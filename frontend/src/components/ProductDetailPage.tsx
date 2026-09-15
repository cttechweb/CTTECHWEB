import { useState, useMemo, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  FileText, 
  ShieldCheck, 
  Truck, 
  Award, 
  Settings, 
  Cpu, 
  Layers, 
  Heart, 
  ChevronDown, 
  ExternalLink,
  ChevronRightSquare,
  BadgeAlert,
  CornerDownRight,
  Sparkles,
  Database,
  Building,
  Wrench,
  Thermometer,
  Zap,
  CheckCircle,
  HelpCircle,
  ShoppingCart,
  Mail,
  FileCheck,
  Share2,
  Copy,
  Check,
  X,
  MessageSquare,
  Linkedin,
  Twitter
} from "lucide-react";
import { Product } from "../types";
import { PRODUCTS } from "../data";
import { ProductCard } from "./ProductCard";
import { openProductWhatsAppOrder } from "../utils/whatsappOrder";
import { getSocialSeoSettings } from "../services/generalSettingsService";
import { useWishlist } from "../context/WishlistContext";
import { getProductSlug, matchesProductIdentifier } from "../utils/productSlug";
import DirhamSymbol from "./common/DirhamSymbol";

interface ProductDetailPageProps {
  productId: string;
  products?: Product[];
  onBack?: () => void;
  onBackToCatalog?: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onOpenQuoteWithProduct: (productName: string) => void;
  b2bDiscountRate: number;
}

export default function ProductDetailPage({
  productId,
  products,
  onBackToCatalog,
  onAddToCart,
  onOpenQuoteWithProduct,
  b2bDiscountRate
}: ProductDetailPageProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const activeProducts = products || PRODUCTS;
  // Find primary product
  const cleanId = (productId || "").split("?")[0].replace(/\/$/, "");
  const product =
    activeProducts.find((p) => matchesProductIdentifier(p, cleanId)) ||
    activeProducts.find((p) => matchesProductIdentifier(p, productId)) ||
    activeProducts[0];
  
  // States
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<"features" | "specs" | "apps" | "docs">("features");
  const quantity = product.minOrderQty || 1;
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopiedLink, setIsCopiedLink] = useState(false);

  // Sync address bar to SEO slug if accessed via ID or legacy route
  useEffect(() => {
    if (product) {
      const slug = getProductSlug(product);
      const targetHash = `#/product/${slug}`;
      if (window.location.hash.startsWith("#/product/") && window.location.hash !== targetHash) {
        window.history.replaceState(null, "", targetHash);
      }
    }
  }, [product]);

  // Reset tab and active image when productId changes
  useEffect(() => {
    setActiveImageIdx(0);
    setActiveTab("features");
  }, [productId]);

  // Find relatable / related products
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const others = activeProducts.filter(
      (p) => p.id !== product.id && (p.status as string) !== "inactive" && (p.status as string) !== "archived"
    );

    const sameCategory = others.filter(
      (p) => p.category && product.category && p.category.toLowerCase() === product.category.toLowerCase()
    );
    const sameBrand = others.filter(
      (p) => p.brand && product.brand && p.brand.toLowerCase() === product.brand.toLowerCase() && !sameCategory.some((sc) => sc.id === p.id)
    );
    const remaining = others.filter(
      (p) => !sameCategory.some((sc) => sc.id === p.id) && !sameBrand.some((sb) => sb.id === p.id)
    );

    return [...sameCategory, ...sameBrand, ...remaining].slice(0, 4);
  }, [activeProducts, product]);

  const handleSelectRelatedProduct = (p: Product) => {
    window.location.hash = `#/product/${getProductSlug(p)}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Deduplicate product images: only include genuine images, never duplicate single images into 4
  const productImages = useMemo(() => {
    if (!product) return [];
    const set = new Set<string>();
    if (product.image && product.image.trim()) {
      set.add(product.image.trim());
    }
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img && typeof img === "string" && img.trim()) {
          set.add(img.trim());
        }
      });
    }
    const list = Array.from(set);
    return list.length > 0 ? list : ["/src/assets/images/hvac_air_conditioner_1784350824930.jpg"];
  }, [product]);

  // Clean dynamic specifications without internal metadata flags
  const cleanSpecs = useMemo(() => {
    if (!product?.specifications) return [];
    return Object.entries(product.specifications).filter(
      ([key]) => !key.startsWith("_")
    );
  }, [product?.specifications]);

  const specs = product.specifications || {};
  const coolingCap = specs["Cooling Capacity (BTU)"] || specs["Cooling Capacity (TR)"] || specs["Cooling Capacity"] || specs["Capacity"] || (cleanSpecs[0] ? cleanSpecs[0][1] : "N/A");
  const compressorType = specs["Compressor Type"] || specs["Type of Compressor"] || (cleanSpecs[1] ? cleanSpecs[1][1] : (product.category === "Compressors" ? "Scroll" : "Rotary"));
  const refrigerant = specs["Refrigerant"] || specs["Refrigerant Type"] || (cleanSpecs[2] ? cleanSpecs[2][1] : "R-32");
  const powerSupply = specs["Power Supply"] || specs["Voltage"] || specs["Power Source"] || (cleanSpecs[3] ? cleanSpecs[3][1] : "Standard AC");
  const warranty = specs["Warranty"] || "Standard Commercial Warranty";

  // Determine promotional badge (Featured, Best Seller, etc.)
  const isFeatured = useMemo(() => {
    if (!product) return false;
    return (
      product.isFeatured === true ||
      product.badge?.toLowerCase() === "featured" ||
      product.specifications?._badge?.toLowerCase() === "featured" ||
      product.specifications?._isFeatured === "true" ||
      (Array.isArray(product.tags) && product.tags.some((t) => t.toLowerCase().includes("featured")))
    );
  }, [product]);

  const promotionalBadge = useMemo(() => {
    if (!product) return null;
    return product.badge || product.specifications?._badge || null;
  }, [product]);

  // First 4 technical specifications directly from the product specification matrix
  const firstFourSpecs = useMemo(() => {
    return cleanSpecs.slice(0, 4);
  }, [cleanSpecs]);

  const getSpecIcon = (keyName: string, index: number) => {
    const k = keyName.toLowerCase();
    if (k.includes("cooling") || k.includes("capacity") || k.includes("temp") || k.includes("btu")) {
      return <Thermometer size={16} className="stroke-[2.5]" />;
    }
    if (k.includes("compressor") || k.includes("motor") || k.includes("control") || k.includes("type")) {
      return <Settings size={16} className="stroke-[2.5]" />;
    }
    if (k.includes("refrigerant") || k.includes("airflow") || k.includes("air") || k.includes("gas") || k.includes("coil")) {
      return <Layers size={16} className="stroke-[2.5]" />;
    }
    if (k.includes("power") || k.includes("energy") || k.includes("voltage") || k.includes("efficiency") || k.includes("star") || k.includes("supply")) {
      return <Zap size={16} className="stroke-[2.5]" />;
    }
    const icons = [
      <Thermometer size={16} className="stroke-[2.5]" />,
      <Settings size={16} className="stroke-[2.5]" />,
      <Layers size={16} className="stroke-[2.5]" />,
      <Zap size={16} className="stroke-[2.5]" />
    ];
    return icons[index % icons.length];
  };

  const dynamicApplications = useMemo(() => {
    if (Array.isArray(product.applications) && product.applications.length > 0) {
      return product.applications;
    }
    const fromSpecs = product.specifications?.["Target Applications"] || product.specifications?.["Applications"];
    if (fromSpecs) {
      return fromSpecs.split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (Array.isArray(product.tags) && product.tags.length > 0) {
      return product.tags.filter((t) => !/best seller|featured|new|popular/i.test(t));
    }
    return [];
  }, [product]);

  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handlePrevImage = () => {
    setActiveImageIdx((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIdx((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  // Auto-sliding every 3.5 seconds when multiple images exist (pauses on hover)
  useEffect(() => {
    if (productImages.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setActiveImageIdx((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
    }, 3500);
    return () => clearInterval(interval);
  }, [productImages.length, isHovered]);

  // Touch Swipe Gesture Support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 40) {
      // Swiped left -> next photo
      handleNextImage();
    } else if (distance < -40) {
      // Swiped right -> prev photo
      handlePrevImage();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const discountedPrice = b2bDiscountRate > 0 
    ? product.price * (1 - b2bDiscountRate) 
    : product.price;

  return (
    <div className="w-full bg-white min-h-screen py-6 md:py-10 text-slate-800" id="product-detail-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumbs Navigation Bar matching image */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 text-xs text-slate-400 font-semibold" id="breadcrumbs">
          <div className="flex items-center gap-1.5">
            <button 
              onClick={onBackToCatalog}
              className="hover:text-[#2596be] transition-colors flex items-center gap-1"
            >
              Home
            </button>
            <span>&gt;</span>
            <button 
              onClick={onBackToCatalog}
              className="hover:text-[#2596be] transition-colors"
            >
              Products
            </button>
            <span>&gt;</span>
            <span className="text-[#2596be] uppercase">{product.category}</span>
            <span>&gt;</span>
            <span className="text-slate-600 truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
          </div>
          
          <button 
            onClick={onBackToCatalog}
            className="flex items-center gap-1.5 text-slate-500 hover:text-[#2596be] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Inventory</span>
          </button>
        </div>

        {/* TOP SECTION: Gallery & High-Level Specifications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 py-4 mb-10 text-slate-800" id="product-overview-card">
          
          {/* Left Column: Image Gallery Module (col-span 5) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Active Main Image Container with Auto-Slide & Touch-Swipe */}
            <div 
              className="relative aspect-video sm:aspect-square bg-[#f8fafc] border border-slate-100 rounded-xl overflow-hidden flex items-center justify-center group select-none transition-all"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              
              {/* Floating Top-Left Tag: Featured Product Tag */}
              {isFeatured ? (
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-[#031b4e] text-white shadow-md border border-slate-700/60">
                    <Sparkles size={13} className="text-amber-400 stroke-[2.5]" />
                    <span>Featured Product</span>
                  </span>
                </div>
              ) : promotionalBadge ? (
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 pointer-events-none">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-slate-800 text-white shadow-md">
                    <span>{promotionalBadge}</span>
                  </span>
                </div>
              ) : null}

              <img 
                key={activeImageIdx}
                src={productImages[activeImageIdx]} 
                alt={product.name} 
                className="max-h-[85%] max-w-[85%] object-contain mix-blend-multiply transition-all duration-500 group-hover:scale-105 animate-in fade-in duration-300"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/src/assets/images/hvac_air_conditioner_1784350824930.jpg";
                }}
              />

              {/* Floating Top-Right Controls: Heart Wishlist + Share Icon directly below it */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex flex-col gap-2 z-20">
                {/* Wishlist Heart Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist({ type: "product", product });
                  }}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md backdrop-blur-xs ${
                    isInWishlist(product.id)
                      ? "bg-rose-50 text-rose-600 hover:bg-rose-100 scale-105 border border-rose-200"
                      : "bg-white/95 hover:bg-white text-slate-500 hover:text-rose-600 border border-slate-200/80 hover:scale-105"
                  }`}
                  title={isInWishlist(product.id) ? "Remove from Wishlist" : "Save to Wishlist"}
                  aria-label="Save to Wishlist"
                  id="detail-wishlist-toggle-btn"
                >
                  <Heart
                    size={18}
                    className={isInWishlist(product.id) ? "fill-rose-500 text-rose-500" : ""}
                  />
                </button>

                {/* Share Icon Button (Placed below Heart) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsShareModalOpen(true);
                  }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white/95 hover:bg-white text-slate-500 hover:text-[#2596be] border border-slate-200/80 hover:scale-105 transition-all cursor-pointer shadow-md backdrop-blur-xs"
                  title="Share product with image preview"
                  aria-label="Share Product"
                  id="detail-share-product-icon-btn"
                >
                  <Share2 size={17} />
                </button>
              </div>
            </div>

            {/* Thumbnail Navigation Strip - ONLY IF MORE THAN 1 IMAGE */}
            {productImages.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none" id="product-thumbnails-strip">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 aspect-square bg-[#f8fafc] border rounded-xl overflow-hidden flex items-center justify-center p-1.5 transition-all cursor-pointer ${
                      activeImageIdx === idx 
                        ? "border-[#2596be] ring-2 ring-blue-100 shadow-xs" 
                        : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                    }`}
                    title={`View photo ${idx + 1}`}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${idx + 1}`} 
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/src/assets/images/hvac_air_conditioner_1784350824930.jpg";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Commercial Summary & Key Specifications (col-span 7) */}
          <div className="lg:col-span-7 flex flex-col justify-start" id="product-commercial-specs">
            <div>
              {/* Category tag */}
              <span className="text-xs font-bold text-[#2596be] uppercase tracking-widest block mb-2" id="detail-category-badge">
                {product.category}
              </span>

              {/* Product Name */}
              <h1 className="font-sans font-black text-2xl sm:text-3xl text-[#031b4e] leading-tight tracking-tight mb-1" id="detail-product-title">
                {product.name}
              </h1>

              {/* Model Number & Wholesale Price */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="text-xs font-mono font-extrabold text-slate-400 tracking-wider uppercase">
                  Model ID: <span className="text-slate-600">{product.modelId || product.id}</span>
                </div>
                {!product.hidePrice && (
                  <div>
                    <span className="text-xl font-black text-[#031b4e] inline-flex items-center gap-1.5">
                      <DirhamSymbol className="h-5 w-auto" />
                      <span>AED {discountedPrice.toLocaleString()}</span>
                      <span className="text-xs font-semibold text-slate-400 font-normal">/ Unit</span>
                    </span>
                  </div>
                )}
              </div>

              {/* In Stock Badge & Minimum Order Quantity */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {(() => {
                  const currentStatus = product.stockStatus || (product.inStock ? "In Stock & Ready to Ship" : "Lead Time Required");
                  const lower = currentStatus.toLowerCase();
                  const isRed = lower.includes("out of stock") || lower.includes("stock out");
                  const isGreen = lower.includes("in stock") || lower.includes("ready") || lower.includes("factory direct");

                  const badgeStyle = isRed
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : isGreen
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-amber-50 text-amber-700 border-amber-200";

                  return (
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${badgeStyle}`}>
                      ● {currentStatus}
                    </span>
                  );
                })()}

                {product.showMinOrderQty !== false && product.minOrderQty && product.minOrderQty > 0 ? (
                  <span className="text-[11px] text-slate-500 font-semibold">
                    Min. Bulk Order: {product.minOrderQty} unit(s)
                  </span>
                ) : null}
              </div>



              {/* Brief high-quality description */}
              <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6">
                {product.description}
              </p>

              {/* 4-Column Key Metrics Spec Blocks (Dynamically rendered from first 4 technical specifications) */}
              {firstFourSpecs.length > 0 && (
                <div 
                  className={`grid gap-3.5 mb-5 ${
                    firstFourSpecs.length === 1 
                      ? "grid-cols-1 max-w-xs" 
                      : firstFourSpecs.length === 2 
                      ? "grid-cols-2" 
                      : firstFourSpecs.length === 3 
                      ? "grid-cols-2 sm:grid-cols-3" 
                      : "grid-cols-2 sm:grid-cols-4"
                  }`} 
                  id="key-spec-cards-grid"
                >
                  {firstFourSpecs.map(([specKey, specVal], idx) => (
                    <div 
                      key={idx} 
                      className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 flex flex-col items-center text-center justify-center hover:border-slate-200 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2596be] flex items-center justify-center mb-2 shrink-0">
                        {getSpecIcon(specKey, idx)}
                      </div>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block truncate max-w-[130px]" title={specKey}>
                        {specKey}
                      </span>
                      <span className="text-xs font-extrabold text-[#031b4e] mt-1 leading-tight line-clamp-2 max-w-[130px]" title={specVal}>
                        {specVal}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Procurement / Cart and RFQ Actions Container */}
            <div className="flex flex-col sm:flex-row items-stretch gap-3 border-t border-slate-100 pt-5 mt-2">
              
              {/* Add to Procurement Button */}
              <button
                onClick={() => {
                  const prodParam = encodeURIComponent(`${product.name}${product.modelId ? ` (${product.modelId})` : ""}`);
                  window.location.hash = `#/contact?category=equipment_quotation&product=${prodParam}`;
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full sm:flex-1 h-12 min-h-[48px] shrink-0 bg-[#2596be] hover:bg-[#1c7e9f] text-white rounded-xl text-xs font-black tracking-wider uppercase shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                id="detail-add-to-cart-btn"
              >
                <Mail size={16} />
                <span>Product Enquiry</span>
              </button>

              {/* Direct WhatsApp Order */}
              <button
                type="button"
                onClick={() => openProductWhatsAppOrder(product, quantity)}
                className="w-full sm:w-auto sm:px-6 h-12 min-h-[48px] shrink-0 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                id="detail-whatsapp-order-btn"
                title="Order or Inquire directly via WhatsApp"
              >
                <img src="/whatsapp-official.png" alt="WhatsApp" className="w-4 h-4 object-contain shrink-0" />
                <span>Order via WhatsApp</span>
              </button>

              {/* Download Brochure Button - Switches to Documents section and scrolls smoothly */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("docs");
                  const el = document.getElementById("product-detailed-specifications-section");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                className="w-full sm:w-auto sm:px-5 h-12 min-h-[48px] shrink-0 border border-slate-200 hover:border-[#2596be] hover:text-[#2596be] text-slate-600 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 bg-white cursor-pointer active:scale-95 shadow-2xs hover:shadow-sm"
                id="detail-download-brochure-btn"
              >
                <Download size={15} />
                <span>Download Brochure</span>
              </button>

            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Detailed Tabbed Data & Quick Info Sidebar Grid (Matching Image) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 pt-6 border-t border-slate-100" id="product-detailed-specifications-section">
          
          {/* Left Column: 8/12 - Tabbed Tech Specifications & Details */}
          <div className="lg:col-span-8 space-y-6" id="tech-tabs-card">
            
            {/* Tabs List Header */}
            <div className="flex items-center overflow-x-auto border-b border-slate-100 pb-3 gap-6 sm:gap-8 scrollbar-none" id="tabs-header">
              
              <button
                onClick={() => setActiveTab("features")}
                className={`text-xs font-black uppercase tracking-wider pb-1 transition-all relative shrink-0 ${
                  activeTab === "features" 
                    ? "text-[#2596be]" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Key Features
                {activeTab === "features" && (
                  <span className="absolute bottom-[-13px] left-0 right-0 h-1 bg-[#2596be] rounded-full"></span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("specs")}
                className={`text-xs font-black uppercase tracking-wider pb-1 transition-all relative shrink-0 ${
                  activeTab === "specs" 
                    ? "text-[#2596be]" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Technical Specifications
                {activeTab === "specs" && (
                  <span className="absolute bottom-[-13px] left-0 right-0 h-1 bg-[#2596be] rounded-full"></span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("apps")}
                className={`text-xs font-black uppercase tracking-wider pb-1 transition-all relative shrink-0 ${
                  activeTab === "apps" 
                    ? "text-[#2596be]" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Applications
                {activeTab === "apps" && (
                  <span className="absolute bottom-[-13px] left-0 right-0 h-1 bg-[#2596be] rounded-full"></span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("docs")}
                className={`text-xs font-black uppercase tracking-wider pb-1 transition-all relative shrink-0 ${
                  activeTab === "docs" 
                    ? "text-[#2596be]" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Documents
                {activeTab === "docs" && (
                  <span className="absolute bottom-[-13px] left-0 right-0 h-1 bg-[#2596be] rounded-full"></span>
                )}
              </button>

            </div>

            {/* Tab content renderer with elegant custom styled markup */}
            <div className="pt-6" id="tabs-viewport">
              
              {/* TAB 1: KEY FEATURES */}
              {activeTab === "features" && (
                <div className="space-y-6 animate-in fade-in duration-300" id="tab-content-features">
                  <h4 className="font-sans font-black text-[#031b4e] uppercase text-sm tracking-wide">
                    Key Features
                  </h4>
                  {Array.isArray(product.features) && product.features.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {product.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="border border-slate-100 bg-[#f8fafc]/50 hover:border-[#2596be]/30 rounded-xl p-3.5 flex items-start gap-3 transition-colors"
                        >
                          <div className="w-5 h-5 rounded-full bg-[#2596be]/10 text-[#2596be] flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle size={12} className="stroke-[2.5]" />
                          </div>
                          <span className="text-xs text-slate-700 font-semibold leading-relaxed">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No key features listed for this product.</p>
                  )}
                </div>
              )}

              {/* TAB 3: TECHNICAL SPECIFICATIONS (DYNAMIC MATRIX) */}
              {activeTab === "specs" && (
                <div className="space-y-6 animate-in fade-in duration-300" id="tab-content-specs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-sans font-black text-[#031b4e] uppercase text-sm tracking-wide">
                      Technical Specification Matrix
                    </h4>
                    <span className="text-xs font-semibold text-slate-400">
                      {cleanSpecs.length} Parameters Configured
                    </span>
                  </div>
                  
                  {cleanSpecs.length > 0 ? (
                    <div className="overflow-x-auto border border-slate-100 rounded-xl shadow-2xs bg-white">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-600 border-b border-slate-100 uppercase tracking-wider font-extrabold">
                            <th className="py-3 px-5 w-1/2">Technical Parameter</th>
                            <th className="py-3 px-5 w-1/2">Specification Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                          {cleanSpecs.map(([paramKey, paramVal], idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}>
                              <td className="py-3.5 px-5 font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2596be] shrink-0"></span>
                                <span>{paramKey}</span>
                              </td>
                              <td className="py-3.5 px-5 font-mono text-slate-700 font-semibold">
                                {paramVal}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-xl text-slate-400 text-xs">
                      No technical parameters configured for this model.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: APPLICATIONS */}
              {activeTab === "apps" && (
                <div className="space-y-4 animate-in fade-in duration-300" id="tab-content-apps">
                  <h4 className="font-sans font-black text-[#031b4e] uppercase text-sm tracking-wide">
                    Target Applications & Use Environments
                  </h4>
                  {dynamicApplications.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-2">
                      {dynamicApplications.map((app, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50/60 border border-slate-100 rounded-xl hover:border-[#2596be]/40 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-[#2596be]/10 text-[#2596be] flex items-center justify-center shrink-0">
                            <Building size={15} className="stroke-[2.5]" />
                          </div>
                          <span className="text-xs font-bold text-slate-800">{app}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">Suitable across standard commercial, residential, and industrial environments.</p>
                  )}
                </div>
              )}

              {/* TAB 5: DOCUMENTS */}
              {activeTab === "docs" && (
                <div className="space-y-4 animate-in fade-in duration-300" id="tab-content-documents">
                  <h4 className="font-sans font-black text-[#031b4e] uppercase text-sm tracking-wide">
                    Technical Documents & Submittals
                  </h4>
                  <p className="text-sm text-slate-500 font-medium mb-4">
                    Download authentic technical submittals, manuals, and drawings directly:
                  </p>
                  
                  {Array.isArray(product.documents) && product.documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="document-cards-grid">
                      {product.documents.map((doc, dIdx) => (
                        <div key={dIdx} className="border border-slate-100 bg-white hover:border-[#2596be] rounded-xl p-4 transition-all hover:shadow-md flex flex-col justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                              <FileText size={16} />
                            </div>
                            <div>
                              <h5 className="text-xs font-black text-slate-800 leading-tight">{doc.name}</h5>
                              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{doc.size || "PDF Document"}</span>
                            </div>
                          </div>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="mt-4 w-full py-2 bg-slate-50 hover:bg-[#2596be] hover:text-white text-slate-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <Download size={12} />
                            <span>Download / View</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-xl text-slate-400 text-xs">
                      No technical documentation files uploaded for this model yet. Contact our engineering team for submittals.
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Right Column: 4/12 - Quick Information Sidebar Widget */}
          <div className="lg:col-span-4 space-y-6" id="quick-info-sidebar">
            
            {/* Box 1: Quick Information Grid Table */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 space-y-4">
              <h4 className="font-sans font-black text-[#031b4e] uppercase text-xs tracking-wider border-b border-slate-200 pb-2">
                Quick Information
              </h4>
              
              {/* Sidebar table parameters list */}
              <div className="divide-y divide-slate-100 text-xs font-medium" id="quick-info-table">
                
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-400">Product Type</span>
                  <span className="text-slate-800 font-bold">{product.category}</span>
                </div>

                {product.modelId && (
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-400">Model SKU</span>
                    <span className="text-slate-800 font-mono font-bold uppercase">{product.modelId}</span>
                  </div>
                )}

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-400">Cooling Capacity</span>
                  <span className="text-slate-800 font-bold">{coolingCap}</span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-400">Compressor Type</span>
                  <span className="text-slate-800 font-bold">{compressorType}</span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-400">Refrigerant</span>
                  <span className="text-slate-800 font-mono font-bold">{refrigerant}</span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-400">Power Supply</span>
                  <span className="text-slate-800 font-mono font-bold text-[11px] truncate max-w-[170px]" title={powerSupply}>
                    {powerSupply}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-400">Application</span>
                  <span className="text-slate-800 font-bold truncate max-w-[170px] text-right" title={dynamicApplications.join(", ")}>
                    {dynamicApplications.length > 0 ? dynamicApplications.slice(0, 2).join(", ") : product.category}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-400">Warranty</span>
                  <span className="text-slate-800 font-bold">{warranty}</span>
                </div>
              </div>
            </div>

            {/* Box 2: Need More Information? Action Widget */}
            <div className="bg-blue-50/30 border border-blue-100/40 rounded-xl p-6 text-center space-y-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2596be] flex items-center justify-center mx-auto">
                <HelpCircle size={20} className="stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-sans font-black text-[#031b4e] uppercase text-xs tracking-wider">
                  Need More Information?
                </h4>
                <p className="text-[11px] text-slate-400 font-bold leading-normal">
                  Our corporate technical engineering team is ready to help you with equipment sizing, technical drawings, and custom project bids.
                </p>
              </div>
              
              <button
                onClick={() => {
                  const prodParam = encodeURIComponent(`${product.name}${product.modelId ? ` (${product.modelId})` : ""}`);
                  window.location.hash = `#/contact?category=equipment_quotation&product=${prodParam}`;
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full py-2.5 bg-[#2596be] hover:bg-[#1c7e9f] text-white rounded-lg text-xs font-black tracking-wider uppercase shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                id="sidebar-product-enquiry-btn"
              >
                <Mail size={13} />
                <span>Product Enquiry</span>
              </button>
            </div>

          </div>

        </div>

        {/* ================= RELATABLE / RELATED PRODUCTS SECTION ================= */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-slate-200" id="related-products-section">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-[#2596be] block mb-1">
                  Procurement Recommendations
                </span>
                <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#031b4e] tracking-tight">
                  Related Equipment & Systems
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  window.location.hash = `#/products?category=${encodeURIComponent(product.category || "All")}`;
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f4c81] hover:text-[#2596be] transition-colors cursor-pointer group"
              >
                <span>View More in {product.category}</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* 4-Column Product Grid with standard ProductCard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard
                  key={relProduct.id}
                  product={relProduct}
                  onOpenProductDetail={handleSelectRelatedProduct}
                  onAddToCart={onAddToCart}
                  onOpenQuoteWithProduct={onOpenQuoteWithProduct}
                />
              ))}
            </div>
          </section>
        )}

        {/* ================= SOCIAL SHARE & OPEN GRAPH PREVIEW MODAL ================= */}
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#2596be]/10 text-[#2596be] flex items-center justify-center font-bold">
                    <Share2 size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Share Product</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Send specifications, photos and quote link</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Social Card Preview */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Card Preview (As Seen on Social Media & WhatsApp)</span>
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-slate-50">
                    <div className="h-40 w-full bg-white relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-contain p-4" 
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/src/assets/images/hvac_air_conditioner_1784350824930.jpg";
                        }}
                      />
                      <span className="absolute top-2 right-2 px-2 py-0.5 bg-slate-900/80 text-white rounded text-[10px] font-bold uppercase tracking-wider">
                        {product.brand}
                      </span>
                    </div>
                    <div className="p-3 bg-white space-y-1">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">cooltechnologies.ae</div>
                      <div className="text-xs font-bold text-slate-800 line-clamp-1">{product.name} | Cool Technologies UAE</div>
                      <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {product.description || `Procure ${product.name} from Cool Technologies LLC UAE. Inquire now for wholesale pricing & delivery.`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Link Box */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Direct Share Link</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#/product/${getProductSlug(product)}` : `https://cooltechnologies.ae/#/product/${getProductSlug(product)}`}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-mono select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}${window.location.pathname}#/product/${getProductSlug(product)}`;
                        navigator.clipboard.writeText(url);
                        setIsCopiedLink(true);
                        setTimeout(() => setIsCopiedLink(false), 2000);
                      }}
                      className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        isCopiedLink 
                          ? "bg-emerald-600 text-white" 
                          : "bg-slate-900 hover:bg-slate-800 text-white active:scale-95"
                      }`}
                    >
                      {isCopiedLink ? (
                        <>
                          <Check size={13} />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Channel Sharing Buttons */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Share Instantly To</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* WhatsApp */}
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `*Check out ${product.name} on Cool Technologies UAE*\n\nBrand: ${product.brand}\nCategory: ${product.category}\n\nView details & specs:\n${typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#/product/${getProductSlug(product)}` : `https://cooltechnologies.ae/#/product/${getProductSlug(product)}`}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors cursor-pointer group"
                    >
                      <img src="/whatsapp-official.png" alt="WhatsApp" className="w-5 h-5 object-contain group-hover:scale-110 transition-transform" />
                      <span>WhatsApp</span>
                    </a>

                    {/* LinkedIn */}
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                        typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#/product/${getProductSlug(product)}` : `https://cooltechnologies.ae/#/product/${getProductSlug(product)}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-blue-100 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs transition-colors cursor-pointer group"
                    >
                      <Linkedin size={20} className="text-[#0A66C2] group-hover:scale-110 transition-transform" />
                      <span>LinkedIn</span>
                    </a>

                    {/* Twitter / X */}
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        `Check out ${product.name} on Cool Technologies UAE`
                      )}&url=${encodeURIComponent(
                        typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#/product/${getProductSlug(product)}` : `https://cooltechnologies.ae/#/product/${getProductSlug(product)}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer group"
                    >
                      <Twitter size={20} className="text-slate-800 group-hover:scale-110 transition-transform" />
                      <span>X / Twitter</span>
                    </a>
                  </div>

                  {/* Native Mobile / System Share if available */}
                  {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.share({
                          title: `${product.name} | Cool Technologies UAE`,
                          text: `Discover ${product.name} (${product.brand}) at Cool Technologies UAE.`,
                          url: `${window.location.origin}${window.location.pathname}#/product/${getProductSlug(product)}`,
                        }).catch(() => {});
                      }}
                      className="w-full mt-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Share2 size={14} />
                      <span>Share with Device Apps...</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
