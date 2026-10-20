import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X, Check, Crop, Wand2,
  Sparkles, Undo2, Pipette, Eye, Sliders
} from "lucide-react";

interface StickerEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (processedImageUrl: string, size?: "medium" | "large" | "xlarge") => void;
  initialSize?: "medium" | "large" | "xlarge";
}

export default function StickerEditorModal({
  isOpen,
  onClose,
  imageUrl,
  onSave,
  initialSize = "large"
}: StickerEditorModalProps) {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  
  // Background removal state - ON BY DEFAULT for instant magic
  const [isBgRemoved, setIsBgRemoved] = useState<boolean>(true);
  const [bgMode, setBgMode] = useState<"outer" | "all">("outer"); // "outer" = safe flood-fill from border, protects stars
  const [bgTolerance, setBgTolerance] = useState<number>(30); // 5 - 80
  const [isEyedropperActive, setIsEyedropperActive] = useState<boolean>(false);
  const [sampledColor, setSampledColor] = useState<{ r: number; g: number; b: number }>({ r: 255, g: 255, b: 255 });
  
  // Crop state (percentages: 0 to 45)
  const [cropTop, setCropTop] = useState<number>(0);
  const [cropBottom, setCropBottom] = useState<number>(0);
  const [cropLeft, setCropLeft] = useState<number>(0);
  const [cropRight, setCropRight] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<"medium" | "large" | "xlarge">(initialSize);

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Helper to safely load remote or local image without CORS tainting canvas
  const getProxiedUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("/")) {
      return url;
    }
    try {
      const parsed = new URL(url);
      if (parsed.origin === window.location.origin) {
        return url;
      }
      return `/api/proxy-image?url=${encodeURIComponent(url)}`;
    } catch {
      return url;
    }
  };

  // Load original image safely
  useEffect(() => {
    if (!isOpen || !imageUrl) return;
    let cancelled = false;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (cancelled) return;
      setOriginalImage(img);
      setIsBgRemoved(true); // Auto-remove background immediately on open!
      setBgMode("outer");
      setBgTolerance(30);
      setCropTop(0);
      setCropBottom(0);
      setCropLeft(0);
      setCropRight(0);
      setSampledColor({ r: 255, g: 255, b: 255 });
      setSelectedSize(initialSize);
    };

    img.onerror = () => {
      // Fallback if proxy failed or direct load
      console.warn("Retrying direct image load...");
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        if (cancelled) return;
        setOriginalImage(fallbackImg);
        setIsBgRemoved(true);
      };
      fallbackImg.src = imageUrl;
    };

    img.src = getProxiedUrl(imageUrl);

    return () => {
      cancelled = true;
    };
  }, [isOpen, imageUrl, initialSize]);

  // Color distance calculation (Euclidean RGB distance)
  const colorDistance = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) => {
    const dr = r1 - r2;
    const dg = g1 - g2;
    const db = b1 - b2;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  // Render & Process Canvas
  const renderCanvas = useCallback(() => {
    if (!originalImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Calculate crop rectangle in source coordinates
    const naturalW = originalImage.naturalWidth || originalImage.width;
    const naturalH = originalImage.naturalHeight || originalImage.height;

    const cropX = Math.round((cropLeft / 100) * naturalW);
    const cropY = Math.round((cropTop / 100) * naturalH);
    const cropW = Math.max(10, Math.round(naturalW - cropX - (cropRight / 100) * naturalW));
    const cropH = Math.max(10, Math.round(naturalH - cropY - (cropBottom / 100) * naturalH));

    canvas.width = cropW;
    canvas.height = cropH;

    // Clear canvas
    ctx.clearRect(0, 0, cropW, cropH);

    // Draw source cropped region
    ctx.drawImage(originalImage, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    // Apply Background Removal if toggled on
    if (isBgRemoved) {
      try {
        const imageData = ctx.getImageData(0, 0, cropW, cropH);
        const data = imageData.data;
        const targetR = sampledColor.r;
        const targetG = sampledColor.g;
        const targetB = sampledColor.b;

        // Euclidean max color distance is sqrt(255^2 * 3) ~ 441.67
        // bgTolerance 5-80 maps to threshold range ~ 20 to 260
        const threshold = (bgTolerance / 100) * 320;

        if (bgMode === "outer") {
          // ==========================================================
          // MODE 1: CONTIGUOUS OUTER FLOOD FILL (Edge/Corner Inward)
          // Erases only the outer white background outside the sticker!
          // Protects interior white stars, text ("POWER SAVINGS GUIDE"), and table rows!
          // ==========================================================
          const totalPixels = cropW * cropH;
          const visited = new Uint8Array(totalPixels);
          const queue: number[] = [];

          // Helper to test if a pixel matches the target background color
          const isMatch = (pxIdx: number) => {
            const dataIdx = pxIdx * 4;
            const r = data[dataIdx];
            const g = data[dataIdx + 1];
            const b = data[dataIdx + 2];
            const a = data[dataIdx + 3];
            if (a === 0) return true; // already transparent
            return colorDistance(r, g, b, targetR, targetG, targetB) < threshold;
          };

          // Seed the queue from all 4 outer borders (top, bottom, left, right)
          // Top & Bottom rows
          for (let x = 0; x < cropW; x++) {
            const topIdx = x;
            if (isMatch(topIdx) && !visited[topIdx]) {
              visited[topIdx] = 1;
              queue.push(topIdx);
            }
            const botIdx = (cropH - 1) * cropW + x;
            if (isMatch(botIdx) && !visited[botIdx]) {
              visited[botIdx] = 1;
              queue.push(botIdx);
            }
          }

          // Left & Right columns
          for (let y = 0; y < cropH; y++) {
            const leftIdx = y * cropW;
            if (isMatch(leftIdx) && !visited[leftIdx]) {
              visited[leftIdx] = 1;
              queue.push(leftIdx);
            }
            const rightIdx = y * cropW + (cropW - 1);
            if (isMatch(rightIdx) && !visited[rightIdx]) {
              visited[rightIdx] = 1;
              queue.push(rightIdx);
            }
          }

          // Process BFS Queue to flood fill connected outer background
          let head = 0;
          while (head < queue.length) {
            const curr = queue[head++];
            const cx = curr % cropW;
            const cy = Math.floor(curr / cropW);

            // 4-way neighbors
            if (cx > 0) {
              const left = curr - 1;
              if (!visited[left] && isMatch(left)) {
                visited[left] = 1;
                queue.push(left);
              }
            }
            if (cx < cropW - 1) {
              const right = curr + 1;
              if (!visited[right] && isMatch(right)) {
                visited[right] = 1;
                queue.push(right);
              }
            }
            if (cy > 0) {
              const up = curr - cropW;
              if (!visited[up] && isMatch(up)) {
                visited[up] = 1;
                queue.push(up);
              }
            }
            if (cy < cropH - 1) {
              const down = curr + cropW;
              if (!visited[down] && isMatch(down)) {
                visited[down] = 1;
                queue.push(down);
              }
            }
          }

          // Apply transparency to visited outer background pixels
          for (let p = 0; p < totalPixels; p++) {
            if (visited[p]) {
              data[p * 4 + 3] = 0; // Turn transparent
            }
          }

          // Feather boundary pixels slightly for silky anti-aliased edge
          const featherDist = threshold * 0.25;
          for (let p = 0; p < totalPixels; p++) {
            if (!visited[p]) {
              const cx = p % cropW;
              const cy = Math.floor(p / cropW);
              // Check if adjacent to a visited transparent pixel
              const isBoundary =
                (cx > 0 && visited[p - 1]) ||
                (cx < cropW - 1 && visited[p + 1]) ||
                (cy > 0 && visited[p - cropW]) ||
                (cy < cropH - 1 && visited[p + cropW]);

              if (isBoundary) {
                const dataIdx = p * 4;
                const r = data[dataIdx];
                const g = data[dataIdx + 1];
                const b = data[dataIdx + 2];
                const dist = colorDistance(r, g, b, targetR, targetG, targetB);
                if (dist < threshold + featherDist) {
                  const factor = Math.min(1, Math.max(0, (dist - threshold) / featherDist));
                  data[dataIdx + 3] = Math.round(data[dataIdx + 3] * factor);
                }
              }
            }
          }

        } else {
          // ==========================================================
          // MODE 2: GLOBAL COLOR ERASE (Matches everywhere)
          // ==========================================================
          const feather = threshold * 0.25;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a === 0) continue;

            const dist = colorDistance(r, g, b, targetR, targetG, targetB);

            if (dist < threshold) {
              if (dist < threshold - feather) {
                data[i + 3] = 0; // Fully transparent
              } else {
                // Smooth feathered alpha edge
                const alphaFactor = (dist - (threshold - feather)) / feather;
                data[i + 3] = Math.round(a * alphaFactor);
              }
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
      } catch (err) {
        console.warn("Canvas pixel manipulation error", err);
      }
    }
  }, [originalImage, cropTop, cropBottom, cropLeft, cropRight, isBgRemoved, bgMode, bgTolerance, sampledColor]);

  // Re-render whenever parameters change
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Handle Eyedropper click on Canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEyedropperActive || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      try {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        setSampledColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
        setIsEyedropperActive(false);
        setIsBgRemoved(true);
      } catch (err) {
        console.warn("Could not sample color", err);
      }
    }
  };

  const handleSaveAndApply = () => {
    if (!canvasRef.current) return;
    try {
      const transparentDataUrl = canvasRef.current.toDataURL("image/png");
      onSave(transparentDataUrl, selectedSize);
      onClose();
    } catch (e) {
      alert("Failed to export edited sticker image.");
    }
  };

  const handleResetAll = () => {
    setIsBgRemoved(false);
    setBgMode("outer");
    setBgTolerance(30);
    setCropTop(0);
    setCropBottom(0);
    setCropLeft(0);
    setCropRight(0);
    setSampledColor({ r: 255, g: 255, b: 255 });
    setSelectedSize(initialSize);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[94vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-wide flex items-center gap-1.5">
                <span>Sticker Image Studio</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/20">
                  Crop &amp; Transparent Background
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Trim borders and erase white backgrounds so your sticker looks authentic on appliances.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetAll}
              className="text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              title="Reset all edits to original image"
            >
              <Undo2 size={13} />
              <span>Reset Original</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main Work Area: Large Canvas + Interactive Controls below */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
          
          {/* Canvas Preview Area with Checkered Transparency Grid */}
          <div className="relative rounded-xl border border-slate-300 overflow-hidden flex items-center justify-center p-4 min-h-[220px] sm:min-h-[260px] max-h-[300px] bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0]">
            
            {/* Live Processed Canvas */}
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              style={{
                maxHeight: "240px",
                maxWidth: "100%",
                cursor: isEyedropperActive ? "crosshair" : "default"
              }}
              className="object-contain drop-shadow-xl transition-all duration-100 rounded"
            />

            {/* Eyedropper indicator floating notice */}
            {isEyedropperActive && (
              <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 animate-pulse pointer-events-none">
                <Pipette size={13} className="text-amber-400" />
                <span>Click anywhere on the image background to sample color</span>
              </div>
            )}

            {/* Transparency indicator badge */}
            <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-xs border border-slate-200 text-slate-700 text-[10px] font-black px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isBgRemoved ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></span>
              <span>{isBgRemoved ? "✨ Transparent Background Active" : "Original Background"}</span>
            </div>
          </div>

          {/* Section 1: Magic Transparent Background Eraser (Contiguous Flood-Fill) */}
          <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Wand2 size={13} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span>1. Magic Background Remover</span>
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Erases outer white background while keeping stars, text &amp; logos 100% solid.
                  </p>
                </div>
              </div>

              {/* Action Buttons: Toggle Background Removal & Eyedropper */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBgRemoved(!isBgRemoved)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    isBgRemoved
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-400/40"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  <Wand2 size={13} />
                  <span>{isBgRemoved ? "Background Eraser: ON" : "Turn ON Eraser"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEyedropperActive(!isEyedropperActive)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                    isEyedropperActive
                      ? "bg-blue-600 text-white border-blue-700 ring-2 ring-blue-300"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                  }`}
                  title="Sample any custom color from the image to erase"
                >
                  <Pipette size={13} />
                  <span>Pick Color</span>
                </button>
              </div>
            </div>

            {/* Eraser Mode & Tolerance Slider */}
            {isBgRemoved && (
              <div className="pt-2 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                {/* Mode Selector */}
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Protection Mode:</label>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setBgMode("outer")}
                      className={`flex-1 py-1 px-2 rounded transition-all cursor-pointer ${
                        bgMode === "outer"
                          ? "bg-blue-600 text-white shadow-2xs font-black"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                      title="Starts from edges and flood fills background only. Protects interior stars and text."
                    >
                      Outer Border (Safe for Stars)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBgMode("all")}
                      className={`flex-1 py-1 px-2 rounded transition-all cursor-pointer ${
                        bgMode === "all"
                          ? "bg-blue-600 text-white shadow-2xs font-black"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                      title="Erases matching color everywhere across the entire sticker."
                    >
                      All Matching Color
                    </button>
                  </div>
                </div>

                {/* Tolerance Slider */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 mb-1">
                    <span className="flex items-center gap-1">
                      <Sliders size={11} className="text-amber-600" />
                      <span>Color Tolerance: {bgTolerance}%</span>
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {bgTolerance < 25 ? "Strict" : bgTolerance > 50 ? "Strong" : "Balanced (Recommended)"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    value={bgTolerance}
                    onChange={(e) => setBgTolerance(Number(e.target.value))}
                    className="w-full accent-amber-600 h-1.5 bg-slate-200 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Crop Border Trimmer */}
          <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Crop size={13} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    2. Crop Margins (Optional)
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Trim outer excess borders, manufacturer margins, or headers.
                  </p>
                </div>
              </div>

              {(cropTop > 0 || cropBottom > 0 || cropLeft > 0 || cropRight > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setCropTop(0);
                    setCropBottom(0);
                    setCropLeft(0);
                    setCropRight(0);
                  }}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  Reset Crop
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Crop Top: {cropTop}%</label>
                <input
                  type="range"
                  min="0"
                  max="45"
                  value={cropTop}
                  onChange={(e) => setCropTop(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Crop Bottom: {cropBottom}%</label>
                <input
                  type="range"
                  min="0"
                  max="45"
                  value={cropBottom}
                  onChange={(e) => setCropBottom(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Crop Left: {cropLeft}%</label>
                <input
                  type="range"
                  min="0"
                  max="45"
                  value={cropLeft}
                  onChange={(e) => setCropLeft(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Crop Right: {cropRight}%</label>
                <input
                  type="range"
                  min="0"
                  max="45"
                  value={cropRight}
                  onChange={(e) => setCropRight(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Sticker Display Size Control on Product Image */}
          <div className="bg-amber-50/60 p-3 sm:p-3.5 rounded-xl border border-amber-200/80 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                <Eye size={13} className="text-amber-600" />
                <span>3. Sticker Display Size on Product Image</span>
              </p>
              <p className="text-[10px] text-amber-800">
                Choose how prominently the sticker appears over the product appliance.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-amber-200 text-xs font-bold">
              {[
                { id: "medium", label: "Medium" },
                { id: "large", label: "Large (Recommended)" },
                { id: "xlarge", label: "Extra Large" }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedSize(opt.id as any)}
                  className={`px-3 py-1 rounded transition-all cursor-pointer ${
                    selectedSize === opt.id
                      ? "bg-amber-600 text-white shadow-2xs font-black"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveAndApply}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-xs font-black transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Check size={16} />
            <span>Apply &amp; Use Edited Sticker</span>
          </button>
        </div>

      </div>
    </div>
  );
}
