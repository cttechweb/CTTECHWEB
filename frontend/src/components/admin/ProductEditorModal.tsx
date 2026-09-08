import React, { useState, useEffect, useRef } from "react";
import { 
  X, Plus, Trash2, Check, DollarSign, Image, Package, CheckSquare, 
  ShieldCheck, EyeOff, Globe, FileText, Search, Sparkles, Layers, SlidersHorizontal,
  Upload, Cloud, Link2, Loader2, CheckCircle, RefreshCw
} from "lucide-react";
import { Product, Category } from "../../types";
import { uploadProductImage, uploadDocumentFile } from "../../services/storageService";
import { getLocalCategories, getCategories } from "../../services/categoryService";

interface ProductEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  editingProduct?: Product | null;
}

const BRAND_OPTIONS = [
  "Daikin", "Midea", "Carrier", "Mitsubishi Heavy Industries",
  "Panasonic", "LG", "Samsung", "York", "Trane", "Blue Star",
  "Clivet", "Hisense", "TCL HVAC", "Gree", "Super General",
  "Brema", "Copeland", "Danfoss", "Honeywell", "COOLTECH"
];

export default function ProductEditorModal({
  isOpen,
  onClose,
  onSave,
  editingProduct
}: ProductEditorModalProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "specs" | "features" | "seo">("basic");
  const [availableCategories, setAvailableCategories] = useState<Category[]>(getLocalCategories);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadCats = async () => {
      const list = await getCategories();
      setAvailableCategories(list);
    };
    loadCats();
    const handleCatUpdate = (e: any) => {
      if (e.detail) {
        setAvailableCategories(e.detail);
      } else {
        setAvailableCategories(getLocalCategories());
      }
    };
    window.addEventListener("cooltech_categories_updated", handleCatUpdate);
    return () => window.removeEventListener("cooltech_categories_updated", handleCatUpdate);
  }, []);

  // Core basic fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Air Conditioners");
  const [brand, setBrand] = useState("Daikin");
  const [price, setPrice] = useState(1200);
  const [hidePrice, setHidePrice] = useState(false);
  const [rating, setRating] = useState(4.9);
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [inStock, setInStock] = useState(true);
  const [minOrderQty, setMinOrderQty] = useState(1);
  const [badge, setBadge] = useState<string>("");

  // Cloud Image Upload State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("upload");

  // Extended Sourcing & Tech Specs
  const [modelId, setModelId] = useState("");
  const [series, setSeries] = useState("");
  const [sourcingChannel, setSourcingChannel] = useState("DIRECT OEM WHOLESALE");
  const [certification, setCertification] = useState("CE / AHRI CERTIFIED");
  const [primaryRegion, setPrimaryRegion] = useState("GCC & UAE MARKET");
  const [applicationsText, setApplicationsText] = useState("Commercial Complexes, Data Centers, Industrial Processing, Healthcare");

  // Key-value specifications
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: "Cooling Capacity", value: "60,000 BTU/h (5 Ton)" },
    { key: "Compressor Type", value: "Twin-Screw Inverter" },
    { key: "Refrigerant", value: "R-410A Eco-Friendly" },
    { key: "Power Supply", value: "208-230V, 1-Phase, 60Hz" }
  ]);

  // Bullet features
  const [features, setFeatures] = useState<string[]>([
    "Variable-speed inverter compressor for supreme temperature stability",
    "Saves up to 40% space compared to traditional outdoor units",
    "Anti-corrosion Blue Fin heat exchanger coating",
    "Backed by manufacturer 10-Year commercial warranty"
  ]);
  const [newFeatureText, setNewFeatureText] = useState("");

  // Technical PDF Documents
  const [documents, setDocuments] = useState<{ name: string; url: string; size?: string }[]>([
    { name: "Technical Spec Sheet (PDF)", url: "https://example.com/specs.pdf", size: "1.2 MB" },
    { name: "CAD Installation Drawing", url: "https://example.com/cad.dwg", size: "4.5 MB" }
  ]);
  const [docName, setDocName] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("HVAC Sourcing Dubai, VRF Units UAE, Daikin Wholesale");

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setCategory(editingProduct.category);
      setBrand(editingProduct.brand);
      setPrice(editingProduct.price);
      setHidePrice(Boolean(editingProduct.hidePrice));
      setRating(editingProduct.rating || 4.9);
      setImage(editingProduct.image);
      setDescription(editingProduct.description);
      setInStock(editingProduct.inStock);
      setMinOrderQty(editingProduct.minOrderQty || 1);
      setBadge(editingProduct.badge || (editingProduct.isFeatured ? "Featured" : ""));

      setModelId(editingProduct.modelId || `DAI-${editingProduct.id.toUpperCase()}`);
      setSeries(editingProduct.series || "PRO-SERIES");
      setSourcingChannel(editingProduct.sourcingChannel || "DIRECT OEM WHOLESALE");
      setCertification(editingProduct.certification || "CE / AHRI CERTIFIED");
      setPrimaryRegion(editingProduct.primaryRegion || "GCC & UAE MARKET");
      setApplicationsText((editingProduct.applications || ["Commercial", "Industrial", "Healthcare"]).join(", "));
      setDocuments(editingProduct.documents || []);

      setSeoTitle(editingProduct.seoTitle || `${editingProduct.name} Sourcing Dubai | Cool Technologies`);
      setSeoDescription(editingProduct.seoDescription || editingProduct.description);
      setSeoKeywords(editingProduct.seoKeywords || `${editingProduct.name}, HVAC Dubai, Wholesale UAE`);

      if (editingProduct.specifications) {
        setSpecs(
          Object.entries(editingProduct.specifications).map(([key, value]) => ({ key, value }))
        );
      }
      if (editingProduct.features) {
        setFeatures(editingProduct.features);
      }
    } else {
      setName("");
      setCategory("Air Conditioners");
      setBrand("Daikin");
      setPrice(1500);
      setHidePrice(false);
      setRating(4.9);
      setImage("https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop");
      setDescription("The Daikin Fit Slim VRF Outdoor Unit (5-Ton) represents the next generation in commercial climate performance. Engineered to satisfy rigorous efficiency parameters in tropical climates.");
      setInStock(true);
      setMinOrderQty(1);
      setBadge("");

      setModelId(`DAI-PROD-${Math.floor(1000 + Math.random() * 9000)}`);
      setSeries("DAI-AIR");
      setSourcingChannel("DIRECT OEM WHOLESALE");
      setCertification("CE / AHRI CERTIFIED");
      setPrimaryRegion("GCC & UAE MARKET");
      setApplicationsText("Commercial Complexes, Critical Data Centers, Industrial Processing, Healthcare & Public");

      setSeoTitle("Daikin Fit Slim VRF Outdoor Unit Sourcing Dubai | Cool Technologies");
      setSeoDescription("Direct B2B OEM wholesale Daikin VRF units in Dubai and UAE. High ambient T3 tropical compressor, CE/AHRI certified.");
      setSeoKeywords("Daikin VRF Dubai, Commercial AC Sourcing UAE, Chiller Wholesale");
    }
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  // Calculate live Pro SEO Audit Score
  const calculateSeoScore = (): number => {
    let score = 50;
    if (name.length > 10) score += 10;
    if (seoTitle.length >= 30 && seoTitle.length <= 65) score += 15;
    if (seoDescription.length >= 70 && seoDescription.length <= 160) score += 15;
    if (image.length > 5) score += 5;
    if (features.length >= 3) score += 5;
    return Math.min(100, score);
  };

  const currentSeoScore = calculateSeoScore();

  // Cloud Image Upload Handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      setUploadProgress(10);
      setUploadStatus("Connecting to Cloud Storage...");

      const result = await uploadProductImage(file, "products", (progress) => {
        setUploadProgress(progress);
        setUploadStatus(`Uploading image (${progress}%)...`);
      });

      setImage(result.url);
      setUploadStatus(result.isCloud ? "Uploaded to Firebase Cloud Storage!" : "Image loaded successfully!");
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err: any) {
      alert(err?.message || "Failed to process image file.");
      setUploadStatus(null);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setImage("");
    setUploadStatus(null);
  };

  const handleAddSpec = () => {
    setSpecs([...specs, { key: "Parameter", value: "Value" }]);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleAddFeature = () => {
    if (newFeatureText.trim()) {
      setFeatures([...features, newFeatureText.trim()]);
      setNewFeatureText("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleAddDocument = () => {
    if (docName.trim() && docUrl.trim()) {
      setDocuments([...documents, { name: docName.trim(), url: docUrl.trim(), size: "PDF Spec" }]);
      setDocName("");
      setDocUrl("");
    }
  };

  const handleUploadDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingDoc(true);
    try {
      const res = await uploadDocumentFile(file, "documents/products");
      if (res && res.url) {
        const title = docName.trim() || file.name.replace(/\.[^/.]+$/, "");
        setDocuments([...documents, { name: title, url: res.url, size: `${Math.round(file.size / 1024)} KB` }]);
        setDocName("");
        setDocUrl("");
      }
    } catch (err) {
      console.error("Failed to upload document:", err);
      alert("Failed to upload document to Cloudflare storage.");
    } finally {
      setIsUploadingDoc(false);
      if (docFileInputRef.current) docFileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (!name.trim()) {
      alert("Please provide a product title.");
      return;
    }

    const specificationsObj: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim()) specificationsObj[s.key.trim()] = s.value;
    });

    const applicationsList = applicationsText
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    const existingTags = editingProduct?.tags || [];
    let updatedTags = [...existingTags];
    if (badge && badge.trim()) {
      if (!updatedTags.includes(badge.trim())) {
        updatedTags.push(badge.trim());
      }
    } else {
      updatedTags = updatedTags.filter(
        (t) => !/best seller|featured|new|popular/i.test(t)
      );
    }

    const savedProduct: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: name.trim(),
      category,
      brand,
      price: Number(price),
      hidePrice: Boolean(hidePrice),
      rating: Number(rating),
      image: image.trim() || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop",
      description: description.trim(),
      inStock,
      minOrderQty: Number(minOrderQty),
      badge: badge || undefined,
      isFeatured: badge === "Featured",
      tags: updatedTags,
      specifications: {
        ...specificationsObj,
        _badge: badge || "",
        _isFeatured: badge === "Featured" ? "true" : "false",
        _hidePrice: hidePrice ? "true" : "false",
      },
      features,
      modelId: modelId.trim() || `MOD-${Date.now()}`,
      series: series.trim() || "STANDARD",
      sourcingChannel,
      certification,
      primaryRegion,
      applications: applicationsList,
      documents,
      seoTitle: seoTitle.trim() || `${name} | Cool Technologies`,
      seoDescription: seoDescription.trim() || description.substring(0, 155),
      seoKeywords,
      seoScore: currentSeoScore
    };

    try {
      setIsSaving(true);
      await onSave(savedProduct);
      onClose();
    } catch (err) {
      console.error("Failed to save product:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#031b4e] text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/30">
              <Package size={18} />
            </div>
            <div>
              <h2 className="font-extrabold text-sm uppercase tracking-wider text-white">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : "Create Comprehensive Product Specification"}
              </h2>
              <p className="text-[11px] text-blue-200 font-medium">Fill full commercial specs, pricing controls, and SEO metadata</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 pt-2 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`px-4 py-2.5 text-xs font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "basic"
                ? "border-[#031b4e] text-[#031b4e] bg-white rounded-t-lg shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <DollarSign size={14} />
            <span>1. Basic & Pricing</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("specs")}
            className={`px-4 py-2.5 text-xs font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "specs"
                ? "border-[#031b4e] text-[#031b4e] bg-white rounded-t-lg shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>2. Sourcing & Specs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("features")}
            className={`px-4 py-2.5 text-xs font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "features"
                ? "border-[#031b4e] text-[#031b4e] bg-white rounded-t-lg shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <CheckSquare size={14} />
            <span>3. Features & PDF Docs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("seo")}
            className={`px-4 py-2.5 text-xs font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "seo"
                ? "border-[#031b4e] text-[#031b4e] bg-white rounded-t-lg shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Globe size={14} />
            <span>4. Pro SEO Engine</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
              currentSeoScore >= 80 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }`}>
              {currentSeoScore}/100
            </span>
          </button>
        </div>

        {/* Main Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: BASIC & PRICING */}
          {activeTab === "basic" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Product Title / Full Model Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Daikin Fit Slim VRF Outdoor Unit (5-Ton)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-600 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Equipment Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-600 bg-slate-50"
                  >
                    {availableCategories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Manufacturer / OEM Brand *</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-600 bg-slate-50"
                  >
                    {BRAND_OPTIONS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* Product Promotion Tag / Badge Selector */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <Sparkles size={13} className="text-amber-500" />
                    <span>Product Promotion Tag / Badge</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Tag this product to display special badges and highlight it in the homepage Featured Products section.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: "", label: "None", color: "border-slate-300 bg-slate-50 text-slate-700" },
                      { id: "Best Seller", label: "Best Seller", color: "border-amber-400 bg-amber-50 text-amber-900" },
                      { id: "Featured", label: "Featured", color: "border-blue-400 bg-blue-50 text-[#0f4c81]" },
                      { id: "New", label: "New", color: "border-emerald-400 bg-emerald-50 text-emerald-900" },
                      { id: "Popular", label: "Popular", color: "border-slate-800 bg-[#031b4e] text-white" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setBadge(opt.id)}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                          badge === opt.id
                            ? `${opt.color} ring-2 ring-blue-500 shadow-xs font-black`
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PRICING & HIDE PRICE CONTROLS */}
                <div className="sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign size={14} className="text-blue-600" />
                      <span>B2B Wholesale Pricing & Display Rules</span>
                    </h4>

                    {/* HIDE PRICE CHECKBOX TOGGLE */}
                    <label className="inline-flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-2xs hover:bg-slate-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={hidePrice}
                        onChange={(e) => setHidePrice(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      />
                      <EyeOff size={14} className={hidePrice ? "text-amber-600" : "text-slate-400"} />
                      <span className="text-xs font-black text-slate-800">Hide Price (Show "Call for Price")</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600">Unit Price ($ USD)</label>
                      <input
                        type="number"
                        disabled={hidePrice}
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className={`w-full mt-1 px-3 py-2 border rounded-lg text-xs font-bold ${
                          hidePrice ? "bg-slate-200 text-slate-400 border-slate-300" : "bg-white border-slate-300 focus:border-blue-600 text-slate-900"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600">Minimum Order Qty (B2B)</label>
                      <input
                        type="number"
                        min="1"
                        value={minOrderQty}
                        onChange={(e) => setMinOrderQty(Number(e.target.value))}
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600">Star Rating (1 - 5.0)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-white"
                      />
                    </div>
                  </div>

                  {hidePrice && (
                    <p className="text-[11px] font-bold text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                      ℹ️ Price will be hidden on website cards and detail pages. Users will see "Contact for Wholesale Rate" with instant RFQ button.
                    </p>
                  )}
                </div>

                {/* CLOUD STORAGE IMAGE UPLOADER & PREVIEW */}
                <div className="sm:col-span-2 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Image size={14} className="text-blue-600" />
                        <span>Product Visual Specification Asset</span>
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Upload high-resolution commercial HVAC equipment photography or link via direct URL.
                      </p>
                    </div>

                    {/* Mode Toggle (Upload vs Direct URL) */}
                    <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setImageInputMode("upload")}
                        className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                          imageInputMode === "upload" ? "bg-blue-600 text-white shadow-2xs" : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <Upload size={12} />
                        <span>Upload Image</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMode("url")}
                        className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                          imageInputMode === "url" ? "bg-blue-600 text-white shadow-2xs" : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <Link2 size={12} />
                        <span>Direct URL</span>
                      </button>
                    </div>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {/* Upload Dropzone / Button */}
                  {imageInputMode === "upload" ? (
                    <div className="space-y-3">
                      {!image ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                            isUploadingImage
                              ? "border-blue-400 bg-blue-50/50 cursor-wait"
                              : "border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/20"
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                              {isUploadingImage ? (
                                <Loader2 size={20} className="animate-spin text-blue-600" />
                              ) : (
                                <Upload size={20} />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">
                                {isUploadingImage ? "Uploading image..." : "Click or Drag to Upload Product Image"}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Supports PNG, JPG, WebP, SVG up to 10MB
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Image Preview Card */
                        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                          <div className="w-24 h-24 rounded-lg bg-slate-900/5 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 p-1">
                            <img
                              src={image}
                              alt="Product Preview"
                              className="max-h-full max-w-full object-contain rounded"
                            />
                          </div>

                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">Current Product Image</span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <CheckCircle size={10} />
                                <span>Ready</span>
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono truncate bg-slate-50 p-1.5 rounded border border-slate-200">
                              {image}
                            </p>

                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingImage}
                                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <RefreshCw size={12} className={isUploadingImage ? "animate-spin" : ""} />
                                <span>Replace Image</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <Trash2 size={12} />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Upload Progress Bar */}
                      {isUploadingImage && (
                        <div className="space-y-1 bg-white p-3 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between text-[11px] font-bold text-blue-900">
                            <span className="flex items-center gap-1.5">
                              <Loader2 size={12} className="animate-spin text-blue-600" />
                              <span>{uploadStatus || "Uploading image..."}</span>
                            </span>
                            <span className="font-mono">{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full transition-all duration-200"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {uploadStatus && !isUploadingImage && (
                        <p className="text-[11px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                          <CheckCircle size={12} />
                          <span>{uploadStatus}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    /* Manual Direct URL Input */
                    <div>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... or https://firebasestorage.googleapis.com/..."
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-white focus:outline-none focus:border-blue-600"
                      />
                      {image && (
                        <div className="mt-2.5 flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200">
                          <img src={image} alt="Preview" className="w-10 h-10 object-contain rounded border border-slate-100 bg-slate-50" />
                          <span className="text-xs text-slate-600 truncate font-mono">{image}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Full Product Overview Description</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full mt-1 p-3 border border-slate-300 rounded-lg text-xs leading-relaxed bg-slate-50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXTENDED SOURCING & SPECS */}
          {activeTab === "specs" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-3">
                <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider">Commercial Sourcing & Regional Compliance</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Model ID / SKU</label>
                    <input
                      type="text"
                      placeholder="e.g. DAI-PROD-AC-1"
                      value={modelId}
                      onChange={(e) => setModelId(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded text-xs font-mono bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Equipment Series</label>
                    <input
                      type="text"
                      placeholder="e.g. DAI-AIR"
                      value={series}
                      onChange={(e) => setSeries(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded text-xs font-bold bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Sourcing Channel</label>
                    <input
                      type="text"
                      placeholder="e.g. DIRECT OEM WHOLESALE"
                      value={sourcingChannel}
                      onChange={(e) => setSourcingChannel(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded text-xs font-bold bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Certification</label>
                    <input
                      type="text"
                      placeholder="e.g. CE / AHRI CERTIFIED"
                      value={certification}
                      onChange={(e) => setCertification(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded text-xs font-bold bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Primary Market Region</label>
                    <input
                      type="text"
                      placeholder="e.g. GCC & UAE MARKET"
                      value={primaryRegion}
                      onChange={(e) => setPrimaryRegion(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded text-xs font-bold bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Target Applications (Comma-separated)</label>
                    <input
                      type="text"
                      placeholder="Commercial Complexes, Data Centers, Healthcare"
                      value={applicationsText}
                      onChange={(e) => setApplicationsText(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Technical Specifications Matrix Rows */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Technical Specification Matrix</h3>
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="px-2.5 py-1 bg-[#031b4e] text-white text-[11px] font-bold rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Add Parameter Row</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {specs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Parameter Name (e.g. Cooling Capacity)"
                        value={spec.key}
                        onChange={(e) => {
                          const updated = [...specs];
                          updated[i].key = e.target.value;
                          setSpecs(updated);
                        }}
                        className="w-1/2 px-3 py-1.5 border border-slate-300 rounded text-xs font-bold bg-slate-50"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. 60,000 BTU/h / 5-Ton)"
                        value={spec.value}
                        onChange={(e) => {
                          const updated = [...specs];
                          updated[i].value = e.target.value;
                          setSpecs(updated);
                        }}
                        className="w-1/2 px-3 py-1.5 border border-slate-300 rounded text-xs bg-slate-50"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(i)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FEATURES & PDF DOCUMENTS */}
          {activeTab === "features" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Bullet features */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Key Product Features & Highlights</h3>
                
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add bullet feature (e.g. Anti-corrosion Blue Fin heat exchanger coating)..."
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddFeature(); } }}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2 bg-[#031b4e] text-white font-bold text-xs rounded-lg"
                  >
                    Add Feature
                  </button>
                </div>

                <ul className="space-y-1.5">
                  {features.map((feat, i) => (
                    <li key={i} className="flex items-start justify-between gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-medium">
                      <div className="flex items-start gap-2">
                        <CheckSquare size={14} className="text-blue-600 mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(i)}
                        className="text-slate-400 hover:text-red-600 shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technical PDF Documents */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-600" />
                  <span>Technical PDF Documentation & Drawings</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Document Title (e.g. Daikin Technical Data Book PDF)"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded text-xs"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="URL Link (https://...)"
                      value={docUrl}
                      onChange={(e) => setDocUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddDocument}
                      className="px-3 py-1.5 bg-slate-800 text-white font-bold text-xs rounded shrink-0 cursor-pointer hover:bg-slate-900 transition-colors"
                    >
                      Add URL
                    </button>
                    <input
                      type="file"
                      ref={docFileInputRef}
                      onChange={handleUploadDoc}
                      accept=".pdf,.doc,.docx,.dwg"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => docFileInputRef.current?.click()}
                      disabled={isUploadingDoc}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {isUploadingDoc ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={12} />
                          <span>Upload File</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold">
                      <div className="flex items-center gap-2 truncate">
                        <FileText size={14} className="text-red-600 shrink-0" />
                        <span className="truncate">{doc.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDocuments(documents.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-red-600 shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRO SEO ENGINE */}
          {activeTab === "seo" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Live Audit Score Card */}
              <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-base flex items-center justify-center shadow-md">
                    {currentSeoScore}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Technical SEO & Schema Health Score</h4>
                    <p className="text-[11px] text-blue-200">
                      {currentSeoScore >= 80 ? "✅ Excellent: Full Schema.org, Canonical Tag & OpenGraph Metadata Ready" : "⚠️ Needs Optimization"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                  <span className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded border border-emerald-400/30">Schema: Active</span>
                  <span className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded border border-cyan-400/30">Index: Yes</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>SEO Meta Title Tag (30-65 chars)</span>
                    <span className={seoTitle.length >= 30 && seoTitle.length <= 65 ? "text-emerald-600" : "text-amber-600"}>
                      {seoTitle.length} chars
                    </span>
                  </div>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-slate-50"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>SEO Meta Description Tag (70-160 chars)</span>
                    <span className={seoDescription.length >= 70 && seoDescription.length <= 160 ? "text-emerald-600" : "text-amber-600"}>
                      {seoDescription.length} chars
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    className="w-full mt-1 p-3 border border-slate-300 rounded-lg text-xs leading-relaxed bg-slate-50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Target SEO Keywords (Comma-separated)</label>
                  <input
                    type="text"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-slate-50"
                  />
                </div>
              </div>

            </div>
          )}

          {/* Footer Submit Bar */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between shrink-0">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span>In-Stock Inventory Available</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-[#031b4e] hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition-colors shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={15} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    <span>Save Full Specifications</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>

    </div>
  );
}
