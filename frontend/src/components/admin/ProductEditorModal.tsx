import React, { useState, useEffect, useRef } from "react";
import { 
  X, Plus, Trash2, Check, DollarSign, Image, Package, CheckSquare, 
  ShieldCheck, EyeOff, Globe, FileText, Search, Sparkles, Layers, SlidersHorizontal,
  Upload, Cloud, Link2, Loader2, CheckCircle, RefreshCw
} from "lucide-react";
import { Product, Category } from "../../types";
import { uploadProductImage, uploadDocumentFile } from "../../services/storageService";
import { getLocalCategories, getCategories } from "../../services/categoryService";
import DirhamSymbol from "../common/DirhamSymbol";

interface ProductEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  editingProduct?: Product | null;
}

const DEFAULT_BRAND_OPTIONS = [
  "Daikin", "Midea", "Carrier", "Mitsubishi Heavy Industries",
  "Panasonic", "LG", "Samsung", "York", "Trane", "Blue Star",
  "Clivet", "Hisense", "TCL HVAC", "Gree", "Super General",
  "Brema", "Copeland", "Danfoss", "Honeywell", "COOLTECH"
];

const BRANDS_STORAGE_KEY = "cooltech_managed_brands_v1";

const getSavedBrands = (): string[] => {
  try {
    const saved = localStorage.getItem(BRANDS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to load saved brands:", e);
  }
  return DEFAULT_BRAND_OPTIONS;
};

const DEFAULT_STOCK_STATUS_OPTIONS = [
  "In Stock & Ready to Ship",
  "Lead Time Required",
  "Available on Backorder",
  "Pre-Order (1-2 Weeks)",
  "Factory Direct Dispatch",
  "Stock Out / Out of Stock"
];

const STOCK_STATUS_STORAGE_KEY = "cooltech_stock_status_labels_v1";

const getSavedStockStatuses = (): string[] => {
  try {
    const saved = localStorage.getItem(STOCK_STATUS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to load saved stock statuses:", e);
  }
  return DEFAULT_STOCK_STATUS_OPTIONS;
};

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
      if (Array.isArray(list) && list.length > 0) {
        setAvailableCategories(list);
        if (!editingProduct && (!category || category === "Air Conditioners")) {
          setCategory(list[0].name);
        }
      }
    };
    loadCats();
    const handleCatUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail) && e.detail.length > 0) {
        setAvailableCategories(e.detail);
      } else {
        setAvailableCategories(getLocalCategories());
      }
    };
    window.addEventListener("cooltech_categories_updated", handleCatUpdate);
    return () => window.removeEventListener("cooltech_categories_updated", handleCatUpdate);
  }, [editingProduct]);

  // Core basic fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(() => {
    const initialList = getLocalCategories();
    return initialList.length > 0 ? initialList[0].name : "Window A/C";
  });
  const [availableBrands, setAvailableBrands] = useState<string[]>(getSavedBrands);
  const [brand, setBrand] = useState(() => {
    const saved = getSavedBrands();
    return saved.length > 0 ? saved[0] : "Daikin";
  });
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrandInput, setNewBrandInput] = useState("");

  // Stock status dynamic options
  const [availableStockStatuses, setAvailableStockStatuses] = useState<string[]>(getSavedStockStatuses);
  const [stockStatus, setStockStatus] = useState<string>("In Stock & Ready to Ship");
  const [isAddingStockStatus, setIsAddingStockStatus] = useState(false);
  const [newStockStatusInput, setNewStockStatusInput] = useState("");
  const [showMinOrderQty, setShowMinOrderQty] = useState(true);

  // Ensure editing product's brand is present in availableBrands
  useEffect(() => {
    if (editingProduct?.brand) {
      setAvailableBrands((prev) => {
        if (prev.includes(editingProduct.brand)) return prev;
        const updated = [editingProduct.brand, ...prev];
        try {
          localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }
  }, [editingProduct]);

  const handleAddNewBrand = (brandNameToAdd?: string) => {
    const target = (brandNameToAdd || newBrandInput).trim();
    if (!target) return;
    const existing = availableBrands.find((b) => b.toLowerCase() === target.toLowerCase());
    if (existing) {
      setBrand(existing);
      setNewBrandInput("");
      setIsAddingBrand(false);
      return;
    }
    const updated = [...availableBrands, target];
    setAvailableBrands(updated);
    setBrand(target);
    try {
      localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setNewBrandInput("");
    setIsAddingBrand(false);
  };

  const handleDeleteBrand = (brandToDelete: string) => {
    if (availableBrands.length <= 1) {
      alert("At least one brand option must remain.");
      return;
    }
    if (!window.confirm(`Are you sure you want to remove "${brandToDelete}" from the brand list?`)) {
      return;
    }
    const updated = availableBrands.filter((b) => b !== brandToDelete);
    setAvailableBrands(updated);
    try {
      localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    if (brand === brandToDelete) {
      setBrand(updated[0] || "");
    }
  };

  const handleAddNewStockStatus = (statusToAdd?: string) => {
    const target = (statusToAdd || newStockStatusInput).trim();
    if (!target) return;
    const existing = availableStockStatuses.find((s) => s.toLowerCase() === target.toLowerCase());
    if (existing) {
      setStockStatus(existing);
      setNewStockStatusInput("");
      setIsAddingStockStatus(false);
      return;
    }
    const updated = [...availableStockStatuses, target];
    setAvailableStockStatuses(updated);
    setStockStatus(target);
    try {
      localStorage.setItem(STOCK_STATUS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setNewStockStatusInput("");
    setIsAddingStockStatus(false);
  };

  const handleDeleteStockStatus = (statusToDelete: string) => {
    if (availableStockStatuses.length <= 1) {
      alert("At least one stock status option must remain.");
      return;
    }
    if (!window.confirm(`Are you sure you want to remove "${statusToDelete}" from the stock status list?`)) {
      return;
    }
    const updated = availableStockStatuses.filter((s) => s !== statusToDelete);
    setAvailableStockStatuses(updated);
    try {
      localStorage.setItem(STOCK_STATUS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    if (stockStatus === statusToDelete) {
      setStockStatus(updated[0] || "In Stock & Ready to Ship");
    }
  };
  const [price, setPrice] = useState(1200);
  const [hidePrice, setHidePrice] = useState(false);
  const [rating, setRating] = useState(4.9);
  const [image, setImage] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [directUrlInput, setDirectUrlInput] = useState("");
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
      
      const loadedImages: string[] = [];
      if (editingProduct.image && editingProduct.image.trim()) {
        loadedImages.push(editingProduct.image.trim());
      }
      if (Array.isArray(editingProduct.images)) {
        editingProduct.images.forEach((img) => {
          if (img && typeof img === "string" && img.trim() && !loadedImages.includes(img.trim())) {
            loadedImages.push(img.trim());
          }
        });
      }
      setImages(loadedImages);
      setImage(loadedImages[0] || editingProduct.image || "");
      
      setDescription(editingProduct.description);
      setInStock(editingProduct.inStock);
      setMinOrderQty(editingProduct.minOrderQty || 1);
      setShowMinOrderQty(editingProduct.showMinOrderQty ?? (editingProduct.minOrderQty !== undefined && editingProduct.minOrderQty !== null && editingProduct.minOrderQty > 0));
      const initialStockStatus = editingProduct.stockStatus || (editingProduct.inStock ? "In Stock & Ready to Ship" : "Lead Time Required");
      setStockStatus(initialStockStatus);
      if (initialStockStatus) {
        setAvailableStockStatuses((prev) => {
          if (prev.includes(initialStockStatus)) return prev;
          const updated = [...prev, initialStockStatus];
          try {
            localStorage.setItem(STOCK_STATUS_STORAGE_KEY, JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      }
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
          Object.entries(editingProduct.specifications)
            .filter(([key]) => !key.startsWith("_"))
            .map(([key, value]) => ({ key, value }))
        );
      }
      if (editingProduct.features) {
        setFeatures(editingProduct.features);
      }
    } else {
      setName("");
      const initialCat = availableCategories.length > 0 ? availableCategories[0].name : "Window A/C";
      setCategory(initialCat);
      setBrand("Daikin");
      setPrice(1500);
      setHidePrice(false);
      setRating(4.9);
      const defaultImg = "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop";
      setImage(defaultImg);
      setImages([defaultImg]);
      setDescription("The Daikin Fit Slim VRF Outdoor Unit (5-Ton) represents the next generation in commercial climate performance. Engineered to satisfy rigorous efficiency parameters in tropical climates.");
      setInStock(true);
      setMinOrderQty(1);
      setShowMinOrderQty(true);
      setStockStatus("In Stock & Ready to Ship");
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

  // Cloud Multi-Image Upload Handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploadingImage(true);
      setUploadProgress(10);
      setUploadStatus(`Uploading ${files.length} image(s)...`);

      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await uploadProductImage(file, "products", (progress) => {
          const overall = Math.round(((i + progress / 100) / files.length) * 100);
          setUploadProgress(overall);
          setUploadStatus(`Uploading image ${i + 1} of ${files.length} (${overall}%)...`);
        });
        if (result?.url) {
          uploadedUrls.push(result.url);
        }
      }

      setImages((prev) => {
        const combined = [...prev];
        uploadedUrls.forEach((url) => {
          if (!combined.includes(url)) combined.push(url);
        });
        return combined;
      });

      if (!image && uploadedUrls.length > 0) {
        setImage(uploadedUrls[0]);
      }

      setUploadStatus(`${uploadedUrls.length} image(s) added successfully!`);
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err: any) {
      alert(err?.message || "Failed to process image file(s).");
      setUploadStatus(null);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddDirectUrl = () => {
    if (!directUrlInput.trim()) return;
    const url = directUrlInput.trim();
    setImages((prev) => {
      if (prev.includes(url)) return prev;
      return [...prev, url];
    });
    if (!image) {
      setImage(url);
    }
    setDirectUrlInput("");
  };

  const handleRemoveImageByIndex = (indexToRemove: number) => {
    setImages((prev) => {
      const removed = prev[indexToRemove];
      const next = prev.filter((_, i) => i !== indexToRemove);
      if (image === removed) {
        setImage(next[0] || "");
      }
      return next;
    });
  };

  const handleSetPrimaryImage = (targetUrl: string) => {
    setImage(targetUrl);
    setImages((prev) => {
      const remaining = prev.filter((u) => u !== targetUrl);
      return [targetUrl, ...remaining];
    });
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

    const matchedCategory = availableCategories.find(
      (c) => c.name.toLowerCase() === category.toLowerCase()
    );

    const finalPrimaryImage = image.trim() || (images.length > 0 ? images[0] : "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop");
    const finalImagesList = images.length > 0 ? images : [finalPrimaryImage];

    const savedProduct: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: name.trim(),
      category,
      categoryId: matchedCategory?.id || editingProduct?.categoryId,
      brand,
      price: Number(price),
      hidePrice: Boolean(hidePrice),
      rating: Number(rating),
      image: finalPrimaryImage,
      images: finalImagesList,
      description: description.trim(),
      inStock: !stockStatus.toLowerCase().includes("out of stock") && !stockStatus.toLowerCase().includes("stock out"),
      stockStatus: stockStatus.trim(),
      minOrderQty: showMinOrderQty ? Number(minOrderQty || 1) : 0,
      showMinOrderQty: Boolean(showMinOrderQty),
      badge: badge || undefined,
      isFeatured: badge === "Featured",
      tags: updatedTags,
      specifications: specificationsObj,
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
                    {category && !availableCategories.some((c) => c.name === category) && (
                      <option value={category}>{category}</option>
                    )}
                    {Array.from(
                      availableCategories.reduce((map, cat) => {
                        const groupName = cat.tag?.trim() || "General Equipment";
                        if (!map.has(groupName)) map.set(groupName, []);
                        map.get(groupName)!.push(cat);
                        return map;
                      }, new Map<string, Category[]>())
                    ).map(([groupName, cats]) => (
                      <optgroup key={groupName} label={groupName}>
                        {cats.map((c) => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Manufacturer / OEM Brand *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingBrand(!isAddingBrand);
                        setNewBrandInput("");
                      }}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>{isAddingBrand ? "Cancel" : "Add Brand"}</span>
                    </button>
                  </div>

                  {isAddingBrand ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={newBrandInput}
                        onChange={(e) => setNewBrandInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddNewBrand();
                          } else if (e.key === "Escape") {
                            setIsAddingBrand(false);
                          }
                        }}
                        placeholder="New brand name (e.g. O General)..."
                        autoFocus
                        className="flex-1 px-3 py-2 border border-blue-400 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddNewBrand()}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingBrand(false);
                          setNewBrandInput("");
                        }}
                        className="p-2 border border-slate-300 rounded-lg text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <select
                        value={brand}
                        onChange={(e) => {
                          if (e.target.value === "__NEW_BRAND__") {
                            setIsAddingBrand(true);
                          } else {
                            setBrand(e.target.value);
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-600 bg-slate-50"
                      >
                        {brand && !availableBrands.includes(brand) && (
                          <option value={brand}>{brand}</option>
                        )}
                        {availableBrands.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                        <option value="__NEW_BRAND__" className="text-blue-600 font-bold">
                          + Add New Brand...
                        </option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleDeleteBrand(brand)}
                        disabled={availableBrands.length <= 1}
                        className="p-2 border border-slate-300 hover:border-red-300 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        title={`Delete brand "${brand}" from options`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
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
                      <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        <DirhamSymbol className="h-3 w-auto" />
                        <span>Unit Price (AED)</span>
                      </label>
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
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-600">Min. Bulk Order</label>
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showMinOrderQty}
                            onChange={(e) => setShowMinOrderQty(e.target.checked)}
                            className="w-3.5 h-3.5 text-blue-600 rounded cursor-pointer"
                          />
                          <span className="text-[10px] text-blue-700 font-bold">Show MOQ</span>
                        </label>
                      </div>
                      <input
                        type="number"
                        min="1"
                        disabled={!showMinOrderQty}
                        placeholder={showMinOrderQty ? "1" : "Hidden"}
                        value={showMinOrderQty ? minOrderQty : ""}
                        onChange={(e) => setMinOrderQty(e.target.value === "" ? 1 : Number(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-lg text-xs font-bold ${
                          !showMinOrderQty ? "bg-slate-200 text-slate-400 border-slate-300" : "bg-white border-slate-300 focus:border-blue-600 text-slate-900"
                        }`}
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

                {/* CLOUD STORAGE MULTI-IMAGE UPLOADER & GALLERY */}
                <div className="sm:col-span-2 space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Image size={14} className="text-blue-600" />
                        <span>Product Visual Assets ({images.length} Photos)</span>
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Add multiple commercial photos. Click "Set Primary" on any photo to set it as the cover image.
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
                        <span>Upload Photos</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMode("url")}
                        className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                          imageInputMode === "url" ? "bg-blue-600 text-white shadow-2xs" : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <Link2 size={12} />
                        <span>Add via URL</span>
                      </button>
                    </div>
                  </div>

                  {/* Hidden File Input supporting multiple files */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />

                  {/* Upload Dropzone / Button or URL adder */}
                  {imageInputMode === "upload" ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                        isUploadingImage
                          ? "border-blue-400 bg-blue-50/50 cursor-wait"
                          : "border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/20"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                          {isUploadingImage ? (
                            <Loader2 size={18} className="animate-spin text-blue-600" />
                          ) : (
                            <Upload size={18} />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {isUploadingImage ? "Uploading photos..." : "Click or Drag to Upload Product Photos (Multiple allowed)"}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Select one or multiple PNG, JPG, WebP photos up to 10MB each
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                        value={directUrlInput}
                        onChange={(e) => setDirectUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddDirectUrl();
                          }
                        }}
                        className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-white focus:outline-none focus:border-blue-600"
                      />
                      <button
                        type="button"
                        onClick={handleAddDirectUrl}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shrink-0 cursor-pointer shadow-2xs flex items-center gap-1.5"
                      >
                        <Plus size={14} />
                        <span>Add Photo</span>
                      </button>
                    </div>
                  )}

                  {/* Upload Progress Bar */}
                  {isUploadingImage && (
                    <div className="space-y-1 bg-white p-3 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between text-[11px] font-bold text-blue-900">
                        <span className="flex items-center gap-1.5">
                          <Loader2 size={12} className="animate-spin text-blue-600" />
                          <span>{uploadStatus || "Uploading images..."}</span>
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

                  {/* Configured Photos Gallery Grid */}
                  {images.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                          Configured Photos ({images.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={12} />
                          <span>Add More</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {images.map((imgUrl, idx) => {
                          const isPrimary = image === imgUrl || (!image && idx === 0);
                          return (
                            <div
                              key={idx}
                              className={`relative group bg-white border rounded-xl overflow-hidden shadow-2xs transition-all flex flex-col justify-between ${
                                isPrimary
                                  ? "border-blue-500 ring-2 ring-blue-100"
                                  : "border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <div className="aspect-square bg-[#f8fafc] flex items-center justify-center p-2 relative overflow-hidden">
                                <img
                                  src={imgUrl}
                                  alt={`Product Asset ${idx + 1}`}
                                  className="max-h-full max-w-full object-contain rounded"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = "/src/assets/images/hvac_air_conditioner_1784350824930.jpg";
                                  }}
                                />
                                {isPrimary && (
                                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-[#031b4e] text-white rounded text-[9px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
                                    <Sparkles size={9} className="text-amber-400" />
                                    <span>Cover</span>
                                  </span>
                                )}
                              </div>

                              <div className="p-2 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-1">
                                {!isPrimary ? (
                                  <button
                                    type="button"
                                    onClick={() => handleSetPrimaryImage(imgUrl)}
                                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                                  >
                                    Set Cover
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-bold text-slate-500">
                                    Primary Cover
                                  </span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleRemoveImageByIndex(idx)}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                  title="Remove photo"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
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
                <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider">Commercial Identification & Target Applications</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <label className="text-[11px] font-bold text-slate-700">Target Applications (Comma-separated)</label>
                    <input
                      type="text"
                      placeholder="Bedrooms, Offices, Apartments, Retail Spaces"
                      value={applicationsText}
                      onChange={(e) => setApplicationsText(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Inventory Stock Status & Minimum Order Rules */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Package size={14} className="text-blue-600" />
                    <span>Inventory Availability & Minimum Order Rules</span>
                  </h4>

                  {/* Stock Status Badge Live Preview */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Preview:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      stockStatus.toLowerCase().includes("out of stock") || stockStatus.toLowerCase().includes("stock out")
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : stockStatus.toLowerCase().includes("in stock") || stockStatus.toLowerCase().includes("ready") || stockStatus.toLowerCase().includes("factory direct")
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      ● {stockStatus}
                    </span>
                    {showMinOrderQty && minOrderQty > 0 && (
                      <span className="text-[10px] text-slate-500 font-bold">
                        Min: {minOrderQty} unit(s)
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Stock Status Selector + Add / Delete */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700">Stock Availability Status *</label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingStockStatus(!isAddingStockStatus);
                          setNewStockStatusInput("");
                        }}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus size={12} />
                        <span>{isAddingStockStatus ? "Cancel" : "Add Status"}</span>
                      </button>
                    </div>

                    {isAddingStockStatus ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={newStockStatusInput}
                          onChange={(e) => setNewStockStatusInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddNewStockStatus();
                            } else if (e.key === "Escape") {
                              setIsAddingStockStatus(false);
                            }
                          }}
                          placeholder="e.g. In Transit (Arriving 3 Days)..."
                          autoFocus
                          className="flex-1 px-3 py-1.5 border border-blue-400 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddNewStockStatus()}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingStockStatus(false);
                            setNewStockStatusInput("");
                          }}
                          className="p-1.5 border border-slate-300 rounded-lg text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                          title="Cancel"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <select
                          value={stockStatus}
                          onChange={(e) => {
                            if (e.target.value === "__NEW_STOCK_STATUS__") {
                              setIsAddingStockStatus(true);
                            } else {
                              setStockStatus(e.target.value);
                            }
                          }}
                          className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-600 bg-white"
                        >
                          {stockStatus && !availableStockStatuses.includes(stockStatus) && (
                            <option value={stockStatus}>{stockStatus}</option>
                          )}
                          {availableStockStatuses.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                          <option value="__NEW_STOCK_STATUS__" className="text-blue-600 font-bold">
                            + Add Custom Status...
                          </option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleDeleteStockStatus(stockStatus)}
                          disabled={availableStockStatuses.length <= 1}
                          className="p-1.5 border border-slate-300 hover:border-red-300 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          title={`Delete "${stockStatus}" from status options`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* MOQ Visibility & Value */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700">Minimum Bulk Order Requirement</label>
                      <label className="inline-flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showMinOrderQty}
                          onChange={(e) => setShowMinOrderQty(e.target.checked)}
                          className="w-3.5 h-3.5 text-blue-600 rounded cursor-pointer"
                        />
                        <span className="text-[10px] text-blue-600 font-bold">Display MOQ Badge</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        disabled={!showMinOrderQty}
                        placeholder={showMinOrderQty ? "e.g. 1" : "MOQ Hidden on Product Page"}
                        value={showMinOrderQty ? minOrderQty : ""}
                        onChange={(e) => setMinOrderQty(e.target.value === "" ? 1 : Number(e.target.value))}
                        className={`flex-1 px-3 py-1.5 border rounded-lg text-xs font-bold ${
                          !showMinOrderQty ? "bg-slate-200 text-slate-400 border-slate-300" : "bg-white border-slate-300 focus:border-blue-600 text-slate-900"
                        }`}
                      />
                      <span className="text-[11px] text-slate-500 font-semibold shrink-0">units minimum</span>
                    </div>
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
