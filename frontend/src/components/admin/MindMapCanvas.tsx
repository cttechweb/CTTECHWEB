import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type Node,
  type Edge,
  type Connection,
  type NodeProps,
  type EdgeProps,
  Handle,
  Position,
  BackgroundVariant,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  Trash2, Edit3, Save, X, Maximize2, Minimize2,
  GitBranch, ChevronUp, ChevronDown, Package, Search, Check,
  CheckCircle2, ShoppingBag, Cloud, Info, ExternalLink,
  Flag, Undo2, Redo2, HelpCircle, AlertTriangle, Lightbulb,
  Zap, ArrowUpRight, Circle, Wrench, ShieldCheck, Image as ImageIcon,
  Upload, Sparkles, Move, Filter
} from "lucide-react";
import { Workflow, WorkflowStep, WorkflowOption, Product, ServiceItem } from "../../types";

/* ─────────────────────────────────────────────────────────────────
   Image Upload Helper (Canvas Compression to Base64)
───────────────────────────────────────────────────────────────── */
export const compressImageFile = (
  file: File,
  onSuccess: (base64Url: string) => void,
  maxDim = 800
) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL("image/jpeg", 0.82);
      onSuccess(compressed);
    };
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

export const HVAC_IMAGE_PRESETS = [
  { label: "Split AC", url: "/src/assets/images/hvac_air_conditioner_1784350824930.jpg" },
  { label: "Cassette AC", url: "/src/assets/images/hvac_hero_banner_1784350809012.jpg" },
  { label: "Ducted / Coils", url: "/src/assets/images/hvac_coils_1784350888537.jpg" },
  { label: "Chiller Plant", url: "/src/assets/images/hvac_chiller_1784350873395.jpg" },
  { label: "Compressor", url: "/src/assets/images/hvac_compressor_1784350840924.jpg" },
  { label: "Piping / Systems", url: "/src/assets/images/hvac_pipes_1784350907486.jpg" },
  { label: "Thermostats", url: "/src/assets/images/hvac_thermostat_1784350856402.jpg" },
];

/* ─────────────────────────────────────────────────────────────────
   Interactive Image Position Adjuster Tool (Exact Storefront Container Size & Hand Drag)
───────────────────────────────────────────────────────────────── */
export function ImagePositionAdjuster({
  imageUrl,
  position,
  onChange,
}: {
  imageUrl: string;
  position?: string;
  onChange: (pos: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentPos = position || "50% 50%";

  const handlePointer = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const x = Math.max(0, Math.min(100, Math.round(((clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(0, Math.min(100, Math.round(((clientY - rect.top) / rect.height) * 100)));

    onChange(`${x}% ${y}%`);
  };

  // Extract coords for indicator
  const parts = currentPos.split(" ");
  const posX = parts[0]?.includes("%") ? parts[0] : parts[0] === "center" ? "50%" : parts[0] === "left" ? "0%" : parts[0] === "right" ? "100%" : "50%";
  const posY = parts[1]?.includes("%") ? parts[1] : parts[1] === "center" ? "50%" : parts[1] === "top" ? "0%" : parts[1] === "bottom" ? "100%" : "50%";

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
        <span className="flex items-center gap-1">
          <Move size={11} className="text-[#0f4c81]" />
          <span>Image Position (X: {posX}, Y: {posY}):</span>
        </span>
        <span className="text-[9px] text-[#0f4c81] font-bold">Drag or click anywhere</span>
      </div>

      {/* Interactive Hand Tool Canvas (Exact h-52 matching storefront category card) */}
      <div
        ref={containerRef}
        onMouseDown={(e) => {
          setIsDragging(true);
          handlePointer(e);
        }}
        onMouseMove={(e) => {
          if (isDragging) handlePointer(e);
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        className="relative w-full max-w-[280px] h-52 mx-auto rounded-2xl overflow-hidden border-2 border-slate-300 hover:border-[#0f4c81] bg-slate-100 cursor-grab active:cursor-grabbing select-none group shadow-inner transition-colors"
      >
        <img
          src={imageUrl}
          alt=""
          style={{ objectPosition: currentPos }}
          className="w-full h-full object-cover pointer-events-none"
        />

        {/* Framing Guide Lines */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-white/30">
          <div className="border-r border-b border-white/20" />
          <div className="border-r border-b border-white/20" />
          <div className="border-b border-white/20" />
          <div className="border-r border-b border-white/20" />
          <div className="border-r border-b border-white/20" />
          <div className="border-b border-white/20" />
          <div className="border-r border-white/20" />
          <div className="border-r border-white/20" />
          <div />
        </div>

        {/* Crosshair / Focal Hand Target */}
        <div
          style={{ left: posX, top: posY }}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 border-white bg-[#0f4c81] text-white flex items-center justify-center shadow-xl pointer-events-none transition-transform"
        >
          <div className="w-2 h-2 rounded-full bg-white animate-ping absolute" />
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Node Data Interfaces
───────────────────────────────────────────────────────────────── */
interface BaseNodeData { step: WorkflowStep; onEdit: (s: WorkflowStep) => void; onDelete: (id: string) => void; }
interface ProductNodeData extends BaseNodeData { products: Product[]; }
interface ServiceNodeData extends BaseNodeData { services: ServiceItem[]; }

/* ─────────────────────────────────────────────────────────────────
   Shared Node Header Bar
───────────────────────────────────────────────────────────────── */
function NodeHeader({ step, label, badgeClass, onEdit, onDelete }: {
  step: WorkflowStep; label: string; badgeClass?: string;
  onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-slate-900 rounded-t-xl text-white">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className={`w-5 h-5 rounded-md font-bold text-[10px] flex items-center justify-center shrink-0 ${badgeClass || "bg-blue-600 text-white"}`}>
          {step.stepNumber}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">{label}</span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onEdit} title="Edit Node" className="w-5 h-5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded flex items-center justify-center transition-colors cursor-pointer">
          <Edit3 size={11} />
        </button>
        <button onClick={onDelete} title="Delete Node" className="w-5 h-5 hover:bg-rose-900/60 text-slate-400 hover:text-rose-400 rounded flex items-center justify-center transition-colors cursor-pointer">
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   1. Question / Choice Node (Clean Text Header + Visual Choice Indicators)
───────────────────────────────────────────────────────────────── */
function StepNode({ data }: NodeProps) {
  const { step, onEdit, onDelete } = data as unknown as BaseNodeData;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs" style={{ width: 275 }}>
      <Handle type="target" position={Position.Left} id="input"
        style={{ background: "#475569", width: 9, height: 9, border: "2px solid #fff", left: -5, top: 28 }} />
      <NodeHeader step={step} label={
        step.inputType === "yesno" ? "Yes / No" :
        step.inputType === "checkboxes" ? "Multi-Select" : 
        step.displayMode === "image" ? "Visual Choice" : "Choice"
      } badgeClass="bg-blue-600 text-white"
        onEdit={() => onEdit(step)} onDelete={() => onDelete(step.id)} />
      
      <div className="px-3 py-2 border-b border-slate-100">
        <p className="font-bold text-slate-900 text-xs leading-snug">{step.title}</p>
        {step.subtitle && <p className="text-[10px] text-slate-500 mt-0.5">{step.subtitle}</p>}
      </div>

      <div className="px-3 py-1.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase">Options ({step.options.length})</span>
          <button onClick={() => setCollapsed(c => !c)} className="text-slate-400 hover:text-slate-600">
            {collapsed ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
          </button>
        </div>
        {!collapsed && (
          <div className="space-y-1 pb-1.5">
            {step.options.map(opt => {
              const isYes = opt.label.toLowerCase().includes("yes");
              const isNo = opt.label.toLowerCase().includes("no");
              const c = isYes ? "#16a34a" : isNo ? "#dc2626" : "#2563eb";
              return (
                <div key={opt.id} className="relative flex items-center justify-between pr-4">
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-semibold flex-1 ${
                    isYes ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
                    isNo ? "bg-red-50 border-red-200 text-red-800" :
                    "bg-slate-50 border-slate-200 text-slate-700"}`}>
                    
                    {opt.image ? (
                      <img 
                        src={opt.image} 
                        alt="" 
                        style={{ objectPosition: opt.imagePosition || "center" }}
                        className="w-4 h-4 rounded object-cover shrink-0 border border-slate-200" 
                      />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c }} />
                    )}

                    <span className="truncate">{opt.label}</span>
                  </div>
                  <Handle type="source" position={Position.Right} id={`opt-${opt.id}`}
                    style={{ background: c, width: 9, height: 9, border: "2px solid #fff",
                      right: -5, top: "50%", transform: "translateY(-50%)", position: "absolute" }} />
                </div>
              );
            })}
          </div>
        )}
        {collapsed && <p className="text-[10px] text-slate-400 pb-1.5">{step.options.length} options — expand to connect</p>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   2. Product Result Node
───────────────────────────────────────────────────────────────── */
function ProductNode({ data }: NodeProps) {
  const { step, products, onEdit, onDelete } = data as unknown as ProductNodeData;
  const selected = (step.selectedProductIds || []).map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
  return (
    <div className="bg-white border border-emerald-200 rounded-xl shadow-xs" style={{ width: 280 }}>
      <Handle type="target" position={Position.Left} id="input"
        style={{ background: "#059669", width: 9, height: 9, border: "2px solid #fff", left: -5, top: 28 }} />
      <NodeHeader step={step} label="Product Result" badgeClass="bg-emerald-600 text-white"
        onEdit={() => onEdit(step)} onDelete={() => onDelete(step.id)} />
      <div className="px-3 py-2 border-b border-slate-100">
        <p className="font-bold text-slate-900 text-xs">{step.title}</p>
        {step.subtitle && <p className="text-[10px] text-slate-500 mt-0.5">{step.subtitle}</p>}
      </div>
      <div className="px-3 py-2 space-y-1.5">
        {selected.length === 0
          ? <p className="text-[10px] text-slate-400 italic">Auto-matching from catalog</p>
          : selected.map(p => (
            <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <img src={p.image} alt="" className="w-7 h-7 rounded object-cover bg-white shrink-0 border border-slate-200" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-900 truncate">{p.name}</p>
                <p className="text-[9px] text-slate-500 truncate">{p.brand} · AED {p.price.toLocaleString()}</p>
              </div>
            </div>
          ))
        }
      </div>
      <div className="px-3 py-1.5 border-t border-slate-100 flex justify-end relative">
        <span className="text-[9px] font-bold text-slate-400">Brand Filter / Next →</span>
        <Handle type="source" position={Position.Right} id="product-out"
          style={{ background: "#059669", width: 9, height: 9, border: "2px solid #fff",
            right: -5, top: "50%", transform: "translateY(-50%)", position: "absolute" }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   2c. Terminal Filter Node (Unified Multi-Criterion Filter)
───────────────────────────────────────────────────────────────── */
function FilterNode({ data }: NodeProps) {
  const { step, onEdit, onDelete } = data as unknown as BaseNodeData;
  const primary = step.primaryFilter || step.filterType || "brand";
  const enabled = step.enabledFilters || [primary];
  const brands = step.selectedBrands || [];

  return (
    <div className="bg-white border-2 border-indigo-500 rounded-2xl shadow-md overflow-hidden text-left" style={{ width: 280 }}>
      <Handle type="target" position={Position.Left} id="input"
        style={{ background: "#4f46e5", width: 10, height: 10, border: "2px solid #fff", left: -5, top: 28 }} />
      <div className="px-3 py-1.5 bg-indigo-700 text-white flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Filter size={11} /> Filter Terminal
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(step)} className="p-0.5 hover:bg-indigo-800 rounded cursor-pointer"><Edit3 size={11} /></button>
          <button onClick={() => onDelete(step.id)} className="p-0.5 hover:bg-indigo-800 rounded cursor-pointer"><Trash2 size={11} /></button>
        </div>
      </div>
      <div className="px-3 py-2 border-b border-indigo-100 bg-indigo-50/40">
        <p className="font-extrabold text-slate-900 text-xs">{step.title || "Product Filter"}</p>
        <p className="text-[10px] text-slate-500 mt-0.5">{step.subtitle || "Customer can filter matching results"}</p>
      </div>
      <div className="p-3 space-y-2 text-xs">
        <div>
          <span className="text-[9px] font-black uppercase tracking-wider text-indigo-700 block mb-1">
            Primary Quick Filter: <strong className="text-slate-900 capitalize">{primary}</strong>
          </span>
          {primary === "brand" && (
            <div className="flex flex-wrap gap-1">
              {brands.length === 0 ? (
                <span className="text-[10px] text-slate-400 italic">All brands (dynamic)</span>
              ) : (
                brands.slice(0, 4).map(b => (
                  <span key={b} className="text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded-md">
                    {b}
                  </span>
                ))
              )}
              {brands.length > 4 && <span className="text-[9px] text-slate-400 font-bold">+{brands.length - 4} more</span>}
            </div>
          )}
        </div>
        <div className="pt-1 border-t border-slate-100">
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">
            Enabled Filters ({enabled.length}):
          </span>
          <div className="flex flex-wrap gap-1">
            {enabled.map(f => (
              <span key={f} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                ✓ {f}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="px-3 py-1 bg-slate-50 border-t border-slate-100 text-center">
        <span className="text-[9px] font-bold text-slate-400 italic">🏁 Terminal Node (End of Flow)</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   2b. Service Result Node
───────────────────────────────────────────────────────────────── */
function ServiceNode({ data }: NodeProps) {
  const { step, services, onEdit, onDelete } = data as unknown as ServiceNodeData;
  const selected = (step.selectedServiceIds || []).map(id => (services || []).find(s => s.id === id)).filter(Boolean) as ServiceItem[];
  return (
    <div className="bg-white border border-amber-200 rounded-xl shadow-xs" style={{ width: 280 }}>
      <Handle type="target" position={Position.Left} id="input"
        style={{ background: "#d97706", width: 9, height: 9, border: "2px solid #fff", left: -5, top: 28 }} />
      <NodeHeader step={step} label="Service Result" badgeClass="bg-amber-600 text-white"
        onEdit={() => onEdit(step)} onDelete={() => onDelete(step.id)} />
      <div className="px-3 py-2 border-b border-slate-100">
        <p className="font-bold text-slate-900 text-xs">{step.title}</p>
        {step.subtitle && <p className="text-[10px] text-slate-500 mt-0.5">{step.subtitle}</p>}
      </div>
      <div className="px-3 py-2 space-y-1.5">
        {selected.length === 0
          ? <p className="text-[10px] text-slate-400 italic">No services selected — click ✏️ to add</p>
          : selected.map(s => (
            <div key={s.id} className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <img src={s.image} alt="" className="w-7 h-7 rounded object-cover bg-white shrink-0 border border-slate-200" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-900 truncate">{s.title}</p>
                <p className="text-[9px] text-slate-500 truncate">{s.category} · SLA: {s.specs?.sla || "24/7"}</p>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   3. Info / Callout Node
───────────────────────────────────────────────────────────────── */
function InfoNode({ data }: NodeProps) {
  const { step, onEdit, onDelete } = data as unknown as BaseNodeData;
  const styleMap: Record<string, { border: string; icon: React.ReactNode; bg: string }> = {
    info:    { border: "border-blue-200", icon: <Info size={11} className="text-blue-600" />, bg: "bg-blue-50/40" },
    warning: { border: "border-amber-200", icon: <AlertTriangle size={11} className="text-amber-600" />, bg: "bg-amber-50/40" },
    success: { border: "border-emerald-200", icon: <CheckCircle2 size={11} className="text-emerald-600" />, bg: "bg-emerald-50/40" },
    tip:     { border: "border-purple-200", icon: <Lightbulb size={11} className="text-purple-600" />, bg: "bg-purple-50/40" },
  };
  const s = styleMap[step.infoStyle || "info"] || styleMap.info;

  return (
    <div className={`bg-white border ${s.border} rounded-xl shadow-xs`} style={{ width: 270 }}>
      <Handle type="target" position={Position.Left} id="input"
        style={{ background: "#475569", width: 9, height: 9, border: "2px solid #fff", left: -5, top: 28 }} />
      <NodeHeader step={step} label={`Info — ${step.infoStyle || "info"}`} badgeClass="bg-sky-600 text-white"
        onEdit={() => onEdit(step)} onDelete={() => onDelete(step.id)} />
      <div className={`p-3 space-y-1.5 ${s.bg}`}>
        <div className="flex items-center gap-1.5">
          {s.icon}
          <p className="font-bold text-slate-900 text-xs">{step.title}</p>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">
          {step.infoContent || step.subtitle || "Info message..."}
        </p>
      </div>
      <div className="px-3 py-1.5 border-t border-slate-100 flex justify-end relative">
        <span className="text-[9px] font-bold text-slate-400">Continue →</span>
        <Handle type="source" position={Position.Right} id="continue"
          style={{ background: "#3b82f6", width: 9, height: 9, border: "2px solid #fff",
            right: -5, top: "50%", transform: "translateY(-50%)", position: "absolute" }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   4. Redirect Node
───────────────────────────────────────────────────────────────── */
function RedirectNode({ data }: NodeProps) {
  const { step, onEdit, onDelete } = data as unknown as BaseNodeData;
  return (
    <div className="bg-white border border-purple-200 rounded-xl shadow-xs" style={{ width: 260 }}>
      <Handle type="target" position={Position.Left} id="input"
        style={{ background: "#7c3aed", width: 9, height: 9, border: "2px solid #fff", left: -5, top: 28 }} />
      <NodeHeader step={step} label="Redirect → URL" badgeClass="bg-purple-600 text-white"
        onEdit={() => onEdit(step)} onDelete={() => onDelete(step.id)} />
      <div className="p-3 space-y-2">
        <p className="font-bold text-slate-900 text-xs">{step.title}</p>
        <div className="p-2 bg-purple-50/50 border border-purple-200 rounded-lg text-[10px] space-y-1">
          <p className="text-purple-600 font-bold uppercase tracking-wider">Target URL:</p>
          <p className="font-mono text-purple-900 truncate">{step.redirectUrl || "https://..."}</p>
        </div>
      </div>
      <div className="px-3 py-1.5 border-t border-slate-100 flex justify-end relative">
        <span className="text-[9px] font-bold text-slate-400">Next Step →</span>
        <Handle type="source" position={Position.Right} id="after"
          style={{ background: "#7c3aed", width: 9, height: 9, border: "2px solid #fff",
            right: -5, top: "50%", transform: "translateY(-50%)", position: "absolute" }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   5. End Node
───────────────────────────────────────────────────────────────── */
function EndNode({ data }: NodeProps) {
  const { step, onEdit, onDelete } = data as unknown as BaseNodeData;
  return (
    <div className="bg-white border-2 border-emerald-500 rounded-2xl shadow-sm overflow-hidden text-center" style={{ width: 240 }}>
      <Handle type="target" position={Position.Left} id="input"
        style={{ background: "#10b981", width: 10, height: 10, border: "2px solid #fff", left: -5, top: "50%", transform: "translateY(-50%)" }} />
      <div className="px-3 py-1.5 bg-emerald-600 text-white flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
          <Flag size={11} /> End Terminal
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(step)} className="p-0.5 hover:bg-emerald-700 rounded"><Edit3 size={11} /></button>
          <button onClick={() => onDelete(step.id)} className="p-0.5 hover:bg-emerald-700 rounded"><Trash2 size={11} /></button>
        </div>
      </div>
      <div className="p-3 space-y-1 bg-emerald-50/50">
        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center mx-auto">
          <Flag size={14} />
        </div>
        <p className="font-extrabold text-slate-900 text-xs">{step.title}</p>
        <p className="text-[10px] text-slate-500">{step.endMessage || "Selection complete."}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   6. Trigger / Start Node (With Direct Working Settings Action)
───────────────────────────────────────────────────────────────── */
function TriggerNode({ data }: NodeProps) {
  const { workflow, onEditMeta } = data as unknown as { workflow: Workflow; onEditMeta?: () => void };

  return (
    <div className="bg-slate-900 text-white border-2 border-blue-500 rounded-2xl shadow-xl overflow-hidden" style={{ width: 240 }}>
      {workflow.image && (
        <div className="w-full h-20 bg-slate-800 relative overflow-hidden">
          <img 
            src={workflow.image} 
            alt={workflow.name} 
            style={{ objectPosition: workflow.imagePosition || "center" }}
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
        </div>
      )}
      <div className="px-3.5 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Circle size={8} className="text-emerald-400 fill-emerald-400" />
          <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Workflow Start</span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (onEditMeta) onEditMeta();
          }}
          className="nodrag nopan px-2 py-0.5 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 rounded text-[9px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
          title="Edit Workflow Title & Settings"
        >
          <Edit3 size={10} /> Settings
        </button>
      </div>
      <div className="px-4 py-3">
        <p className="font-extrabold text-sm leading-snug">{workflow.name}</p>
        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed line-clamp-2">{workflow.description}</p>
      </div>
      <Handle type="source" position={Position.Right} id="trigger-out"
        style={{ background: "#3b82f6", width: 12, height: 12, border: "2px solid #fff", right: -6, top: "50%", transform: "translateY(-50%)" }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Custom Deletable Edge
───────────────────────────────────────────────────────────────── */
function DeletableEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd, label, data }: EdgeProps) {
  const { deleteElements } = useReactFlow();
  const [edgePath, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const [hovered, setHovered] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ edges: [{ id }] });
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{ position: "absolute", transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`, pointerEvents: "all" }}
          className="nodrag nopan flex flex-col items-center gap-1"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {label && (
            <div className="px-2 py-0.5 bg-white border rounded-md text-[9px] font-bold shadow-sm"
              style={{ borderColor: (style as any)?.stroke || "#64748b", color: (style as any)?.stroke || "#64748b" }}>
              {label as string}
            </div>
          )}
          <button
            onClick={handleDelete}
            className={`w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-md transition-all cursor-pointer ${
              hovered ? "opacity-100 scale-110" : "opacity-0 scale-75"
            }`}
            title="Delete this connection"
          >
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Node Type Registry
───────────────────────────────────────────────────────────────── */
const nodeTypes = {
  stepNode: StepNode,
  productNode: ProductNode,
  filterNode: FilterNode,
  serviceNode: ServiceNode,
  infoNode: InfoNode,
  redirectNode: RedirectNode,
  endNode: EndNode,
  triggerNode: TriggerNode,
};

const edgeTypes = { deletable: DeletableEdge };

/* ─────────────────────────────────────────────────────────────────
   Tool Panel Config
───────────────────────────────────────────────────────────────── */
const TOOL_ITEMS = [
  {
    inputType: "cards",
    nodeType: "stepNode",
    label: "Question",
    description: "Multi-choice branch",
    icon: HelpCircle,
    colorClass: "border-slate-300 bg-slate-50 text-slate-700",
  },
  {
    inputType: "yesno",
    nodeType: "stepNode",
    label: "Yes / No",
    description: "Binary decision node",
    icon: GitBranch,
    colorClass: "border-blue-300 bg-blue-50 text-blue-700",
  },
  {
    inputType: "products",
    nodeType: "productNode",
    label: "Product",
    description: "Show curated products",
    icon: ShoppingBag,
    colorClass: "border-teal-300 bg-teal-50 text-teal-700",
  },
  {
    inputType: "filter",
    nodeType: "filterNode",
    label: "Filter",
    description: "Filter by Brand, Price, Category & Stock",
    icon: Filter,
    colorClass: "border-indigo-300 bg-indigo-50 text-indigo-700",
  },
  {
    inputType: "services",
    nodeType: "serviceNode",
    label: "Service",
    description: "Show curated services",
    icon: Wrench,
    colorClass: "border-amber-300 bg-amber-50 text-amber-800",
  },
  {
    inputType: "info",
    nodeType: "infoNode",
    label: "Info",
    description: "Callout or notice block",
    icon: Info,
    colorClass: "border-blue-300 bg-blue-50 text-blue-700",
  },
  {
    inputType: "redirect",
    nodeType: "redirectNode",
    label: "Redirect",
    description: "Send to external URL",
    icon: ArrowUpRight,
    colorClass: "border-violet-300 bg-violet-50 text-violet-700",
  },
  {
    inputType: "end",
    nodeType: "endNode",
    label: "End",
    description: "Completion terminal",
    icon: Flag,
    colorClass: "border-emerald-300 bg-emerald-50 text-emerald-700",
  },
] as const;

type ToolInputType = typeof TOOL_ITEMS[number]["inputType"];

/* ─────────────────────────────────────────────────────────────────
   Convert Workflow → React Flow nodes + edges
───────────────────────────────────────────────────────────────── */
function workflowToFlow(
  workflow: Workflow,
  products: Product[],
  services: ServiceItem[],
  onEdit: (step: WorkflowStep) => void,
  onDelete: (stepId: string) => void,
  onEditMeta?: () => void
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  nodes.push({
    id: "trigger",
    type: "triggerNode",
    position: { x: 60, y: 180 },
    data: { workflow, onEditMeta },
    draggable: true,
  });

  workflow.steps.forEach((step, idx) => {
    const typeMap: Record<string, string> = {
      cards: "stepNode", checkboxes: "stepNode", yesno: "stepNode", range: "stepNode",
      products: "productNode", filter: "filterNode", services: "serviceNode", info: "infoNode", redirect: "redirectNode", end: "endNode",
    };
    nodes.push({
      id: step.id,
      type: typeMap[step.inputType] || "stepNode",
      position: step.position || { x: 370 + idx * 340, y: 60 + (idx % 3) * 100 },
      data: step.inputType === "products"
        ? { step, products, onEdit, onDelete }
        : step.inputType === "filter"
        ? { step, products, onEdit, onDelete }
        : step.inputType === "services"
        ? { step, services, onEdit, onDelete }
        : { step, onEdit, onDelete },
      draggable: true,
    });
  });

  if (workflow.steps.length > 0) {
    edges.push({
      id: "trigger-to-step1",
      source: "trigger", sourceHandle: "trigger-out",
      target: workflow.steps[0].id, targetHandle: "input",
      type: "deletable",
      animated: true,
      style: { stroke: "#3b82f6", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" },
      label: "Start",
      data: {},
    });
  }

  workflow.steps.forEach(step => {
    if (["services", "end", "filter"].includes(step.inputType)) return;

    if (step.inputType === "products") {
      const opt = step.options[0];
      if (opt?.nextStepId && workflow.steps.find(s => s.id === opt.nextStepId)) {
        edges.push({
          id: `edge-${step.id}-product-out`,
          source: step.id, sourceHandle: "product-out",
          target: opt.nextStepId, targetHandle: "input",
          type: "deletable",
          style: { stroke: "#059669", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#059669" },
          label: "Brand Filter",
          data: {},
        });
      }
      return;
    }

    if (step.inputType === "filter") {
      const opt = step.options[0];
      if (opt?.nextStepId && workflow.steps.find(s => s.id === opt.nextStepId)) {
        edges.push({
          id: `edge-${step.id}-filter-out`,
          source: step.id, sourceHandle: "filter-out",
          target: opt.nextStepId, targetHandle: "input",
          type: "deletable",
          style: { stroke: "#4f46e5", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#4f46e5" },
          label: "Next Step",
          data: {},
        });
      }
      return;
    }

    if (step.inputType === "info") {
      const opt = step.options[0];
      if (opt?.nextStepId && workflow.steps.find(s => s.id === opt.nextStepId)) {
        edges.push({
          id: `edge-${step.id}-continue`,
          source: step.id, sourceHandle: "continue",
          target: opt.nextStepId, targetHandle: "input",
          type: "deletable",
          style: { stroke: "#3b82f6", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" },
          label: "Continue",
          data: {},
        });
      }
      return;
    }

    if (step.inputType === "redirect") {
      const opt = step.options[0];
      if (opt?.nextStepId && workflow.steps.find(s => s.id === opt.nextStepId)) {
        edges.push({
          id: `edge-${step.id}-after`,
          source: step.id, sourceHandle: "after",
          target: opt.nextStepId, targetHandle: "input",
          type: "deletable",
          style: { stroke: "#7c3aed", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#7c3aed" },
          label: "After redirect",
          data: {},
        });
      }
      return;
    }

    step.options.forEach(opt => {
      if (!opt.nextStepId) return;
      if (!workflow.steps.find(s => s.id === opt.nextStepId)) return;
      const isYes = opt.label.toLowerCase().includes("yes");
      const isNo = opt.label.toLowerCase().includes("no");
      const color = isYes ? "#16a34a" : isNo ? "#dc2626" : "#2563eb";
      edges.push({
        id: `edge-${step.id}-${opt.id}-${opt.nextStepId}`,
        source: step.id, sourceHandle: `opt-${opt.id}`,
        target: opt.nextStepId, targetHandle: "input",
        type: "deletable",
        style: { stroke: color, strokeWidth: 2, strokeDasharray: isNo ? "5 4" : undefined },
        markerEnd: { type: MarkerType.ArrowClosed, color },
        label: isYes ? "YES" : isNo ? "NO" : opt.label.slice(0, 14),
        data: {},
      });
    });
  });

  return { nodes, edges };
}

/* ─────────────────────────────────────────────────────────────────
   Node Inspector Drawer (Text Questions + Visual Choice Options with Hand Positioning)
───────────────────────────────────────────────────────────────── */
function NodeInspector({ step, workflow, allProducts, allServices, onSave, onClose }: {
  step: WorkflowStep; workflow: Workflow; allProducts: Product[]; allServices: ServiceItem[];
  onSave: (s: WorkflowStep) => void; onClose: () => void;
}) {
  const [local, setLocal] = useState<WorkflowStep>(() => JSON.parse(JSON.stringify(step)));
  const [productSearch, setProductSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");

  const filteredProducts = allProducts.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.brand.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredServices = (allServices || []).filter(s =>
    s.title.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    s.category.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const toggleProduct = (id: string) => {
    const cur = local.selectedProductIds || [];
    setLocal({ ...local, selectedProductIds: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] });
  };

  const toggleService = (id: string) => {
    const cur = local.selectedServiceIds || [];
    setLocal({ ...local, selectedServiceIds: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] });
  };

  const updateOption = (optId: string, field: keyof WorkflowOption, value: any) =>
    setLocal(prev => ({ ...prev, options: prev.options.map(o => o.id === optId ? { ...o, [field]: value } : o) }));

  const addOption = () => {
    const newOpt: WorkflowOption = { id: `opt-${Date.now()}`, label: `Option ${local.options.length + 1}` };
    setLocal(prev => ({ ...prev, options: [...prev.options, newOpt] }));
  };

  const removeOption = (id: string) =>
    setLocal(prev => ({ ...prev, options: prev.options.filter(o => o.id !== id) }));

  const isProducts = local.inputType === "products";
  const isFilter = local.inputType === "filter";
  const isServices = local.inputType === "services";
  const isInfo = local.inputType === "info";
  const isRedirect = local.inputType === "redirect";
  const isEnd = local.inputType === "end";
  const isQuestion = ["cards", "checkboxes", "yesno"].includes(local.inputType);

  return (
    <div className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-slate-200"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-blue-500 font-black text-xs flex items-center justify-center">{local.stepNumber}</span>
            <h3 className="font-bold text-sm">Edit Decision Node</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          
          {/* Question Title (Text-Only) */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5">Question Title *</label>
            <input type="text" value={local.title} onChange={e => setLocal({ ...local, title: e.target.value })}
              placeholder="e.g. What type of indoor installation is possible?"
              className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 text-xs focus:border-[#0f4c81] focus:outline-none" />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5">Subtitle / Explanatory Text</label>
            <input type="text" value={local.subtitle || ""} onChange={e => setLocal({ ...local, subtitle: e.target.value })}
              placeholder="e.g. Select your preferred architectural indoor unit mounting style..."
              className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-700 text-xs focus:border-[#0f4c81] focus:outline-none" />
          </div>

          {/* Node Type */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5">Node Type</label>
            <select value={local.inputType}
              onChange={e => setLocal({ ...local, inputType: e.target.value as WorkflowStep["inputType"] })}
              className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 text-xs focus:border-[#0f4c81] focus:outline-none">
              <option value="cards">❓ Single Choice Cards</option>
              <option value="checkboxes">☑️ Multi-Select Checkboxes</option>
              <option value="yesno">✅ Yes / No</option>
              <option value="products">🛒 Product Result</option>
              <option value="filter">🔍 Brand Filter</option>
              <option value="services">🛠 Service Result</option>
              <option value="info">ℹ️ Information / Callout</option>
              <option value="redirect">🔗 Redirect to URL</option>
              <option value="end">🏁 End / Completion</option>
            </select>
          </div>

          {/* Switch Button: Text-Only vs Visual Image Choices */}
          {isQuestion && (
            <div className="pt-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5">Choice Card Display Format</label>
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 w-full">
                <button
                  type="button"
                  onClick={() => setLocal({ ...local, displayMode: "text" })}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    (local.displayMode || "text") === "text"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  📝 Text-Only Choices
                </button>
                <button
                  type="button"
                  onClick={() => setLocal({ ...local, displayMode: "image" })}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    local.displayMode === "image"
                      ? "bg-[#0f4c81] text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  🖼️ Visual Image Choices
                </button>
              </div>
            </div>
          )}

          {/* ── Info fields ── */}
          {isInfo && (
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Callout Style</label>
                <select value={local.infoStyle || "info"} onChange={e => setLocal({ ...local, infoStyle: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500">
                  <option value="info">ℹ️ Info (Blue)</option>
                  <option value="warning">⚠️ Warning (Amber)</option>
                  <option value="success">✅ Success (Green)</option>
                  <option value="tip">💡 Tip (Purple)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Callout Content</label>
                <textarea rows={4} value={local.infoContent || ""} onChange={e => setLocal({ ...local, infoContent: e.target.value })}
                  placeholder="Write the information or notice to display to the user..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-700 text-xs focus:border-blue-500 focus:outline-none resize-none" />
              </div>
            </div>
          )}

          {/* ── Redirect fields ── */}
          {isRedirect && (
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Redirect URL *</label>
                <input type="url" value={local.redirectUrl || ""} onChange={e => setLocal({ ...local, redirectUrl: e.target.value })}
                  placeholder="https://example.com/page"
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:border-violet-500 focus:outline-none" />
              </div>
              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Button Label</label>
                <input type="text" value={local.redirectLabel || ""} onChange={e => setLocal({ ...local, redirectLabel: e.target.value })}
                  placeholder="e.g. View Details, Learn More, Contact Us"
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:border-violet-500 focus:outline-none" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={local.redirectNewTab ?? true}
                  onChange={e => setLocal({ ...local, redirectNewTab: e.target.checked })}
                  className="w-4 h-4 accent-violet-600" />
                <span className="text-xs font-semibold text-slate-700">Open in new tab</span>
              </label>
            </div>
          )}

          {/* ── End fields ── */}
          {isEnd && (
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1.5">Completion Message</label>
                <textarea rows={3} value={local.endMessage || ""} onChange={e => setLocal({ ...local, endMessage: e.target.value })}
                  placeholder="Thank you for completing the selection wizard! Our team will contact you shortly."
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-700 text-xs focus:border-emerald-500 focus:outline-none resize-none" />
              </div>
              <p className="text-[10px] text-slate-400 italic">End nodes are terminal — no outgoing connections.</p>
            </div>
          )}

          {/* ── Filter Node Unified Configuration Drawer (Primary + Available Filters) ── */}
          {isFilter && (
            <div className="border-t border-slate-200 pt-4 space-y-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5">
                  1. Primary Quick Filter (Displayed directly under products) *
                </label>
                <select
                  value={local.primaryFilter || local.filterType || "brand"}
                  onChange={e => {
                    const val = e.target.value as any;
                    const curEnabled = local.enabledFilters || [val];
                    const nextEnabled = curEnabled.includes(val) ? curEnabled : [...curEnabled, val];
                    setLocal({ ...local, primaryFilter: val, filterType: val, enabledFilters: nextEnabled });
                  }}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-indigo-500 shadow-xs"
                >
                  <option value="brand">🏷️ Brand (Quick Brand buttons shown directly below products)</option>
                  <option value="price">💰 Price Range (Quick Price Tier buttons shown directly below products)</option>
                  <option value="category">📁 Product Category (Quick Category buttons shown directly below products)</option>
                  <option value="stock">⚡ Stock Availability (Instant Dispatch toggle shown directly)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5">
                  2. Available Filter Options (In Customer Filter Drawer)
                </label>
                <p className="text-[10px] text-slate-500 mb-2">Select which filter dimensions the customer can open and use:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "brand", label: "🏷️ Brand Filter" },
                    { id: "price", label: "💰 Price Range" },
                    { id: "category", label: "📁 Equipment Category" },
                    { id: "stock", label: "⚡ In-Stock Only" },
                  ].map(f => {
                    const primaryVal = (local.primaryFilter || local.filterType || "brand") as any;
                    const enabledList = local.enabledFilters || [primaryVal];
                    const isChecked = enabledList.includes(f.id as any);
                    const isPrimary = primaryVal === f.id;
                    return (
                      <button
                        type="button"
                        key={f.id}
                        onClick={() => {
                          if (isPrimary) return; // Primary is always enabled
                          const next = isChecked ? enabledList.filter(x => x !== f.id) : [...enabledList, f.id as any];
                          setLocal({ ...local, enabledFilters: next });
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between text-left transition-all cursor-pointer ${
                          isChecked
                            ? "bg-indigo-50 border-indigo-300 text-indigo-900"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <span className="truncate">{f.label}</span>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-white"
                        }`}>
                          {isChecked && <Check size={10} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Config details for Brand */}
              {(local.enabledFilters || ["brand"]).includes("brand") && (
                <div className="space-y-2 p-3 bg-indigo-50/40 rounded-xl border border-indigo-200">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-indigo-900 uppercase tracking-wider text-[10px]">Filterable Brands</label>
                    <span className="text-[10px] text-indigo-700 font-bold bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                      {(local.selectedBrands || []).length === 0 ? "All Brands (Auto)" : `${local.selectedBrands?.length} selected`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto p-1.5 bg-white border border-indigo-100 rounded-lg">
                    {Array.from(new Set(allProducts.map(p => p.brand).filter(Boolean))).map(brand => {
                      const isChecked = (local.selectedBrands || []).includes(brand);
                      return (
                        <button
                          type="button"
                          key={brand}
                          onClick={() => {
                            const current = local.selectedBrands || [];
                            const next = isChecked ? current.filter(b => b !== brand) : [...current, brand];
                            setLocal({ ...local, selectedBrands: next });
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all border cursor-pointer ${
                            isChecked
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300"
                          }`}
                        >
                          {brand}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Product picker ── */}
          {isProducts && (
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">Select Products</h4>
                <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {(local.selectedProductIds || []).length} selected
                </span>
              </div>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search products..." value={productSearch} onChange={e => setProductSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:border-teal-500 focus:outline-none" />
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredProducts.map(prod => {
                  const chosen = (local.selectedProductIds || []).includes(prod.id);
                  return (
                    <button key={prod.id} onClick={() => toggleProduct(prod.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        chosen ? "bg-teal-50 border-teal-300" : "bg-slate-50 border-slate-200 hover:border-teal-200"}`}>
                      <img src={prod.image} alt="" className="w-9 h-9 rounded-lg object-cover bg-slate-200 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-[11px] truncate">{prod.name}</p>
                        <p className="text-[9px] text-slate-500">{prod.brand} · AED {prod.price.toLocaleString()}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        chosen ? "bg-teal-50 border-teal-500" : "border-slate-300"}`}>
                        {chosen && <Check size={11} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Service picker ── */}
          {isServices && (
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">Select Services</h4>
                <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {(local.selectedServiceIds || []).length} selected
                </span>
              </div>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search services..." value={serviceSearch} onChange={e => setServiceSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:border-amber-500 focus:outline-none" />
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredServices.map(serv => {
                  const chosen = (local.selectedServiceIds || []).includes(serv.id);
                  return (
                    <button key={serv.id} onClick={() => toggleService(serv.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        chosen ? "bg-amber-50 border-amber-300" : "bg-slate-50 border-slate-200 hover:border-amber-200"}`}>
                      <img src={serv.image} alt="" className="w-9 h-9 rounded-lg object-cover bg-slate-200 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-[11px] truncate">{serv.title}</p>
                        <p className="text-[9px] text-slate-500">{serv.category} · SLA: {serv.specs?.sla || "Standard"}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        chosen ? "bg-amber-50 border-amber-500" : "border-slate-300"}`}>
                        {chosen && <Check size={11} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Options builder with Clean Conditional Text vs Image Forms ── */}
          {isQuestion && (
            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                  {local.displayMode === "image" ? "Visual Image Choices" : "Answer Choice Options"} ({local.options.length})
                </h4>
                <button onClick={addOption}
                  className="px-2.5 py-1 bg-[#0f4c81] text-white font-bold text-[10px] rounded-lg hover:bg-[#1c7e9f] cursor-pointer shadow-2xs">
                  + Add Option
                </button>
              </div>

              <div className="space-y-3">
                {local.options.map((opt, idx) => (
                  <div key={opt.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-600 text-[10px] uppercase">Option {idx + 1}</span>
                      <button onClick={() => removeOption(opt.id)} className="text-red-500 hover:text-red-700 text-[10px] font-bold cursor-pointer">
                        Remove
                      </button>
                    </div>

                    {local.displayMode === "image" ? (
                      /* 🖼️ VISUAL IMAGE MODE: Show Image Upload + Exact Position Adjuster ONLY */
                      <div className="space-y-2.5">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Option Name / Reference Label *</label>
                          <input type="text" value={opt.label} onChange={e => updateOption(opt.id, "label", e.target.value)}
                            placeholder="e.g. Wall-Mounted Split AC"
                            className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white focus:border-[#0f4c81] focus:outline-none" />
                        </div>

                        {/* Option Image Upload & Position Adjuster */}
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                              <ImageIcon size={11} className="text-[#0f4c81]" />
                              <span>Option Card Image (Full Box)</span>
                            </span>
                            {opt.image && (
                              <button
                                type="button"
                                onClick={() => {
                                  updateOption(opt.id, "image", undefined);
                                  updateOption(opt.id, "imagePosition", undefined);
                                }}
                                className="text-red-500 hover:text-red-700 text-[9px] font-bold cursor-pointer"
                              >
                                Remove Image
                              </button>
                            )}
                          </div>

                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder="Image URL or upload file..."
                              value={opt.image || ""}
                              onChange={e => updateOption(opt.id, "image", e.target.value)}
                              className="flex-1 p-1.5 border border-slate-300 rounded-lg text-[11px]"
                            />
                            <label className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0 border border-slate-200">
                              <Upload size={11} />
                              <span>Upload</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    compressImageFile(file, (b64) => updateOption(opt.id, "image", b64));
                                  }
                                }}
                              />
                            </label>
                          </div>

                          {/* Quick Presets */}
                          <div className="pt-0.5 flex items-center gap-1 flex-wrap">
                            <span className="text-[9px] text-slate-400 font-bold">Presets:</span>
                            {HVAC_IMAGE_PRESETS.map((p) => (
                              <button
                                key={p.label}
                                type="button"
                                onClick={() => updateOption(opt.id, "image", p.url)}
                                className="px-1.5 py-0.5 bg-slate-50 hover:bg-blue-50 hover:text-[#0f4c81] text-slate-600 rounded text-[9px] font-medium border border-slate-200 cursor-pointer transition-colors"
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>

                          {/* Interactive Image Position Hand Tool */}
                          {opt.image && (
                            <ImagePositionAdjuster
                              imageUrl={opt.image}
                              position={opt.imagePosition}
                              onChange={(pos) => updateOption(opt.id, "imagePosition", pos)}
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      /* 📝 TEXT ONLY MODE: Show Label, Badge, Description ONLY */
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">Option Label *</label>
                            <input type="text" value={opt.label} onChange={e => updateOption(opt.id, "label", e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white focus:border-[#0f4c81] focus:outline-none" />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">Badge (Optional)</label>
                            <input type="text" value={opt.badge || ""} onChange={e => updateOption(opt.id, "badge", e.target.value)}
                              placeholder="e.g. Inverter, Max Savings"
                              className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white focus:border-[#0f4c81] focus:outline-none" />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Description (Optional)</label>
                          <input type="text" value={opt.description || ""} onChange={e => updateOption(opt.id, "description", e.target.value)}
                            placeholder="Brief technical or spatial detail..."
                            className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white focus:border-[#0f4c81] focus:outline-none" />
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-2 justify-end shrink-0">
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
          <button onClick={() => onSave(local)}
            className="px-5 py-2 bg-[#0f4c81] hover:bg-[#1c7e9f] text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer">
            <Save size={13} /> Save Node
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Inner Canvas (With Reliable Full-Screen Recalculation & Height)
───────────────────────────────────────────────────────────────── */
interface MindMapCanvasProps {
  workflow: Workflow;
  products?: Product[];
  services?: ServiceItem[];
  onUpdateWorkflow: (workflow: Workflow) => void;
  onEditWorkflowMeta?: () => void;
  onShowToast?: (msg: string) => void;
}

function MindMapCanvasInner({ workflow, products = [], services = [], onUpdateWorkflow, onEditWorkflowMeta, onShowToast }: MindMapCanvasProps) {
  const { screenToFlowPosition, fitView } = useReactFlow();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [publishedAt, setPublishedAt] = useState<Date | null>(null);

  /* ── History for Undo / Redo ── */
  const [history, setHistory] = useState<Workflow[]>([workflow]);
  const [histIdx, setHistIdx] = useState(0);
  const prevWorkflowId = useRef(workflow.id);

  useEffect(() => {
    if (prevWorkflowId.current !== workflow.id) {
      prevWorkflowId.current = workflow.id;
      setHistory([workflow]);
      setHistIdx(0);
    }
  }, [workflow.id]);

  const pushHistory = useCallback((newWf: Workflow) => {
    setHistory(prev => {
      const trimmed = prev.slice(0, histIdx + 1);
      return [...trimmed, newWf];
    });
    setHistIdx(prev => prev + 1);
    onUpdateWorkflow(newWf);
  }, [histIdx, onUpdateWorkflow]);

  const undo = useCallback(() => {
    if (histIdx > 0) {
      const newIdx = histIdx - 1;
      setHistIdx(newIdx);
      onUpdateWorkflow(history[newIdx]);
      if (onShowToast) onShowToast("Undo ↩");
    }
  }, [history, histIdx, onUpdateWorkflow, onShowToast]);

  const redo = useCallback(() => {
    if (histIdx < history.length - 1) {
      const newIdx = histIdx + 1;
      setHistIdx(newIdx);
      onUpdateWorkflow(history[newIdx]);
      if (onShowToast) onShowToast("Redo ↪");
    }
  }, [history, histIdx, onUpdateWorkflow, onShowToast]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z") { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  const handleEdit = useCallback((s: WorkflowStep) => setEditingStep(s), []);
  const handleDelete = useCallback((stepId: string) => {
    const updated = { ...workflow, steps: workflow.steps.filter(s => s.id !== stepId) };
    pushHistory(updated);
    if (onShowToast) onShowToast("Node deleted.");
  }, [workflow, pushHistory, onShowToast]);

  const { nodes: initNodes, edges: initEdges } = workflowToFlow(workflow, products, services, handleEdit, handleDelete, onEditWorkflowMeta);
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

  useEffect(() => {
    const { nodes: n, edges: e } = workflowToFlow(workflow, products, services, handleEdit, handleDelete, onEditWorkflowMeta);
    setNodes(n);
    setEdges(e);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow, products, services, onEditWorkflowMeta]);

  const onConnect = useCallback((connection: Connection) => {
    const { source, sourceHandle, target } = connection;
    if (!source || !sourceHandle || !target) return;
    if (sourceHandle === "trigger-out") return;

    let updatedSteps: WorkflowStep[];

    if (sourceHandle === "continue" || sourceHandle === "after" || sourceHandle === "product-out" || sourceHandle === "filter-out") {
      updatedSteps = workflow.steps.map(s => {
        if (s.id !== source) return s;
        const opt = s.options[0] || { id: `opt-${Date.now()}`, label: sourceHandle === "product-out" ? "Brand Filter" : "Next" };
        return { ...s, options: [{ ...opt, nextStepId: target }] };
      });
    } else {
      const optId = sourceHandle.replace("opt-", "");
      updatedSteps = workflow.steps.map(s => {
        if (s.id !== source) return s;
        return { ...s, options: s.options.map(o => o.id === optId ? { ...o, nextStepId: target } : o) };
      });
    }

    pushHistory({ ...workflow, steps: updatedSteps });
    if (onShowToast) onShowToast("Connection created ✓");
  }, [workflow, pushHistory, onShowToast]);

  const onNodeDragStop = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.id === "trigger") return;
    const updatedSteps = workflow.steps.map(s =>
      s.id === node.id ? { ...s, position: { x: Math.round(node.position.x), y: Math.round(node.position.y) } } : s
    );
    pushHistory({ ...workflow, steps: updatedSteps });
  }, [workflow, pushHistory]);

  const onEdgesDelete = useCallback((deletedEdges: Edge[]) => {
    let updatedSteps = [...workflow.steps];
    deletedEdges.forEach(edge => {
      const h = edge.sourceHandle;
      if (!h || h === "trigger-out") return;
      if (h === "continue" || h === "after" || h === "product-out" || h === "filter-out") {
        updatedSteps = updatedSteps.map(s => {
          if (s.id !== edge.source) return s;
          return { ...s, options: s.options.map(o => ({ ...o, nextStepId: undefined })) };
        });
      } else {
        const optId = h.replace("opt-", "");
        updatedSteps = updatedSteps.map(s => {
          if (s.id !== edge.source) return s;
          return { ...s, options: s.options.map(o => o.id === optId ? { ...o, nextStepId: undefined } : o) };
        });
      }
    });
    pushHistory({ ...workflow, steps: updatedSteps });
    if (onShowToast) onShowToast("Connection removed.");
  }, [workflow, pushHistory, onShowToast]);

  const handleSaveInspector = useCallback((updatedStep: WorkflowStep) => {
    const updatedSteps = workflow.steps.map(s => s.id === updatedStep.id ? { ...updatedStep, position: s.position } : s);
    pushHistory({ ...workflow, steps: updatedSteps });
    setEditingStep(null);
    if (onShowToast) onShowToast(`Saved: ${updatedStep.title}`);
  }, [workflow, pushHistory, onShowToast]);

  const handlePublish = () => {
    onUpdateWorkflow({ ...workflow });
    setPublishedAt(new Date());
    if (onShowToast) onShowToast(`✅ "${workflow.name}" is now live on the website!`);
    setTimeout(() => setPublishedAt(null), 5000);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const payload = e.dataTransfer.getData("application/mindmap-node");
    if (!payload) return;
    const { inputType } = JSON.parse(payload) as { inputType: ToolInputType };
    
    // Enforce 1 filter node limit
    if (inputType === "filter" && workflow.steps.some(s => s.inputType === "filter")) {
      if (onShowToast) onShowToast("⚠️ Only 1 Filter Node is allowed per workflow.");
      return;
    }

    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const stepNum = workflow.steps.length + 1;
    const id = `step-${Date.now()}`;

    const baseStep: WorkflowStep = {
      id, stepNumber: stepNum, position,
      title: inputType === "filter" ? `${stepNum}. Product Filter Node` : `${stepNum}. New ${inputType.charAt(0).toUpperCase() + inputType.slice(1)} Node`,
      subtitle: inputType === "filter" ? "Filter products by brand, price, or category" : "",
      inputType,
      filterType: inputType === "filter" ? "brand" : undefined,
      primaryFilter: inputType === "filter" ? "brand" : undefined,
      enabledFilters: inputType === "filter" ? ["brand", "price"] : undefined,
      displayMode: "text",
      options: ["cards", "checkboxes", "yesno"].includes(inputType)
        ? [{ id: `opt-${Date.now()}-a`, label: "Option A" }, { id: `opt-${Date.now()}-b`, label: "Option B" }]
        : inputType === "info" ? [{ id: `opt-${Date.now()}`, label: "Continue" }]
        : inputType === "redirect" ? [{ id: `opt-${Date.now()}`, label: "After redirect" }]
        : [],
    };

    pushHistory({ ...workflow, steps: [...workflow.steps, baseStep] });
    if (onShowToast) onShowToast(`Added ${inputType} node`);
  }, [workflow, pushHistory, screenToFlowPosition, onShowToast]);

  const handleQuickAdd = (inputType: ToolInputType) => {
    // Enforce 1 filter node limit
    if (inputType === "filter" && workflow.steps.some(s => s.inputType === "filter")) {
      if (onShowToast) onShowToast("⚠️ Only 1 Filter Node is allowed per workflow.");
      return;
    }

    const stepNum = workflow.steps.length + 1;
    const id = `step-${Date.now()}`;
    const newStep: WorkflowStep = {
      id, stepNumber: stepNum,
      title: inputType === "filter" ? `${stepNum}. Product Filter Node` : `${stepNum}. New ${inputType.charAt(0).toUpperCase() + inputType.slice(1)} Node`,
      subtitle: inputType === "filter" ? "Filter products by brand, price, or category" : "",
      inputType,
      filterType: inputType === "filter" ? "brand" : undefined,
      primaryFilter: inputType === "filter" ? "brand" : undefined,
      enabledFilters: inputType === "filter" ? ["brand", "price"] : undefined,
      displayMode: "text",
      position: { x: 400 + stepNum * 30, y: 200 + (stepNum % 4) * 90 },
      options: ["cards", "checkboxes", "yesno"].includes(inputType)
        ? [{ id: `opt-${Date.now()}-a`, label: "Option A" }, { id: `opt-${Date.now()}-b`, label: "Option B" }]
        : inputType === "info" ? [{ id: `opt-${Date.now()}`, label: "Continue" }]
        : inputType === "redirect" ? [{ id: `opt-${Date.now()}`, label: "After redirect" }]
        : [],
    };
    pushHistory({ ...workflow, steps: [...workflow.steps, newStep] });
    if (onShowToast) onShowToast(`Added ${inputType} node`);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(prev => {
      const next = !prev;
      setTimeout(() => {
        fitView({ padding: 0.25 });
      }, 150);
      return next;
    });
  };

  const containerClass = isFullScreen
    ? "fixed inset-0 z-[9999] w-screen h-screen bg-white flex flex-col"
    : "relative bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm w-full h-[660px]";

  return (
    <div className={containerClass} style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Top Toolbar */}
      <div className={`flex items-center justify-between px-4 py-2.5 shrink-0 border-b ${
        isFullScreen ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#0f4c81]/10 text-[#0f4c81] flex items-center justify-center">
            <GitBranch size={15} />
          </div>
          <div>
            <p className={`font-extrabold text-sm ${isFullScreen ? "text-white" : "text-slate-900"}`}>Workflow Node Canvas</p>
            <p className={`text-[10px] ${isFullScreen ? "text-slate-400" : "text-slate-500"}`}>
              Drag nodes • Draw connections • Click ✏️ to add images & choices
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={undo} disabled={histIdx === 0} title="Undo (Ctrl+Z)"
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border ${
              histIdx === 0 ? "opacity-30 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400"
              : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700 cursor-pointer"}`}>
            <Undo2 size={14} />
          </button>
          <button onClick={redo} disabled={histIdx >= history.length - 1} title="Redo (Ctrl+Y)"
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border ${
              histIdx >= history.length - 1 ? "opacity-30 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400"
              : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700 cursor-pointer"}`}>
            <Redo2 size={14} />
          </button>

          <div className="w-px h-6 bg-slate-200 mx-1" />

          <button onClick={handlePublish}
            className={`px-3 py-1.5 font-bold text-xs rounded-xl flex items-center gap-1.5 border shadow-sm transition-all cursor-pointer ${
              publishedAt ? "bg-emerald-600 text-white border-emerald-500"
              : "bg-[#0f4c81] hover:bg-[#1c7e9f] text-white border-[#0f4c81]"}`}>
            {publishedAt ? <><CheckCircle2 size={13} />Published ✓</> : <><Cloud size={13} />Save & Publish</>}
          </button>

          <button onClick={toggleFullScreen}
            className={`px-3 py-1.5 font-bold text-xs rounded-xl flex items-center gap-1.5 border transition-colors cursor-pointer ${
              isFullScreen ? "bg-white text-slate-900 border-slate-300 hover:bg-slate-100"
              : "bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200"}`}>
            {isFullScreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            {isFullScreen ? "Exit" : "Full Screen"}
          </button>
        </div>
      </div>

      {/* Node Tools Panel */}
      <div className={`px-4 py-2.5 shrink-0 border-b ${
        isFullScreen ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-black uppercase tracking-widest mr-1 ${isFullScreen ? "text-slate-400" : "text-slate-500"}`}>
            🔧 Node Palette
          </span>
          {TOOL_ITEMS.map(tool => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.inputType}
                draggable
                onDragStart={e => {
                  e.dataTransfer.setData("application/mindmap-node", JSON.stringify({ inputType: tool.inputType }));
                  e.dataTransfer.effectAllowed = "move";
                }}
                onClick={() => handleQuickAdd(tool.inputType)}
                title={`${tool.label} — ${tool.description}. Click to add, or drag to canvas.`}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold cursor-grab active:cursor-grabbing select-none transition-all hover:shadow-sm hover:-translate-y-0.5 ${tool.colorClass}`}
              >
                <Icon size={12} />
                <span>{tool.label}</span>
              </div>
            );
          })}
          <span className={`text-[9px] ml-1 ${isFullScreen ? "text-slate-500" : "text-slate-400"}`}>
            ← click or drag to canvas
          </span>
        </div>
      </div>

      {/* Flow Canvas Area */}
      <div className="flex-1 w-full h-full relative" style={{ minHeight: isFullScreen ? "calc(100vh - 110px)" : 560 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          onEdgesDelete={onEdgesDelete}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          minZoom={0.2}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
          deleteKeyCode={["Backspace", "Delete"]}
          snapToGrid={true}
          snapGrid={[15, 15]}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="#cbd5e1" />
          <Controls position="bottom-left" showInteractive={false} />
          <MiniMap
            position="bottom-right"
            nodeStrokeWidth={3}
            zoomable
            pannable
            nodeColor={n => {
              if (n.type === "triggerNode") return "#0f4c81";
              if (n.type === "productNode") return "#10b981";
              if (n.type === "serviceNode") return "#f59e0b";
              if (n.type === "endNode") return "#10b981";
              return "#3b82f6";
            }}
            className="!bg-white !border !border-slate-200 !rounded-xl !shadow-xs"
          />
        </ReactFlow>
      </div>

      {/* Node Inspector Drawer */}
      {editingStep && (
        <NodeInspector
          step={editingStep}
          workflow={workflow}
          allProducts={products}
          allServices={services}
          onSave={handleSaveInspector}
          onClose={() => setEditingStep(null)}
        />
      )}

    </div>
  );
}

export default function MindMapCanvas(props: MindMapCanvasProps) {
  return (
    <ReactFlowProvider>
      <MindMapCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
