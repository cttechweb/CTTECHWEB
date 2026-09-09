import React, { useState } from "react";
import { 
  Package, Wrench, Plus, Edit3, Trash2, Search, Sliders, 
  ShieldCheck, ArrowLeft, LogOut, LayoutDashboard, CheckCircle2, 
  Tag, Layers, Check, X, AlertCircle, GitBranch, Users, Globe,
  FileCode, CheckSquare, Zap, Cpu, SearchCheck, RefreshCw, EyeOff, Eye, 
  FileSpreadsheet, FileText, MessageSquare, ShoppingBag, ClipboardSignature, Building2, Settings, Briefcase,
  ChevronLeft, ChevronRight, Headphones
} from "lucide-react";
import { Product, ServiceItem, Workflow, BlogPost, OrderRequest, RfqRequest, Category } from "../../types";
import { ReviewItem } from "../../types/review";
import ProductEditorModal from "./ProductEditorModal";
import ServiceEditorModal from "./ServiceEditorModal";
import SmartSelectionBuilder from "./SmartSelectionBuilder";
import AdminUserManagement from "./AdminUserManagement";
import ExcelProductImporterModal from "./ExcelProductImporterModal";
import AdminBlogManager from "./AdminBlogManager";
import AdminSeoSuite from "./AdminSeoSuite";
import AdminReviewManager from "./AdminReviewManager";
import AdminOrderManagement from "./AdminOrderManagement";
import AdminEnquiriesManager from "./AdminEnquiriesManager";
import AdminGeneralSettings from "./AdminGeneralSettings";
import AdminContactCenter from "./AdminContactCenter";
import AdminCategoryManager from "./AdminCategoryManager";
import AdminCareersManager from "./AdminCareersManager";
import AdminRetailerApplicationsManager from "./AdminRetailerApplicationsManager";
import { getLocalCategories, getCategories } from "../../services/categoryService";
import { getLocalJobPostings } from "../../services/careersService";

interface AdminPanelPageProps {
  products: Product[];
  services: ServiceItem[];
  workflows: Workflow[];
  blogs?: BlogPost[];
  reviews?: ReviewItem[];
  orders?: OrderRequest[];
  rfqs?: RfqRequest[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onBulkDeleteProducts?: (productIds: string[]) => void;
  onAddService: (service: ServiceItem) => void;
  onUpdateService: (service: ServiceItem) => void;
  onDeleteService: (serviceId: string) => void;
  onAddWorkflow: (workflow: Workflow) => void;
  onUpdateWorkflow: (workflow: Workflow) => void;
  onDeleteWorkflow: (workflowId: string) => void;
  onResetDefaultWorkflows?: () => void;
  onAddBlog?: (blog: BlogPost) => void;
  onUpdateBlog?: (blog: BlogPost) => void;
  onDeleteBlog?: (blogId: string) => void;
  onBulkDeleteBlogs?: (blogIds: string[]) => void;
  onPreviewBlogOnSite?: (blog: BlogPost) => void;
  onLogout: () => void;
  onBackToWebsite: () => void;
  onShowToast?: (msg: string) => void;
}

export default function AdminPanelPage({
  products,
  services,
  workflows,
  blogs = [],
  reviews = [],
  orders = [],
  rfqs = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onBulkDeleteProducts,
  onAddService,
  onUpdateService,
  onDeleteService,
  onAddWorkflow,
  onUpdateWorkflow,
  onDeleteWorkflow,
  onResetDefaultWorkflows,
  onAddBlog = () => {},
  onUpdateBlog = () => {},
  onDeleteBlog = () => {},
  onBulkDeleteBlogs,
  onPreviewBlogOnSite,
  onLogout,
  onBackToWebsite,
  onShowToast
}: AdminPanelPageProps) {
  const [activeTab, setActiveTab] = useState<
    "orders" | "retailer-apps" | "enquiries" | "products" | "services" | "blogs" | "reviews" | "careers" | "wizard-tags" | "users" | "seo" | "settings" | "contact-center"
  >("orders");

  // Dynamic Careers Count State
  const [activeJobsCount, setActiveJobsCount] = useState<number>(() => {
    return getLocalJobPostings().filter((j) => j.isActive).length;
  });

  // Product Catalog Sub-Tab ("inventory" vs "categories")
  const [productSubTab, setProductSubTab] = useState<"inventory" | "categories">("inventory");
  const [dynamicCategories, setDynamicCategories] = useState<Category[]>(getLocalCategories);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  React.useEffect(() => {
    const loadCats = async () => {
      const list = await getCategories();
      setDynamicCategories(list);
    };
    loadCats();
    const handleCatUpdate = (e: any) => {
      if (e.detail) {
        setDynamicCategories(e.detail);
      } else {
        setDynamicCategories(getLocalCategories());
      }
    };
    const handleCareersUpdate = () => {
      setActiveJobsCount(getLocalJobPostings().filter((j) => j.isActive).length);
    };
    window.addEventListener("cooltech_categories_updated", handleCatUpdate);
    window.addEventListener("cooltech_careers_updated", handleCareersUpdate);
    return () => {
      window.removeEventListener("cooltech_categories_updated", handleCatUpdate);
      window.removeEventListener("cooltech_careers_updated", handleCareersUpdate);
    };
  }, []);

  // Editor Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  const handleBulkImportProducts = (newProducts: Product[]) => {
    newProducts.forEach((p) => onAddProduct(p));
    if (onShowToast) onShowToast(`Successfully imported ${newProducts.length} product records from Excel!`);
  };

  // Selection & Bulk Action States
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const toggleSelectProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const toggleSelectAllFiltered = () => {
    if (selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleBulkDeleteSelected = () => {
    if (selectedProductIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedProductIds.length} selected products?`)) {
      if (onBulkDeleteProducts) {
        onBulkDeleteProducts(selectedProductIds);
      } else {
        selectedProductIds.forEach((id) => onDeleteProduct(id));
      }
      if (onShowToast) onShowToast(`Deleted ${selectedProductIds.length} selected products!`);
      setSelectedProductIds([]);
    }
  };

  // Filtered Lists
  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === "all" || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredServices = services.filter((s) => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination States for Products & Services
  const [productPage, setProductPage] = useState(1);
  const PRODUCT_PAGE_SIZE = 10;

  const [servicePage, setServicePage] = useState(1);
  const SERVICE_PAGE_SIZE = 9;

  // Reset page when filters change
  React.useEffect(() => {
    setProductPage(1);
  }, [searchTerm, filterCategory]);

  React.useEffect(() => {
    setServicePage(1);
  }, [searchTerm]);

  const totalProductPages = Math.ceil(filteredProducts.length / PRODUCT_PAGE_SIZE) || 1;
  const validProductPage = Math.min(productPage, totalProductPages);
  const startProdIdx = (validProductPage - 1) * PRODUCT_PAGE_SIZE;
  const endProdIdx = Math.min(startProdIdx + PRODUCT_PAGE_SIZE, filteredProducts.length);
  const paginatedProducts = filteredProducts.slice(startProdIdx, endProdIdx);

  const totalServicePages = Math.ceil(filteredServices.length / SERVICE_PAGE_SIZE) || 1;
  const validServicePage = Math.min(servicePage, totalServicePages);
  const startServIdx = (validServicePage - 1) * SERVICE_PAGE_SIZE;
  const endServIdx = Math.min(startServIdx + SERVICE_PAGE_SIZE, filteredServices.length);
  const paginatedServices = filteredServices.slice(startServIdx, endServIdx);

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (product: Product) => {
    try {
      if (editingProduct) {
        await onUpdateProduct(product);
        if (onShowToast) onShowToast(`Updated product "${product.name}".`);
      } else {
        await onAddProduct(product);
        if (onShowToast) onShowToast(`Created new product "${product.name}".`);
      }
      setIsProductModalOpen(false);
    } catch (err: any) {
      alert(`Failed to save product to database: ${err?.message || "Authentication / network error"}`);
    }
  };

  const handleDeleteProductConfirm = async (product: Product) => {
    if (window.confirm(`Are you sure you want to delete product "${product.name}"?`)) {
      try {
        await onDeleteProduct(product.id);
        if (onShowToast) onShowToast(`Product "${product.name}" removed from catalog.`);
      } catch (err: any) {
        alert(`Failed to delete product: ${err?.message || "Authentication / network error"}`);
      }
    }
  };

  const handleToggleHidePrice = (product: Product) => {
    const updated = { ...product, hidePrice: !product.hidePrice };
    onUpdateProduct(updated);
    if (onShowToast) {
      onShowToast(
        updated.hidePrice 
          ? `Price hidden for "${product.name}". Clients must request quotes.`
          : `Price is now publicly visible for "${product.name}".`
      );
    }
  };

  const handleOpenAddService = () => {
    setEditingService(null);
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (service: ServiceItem) => {
    setEditingService(service);
    setIsServiceModalOpen(true);
  };

  const handleSaveService = (service: ServiceItem) => {
    if (editingService) {
      onUpdateService(service);
      if (onShowToast) onShowToast(`Updated service "${service.title}".`);
    } else {
      onAddService(service);
      if (onShowToast) onShowToast(`Added new service "${service.title}".`);
    }
    setIsServiceModalOpen(false);
  };

  const handleDeleteServiceConfirm = (service: ServiceItem) => {
    if (window.confirm(`Are you sure you want to delete service "${service.title}"?`)) {
      onDeleteService(service.id);
      if (onShowToast) onShowToast(`Service "${service.title}" deleted.`);
    }
  };

  const uniqueCategories = Array.from(new Set(products.map((p) => p.category)));
  const totalWorkflowsCount = workflows.length;
  const newOrdersCount = orders.filter(o => o.status === "NEW").length;

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-50 text-slate-900 flex font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. White / Light Enterprise Sidebar */}
      <aside className="w-64 h-full bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden">
        
        {/* Brand / Logo */}
        <div className="p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2596be] text-white flex items-center justify-center font-black text-base shadow-sm">
              CT
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-slate-900 tracking-tight leading-none">Cool Technologies</h2>
              <span className="text-[10px] font-bold text-[#2596be] uppercase tracking-wider">Enterprise Ops</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <div className="flex-1 p-4 overflow-y-auto space-y-1 text-xs font-bold">
          
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1.5 block">
            B2B Commercial Ops
          </span>

          <nav className="space-y-1">
            
            {/* ORDER REQUESTS */}
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "orders"
                  ? "bg-[#0f4c81] text-white font-extrabold shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag size={16} />
                <span>Order Requests</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                activeTab === "orders" 
                  ? "bg-white/20 text-white" 
                  : newOrdersCount > 0 
                  ? "bg-blue-100 text-blue-800 border border-blue-200" 
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}>
                {newOrdersCount > 0 ? `${newOrdersCount} New` : orders.length}
              </span>
            </button>

            {/* RETAILER & B2B PARTNER APPLICATIONS */}
            <button
              onClick={() => setActiveTab("retailer-apps")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "retailer-apps"
                  ? "bg-[#0f4c81] text-white font-extrabold shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={16} />
                <span>Retailer Applications</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                activeTab === "retailer-apps"
                  ? "bg-white/20 text-white"
                  : "bg-cyan-50 text-cyan-800 border border-cyan-200"
              }`}>
                Verification
              </span>
            </button>

            {/* GENERAL ENQUIRIES */}
            <button
              onClick={() => setActiveTab("enquiries")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "enquiries"
                  ? "bg-[#0f4c81] text-white font-extrabold shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare size={16} />
                <span>General Enquiries</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Live</span>
            </button>
          </nav>

          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 pt-4 pb-1.5 block">
            Catalog & Content
          </span>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "products"
                  ? "bg-[#0f4c81] text-white font-extrabold shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package size={16} />
                <span>Products Catalog</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                activeTab === "products" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}>
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("services")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "services"
                  ? "bg-[#0f4c81] text-white font-extrabold shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wrench size={16} />
                <span>Services Offering</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                activeTab === "services" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}>
                {services.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("blogs")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "blogs"
                  ? "bg-[#0f4c81] text-white font-extrabold shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText size={16} />
                <span>Blog Hub</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                activeTab === "blogs" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700 border border-slate-200"
              }`}>
                {blogs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "reviews"
                  ? "bg-[#0f4c81] text-white font-extrabold shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare size={16} />
                <span>Customer Reviews</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                activeTab === "reviews" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}>
                {reviews.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("careers")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "careers"
                  ? "bg-[#0f4c81] text-white font-extrabold shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase size={16} />
                <span>Careers & Hiring</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                activeTab === "careers" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}>
                {activeJobsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("wizard-tags")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "wizard-tags"
                  ? "bg-[#0f4c81] text-white font-extrabold shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sliders size={16} />
                <span>Selection Builder</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                activeTab === "wizard-tags" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}>
                {totalWorkflowsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "users"
                  ? "bg-[#0f4c81] text-white font-extrabold shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users size={16} />
                <span>Users & RBAC</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 font-bold">Live</span>
            </button>

            <button
              onClick={() => setActiveTab("seo")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "seo"
                  ? "bg-[#0f4c81] text-white font-extrabold shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe size={16} />
                <span>Technical SEO Suite</span>
              </div>
              <span className="text-[10px] font-black font-mono text-emerald-600">100%</span>
            </button>

            <button
              onClick={() => setActiveTab("contact-center")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "contact-center"
                  ? "bg-[#0f4c81] text-white font-extrabold shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Headphones size={16} />
                <span>Contact &amp; Comms</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "settings"
                  ? "bg-[#0f4c81] text-white font-extrabold shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings size={16} />
                <span>General Settings</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 space-y-2 shrink-0 bg-white">
          <button
            onClick={onBackToWebsite}
            className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
          >
            <ArrowLeft size={14} />
            <span>Return to Public Site</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Work Area (Light Theme) */}
      <main className="flex-1 flex flex-col min-w-0 h-full max-h-screen overflow-hidden bg-slate-50">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0 shadow-2xs">
          <div>
            <h1 className="font-extrabold text-lg text-slate-900 tracking-tight">
              {activeTab === "orders" && "B2B Order Requests Pipeline"}
              {activeTab === "retailer-apps" && "Retailer & B2B Partner Applications"}
              {activeTab === "enquiries" && "General Enquiries & Lead Pipeline"}
              {activeTab === "products" && (productSubTab === "inventory" ? "Product Catalog Manager" : "Product Categories Manager")}
              {activeTab === "services" && "Services & Operations Manager"}
              {activeTab === "blogs" && "Blog & Dynamic Content Hub"}
              {activeTab === "wizard-tags" && "Visual Selection Assistant Builder"}
              {activeTab === "users" && "User Accounts & Role-Based Permissions (RBAC)"}
              {activeTab === "seo" && "Technical SEO & XML Sitemap Health Engine"}
              {activeTab === "contact-center" && "Contact & Communications Center"}
              {activeTab === "settings" && "General Site & System Settings"}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {activeTab === "orders" && "Manage incoming B2B order requests, allocate equipment, and record audit history"}
              {activeTab === "retailer-apps" && "Review trade licenses, verify commercial tax credentials, and authorize B2B wholesale partner status"}
              {activeTab === "enquiries" && "Unified customer inquiries, product support tickets, and CRM-synchronized submissions"}
              {activeTab === "products" && (productSubTab === "inventory" ? "Manage full commercial specs, price display toggles, and catalog items" : "Create and organize dynamic HVAC sourcing categories, subtitles, and SEO catalogs")}
              {activeTab === "services" && "Manage HVAC maintenance, installation, and field service contracts"}
              {activeTab === "blogs" && "Create technical engineering guides and manage SEO schemas"}
              {activeTab === "wizard-tags" && "Design interactive equipment decision tree workflows"}
              {activeTab === "users" && "View registered client accounts, roles, and verified B2B credentials"}
              {activeTab === "seo" && "Schema.org Markup, Meta Tags & Sitemap Generation"}
              {activeTab === "contact-center" && "Centralized corporate channels, Brevo mail routing, WhatsApp floating CTAs, and dynamic social profiles"}
              {activeTab === "settings" && "Configure trusted brand partner ticker, company contacts, and dynamic global parameters"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "products" && productSubTab === "inventory" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExcelModalOpen(true)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <FileSpreadsheet size={15} />
                  <span>Import Products (Excel/CSV)</span>
                </button>

                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2 bg-[#0f4c81] hover:bg-[#1c7e9f] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Add Product</span>
                </button>
              </div>
            )}

            {activeTab === "services" && (
              <button
                onClick={handleOpenAddService}
                className="px-4 py-2 bg-[#0f4c81] hover:bg-[#1c7e9f] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus size={15} />
                <span>Add Service</span>
              </button>
            )}

            {/* Top Header Manual Sign Out Button */}
            <div className="pl-3 border-l border-slate-200">
              <button
                type="button"
                onClick={onLogout}
                className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                title="Sign out of Admin Portal"
                id="admin-header-logout-btn"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body Container */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          
          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <AdminOrderManagement
              orders={orders}
              onShowToast={onShowToast || (() => {})}
            />
          )}

          {/* RETAILER & B2B APPLICATIONS TAB */}
          {activeTab === "retailer-apps" && (
            <AdminRetailerApplicationsManager
              onShowToast={onShowToast}
            />
          )}

          {/* GENERAL ENQUIRIES TAB */}
          {activeTab === "enquiries" && (
            <AdminEnquiriesManager
              onShowToast={onShowToast || (() => {})}
            />
          )}

          {/* PRODUCTS TAB */}
          {activeTab === "products" && (
            <div className="space-y-6">
              
              {/* Product Sub-Tabs Switcher */}
              <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs w-fit">
                <button
                  type="button"
                  onClick={() => setProductSubTab("inventory")}
                  className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                    productSubTab === "inventory"
                      ? "bg-[#0f4c81] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Package size={14} />
                  <span>Products Inventory ({products.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProductSubTab("categories")}
                  className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                    productSubTab === "categories"
                      ? "bg-[#0f4c81] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Layers size={14} />
                  <span>Product Categories ({dynamicCategories.length})</span>
                </button>
              </div>

              {/* Sub-Tab 1: Inventory Table */}
              {productSubTab === "inventory" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Product Search & Category Filter */}
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full md:w-80">
                      <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by SKU, Brand, or Model..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2596be] focus:bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-bold">Category:</span>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#2596be]"
                      >
                        <option value="all">All Categories ({products.length})</option>
                        {dynamicCategories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

              {/* Products Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-[10px] uppercase tracking-wider font-extrabold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3.5">Equipment / Model</th>
                        <th className="px-4 py-3.5">Category & Brand</th>
                        <th className="px-4 py-3.5">Wholesale Price</th>
                        <th className="px-4 py-3.5">Stock & MOQ</th>
                        <th className="px-4 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {paginatedProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <img src={p.image} alt="" className="w-10 h-10 object-contain rounded bg-slate-50 p-1 border border-slate-200 shrink-0" />
                              <div>
                                <div className="font-bold text-slate-900 text-xs">{p.name}</div>
                                {p.modelId && <div className="text-[10px] font-mono text-slate-400">SKU: {p.modelId}</div>}
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span className="text-[#0f4c81] font-bold">{p.brand}</span>
                            <div className="text-[10px] text-slate-400">{p.category}</div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900 text-xs">
                                ${p.price ? p.price.toLocaleString() : "Quote"}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleHidePrice(p)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                  p.hidePrice 
                                    ? "bg-amber-50 text-amber-700 border-amber-200" 
                                    : "bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900"
                                }`}
                                title={p.hidePrice ? "Price hidden on store" : "Price visible"}
                              >
                                {p.hidePrice ? "Hidden" : "Public"}
                              </button>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              p.inStock ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}>
                              {p.inStock ? "In Stock" : "Out of Stock"}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">MOQ: {p.minOrderQty || 1}</div>
                          </td>

                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-[#0f4c81] hover:bg-blue-50 transition-colors cursor-pointer"
                                title="Edit specs"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteProductConfirm(p)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete product"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Products Pagination Footer */}
                {filteredProducts.length > 0 && (
                  <div className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="text-slate-500 font-medium">
                      Showing <span className="font-bold text-slate-800">{startProdIdx + 1}</span> to{" "}
                      <span className="font-bold text-slate-800">{endProdIdx}</span> of{" "}
                      <span className="font-bold text-slate-800">{filteredProducts.length}</span> products
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                        disabled={validProductPage <= 1}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <ChevronLeft size={14} />
                        <span>Prev</span>
                      </button>

                      {Array.from({ length: totalProductPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalProductPages || Math.abs(p - validProductPage) <= 1)
                        .map((page, i, arr) => {
                          const prev = arr[i - 1];
                          const hasGap = prev && page - prev > 1;
                          return (
                            <React.Fragment key={page}>
                              {hasGap && <span className="px-1 text-slate-400 font-bold">...</span>}
                              <button
                                type="button"
                                onClick={() => setProductPage(page)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                  validProductPage === page
                                    ? "bg-[#0f4c81] text-white shadow-xs"
                                    : "border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        })}

                      <button
                        type="button"
                        onClick={() => setProductPage((p) => Math.min(totalProductPages, p + 1))}
                        disabled={validProductPage >= totalProductPages}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Next</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sub-Tab 2: Categories Manager */}
          {productSubTab === "categories" && (
            <AdminCategoryManager
              products={products}
              onShowToast={onShowToast || (() => {})}
            />
          )}

        </div>
      )}

      {/* SERVICES TAB */}
      {activeTab === "services" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedServices.map((s) => (
              <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-[#0f4c81] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                    {s.category}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenEditService(s)} className="p-1.5 rounded text-slate-500 hover:text-[#0f4c81] hover:bg-blue-50">
                      <Edit3 size={13} />
                    </button>
                    <button onClick={() => handleDeleteServiceConfirm(s)} className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{s.tagline}</p>
                <div className="text-[10px] text-slate-400 font-mono">SLA: {s.specs?.sla || "24/7"} • Warranty: {s.specs?.warranty || "1-Year"}</div>
              </div>
            ))}
          </div>

          {/* Services Pagination Footer */}
          {filteredServices.length > SERVICE_PAGE_SIZE && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 font-medium">
                Showing <span className="font-bold text-slate-800">{startServIdx + 1}</span> to{" "}
                <span className="font-bold text-slate-800">{endServIdx}</span> of{" "}
                <span className="font-bold text-slate-800">{filteredServices.length}</span> services
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setServicePage((p) => Math.max(1, p - 1))}
                  disabled={validServicePage <= 1}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>
                {Array.from({ length: totalServicePages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setServicePage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      validServicePage === page
                        ? "bg-[#0f4c81] text-white shadow-xs"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setServicePage((p) => Math.min(totalServicePages, p + 1))}
                  disabled={validServicePage >= totalServicePages}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

          {/* DYNAMIC BLOGS & CONTENT HUB TAB */}
          {activeTab === "blogs" && (
            <AdminBlogManager
              blogs={blogs}
              products={products}
              services={services}
              onAddBlog={onAddBlog}
              onUpdateBlog={onUpdateBlog}
              onDeleteBlog={onDeleteBlog}
              onBulkDeleteBlogs={onBulkDeleteBlogs}
              onShowToast={onShowToast}
              onPreviewBlogOnSite={onPreviewBlogOnSite}
            />
          )}

          {/* CUSTOMER REVIEWS TAB */}
          {activeTab === "reviews" && (
            <AdminReviewManager
              reviews={reviews}
              onShowToast={onShowToast || (() => {})}
            />
          )}

          {/* WIZARD BUILDER TAB */}
          {activeTab === "wizard-tags" && (
            <SmartSelectionBuilder
              workflows={workflows}
              products={products}
              services={services}
              onAddWorkflow={onAddWorkflow}
              onUpdateWorkflow={onUpdateWorkflow}
              onDeleteWorkflow={onDeleteWorkflow}
              onResetDefaultWorkflows={onResetDefaultWorkflows}
              onShowToast={onShowToast}
            />
          )}

          {/* CAREERS & HIRING TAB */}
          {activeTab === "careers" && (
            <AdminCareersManager onShowToast={onShowToast} />
          )}

          {/* USERS TAB */}
          {activeTab === "users" && (
            <AdminUserManagement onShowToast={onShowToast} />
          )}

          {/* TECHNICAL SEO & SITEMAP AUDIT TAB */}
          {activeTab === "seo" && (
            <AdminSeoSuite
              products={products}
              blogs={blogs}
              services={services}
              onShowToast={onShowToast}
            />
          )}

          {/* CONTACT & COMMUNICATIONS CENTER TAB */}
          {activeTab === "contact-center" && (
            <AdminContactCenter
              onShowToast={onShowToast}
            />
          )}

          {/* GENERAL SETTINGS TAB */}
          {activeTab === "settings" && (
            <AdminGeneralSettings
              onShowToast={onShowToast}
              onNavigateToContactCenter={() => setActiveTab("contact-center")}
            />
          )}

        </div>

      </main>

      {/* Product Editor Modal */}
      {isProductModalOpen && (
        <ProductEditorModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          onSave={handleSaveProduct}
          editingProduct={editingProduct}
        />
      )}

      {/* Service Editor Modal */}
      {isServiceModalOpen && (
        <ServiceEditorModal
          isOpen={isServiceModalOpen}
          onClose={() => setIsServiceModalOpen(false)}
          onSave={handleSaveService}
          editingService={editingService}
        />
      )}

      {/* Excel Product Importer Modal */}
      {isExcelModalOpen && (
        <ExcelProductImporterModal
          isOpen={isExcelModalOpen}
          onClose={() => setIsExcelModalOpen(false)}
          onImportProducts={handleBulkImportProducts}
        />
      )}

    </div>
  );
}
