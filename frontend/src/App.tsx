import { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Categories from "./components/Categories";
import ProductCatalog from "./components/ProductCatalog";
import Brands from "./components/Brands";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import ProductDetailModal from "./components/ProductDetailModal";
import QuoteModal from "./components/QuoteModal";
import BlogPage from "./components/BlogPage";
import CareersPage from "./components/CareersPage";
import ManagementModal from "./components/ManagementModal";
import LoginModal from "./components/LoginModal";
import ProductsPage from "./components/ProductsPage";
import ProductDetailPage from "./components/ProductDetailPage";
import ServicesPage from "./components/ServicesPage";
import Achievements from "./components/Achievements";
import CustomerReviews from "./components/CustomerReviews";
import AboutShort from "./components/AboutShort";
import AboutModal from "./components/AboutModal";
import AboutPage from "./components/AboutPage";
import ManagementPage from "./components/ManagementPage";
import MediaPage from "./components/MediaPage";
import ContactPage from "./components/ContactPage";
import CategoriesPage from "./components/CategoriesPage";
import AdminPanelPage from "./components/admin/AdminPanelPage";
import AdminLoginScreen from "./components/admin/AdminLoginScreen";
import SalesBuilderPage from "./components/admin/SalesBuilderPage";
import SelectionWizardModal from "./components/selection-wizard/SelectionWizardModal";
import LegalPage from "./components/LegalPage";
import AuthPage from "./components/AuthPage";
import AccountWorkspacePage from "./components/account/AccountWorkspacePage";
import RetailerApplicationPage from "./components/account/RetailerApplicationPage";
import { saveBlogToDatabase, deleteBlogFromDatabase, bulkDeleteBlogsFromDatabase, subscribeToBlogs } from "./lib/blogService";
import { subscribeToReviews } from "./lib/reviewService";
import { ReviewItem } from "./types/review";
import SubmitReviewPage from "./components/SubmitReviewPage";
import FloatingWidgets from "./components/common/FloatingWidgets";

import FloatingSelectorTrigger from "./components/selection-wizard/FloatingSelectorTrigger";
import { PRODUCTS, SERVICES } from "./data";
import { INITIAL_WORKFLOWS } from "./data/initialWorkflows";
import { INITIAL_BLOG_POSTS } from "./data/initialBlogs";
import { CartItem, Product, ServiceItem, Workflow, BlogPost, OrderRequest, RfqRequest, B2BUser } from "./types";
import { CheckCircle2, Sparkles } from "lucide-react";
import SEOHead from "./components/common/SEOHead";
import { useAuth } from "./context/AuthContext";
import { subscribeToOrders } from "./services/orderService";
import { subscribeToRfqs } from "./services/rfqService";
import { 
  subscribeToProducts, 
  getLocalProductsCache,
  createProduct, 
  updateProduct, 
  deleteProduct,
  bulkSaveProducts
} from "./services/productService";
import { 
  subscribeToServices, 
  createService as createServiceDb, 
  updateService as updateServiceDb, 
  deleteService as deleteServiceDb 
} from "./services/serviceService";
import { 
  subscribeToWorkflows, 
  saveWorkflow as saveWorkflowDb, 
  deleteWorkflow as deleteWorkflowDb 
} from "./services/workflowService";
import { auth, onIdTokenChanged } from "./lib/firebase";


export default function App() {
  const { user, profile, isAdmin, isSales, logout } = useAuth();
  const [currentHash, setCurrentHash] = useState<string>(window.location.hash || "#/");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [quotePrefilledProduct, setQuotePrefilledProduct] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);

  // Admin Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("cooltech_admin_authed") === "true";
    } catch {
      return false;
    }
  });

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    try {
      sessionStorage.setItem("cooltech_admin_authed", "true");
    } catch {}
    showToast("Authenticated as Enterprise System Admin.");
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem("cooltech_admin_authed");
    } catch {}
    if (logout) logout().catch(() => {});
    showToast("Signed out of Admin Portal.");
  };

  // Active Admin Session Security Heartbeat & Firebase Password Change Revocation Guard
  useEffect(() => {
    if (!isAdminAuthenticated || !currentHash.startsWith("#/admin")) return;

    let isTerminated = false;

    const terminateRevokedSession = (reason: string) => {
      if (isTerminated) return;
      isTerminated = true;
      console.warn(`[AdminSecurity] ${reason}. Revoking active administrative session.`);
      setIsAdminAuthenticated(false);
      try {
        sessionStorage.removeItem("cooltech_admin_authed");
      } catch {}
      if (logout) logout().catch(() => {});
      showToast("Security Alert: Administrative session terminated. Password or security settings were updated in Firebase.");
    };

    // 1. Listen to Firebase ID token changes (triggered when token is revoked or user updated in Firebase Console)
    const unsubscribeToken = onIdTokenChanged(auth, async (currentUser) => {
      if (!currentUser) {
        terminateRevokedSession("No authenticated Firebase user found");
      }
    });

    // 2. Active token refresh heartbeat: forces refresh against Firebase Auth servers every 20 seconds
    const heartbeatInterval = setInterval(async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        terminateRevokedSession("Firebase user session expired");
        return;
      }

      try {
        // Force token refresh from Firebase servers to detect password change / token revocation
        await currentUser.getIdToken(true);
      } catch (err: any) {
        console.warn("[AdminSecurity] Token validation check failed:", err);
        terminateRevokedSession("Firebase refresh token revoked due to password change or security update");
      }
    }, 20000);

    return () => {
      unsubscribeToken();
      clearInterval(heartbeatInterval);
    };
  }, [isAdminAuthenticated, currentHash, logout]);

  // Live products & services list (Clean initialization from local cache & Cloudflare D1)
  const [productsList, setProductsList] = useState<Product[]>(() => {
    return getLocalProductsCache();
  });

  const [servicesList, setServicesList] = useState<ServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem("cooltech_services_v1");
      return saved ? JSON.parse(saved) : SERVICES;
    } catch {
      return SERVICES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cooltech_products_v3", JSON.stringify(productsList));
    } catch {}
  }, [productsList]);

  useEffect(() => {
    try {
      localStorage.setItem("cooltech_services_v1", JSON.stringify(servicesList));
    } catch {}
  }, [servicesList]);

  // Real-time Firestore Products, Orders & RFQs Subscriptions
  const [ordersList, setOrdersList] = useState<OrderRequest[]>([]);
  const [rfqsList, setRfqsList] = useState<RfqRequest[]>([]);

  useEffect(() => {
    const unsubProducts = subscribeToProducts((prods) => {
      if (Array.isArray(prods)) {
        setProductsList(prods);
      }
    });

    const unsubOrders = subscribeToOrders((orders) => {
      setOrdersList(orders);
    });

    const unsubRfqs = subscribeToRfqs((rfqs) => {
      setRfqsList(rfqs);
    });

    const unsubServices = subscribeToServices((srvs) => {
      if (Array.isArray(srvs) && srvs.length > 0) {
        setServicesList(srvs);
      }
    });

    const unsubWorkflows = subscribeToWorkflows((wfs) => {
      if (Array.isArray(wfs) && wfs.length > 0) {
        setWorkflowsList(wfs);
      }
    });

    return () => {
      unsubProducts();
      unsubOrders();
      unsubRfqs();
      unsubServices();
      unsubWorkflows();
    };
  }, []);

  // Product CRUD Handlers with D1 / Backend Persistence
  const handleAddProduct = async (newProd: Product) => {
    await createProduct(newProd);
  };

  const handleUpdateProduct = async (updatedProd: Product) => {
    await updateProduct(updatedProd.id, updatedProd);
  };

  const handleDeleteProduct = async (productId: string) => {
    await deleteProduct(productId);
  };

  const handleBulkDeleteProducts = async (productIds: string[]) => {
    for (const id of productIds) {
      try {
        await deleteProduct(id);
      } catch (err) {
        console.warn("Bulk delete product error:", err);
      }
    }
  };

  // Service CRUD Handlers (with D1 Persistence)
  const handleAddService = async (newServ: ServiceItem) => {
    setServicesList((prev) => [newServ, ...prev]);
    try {
      await createServiceDb(newServ);
    } catch (err) {
      console.warn("Service create error:", err);
    }
  };

  const handleUpdateService = async (updatedServ: ServiceItem) => {
    setServicesList((prev) =>
      prev.map((s) => (s.id === updatedServ.id ? updatedServ : s))
    );
    try {
      await updateServiceDb(updatedServ);
    } catch (err) {
      console.warn("Service update error:", err);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    setServicesList((prev) => prev.filter((s) => s.id !== serviceId));
    try {
      await deleteServiceDb(serviceId);
    } catch (err) {
      console.warn("Service delete error:", err);
    }
  };

  // Dynamic Workflows List (with localStorage persistence & D1 sync)
  const [workflowsList, setWorkflowsList] = useState<Workflow[]>(() => {
    try {
      const saved = localStorage.getItem("cooltech_dynamic_workflows_v1");
      return saved ? JSON.parse(saved) : INITIAL_WORKFLOWS;
    } catch {
      return INITIAL_WORKFLOWS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cooltech_dynamic_workflows_v1", JSON.stringify(workflowsList));
    } catch {}
  }, [workflowsList]);

  // Sync workflows across tabs/windows in real time
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "cooltech_dynamic_workflows_v1" && e.newValue) {
        try {
          setWorkflowsList(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Workflow CRUD Handlers (with D1 Persistence)
  const handleAddWorkflow = async (newWf: Workflow) => {
    setWorkflowsList((prev) => [...prev, newWf]);
    try {
      await saveWorkflowDb(newWf);
    } catch (err) {
      console.warn("Workflow create error:", err);
    }
  };

  const handleUpdateWorkflow = async (updatedWf: Workflow) => {
    setWorkflowsList((prev) =>
      prev.map((w) => (w.id === updatedWf.id ? updatedWf : w))
    );
    try {
      await saveWorkflowDb(updatedWf);
    } catch (err) {
      console.warn("Workflow update error:", err);
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    setWorkflowsList((prev) => prev.filter((w) => w.id !== workflowId));
    try {
      await deleteWorkflowDb(workflowId);
    } catch (err) {
      console.warn("Workflow delete error:", err);
    }
  };

  const handleResetDefaultWorkflows = () => {
    setWorkflowsList(INITIAL_WORKFLOWS);
    try {
      localStorage.setItem("cooltech_dynamic_workflows_v1", JSON.stringify(INITIAL_WORKFLOWS));
    } catch {}
  };

  // Dynamic Blogs List with Firestore DB Sync & Local Storage Cache
  const [blogsList, setBlogsList] = useState<BlogPost[]>(INITIAL_BLOG_POSTS);

  useEffect(() => {
    const unsubscribe = subscribeToBlogs((updatedBlogs) => {
      setBlogsList(updatedBlogs);
    });
    return () => unsubscribe();
  }, []);

  // Dynamic Customer Reviews List with Firestore DB Sync & Local Storage Cache
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToReviews((updatedReviews) => {
      setReviewsList(updatedReviews);
    });
    return () => unsubscribe();
  }, []);

  // Blog Database CRUD Handlers
  const handleAddBlog = (newBlog: BlogPost) => {
    setBlogsList((prev) => [newBlog, ...prev.filter(b => b.id !== newBlog.id)]);
    saveBlogToDatabase(newBlog);
  };

  const handleUpdateBlog = (updatedBlog: BlogPost) => {
    setBlogsList((prev) =>
      prev.map((b) => (b.id === updatedBlog.id ? updatedBlog : b))
    );
    saveBlogToDatabase(updatedBlog);
  };

  const handleDeleteBlog = (blogId: string) => {
    setBlogsList((prev) => prev.filter((b) => b.id !== blogId));
    deleteBlogFromDatabase(blogId);
  };

  const handleBulkDeleteBlogs = (blogIds: string[]) => {
    const idSet = new Set(blogIds);
    setBlogsList((prev) => prev.filter((b) => !idSet.has(b.id)));
    bulkDeleteBlogsFromDatabase(blogIds);
  };



  // Listen to hash changes for robust routing
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || "#/");
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Navigation modal states
  const [isCareerOpen, setIsCareerOpen] = useState(false);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<"login" | "signup" | "retailer">("login");
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const handleOpenLoginModal = (mode: "login" | "signup" | "retailer" = "login") => {
    setLoginModalMode(mode);
    setIsLoginOpen(true);
  };

  // Firebase Authentication & User Profile (Single Source of Truth)
  const { user: authUser, profile: authProfile, logout: authLogout } = useAuth();

  // Derive active authenticated user object directly from Firebase Auth / Firestore profile
  const b2bUser: B2BUser | null = authUser ? {
    email: authProfile?.email || authUser.email || "",
    companyName: authProfile?.companyName || authUser.displayName || authUser.email?.split("@")[0] || "Valued User",
    taxId: authProfile?.taxId || "",
    isRetailer: authProfile?.role === "retailer" || authProfile?.isVerifiedRetailer === true,
  } : null;

  // Restore user's saved cart when user logs in or switches account
  useEffect(() => {
    try {
      if (b2bUser?.email) {
        const savedUserCart = localStorage.getItem(`cooltech_cart_${b2bUser.email}`);
        if (savedUserCart) {
          setCart(JSON.parse(savedUserCart));
        }
      } else {
        setCart([]);
      }
    } catch {}
  }, [b2bUser?.email]);

  // Automatically save cart changes to user's personal account storage
  useEffect(() => {
    try {
      if (b2bUser?.email && cart.length > 0) {
        localStorage.setItem(`cooltech_cart_${b2bUser.email}`, JSON.stringify(cart));
      }
    } catch {}
  }, [cart, b2bUser?.email]);

  const handleLoginSuccess = (usr: B2BUser) => {
    showToast(`Welcome back, ${usr.companyName || usr.email}! Account authenticated.`);
  };

  const handleLogout = async () => {
    if (b2bUser?.email) {
      try {
        localStorage.setItem(`cooltech_cart_${b2bUser.email}`, JSON.stringify(cart));
      } catch {}
    }
    await authLogout();
    setCart([]);
    showToast("Signed out of your account.");
  };

  // Show interactive success toast with deduplication guard
  const lastToastRef = useRef<{ message: string; time: number }>({ message: "", time: 0 });

  const showToast = (message: string) => {
    const now = Date.now();
    // Guard against identical toast messages triggered within 1500ms
    if (lastToastRef.current.message === message && now - lastToastRef.current.time < 1500) {
      return;
    }
    lastToastRef.current = { message, time: now };

    const id = `${now}-${Math.random()}`;
    setToasts((prev) => {
      // Prevent displaying duplicate notification cards simultaneously
      if (prev.some((t) => t.message === message)) {
        return prev;
      }
      return [...prev, { id, message }];
    });

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleAddToCart = (product: Product, quantity: number) => {
    let notificationMsg = "";
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        const newQty = updatedCart[existingItemIndex].quantity + quantity;
        updatedCart[existingItemIndex].quantity = newQty;
        notificationMsg = `Updated quantity of ${product.name} to ${newQty} units.`;
        return updatedCart;
      } else {
        notificationMsg = `Added ${quantity} units of ${product.name} to quote list.`;
        return [...prevCart, { product, quantity }];
      }
    });

    // Execute side-effect OUTSIDE the setState updater function to prevent React StrictMode double execution
    if (notificationMsg) {
      showToast(notificationMsg);
    }
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
         item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    let removedName = "";
    setCart((prevCart) => {
      const itemToRemove = prevCart.find((item) => item.product.id === productId);
      if (itemToRemove) {
        removedName = itemToRemove.product.name;
      }
      return prevCart.filter((item) => item.product.id !== productId);
    });

    if (removedName) {
      showToast(`Removed ${removedName} from cart.`);
    }
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleOpenProductDetail = (product: Product) => {
    window.location.hash = `#/product/${product.id}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenQuoteWithProduct = (productName: string) => {
    setQuotePrefilledProduct(productName);
    setIsQuoteOpen(true);
  };

  const handleOpenQuoteGeneral = () => {
    setQuotePrefilledProduct("");
    setIsQuoteOpen(true);
  };

  const handleShopProductsScroll = () => {
    window.location.hash = "#/products";
  };

  const b2bDiscountRate = b2bUser?.isRetailer ? 0.10 : 0;

  const handleOpenAbout = () => {
    window.location.hash = "#/about";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenBlog = () => {
    window.location.hash = "#/blog";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenManagement = () => {
    window.location.hash = "#/management";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenCareer = () => {
    window.location.hash = "#/careers";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenMedia = () => {
    window.location.hash = "#/media";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenContact = () => {
    window.location.hash = "#/contact";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenAdmin = () => {
    setIsWizardOpen(false);
    window.location.hash = "#/admin";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenWizard = () => {
    setIsWizardOpen(true);
  };

  // STANDALONE ADMIN PORTAL VIEW (Completely isolated from public Header & Footer)
  if (currentHash.startsWith("#/admin")) {
    if (!isAdminAuthenticated) {
      return (
        <AdminLoginScreen
          onLoginSuccess={handleAdminLoginSuccess}
          onBackToWebsite={() => {
            window.location.hash = "#/";
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      );
    }

    return (
      <AdminPanelPage
        products={productsList}
        services={servicesList}
        workflows={workflowsList}
        blogs={blogsList}
        reviews={reviewsList}
        orders={ordersList}
        rfqs={rfqsList}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onBulkDeleteProducts={handleBulkDeleteProducts}
        onAddService={handleAddService}
        onUpdateService={handleUpdateService}
        onDeleteService={handleDeleteService}
        onAddWorkflow={handleAddWorkflow}
        onUpdateWorkflow={handleUpdateWorkflow}
        onDeleteWorkflow={handleDeleteWorkflow}
        onResetDefaultWorkflows={handleResetDefaultWorkflows}
        onAddBlog={handleAddBlog}
        onUpdateBlog={handleUpdateBlog}
        onDeleteBlog={handleDeleteBlog}
        onBulkDeleteBlogs={handleBulkDeleteBlogs}
        onPreviewBlogOnSite={(blog) => {
          window.location.hash = `#/blog/${blog.slug || blog.id}`;
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onLogout={handleAdminLogout}
        onBackToWebsite={() => {
          window.location.hash = "#/";
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onShowToast={showToast}
      />
    );
  }

  // STANDALONE SHAREABLE PUBLIC CLIENT REVIEW SUBMISSION PAGE (#/submit-review)
  if (currentHash.startsWith("#/submit-review")) {
    return (
      <SubmitReviewPage onShowToast={showToast} />
    );
  }

  // STANDALONE SALES TEAM BUILDER PORTAL VIEW (Direct share link: #/builder or #/sales-builder)
  if (currentHash.startsWith("#/builder") || currentHash.startsWith("#/sales-builder")) {
    return (
      <SalesBuilderPage
        workflows={workflowsList}
        products={productsList}
        services={servicesList}
        onAddWorkflow={handleAddWorkflow}
        onUpdateWorkflow={handleUpdateWorkflow}
        onDeleteWorkflow={handleDeleteWorkflow}
        onResetDefaultWorkflows={handleResetDefaultWorkflows}
        onBackToWebsite={() => {
          window.location.hash = "#/";
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onShowToast={showToast}
      />
    );
  }

  // DEDICATED FULL-PAGE AUTHENTICATION (#/login, #/signup, #/forgot-password)
  if (
    currentHash.startsWith("#/login") ||
    currentHash.startsWith("#/signin") ||
    currentHash.startsWith("#/signup") ||
    currentHash.startsWith("#/register") ||
    currentHash.startsWith("#/forgot-password") ||
    currentHash.startsWith("#/forgot")
  ) {
    const mode = (currentHash.startsWith("#/signup") || currentHash.startsWith("#/register"))
      ? "signup"
      : (currentHash.startsWith("#/forgot-password") || currentHash.startsWith("#/forgot"))
      ? "forgot"
      : "login";

    return (
      <AuthPage
        initialMode={mode}
        onLoginSuccess={() => {
          showToast("Authentication confirmed.");
        }}
        onNavigateHome={() => {
          window.location.hash = "#/";
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onShowToast={showToast}
      />
    );
  }

  // DEDICATED FULL-PAGE ACCOUNT WORKSPACE (#/account, #/profile, #/wishlist, #/partner, #/retailer-application, #/b2b-application)
  if (
    currentHash.startsWith("#/account") || 
    currentHash.startsWith("#/profile") || 
    currentHash.startsWith("#/wishlist") ||
    currentHash.startsWith("#/partner") ||
    currentHash.startsWith("#/retailer-application") ||
    currentHash.startsWith("#/b2b-application")
  ) {
    return (
      <AccountWorkspacePage
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onAddToCart={handleAddToCart}
        onRequestQuoteWithService={handleOpenQuoteWithProduct}
        onNavigateHome={() => {
          window.location.hash = "#/";
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onNavigateCatalog={() => {
          window.location.hash = "#/products";
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenQuote={handleOpenQuoteGeneral}
        onShowToast={showToast}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans relative antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* Technical SEO Engine: Dynamic Meta Tags, Canonical Tags, OpenGraph & Schema.org JSON-LD */}
      <SEOHead />

      {/* Global Floating UI Widgets: Right-Edge Social Media Bar, WhatsApp Quick Chat, and 13+ Years Trust Badge */}
      <FloatingWidgets />

      {/* Floating Bottom-Left Smart Equipment Selector Trigger */}
      <FloatingSelectorTrigger 
        onOpenWizard={handleOpenWizard} 
        currentHash={currentHash} 
      />

      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-slate-900 text-white rounded-xl shadow-2xl p-4 border border-slate-800 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300"
            role="alert"
          >
            <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 size={14} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-200">System Notification</p>
              <p className="text-xs text-gray-400 mt-1 leading-normal font-semibold">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Header component */}
      <Header
        products={productsList}
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCategorySelect={setActiveCategory}
        onOpenQuote={handleOpenQuoteGeneral}
        onOpenBlog={handleOpenBlog}
        onOpenCareer={handleOpenCareer}
        onOpenManagement={handleOpenManagement}
        onOpenMedia={handleOpenMedia}
        onOpenContact={handleOpenContact}
        onOpenAdmin={handleOpenAdmin}
        onOpenWizard={handleOpenWizard}
        onOpenLogin={(mode) => handleOpenLoginModal(mode || "login")}
        onOpenAbout={handleOpenAbout}
        b2bUser={b2bUser}
        onLogout={handleLogout}
      />

      {/* Primary Layout sections */}
      <main className="flex-1">
        {currentHash.startsWith("#/product/") ? (
          <ProductDetailPage
            products={productsList}
            productId={currentHash.split("#/product/")[1]?.split("?")[0]?.replace(/\/$/, "") || ""}
            onBackToCatalog={() => {
              window.location.hash = "#/products";
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onAddToCart={handleAddToCart}
            onOpenQuoteWithProduct={handleOpenQuoteWithProduct}
            b2bDiscountRate={b2bDiscountRate}
          />
        ) : currentHash.startsWith("#/products") ? (
          <ProductsPage
            products={productsList}
            onAddToCart={handleAddToCart}
            onOpenProductDetail={handleOpenProductDetail}
            onOpenQuoteWithProduct={handleOpenQuoteWithProduct}
            b2bDiscountRate={b2bDiscountRate}
          />
        ) : currentHash.startsWith("#/services") ? (
          <ServicesPage
            services={servicesList}
            onAddToCart={handleAddToCart}
            onRequestQuoteWithService={handleOpenQuoteWithProduct}
            onOpenAbout={handleOpenAbout}
            onOpenLogin={() => handleOpenLoginModal("login")}
            reviews={reviewsList}
          />
        ) : currentHash.startsWith("#/about") ? (
          <AboutPage
            onOpenQuote={handleOpenQuoteWithProduct}
            onCategorySelect={setActiveCategory}
          />
        ) : currentHash.startsWith("#/management") ? (
          <ManagementPage
            onOpenQuote={handleOpenQuoteWithProduct}
            onOpenCareer={handleOpenCareer}
          />
        ) : currentHash.startsWith("#/media") ? (
          <MediaPage
            onOpenQuote={handleOpenQuoteWithProduct}
          />
        ) : currentHash.startsWith("#/careers") ? (
          <CareersPage
            onOpenQuote={handleOpenQuoteWithProduct}
          />
        ) : currentHash.startsWith("#/terms") ? (
          <LegalPage initialTab="terms" />
        ) : currentHash.startsWith("#/privacy") ? (
          <LegalPage initialTab="privacy" />
        ) : currentHash.startsWith("#/legal") ? (
          <LegalPage initialTab={currentHash.includes("privacy") ? "privacy" : "terms"} />
        ) : currentHash.startsWith("#/contact") || currentHash.startsWith("#/support") ? (
          <ContactPage
            initialCategory={
              currentHash.includes("category=product_support") ||
              currentHash.includes("category=product-support") ||
              currentHash.startsWith("#/support")
                ? "product_support"
                : undefined
            }
            onOpenQuote={handleOpenQuoteWithProduct}
            onOpenProducts={() => {
              window.location.hash = "#/products";
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onShowToast={showToast}
          />
        ) : currentHash.startsWith("#/categories") ? (
          <CategoriesPage
            products={productsList}
            onSelectCategory={(catName) => {
              setActiveCategory(catName);
              window.location.hash = `#/products?category=${encodeURIComponent(catName)}`;
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onOpenQuote={handleOpenQuoteGeneral}
          />
        ) : currentHash.startsWith("#/blog") ? (
          <BlogPage
            blogs={blogsList}
            onOpenQuote={handleOpenQuoteWithProduct}
            onOpenProducts={() => {
              window.location.hash = "#/products";
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        ) : (
          <>
            {/* Hero Section */}
            <Hero
              onShopProductsClick={handleShopProductsScroll}
              onRequestQuoteClick={handleOpenQuoteGeneral}
              onFormSubmitSuccess={showToast}
            />

            {/* Value Ribbon */}
            <Features />

            {/* Categories Section */}
            <Categories
              activeCategory={activeCategory}
              onCategorySelect={setActiveCategory}
            />

            {/* Brands Section */}
            <Brands />

            {/* Interactive Products Grid Sourcing Center */}
            <ProductCatalog
              products={productsList}
              activeCategory={activeCategory}
              onCategorySelect={setActiveCategory}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onAddToCart={handleAddToCart}
              onOpenProductDetail={handleOpenProductDetail}
              onOpenQuoteWithProduct={handleOpenQuoteWithProduct}
            />

            {/* Short About Us Section */}
            <AboutShort onOpenAbout={handleOpenAbout} />

            {/* Achievements Section */}
            <Achievements />

            {/* Customer Reviews Section */}
            <CustomerReviews 
              reviews={reviewsList} 
              onOpenLogin={() => handleOpenLoginModal("login")}
            />
          </>
        )}
      </main>

      {/* Footer component */}
      <Footer
        onCategorySelect={setActiveCategory}
        onOpenQuote={handleOpenQuoteGeneral}
        onOpenBlog={handleOpenBlog}
        onOpenCareer={handleOpenCareer}
        onOpenManagement={handleOpenManagement}
        onOpenAbout={handleOpenAbout}
        onOpenMedia={handleOpenMedia}
        onOpenTerms={() => {
          window.location.hash = "#/terms";
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onOpenPrivacy={() => {
          window.location.hash = "#/privacy";
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* Pop-Up Smart Selection Wizard Modal */}
      <SelectionWizardModal
        isOpen={isWizardOpen && !currentHash.startsWith("#/admin") && !currentHash.startsWith("#/builder")}
        onClose={() => setIsWizardOpen(false)}
        products={productsList}
        services={servicesList}
        workflows={workflowsList}
        onSelectProduct={(productId) => {
          const found = productsList.find((p) => p.id === productId) || productsList[0];
          handleOpenProductDetail(found);
        }}
        onRequestQuote={handleOpenQuoteWithProduct}
      />

      {/* Drawer and Modal Dialog Overlays */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        b2bDiscountRate={b2bDiscountRate}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onOpenQuoteWithProduct={handleOpenQuoteWithProduct}
        b2bDiscountRate={b2bDiscountRate}
      />

      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        prefilledProduct={quotePrefilledProduct}
      />

      <ManagementModal
        isOpen={isManagementOpen}
        onClose={() => setIsManagementOpen(false)}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        initialMode={loginModalMode}
        onLoginSuccess={handleLoginSuccess}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

    </div>
  );
}
