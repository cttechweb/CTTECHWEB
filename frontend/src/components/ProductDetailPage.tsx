import { useState, useMemo, useEffect } from "react";
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
  const activeProducts = products || PRODUCTS;
  // Find primary product
  const cleanId = (productId || "").split("?")[0].replace(/\/$/, "");
  const product = activeProducts.find((p) => p.id === cleanId) || activeProducts.find((p) => p.id === productId) || activeProducts[0];
  
  // States
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "features" | "specs" | "apps" | "docs">("overview");
  const quantity = product.minOrderQty || 1;
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopiedLink, setIsCopiedLink] = useState(false);

  // Reset tab and active image when productId changes
  useEffect(() => {
    setActiveImageIdx(0);
    setActiveTab("overview");
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
    window.location.hash = `#/product/${p.id}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate 4 image thumbnails (variants of the main image)
  const productImages = [
    product.image,
    // Add subtle visual overlays or placeholders for multiple gallery thumbnails
    product.image,
    product.image,
    product.image
  ];

  // Derive specs from product data or fallback to professional industry values
  const coolingCap = product.specifications["Cooling Capacity"] || product.specifications["Capacity"] || "150 Tons";
  const compressorType = product.specifications["Compressor Type"] || (product.category === "Compressors" ? "Scroll" : "Twin-Screw");
  const refrigerant = product.specifications["Refrigerant Type"] || product.specifications["Refrigerant"] || "R-410A / R-134a";
  const powerSupply = product.specifications["Voltage"] || product.specifications["Power Source"] || "380-415V / 3Ph / 50Hz";
  const warranty = "12 Months Commercial";
  
  // Custom mock variants for the comparison table (matching image style)
  const tableVariants = [
    {
      model: `${product.brand.substring(0, 3).toUpperCase()}-${product.category.substring(0, 3).toUpperCase()}-100`,
      capacity: "100 TR",
      compressor: compressorType,
      refrigerant: refrigerant,
      power: powerSupply,
      inputPower: "78.5 kW",
      eer: "3.1",
      dimensions: "3400 × 1100 × 2100 mm",
      weight: "1650 kg"
    },
    {
      model: `${product.brand.substring(0, 3).toUpperCase()}-${product.category.substring(0, 3).toUpperCase()}-150`,
      capacity: "150 TR",
      compressor: compressorType,
      refrigerant: refrigerant,
      power: powerSupply,
      inputPower: "117.5 kW",
      eer: "3.1",
      dimensions: "3900 × 1200 × 2200 mm",
      weight: "2100 kg"
    },
    {
      model: `${product.brand.substring(0, 3).toUpperCase()}-${product.category.substring(0, 3).toUpperCase()}-200`,
      capacity: "200 TR",
      compressor: compressorType,
      refrigerant: refrigerant,
      power: powerSupply,
      inputPower: "157.0 kW",
      eer: "3.1",
      dimensions: "4300 × 1300 × 2300 mm",
      weight: "2500 kg"
    },
    {
      model: `${product.brand.substring(0, 3).toUpperCase()}-${product.category.substring(0, 3).toUpperCase()}-250`,
      capacity: "250 TR",
      compressor: compressorType,
      refrigerant: refrigerant,
      power: powerSupply,
      inputPower: "195.0 kW",
      eer: "3.1",
      dimensions: "4800 × 1400 × 2400 mm",
      weight: "3100 kg"
    }
  ];

  const handlePrevImage = () => {
    setActiveImageIdx((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIdx((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
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
            {/* Active Main Image Container with arrows */}
            <div className="relative aspect-video sm:aspect-square bg-[#f8fafc] border border-slate-100 rounded-xl overflow-hidden flex items-center justify-center group">
              <img 
                src={productImages[activeImageIdx]} 
                alt={product.name} 
                className="max-h-[85%] max-w-[85%] object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              
              {/* Previous Arrow */}
              <button 
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-[#2596be] hover:text-white transition-colors shadow-sm cursor-pointer"
                title="Previous Image"
              >
                <ChevronLeft size={16} className="stroke-[2.5]" />
              </button>

              {/* Next Arrow */}
              <button 
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-[#2596be] hover:text-white transition-colors shadow-sm cursor-pointer"
                title="Next Image"
              >
                <ChevronRight size={16} className="stroke-[2.5]" />
              </button>
            </div>

            {/* Thumbnail Navigation Strip */}
            <div className="grid grid-cols-4 gap-3">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`aspect-square bg-[#f8fafc] border rounded-lg overflow-hidden flex items-center justify-center p-1.5 transition-all ${
                    activeImageIdx === idx 
                      ? "border-[#2596be] ring-2 ring-blue-100" 
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`Thumbnail ${idx + 1}`} 
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Commercial Summary & Key Specifications (col-span 7) */}
          <div className="lg:col-span-7 flex flex-col justify-between" id="product-commercial-specs">
            <div>
              {/* Category tag */}
              <span className="text-xs font-bold text-[#2596be] uppercase tracking-widest block mb-2" id="detail-category-badge">
                {product.category}
              </span>

              {/* Product Name */}
              <h1 className="font-sans font-black text-2xl sm:text-3xl text-[#031b4e] uppercase leading-tight tracking-tight mb-1" id="detail-product-title">
                {product.name}
              </h1>

              {/* Model Number & Wholesale Price */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="text-xs font-mono font-extrabold text-slate-400 tracking-wider uppercase">
                  Model ID: <span className="text-slate-600">{product.modelId || `${product.brand.substring(0,3).toUpperCase()}-${product.id.toUpperCase()}`}</span>
                </div>
                <div>
                  {product.hidePrice ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black text-amber-800 bg-amber-50 border border-amber-200 uppercase tracking-wider">
                      Contact for Wholesale Rate
                    </span>
                  ) : (
                    <span className="text-xl font-black text-[#031b4e]">
                      ${discountedPrice.toLocaleString()} <span className="text-xs font-semibold text-slate-400">/ Unit</span>
                    </span>
                  )}
                </div>
              </div>

              {/* In Stock Badge */}
              <div className="flex items-center gap-2 mb-6">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  product.inStock 
                    ? "bg-green-50 text-green-700 border border-green-100" 
                    : "bg-amber-50 text-amber-700 border border-amber-100"
                }`}>
                  {product.inStock ? "● In Stock & Ready to Ship" : "● Lead Time Required"}
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">Min. Bulk Order: {product.minOrderQty} unit(s)</span>
              </div>

              {/* Sourcing & Technical Certifications Row */}
              <div className="border-t border-b border-slate-100 py-3 mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Sourcing Channel</span>
                  <span className="text-xs font-black text-slate-700 uppercase">{product.sourcingChannel || "Direct OEM Wholesale"}</span>
                </div>
                <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Certification</span>
                  <span className="text-xs font-black text-slate-700 uppercase">{product.certification || "CE / AHRI Certified"}</span>
                </div>
                <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Primary Region</span>
                  <span className="text-xs font-black text-[#2596be] uppercase font-sans">{product.primaryRegion || "GCC & UAE Market"}</span>
                </div>
              </div>

              {/* Brief high-quality description */}
              <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6">
                {product.description} Engineered for reliable commercial performance, optimized acoustic dampening, and extreme industrial durability. Contact our commercial sourcing technicians for customization configurations.
              </p>

              {/* 4-Column Key Metrics Spec Blocks (Matching Reference Image) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-8" id="key-spec-cards-grid">
                
                {/* Spec Box 1: Cooling Capacity */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 flex flex-col items-center text-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2596be] flex items-center justify-center mb-2">
                    <Thermometer size={16} className="stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Cooling Cap</span>
                  <span className="text-xs font-extrabold text-[#031b4e] mt-1 leading-tight">{coolingCap}</span>
                </div>

                {/* Spec Box 2: Compressor Type */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 flex flex-col items-center text-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2596be] flex items-center justify-center mb-2">
                    <Settings size={16} className="stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Compressor</span>
                  <span className="text-xs font-extrabold text-[#031b4e] mt-1 leading-tight">{compressorType}</span>
                </div>

                {/* Spec Box 3: Refrigerant */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 flex flex-col items-center text-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2596be] flex items-center justify-center mb-2">
                    <Layers size={16} className="stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Refrigerant</span>
                  <span className="text-xs font-extrabold text-[#031b4e] mt-1 leading-tight">{refrigerant.split("/")[0]}</span>
                </div>

                {/* Spec Box 4: Power Supply */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 flex flex-col items-center text-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2596be] flex items-center justify-center mb-2">
                    <Zap size={16} className="stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Power Supply</span>
                  <span className="text-xs font-extrabold text-[#031b4e] mt-1 leading-tight truncate max-w-[110px]">{powerSupply.split("/")[0]}</span>
                </div>

              </div>
            </div>

            {/* Procurement / Cart and RFQ Actions Container */}
            <div className="flex flex-col sm:flex-row items-stretch gap-4 border-t border-slate-100 pt-6">
              
              {/* Add to Procurement Button */}
              <button
                onClick={() => onAddToCart(product, quantity)}
                className="flex-1 h-12 bg-[#2596be] hover:bg-[#1c7e9f] text-white rounded-lg text-xs font-black tracking-wider uppercase shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                id="detail-add-to-cart-btn"
              >
                <ShoppingCart size={15} />
                <span>Product Enquiry</span>
              </button>

              {/* Download Brochure Button */}
              <button
                onClick={() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-5 h-12 border border-slate-200 hover:border-[#2596be] hover:text-[#2596be] text-slate-600 rounded-lg text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 bg-white cursor-pointer"
                id="detail-download-brochure-btn"
              >
                <Download size={15} />
                <span>{copied ? "Brochure Saved" : "Download Brochure"}</span>
              </button>

              {/* Direct WhatsApp Order */}
              <button
                type="button"
                onClick={() => openProductWhatsAppOrder(product, quantity)}
                className="px-5 h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg text-xs font-black tracking-wider uppercase transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                id="detail-whatsapp-order-btn"
                title="Order or Inquire directly via WhatsApp"
              >
                <img src="/whatsapp-official.png" alt="WhatsApp" className="w-4 h-4 object-contain shrink-0" />
                <span>Order via WhatsApp</span>
              </button>

              {/* Share Product */}
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="px-4 h-12 border border-slate-200 hover:border-[#2596be] hover:text-[#2596be] text-slate-600 rounded-lg text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 bg-white cursor-pointer active:scale-95"
                id="detail-share-product-btn"
                title="Share this product link & preview"
              >
                <Share2 size={15} />
                <span>Share</span>
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
                onClick={() => setActiveTab("overview")}
                className={`text-xs font-black uppercase tracking-wider pb-1 transition-all relative shrink-0 ${
                  activeTab === "overview" 
                    ? "text-[#2596be]" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Overview
                {activeTab === "overview" && (
                  <span className="absolute bottom-[-13px] left-0 right-0 h-1 bg-[#2596be] rounded-full"></span>
                )}
              </button>

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
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6 animate-in fade-in duration-300" id="tab-content-overview">
                  <div className="space-y-4">
                    <h4 className="font-sans font-black text-[#031b4e] uppercase text-sm tracking-wide">
                      Product Overview
                    </h4>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                      The {product.name} represents the next generation in commercial climate performance. Engineered to satisfy rigorous efficiency parameters, this industrial model provides B2B operators with extreme thermoregulation reliability under volatile outdoor temperatures. Built with high-grade components designed to minimize frictional and thermal energy dissipation.
                    </p>
                  </div>

                  {/* Custom 3x2 Grid Advantages blocks (From Image) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    
                    {/* Item 1: High Efficiency */}
                    <div className="border border-slate-100 rounded-xl p-4 flex gap-3.5 bg-[#f8fafc]/30">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-[#2596be] flex items-center justify-center shrink-0 mt-0.5">
                        <Zap size={16} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-[#031b4e] uppercase tracking-wide">High Efficiency</h5>
                        <p className="text-[11px] text-slate-400 font-bold mt-1 leading-normal">
                          Optimized compressor and state-of-the-art microchannel heat exchange architecture guarantees lowest electrical drawing ratios.
                        </p>
                      </div>
                    </div>

                    {/* Item 2: Reliable Performance */}
                    <div className="border border-slate-100 rounded-xl p-4 flex gap-3.5 bg-[#f8fafc]/30">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-[#2596be] flex items-center justify-center shrink-0 mt-0.5">
                        <Award size={16} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-[#031b4e] uppercase tracking-wide">Reliable Performance</h5>
                        <p className="text-[11px] text-slate-400 font-bold mt-1 leading-normal">
                          Robust mechanical structural layouts with intelligent high-pressure backup controllers ensure continuous 24/7 cooling operations.
                        </p>
                      </div>
                    </div>

                    {/* Item 3: Easy Maintenance */}
                    <div className="border border-slate-100 rounded-xl p-4 flex gap-3.5 bg-[#f8fafc]/30">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-[#2596be] flex items-center justify-center shrink-0 mt-0.5">
                        <Wrench size={16} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-[#031b4e] uppercase tracking-wide">Easy Maintenance</h5>
                        <p className="text-[11px] text-slate-400 font-bold mt-1 leading-normal">
                          Detachable service panel covers and modular copper fittings for rapid, straightforward technical access and field troubleshooting.
                        </p>
                      </div>
                    </div>

                    {/* Item 4: Advanced Controls */}
                    <div className="border border-slate-100 rounded-xl p-4 flex gap-3.5 bg-[#f8fafc]/30">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-[#2596be] flex items-center justify-center shrink-0 mt-0.5">
                        <Cpu size={16} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-[#031b4e] uppercase tracking-wide">Advanced Controls</h5>
                        <p className="text-[11px] text-slate-400 font-bold mt-1 leading-normal">
                          Microprocessor computer controls with direct BACnet building management system integration for precise air tracking.
                        </p>
                      </div>
                    </div>

                    {/* Item 5: Environment Friendly */}
                    <div className="border border-slate-100 rounded-xl p-4 flex gap-3.5 bg-[#f8fafc]/30">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-[#2596be] flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle size={16} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-[#031b4e] uppercase tracking-wide">Environment Friendly</h5>
                        <p className="text-[11px] text-slate-400 font-bold mt-1 leading-normal">
                          Pre-charged with zero ozone depletion potential (ODP) hydrofluorocarbon refrigerants compliant with local regulations.
                        </p>
                      </div>
                    </div>

                    {/* Item 6: Durable Build */}
                    <div className="border border-slate-100 rounded-xl p-4 flex gap-3.5 bg-[#f8fafc]/30">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-[#2596be] flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck size={16} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-[#031b4e] uppercase tracking-wide">Durable Build</h5>
                        <p className="text-[11px] text-slate-400 font-bold mt-1 leading-normal">
                          Reinforced heavy-gauge galvanized steel cabinet frameworks treated with marine-grade weather-resistant powder paints.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: KEY FEATURES */}
              {activeTab === "features" && (
                <div className="animate-in fade-in duration-300" id="tab-content-features">
                  <h4 className="font-sans font-black text-[#031b4e] uppercase text-sm tracking-wide mb-4">
                    Key Commercial Features
                  </h4>
                  <ul className="space-y-3">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-500 font-medium">
                        <div className="w-4 h-4 rounded-full bg-[#2596be]/10 text-[#2596be] flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle size={10} className="stroke-[3]" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                    <li className="flex items-start gap-2.5 text-sm text-slate-500 font-medium">
                      <div className="w-4 h-4 rounded-full bg-[#2596be]/10 text-[#2596be] flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle size={10} className="stroke-[3]" />
                      </div>
                      <span>Fully tested at factory operating loads prior to distribution center packaging</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-slate-500 font-medium">
                      <div className="w-4 h-4 rounded-full bg-[#2596be]/10 text-[#2596be] flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle size={10} className="stroke-[3]" />
                      </div>
                      <span>High pressure relief safety mechanisms for maximum machinery security</span>
                    </li>
                  </ul>
                </div>
              )}

              {/* TAB 3: TECHNICAL SPECIFICATIONS (VARIANT COMPARISON TABLE FROM IMAGE) */}
              {activeTab === "specs" && (
                <div className="space-y-6 animate-in fade-in duration-300" id="tab-content-specs">
                  <h4 className="font-sans font-black text-[#031b4e] uppercase text-sm tracking-wide">
                    Variant Comparison Matrix
                  </h4>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    * Specifications listed represent general standard parameters and are subject to minor adjustments based on project configuration constraints.
                  </p>
                  
                  {/* Detailed variant comparison table */}
                  <div className="overflow-x-auto border border-slate-100 rounded-xl shadow-inner bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-100 uppercase tracking-wider font-extrabold">
                          <th className="py-3 px-4 min-w-[130px]">Parameter</th>
                          <th className="py-3 px-3 w-[60px]">Unit</th>
                          {tableVariants.map((v, i) => (
                            <th 
                              key={i} 
                              className={`py-3 px-4 min-w-[130px] font-mono text-right ${
                                v.capacity.includes(coolingCap) || coolingCap.includes(v.capacity.split(" ")[0])
                                  ? "text-[#2596be] bg-[#2596be]/5"
                                  : ""
                              }`}
                            >
                              {v.model}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-500">
                        
                        {/* Row 1: Cooling Capacity */}
                        <tr>
                          <td className="py-3 px-4 font-bold text-slate-800">Cooling Capacity</td>
                          <td className="py-3 px-3">TR</td>
                          {tableVariants.map((v, i) => (
                            <td key={i} className="py-3 px-4 text-right font-semibold">{v.capacity}</td>
                          ))}
                        </tr>

                        {/* Row 2: Compressor Type */}
                        <tr>
                          <td className="py-3 px-4 font-bold text-slate-800">Compressor Type</td>
                          <td className="py-3 px-3">-</td>
                          {tableVariants.map((v, i) => (
                            <td key={i} className="py-3 px-4 text-right font-mono text-[11px]">{v.compressor}</td>
                          ))}
                        </tr>

                        {/* Row 3: Refrigerant */}
                        <tr>
                          <td className="py-3 px-4 font-bold text-slate-800">Refrigerant</td>
                          <td className="py-3 px-3">-</td>
                          {tableVariants.map((v, i) => (
                            <td key={i} className="py-3 px-4 text-right font-mono text-[11px]">{v.refrigerant}</td>
                          ))}
                        </tr>

                        {/* Row 4: Power Supply */}
                        <tr>
                          <td className="py-3 px-4 font-bold text-slate-800">Power Supply</td>
                          <td className="py-3 px-3">V/Ph/Hz</td>
                          {tableVariants.map((v, i) => (
                            <td key={i} className="py-3 px-4 text-right font-mono text-[11px] truncate max-w-[110px]">{v.power}</td>
                          ))}
                        </tr>

                        {/* Row 5: Input Power */}
                        <tr>
                          <td className="py-3 px-4 font-bold text-slate-800">Input Power</td>
                          <td className="py-3 px-3">kW</td>
                          {tableVariants.map((v, i) => (
                            <td key={i} className="py-3 px-4 text-right font-mono">{v.inputPower}</td>
                          ))}
                        </tr>

                        {/* Row 6: EER */}
                        <tr>
                          <td className="py-3 px-4 font-bold text-slate-800">EER</td>
                          <td className="py-3 px-3">-</td>
                          {tableVariants.map((v, i) => (
                            <td key={i} className="py-3 px-4 text-right font-mono">{v.eer}</td>
                          ))}
                        </tr>

                        {/* Row 7: Dimensions */}
                        <tr>
                          <td className="py-3 px-4 font-bold text-slate-800">Dimensions (L×W×H)</td>
                          <td className="py-3 px-3">mm</td>
                          {tableVariants.map((v, i) => (
                            <td key={i} className="py-3 px-4 text-right font-mono text-[11px] whitespace-nowrap">{v.dimensions}</td>
                          ))}
                        </tr>

                        {/* Row 8: Weight */}
                        <tr>
                          <td className="py-3 px-4 font-bold text-slate-800">Weight</td>
                          <td className="py-3 px-3">kg</td>
                          {tableVariants.map((v, i) => (
                            <td key={i} className="py-3 px-4 text-right font-mono">{v.weight}</td>
                          ))}
                        </tr>

                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: APPLICATIONS */}
              {activeTab === "apps" && (
                <div className="space-y-4 animate-in fade-in duration-300" id="tab-content-apps">
                  <h4 className="font-sans font-black text-[#031b4e] uppercase text-sm tracking-wide">
                    Industry Applications & Use Cases
                  </h4>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    This unit has been meticulously structured to serve extreme conditions across high-stakes industrial, corporate, and public infrastructure projects:
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="flex items-start gap-3 p-3.5 bg-[#f8fafc]/40 border border-slate-100 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-[#2596be]/10 text-[#2596be] flex items-center justify-center shrink-0 mt-0.5">
                        <Building size={14} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide">Commercial Complexes</h5>
                        <p className="text-[11px] text-slate-400 font-bold mt-0.5 leading-normal">
                          Ideal for shopping centers, high-rise luxury hotels, and large commercial corporate offices.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 bg-[#f8fafc]/40 border border-slate-100 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-[#2596be]/10 text-[#2596be] flex items-center justify-center shrink-0 mt-0.5">
                        <Database size={14} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide">Critical Data Centers</h5>
                        <p className="text-[11px] text-slate-400 font-bold mt-0.5 leading-normal">
                          Provides stable server thermoregulation to safeguard continuous mission-critical computer loops.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 bg-[#f8fafc]/40 border border-slate-100 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-[#2596be]/10 text-[#2596be] flex items-center justify-center shrink-0 mt-0.5">
                        <Settings size={14} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide">Industrial Processing</h5>
                        <p className="text-[11px] text-slate-400 font-bold mt-0.5 leading-normal">
                          Heavy-duty temperature controls for manufacturing processes, chemical refining, and food plants.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 bg-[#f8fafc]/40 border border-slate-100 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-[#2596be]/10 text-[#2596be] flex items-center justify-center shrink-0 mt-0.5">
                        <Building size={14} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide">Healthcare & Public</h5>
                        <p className="text-[11px] text-slate-400 font-bold mt-0.5 leading-normal">
                          Strict temperature and hygiene control parameters for medical facilities, universities, and airports.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: DOCUMENTS */}
              {activeTab === "docs" && (
                <div className="space-y-4 animate-in fade-in duration-300" id="tab-content-documents">
                  <h4 className="font-sans font-black text-[#031b4e] uppercase text-sm tracking-wide">
                    Technical Documents & Submittals
                  </h4>
                  <p className="text-sm text-slate-500 font-medium mb-4">
                    Download authentic technical submittals, piping schematics, and mechanical performance sheets directly:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="document-cards-grid">
                    
                    {/* Document 1: Product Brochure */}
                    <div className="border border-slate-100 bg-white hover:border-[#2596be] rounded-xl p-4 transition-all hover:shadow-md flex flex-col justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                          <FileText size={16} />
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-slate-800 leading-tight">Product Brochure</h5>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">PDF • 4.2 MB</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="mt-4 w-full py-1.5 bg-slate-50 hover:bg-[#2596be] hover:text-white text-slate-600 rounded text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Download size={12} />
                        <span>{copied ? "Saved" : "Download PDF"}</span>
                      </button>
                    </div>

                    {/* Document 2: Technical Manual */}
                    <div className="border border-slate-100 bg-white hover:border-[#2596be] rounded-xl p-4 transition-all hover:shadow-md flex flex-col justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                          <FileText size={16} />
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-slate-800 leading-tight">Technical Manual</h5>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">PDF • 12.8 MB</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="mt-4 w-full py-1.5 bg-slate-50 hover:bg-[#2596be] hover:text-white text-slate-600 rounded text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Download size={12} />
                        <span>{copied ? "Saved" : "Download PDF"}</span>
                      </button>
                    </div>

                    {/* Document 3: Installation Guide */}
                    <div className="border border-slate-100 bg-white hover:border-[#2596be] rounded-xl p-4 transition-all hover:shadow-md flex flex-col justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                          <FileText size={16} />
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-slate-800 leading-tight">Installation Guide</h5>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">PDF • 8.1 MB</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="mt-4 w-full py-1.5 bg-slate-50 hover:bg-[#2596be] hover:text-white text-slate-600 rounded text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Download size={12} />
                        <span>{copied ? "Saved" : "Download PDF"}</span>
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right Column: 4/12 - Quick Information Sidebar Widget (From Image) */}
          <div className="lg:col-span-4 space-y-6" id="quick-info-sidebar">
            
            {/* Box 1: Quick Information Grid Table */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 space-y-4">
              <h4 className="font-sans font-black text-[#031b4e] uppercase text-xs tracking-wider border-b border-slate-50 pb-2">
                Quick Information
              </h4>
              
              {/* Sidebar table parameters list */}
              <div className="divide-y divide-slate-100 text-xs font-medium" id="quick-info-table">
                
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-400">Product Type</span>
                  <span className="text-slate-800 font-bold">{product.category}</span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-400">Series</span>
                  <span className="text-slate-800 font-mono font-bold uppercase">{product.brand.substring(0,3)}-{product.category.substring(0,3).toUpperCase()}</span>
                </div>

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
                    {powerSupply.split("/")[0]}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-400">Application</span>
                  <span className="text-slate-800 font-bold">Commercial / Industrial</span>
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
                onClick={() => onOpenQuoteWithProduct(product.name)}
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
                      value={typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#/product/${product.id}` : `https://cooltechnologies.ae/#/product/${product.id}`}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-mono select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}${window.location.pathname}#/product/${product.id}`;
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
                        `*Check out ${product.name} on Cool Technologies UAE*\n\nBrand: ${product.brand}\nCategory: ${product.category}\n\nView details & specs:\n${typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#/product/${product.id}` : `https://cooltechnologies.ae/#/product/${product.id}`}`
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
                        typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#/product/${product.id}` : `https://cooltechnologies.ae/#/product/${product.id}`
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
                        typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#/product/${product.id}` : `https://cooltechnologies.ae/#/product/${product.id}`
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
                          url: `${window.location.origin}${window.location.pathname}#/product/${product.id}`,
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
