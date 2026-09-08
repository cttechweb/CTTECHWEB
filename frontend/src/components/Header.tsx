import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Truck, ShieldCheck, Headphones, Search, User, ShoppingCart, 
  Menu, X, ChevronDown, Wind, LogOut, ShieldAlert, Wrench,
  Package, Layers, HelpCircle, Users, FileText, BookOpen, Briefcase, Phone, Mail,
  Globe, Download, Newspaper, Info, Shield, CheckCircle, Sparkles, Droplet, Snowflake, Zap,
  RefreshCw, Thermometer, Heart
} from "lucide-react";
// @ts-ignore
import logo from "../assets/images/Cool Technologies Logo.png";
import RetailerOnboardingModal from "./account/RetailerOnboardingModal";
import UserProfileModal from "./account/UserProfileModal";
import { CartItem, Product, ServiceItem } from "../types";
import { PRODUCTS, SERVICES } from "../data";
import { useWishlist } from "../context/WishlistContext";
import { getGeneralSettings } from "../services/generalSettingsService";

interface HeaderProps {
  cart: CartItem[];
  onOpenCart: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCategorySelect: (category: string | null) => void;
  onOpenQuote: () => void;
  onOpenBlog: () => void;
  onOpenCareer: () => void;
  onOpenManagement: () => void;
  onOpenMedia?: () => void;
  onOpenContact?: () => void;
  onOpenAdmin?: () => void;
  onOpenWizard?: () => void;
  onOpenLogin: (mode?: "login" | "signup" | "retailer") => void;
  onOpenAbout: () => void;
  products?: Product[];
  b2bUser: any;
  onLogout: () => void;
}

export default function Header({
  products,
  cart,
  onOpenCart,
  searchTerm,
  onSearchChange,
  onCategorySelect,
  onOpenQuote,
  onOpenBlog,
  onOpenCareer,
  onOpenManagement,
  onOpenMedia,
  onOpenContact,
  onOpenAdmin,
  onOpenWizard,
  onOpenLogin,
  onOpenAbout,
  b2bUser,
  onLogout
}: HeaderProps) {
  const { wishlist } = useWishlist();
  const wishlistCount = wishlist.length;

  const [contactSettings, setContactSettings] = useState(() => {
    const s = getGeneralSettings();
    return {
      phone: s.phone || "+971 2 565 0123",
      email: s.email || "info@cooltechuae.com"
    };
  });

  useEffect(() => {
    const updateContacts = () => {
      const s = getGeneralSettings();
      setContactSettings({
        phone: s.phone || "+971 2 565 0123",
        email: s.email || "info@cooltechuae.com"
      });
    };
    window.addEventListener("cooltech_contact_settings_updated", updateContacts);
    window.addEventListener("cooltech_settings_updated", updateContacts);
    window.addEventListener("storage", updateContacts);
    return () => {
      window.removeEventListener("cooltech_contact_settings_updated", updateContacts);
      window.removeEventListener("cooltech_settings_updated", updateContacts);
      window.removeEventListener("storage", updateContacts);
    };
  }, []);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isRetailerOnboardingOpen, setIsRetailerOnboardingOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  
  // Custom smart search & desktop layout states
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Search debouncing, dropdown & keyboard navigation state
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // Debounce search input (250ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm.trim());
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Handle click outside to close live dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter ONLY internal Products and Services from database
  const searchResults = useMemo(() => {
    if (!debouncedQuery) return { products: [], services: [], total: 0 };
    const q = debouncedQuery.toLowerCase();

    const matchingProducts = (products || PRODUCTS).filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchingServices = SERVICES.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    ).slice(0, 5);

    return {
      products: matchingProducts,
      services: matchingServices,
      total: matchingProducts.length + matchingServices.length,
    };
  }, [debouncedQuery]);

  // Combined flat results array for arrow key navigation
  const flatResults = useMemo(() => {
    const items: Array<{ type: "product" | "service"; item: Product | ServiceItem }> = [];
    searchResults.products.forEach((p) => items.push({ type: "product", item: p }));
    searchResults.services.forEach((s) => items.push({ type: "service", item: s }));
    return items;
  }, [searchResults]);

  // Reset highlight index when query changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [debouncedQuery]);

  // Keyboard navigation handler (Up, Down, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen || !debouncedQuery) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatResults.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = selectedIndex >= 0 ? flatResults[selectedIndex] : flatResults[0];
      if (target) {
        if (target.type === "product") {
          handleSelectProduct(target.item as Product);
        } else {
          handleSelectService(target.item as ServiceItem);
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsDropdownOpen(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setIsDropdownOpen(false);
    onSearchChange("");
    window.location.hash = `#/product/${product.id}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectService = (service: ServiceItem) => {
    setIsDropdownOpen(false);
    onSearchChange("");
    window.location.hash = "#/services";
    setTimeout(() => {
      const el = document.getElementById(`service-${service.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 120);
  };

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case "Wrench": return <Wrench size={15} className="text-blue-600 shrink-0" />;
      case "Sparkles": return <Sparkles size={15} className="text-blue-600 shrink-0" />;
      case "Wind": return <Wind size={15} className="text-blue-600 shrink-0" />;
      case "Droplet": return <Droplet size={15} className="text-blue-600 shrink-0" />;
      case "Snowflake": return <Snowflake size={15} className="text-blue-600 shrink-0" />;
      case "Zap": return <Zap size={15} className="text-blue-600 shrink-0" />;
      case "RefreshCw": return <RefreshCw size={15} className="text-blue-600 shrink-0" />;
      case "Thermometer": return <Thermometer size={15} className="text-blue-600 shrink-0" />;
      default: return <Wrench size={15} className="text-blue-600 shrink-0" />;
    }
  };

  // Render live search dropdown
  const renderSearchDropdown = () => {
    if (!isDropdownOpen || !debouncedQuery) return null;

    let indexCounter = -1;

    return (
      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200/90 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
        {searchResults.total > 0 ? (
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {/* Products Section */}
            {searchResults.products.length > 0 && (
              <div>
                <div className="px-3.5 py-1.5 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between select-none">
                  <span>Products</span>
                  <span className="text-[9px] text-slate-400 font-semibold">{searchResults.products.length} found</span>
                </div>
                <div>
                  {searchResults.products.map((product) => {
                    indexCounter++;
                    const itemIdx = indexCounter;
                    const isHighlighted = itemIdx === selectedIndex;
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleSelectProduct(product)}
                        onMouseEnter={() => setSelectedIndex(itemIdx)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                          isHighlighted ? "bg-blue-50 text-blue-900" : "hover:bg-slate-50 text-slate-800"
                        }`}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-8 h-8 rounded border border-slate-200 object-cover bg-slate-50 shrink-0"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/src/assets/images/hvac_air_conditioner_1784350824930.jpg";
                          }}
                        />
                        <span className="text-xs font-semibold line-clamp-1 flex-1">{product.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Services Section */}
            {searchResults.services.length > 0 && (
              <div>
                <div className="px-3.5 py-1.5 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between select-none">
                  <span>Services</span>
                  <span className="text-[9px] text-slate-400 font-semibold">{searchResults.services.length} found</span>
                </div>
                <div>
                  {searchResults.services.map((service) => {
                    indexCounter++;
                    const itemIdx = indexCounter;
                    const isHighlighted = itemIdx === selectedIndex;
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => handleSelectService(service)}
                        onMouseEnter={() => setSelectedIndex(itemIdx)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                          isHighlighted ? "bg-blue-50 text-blue-900" : "hover:bg-slate-50 text-slate-800"
                        }`}
                      >
                        <div className="w-8 h-8 rounded bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                          {getServiceIcon(service.iconName)}
                        </div>
                        <span className="text-xs font-semibold line-clamp-1 flex-1">{service.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="p-4 text-center">
            <p className="text-xs font-bold text-slate-700">No matching products or services found.</p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Try another keyword.</p>
          </div>
        )}
      </div>
    );
  };
  
  // Custom modal for Product Support & Media navigation
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const handleMediaClick = () => {
    if (onOpenMedia) {
      onOpenMedia();
    } else {
      window.location.hash = "#/media";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  
  // Interactive ticket lookup state
  const [supportTicketId, setSupportTicketId] = useState("");
  const [supportStatusResult, setSupportStatusResult] = useState<string | null>(null);
  const [isSearchingTicket, setIsSearchingTicket] = useState(false);

  const handleTicketLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportTicketId.trim()) return;
    setIsSearchingTicket(true);
    setTimeout(() => {
      setIsSearchingTicket(false);
      const statuses = [
        "LTL Freight dispatch scheduled. Delivery estimate: July 22, 2026.",
        "OEM Warranty registration verified. Certificate sent to authorized email.",
        "Climate System engineering specs reviewed. Technical drawing approved.",
        "Parts sourcing request received. Supplier quote compilation in progress.",
        "Support Ticket ID not found. Please contact the contractor hotline at 1-800-COOL-B2B."
      ];
      const randomStatus = statuses[Math.floor(Math.random() * (statuses.length - 1))];
      if (supportTicketId.toLowerCase().includes("err") || supportTicketId.length < 4) {
        setSupportStatusResult("Support Ticket ID not found. Please contact the contractor hotline at 1-800-COOL-B2B.");
      } else {
        setSupportStatusResult(`[Ticket Active] Status: ${randomStatus}`);
      }
    }, 800);
  };
  
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (flatResults.length > 0) {
      const topItem = selectedIndex >= 0 ? flatResults[selectedIndex] : flatResults[0];
      if (topItem.type === "product") {
        handleSelectProduct(topItem.item as Product);
      } else {
        handleSelectService(topItem.item as ServiceItem);
      }
    } else {
      const catalogElement = document.getElementById("product-catalog");
      if (catalogElement) {
        catalogElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleNavClick = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };


  return (
    <header className="w-full bg-white font-sans sticky top-0 z-40 shadow-sm border-b border-slate-100">
      
      {/* Top Banner (Deep Blue) */}
      <div className="w-full bg-[#031b4e] text-white py-1.5 px-3 sm:px-4 text-[10px] sm:text-[11px] font-semibold">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1 sm:gap-2 text-center sm:text-left">
          <div className="tracking-wide">Official B2B Sourcing Hub — Direct Wholesale Rates</div>
          <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6 text-slate-300">
            <a href={`mailto:${contactSettings.email}`} className="flex items-center gap-1 hover:text-white transition-colors">
              <Mail size={11} className="text-cyan-400" />
              <span>{contactSettings.email}</span>
            </a>
            <a href={`tel:${contactSettings.phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-1 hover:text-white transition-colors">
              <Phone size={11} className="text-cyan-400" />
              <span>{contactSettings.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Primary Navigation Row */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 sm:h-[88px] flex items-center justify-between gap-3 md:gap-6 w-full">
        
        {/* Logo and Brand (Left side) - Perfectly centered and professional */}
        <div 
          className="flex items-center justify-start cursor-pointer select-none shrink-0" 
          onClick={() => {
            onCategorySelect(null);
            onSearchChange("");
            window.location.hash = "#/";
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          id="brand-logo"
        >
          <img 
            src={logo} 
            alt="Cool Technologies Logo" 
            className="w-[125px] sm:w-[170px] h-auto max-h-[42px] sm:max-h-[52px] object-contain select-none"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Dynamic Nav Link & Expanded Search Interaction Zone (Desktop Only) */}
        <div className="hidden lg:flex items-center flex-1 ml-10 relative">
          
          {!isSearchExpanded ? (
            /* STATE A: Navigation Links are displayed */
            <div className="flex items-center animate-in fade-in slide-in-from-left-3 duration-200">
              <nav className="flex items-center gap-[40px] text-[14px] font-semibold text-slate-700 tracking-wide">
                
                {/* 1. Home Page (Direct) */}
                <button 
                  onClick={() => {
                    onCategorySelect(null);
                    onSearchChange("");
                    window.location.hash = "#/";
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-blue-700 transition-colors py-1.5 relative group font-semibold text-[14px] text-slate-700 cursor-pointer"
                >
                  Home
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-700 transition-all group-hover:w-full"></span>
                </button>

                {/* 2. Products & Support Dropdown (Hover Triggered) */}
                <div className="relative group py-2">
                  <button 
                    onClick={() => {
                      window.location.hash = "#/products";
                    }}
                    className="flex items-center gap-1.5 hover:text-blue-700 transition-colors py-1.5 font-semibold text-[14px] text-slate-700 tracking-wide select-none cursor-pointer"
                  >
                    <span>Products</span>
                    <ChevronDown size={14} className="text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
                  </button>
                  
                  {/* Dropdown Box */}
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-100 rounded-xl shadow-xl py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-4 py-1.5 border-b border-slate-50 mb-1">
                      <span className="text-[10px] text-blue-700 font-extrabold uppercase tracking-widest">Sourcing Directory</span>
                    </div>
                    
                    <button
                      onClick={() => {
                        window.location.hash = "#/products";
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-slate-700 transition-colors text-left cursor-pointer"
                    >
                      <Package size={16} className="text-blue-600 shrink-0" />
                      <div>
                        <p className="text-slate-800 font-black text-xs">Product Page</p>
                        <p className="text-[10px] text-slate-400 font-bold leading-none mt-0.5">Industrial B2B HVAC Catalog</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        window.location.hash = "#/categories";
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-slate-700 transition-colors text-left cursor-pointer"
                    >
                      <Layers size={16} className="text-blue-600 shrink-0" />
                      <div>
                        <p className="text-slate-800 font-black text-xs">Product Categories</p>
                        <p className="text-[10px] text-slate-400 font-bold leading-none mt-0.5">Browse Sourcing Categories</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        window.location.hash = "#/contact?category=product_support";
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-slate-700 transition-colors text-left cursor-pointer"
                    >
                      <HelpCircle size={16} className="text-blue-600 shrink-0" />
                      <div>
                        <p className="text-slate-800 font-black text-xs">Product Support</p>
                        <p className="text-[10px] text-slate-400 font-bold leading-none mt-0.5">Brochures, Manuals & Warranty</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 3. Services Page (Direct Top-Level Link) */}
                <button 
                  onClick={() => {
                    window.location.hash = "#/services";
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-blue-700 transition-colors py-1.5 relative group font-semibold text-[14px] text-slate-700 cursor-pointer"
                >
                  Services
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-700 transition-all group-hover:w-full"></span>
                </button>


                {/* 4. Company & Info Dropdown (Hover Triggered) */}
                <div className="relative group py-2">
                  <button className="flex items-center gap-1.5 hover:text-blue-700 transition-colors py-1.5 font-semibold text-[14px] text-slate-700 tracking-wide select-none cursor-pointer">
                    <span>Company</span>
                    <ChevronDown size={14} className="text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
                  </button>
                  
                  {/* Dropdown Box */}
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-100 rounded-xl shadow-xl py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-4 py-1.5 border-b border-slate-50 mb-1">
                      <span className="text-[10px] text-blue-700 font-extrabold uppercase tracking-widest">Corporate Resources</span>
                    </div>
                    
                    <button
                      onClick={onOpenAbout}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-slate-700 transition-colors text-left cursor-pointer"
                    >
                      <Info size={16} className="text-blue-600 shrink-0" />
                      <div>
                        <p className="text-slate-800 font-black text-xs">About Us</p>
                        <p className="text-[10px] text-slate-400 font-bold leading-none mt-0.5">Learn more about our company profile</p>
                      </div>
                    </button>

                    <button
                      onClick={onOpenManagement}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-slate-700 transition-colors text-left cursor-pointer"
                    >
                      <Users size={16} className="text-blue-600 shrink-0" />
                      <div>
                        <p className="text-slate-800 font-black text-xs">Management</p>
                        <p className="text-[10px] text-slate-400 font-bold leading-none mt-0.5">Executive leadership team</p>
                      </div>
                    </button>

                    <button
                      onClick={handleMediaClick}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-slate-700 transition-colors text-left cursor-pointer"
                    >
                      <FileText size={16} className="text-blue-600 shrink-0" />
                      <div>
                        <p className="text-slate-800 font-black text-xs">Media</p>
                        <p className="text-[10px] text-slate-400 font-bold leading-none mt-0.5">Press kits, news releases & assets</p>
                      </div>
                    </button>

                    <button
                      onClick={onOpenCareer}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-slate-700 transition-colors text-left cursor-pointer"
                    >
                      <Briefcase size={16} className="text-blue-600 shrink-0" />
                      <div>
                        <p className="text-slate-800 font-black text-xs">Careers</p>
                        <p className="text-[10px] text-slate-400 font-bold leading-none mt-0.5">Engineering & logistics openings</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 5. Blog (Direct Top-Level Link) */}
                <button 
                  onClick={onOpenBlog}
                  className="hover:text-blue-700 transition-colors py-1.5 relative group font-semibold text-[14px] text-slate-700 cursor-pointer"
                >
                  Blog
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-700 transition-all group-hover:w-full"></span>
                </button>

                {/* 6. Contact Us (Direct Top-Level Link) */}
                <button 
                  onClick={() => {
                    if (onOpenContact) {
                      onOpenContact();
                    } else {
                      window.location.hash = "#/contact";
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className={`hover:text-blue-700 transition-colors py-1.5 relative group font-semibold text-[14px] cursor-pointer ${
                    window.location.hash === "#/contact" ? "text-blue-700 font-bold" : "text-slate-700"
                  }`}
                >
                  Contact
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-700 transition-all ${
                    window.location.hash === "#/contact" ? "w-full" : "w-0 group-hover:w-full"
                  }`}></span>
                </button>

              </nav>
            </div>
          ) : (
            /* STATE B: Search expanded to the left; Menu button collapses back */
            <div className="flex items-center gap-4 w-full animate-in fade-in slide-in-from-right-3 duration-200">
              
              {/* Menu Button (Clicking this reduces search back to button icon) */}
              <button
                onClick={() => {
                  setIsSearchExpanded(false);
                  setIsDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 hover:bg-slate-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-lg font-black text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0"
                title="Collapse Search"
              >
                <Menu size={16} className="text-slate-600" />
                <span>Menu</span>
              </button>

              {/* Expanded Live Search Bar Form */}
              <div ref={searchContainerRef} className="flex-1 relative">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <div className="relative shadow-sm rounded-full overflow-hidden border border-blue-600/40 bg-white ring-4 ring-blue-50/60 transition-all flex items-center">
                    <span className="pl-4 text-blue-700 shrink-0 pointer-events-none">
                      <Search size={15} />
                    </span>
                    <input
                      type="text"
                      placeholder="Search equipment, parts, services, models..."
                      value={searchTerm}
                      onChange={(e) => {
                        onSearchChange(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      className="w-full pl-3 pr-24 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                    <div className="absolute right-1.5 flex items-center gap-1">
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => {
                            onSearchChange("");
                            setIsDropdownOpen(false);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all cursor-pointer mr-1"
                          title="Clear search"
                        >
                          <X size={13} />
                        </button>
                      )}
                      <button
                        type="submit"
                        className="bg-blue-700 hover:bg-blue-800 text-white text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full transition-all cursor-pointer"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </form>
                {renderSearchDropdown()}
              </div>
            </div>
          )}

        </div>

        {/* Right Side Account & Procurement Actions */}
        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">

          {/* ================= DESKTOP CONTROLS (lg:flex) ================= */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            {/* 1. Desktop Search Trigger Icon Button */}
            {!isSearchExpanded && (
              <button
                onClick={() => {
                  setIsSearchExpanded(true);
                  setIsDropdownOpen(true);
                }}
                className="flex items-center justify-center text-slate-500 hover:text-blue-700 w-10 h-10 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg transition-all cursor-pointer shadow-sm shrink-0 hover:scale-[1.02] active:scale-[0.98]"
                title="Expand Sourcing Search"
              >
                <Search size={16} className="text-blue-700" />
              </button>
            )}

            {/* 2. Retailer Login Portal Section / User Profile */}
            <div className="flex items-center">
              {b2bUser ? (
                /* Authenticated User state */
                <div className="relative">
                  <div 
                    onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                    className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 rounded-lg pl-2.5 pr-3 h-10 hover:bg-slate-100 transition-all select-none"
                    id="account-menu-trigger"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#031b4e] text-white font-black flex items-center justify-center text-xs">
                      {b2bUser.companyName ? b2bUser.companyName[0].toUpperCase() : b2bUser.email[0].toUpperCase()}
                    </div>
                    <div className="text-left text-xs leading-tight">
                      <p className="font-extrabold text-slate-800 max-w-[120px] truncate">{b2bUser.companyName || b2bUser.email.split("@")[0]}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">{b2bUser.email}</p>
                    </div>
                    <ChevronDown size={12} className="text-slate-400" />
                  </div>

                  {isAccountDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-150 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 rounded-t-2xl">
                        <p className="text-xs font-black text-slate-900 truncate">{b2bUser.companyName || b2bUser.email.split("@")[0]}</p>
                        <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{b2bUser.email}</p>
                      </div>

                      <div className="py-1.5 space-y-0.5">
                        <button 
                          onClick={() => { 
                            setIsAccountDropdownOpen(false); 
                            window.location.hash = "#/account";
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 text-slate-800 font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
                          id="header-my-account-btn"
                        >
                          <User size={15} className="text-blue-600 shrink-0" />
                          <span>My Account Workspace</span>
                        </button>
                        <button 
                          onClick={() => { setIsAccountDropdownOpen(false); onOpenCart(); }}
                          className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 text-slate-800 font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <ShoppingCart size={15} className="text-blue-600 shrink-0" />
                          <span>My Saved Cart ({cartItemCount})</span>
                        </button>
                        <button 
                          onClick={() => { 
                            setIsAccountDropdownOpen(false); 
                            window.location.hash = "#/account?tab=wishlist";
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 text-slate-800 font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Heart size={15} className="text-rose-500 shrink-0 fill-rose-500" />
                          <span>My Wishlist</span>
                        </button>
                        <button 
                          onClick={() => { 
                            setIsAccountDropdownOpen(false); 
                            window.location.hash = "#/retailer-application";
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs hover:bg-blue-50 text-blue-900 font-bold flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <ShieldCheck size={15} className="text-blue-600 shrink-0" />
                            <span>B2B Retailer Account</span>
                          </div>
                          <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-black uppercase">Apply</span>
                        </button>
                      </div>

                      <div className="border-t border-slate-100 pt-1.5 mt-1 px-3">
                        <button 
                          onClick={() => { setIsAccountDropdownOpen(false); onLogout(); }}
                          className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          <LogOut size={13} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Initial non-authenticated state: Direct links to dedicated login / signup pages */
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      window.location.hash = "#/login";
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="px-3.5 h-9 text-xs font-bold text-slate-700 hover:text-[#2596be] hover:bg-slate-50 rounded-md transition-all cursor-pointer flex items-center gap-1.5"
                    id="header-signin-btn"
                  >
                    <User size={15} className="text-slate-500" />
                    <span>Login</span>
                  </button>

                  <button 
                    onClick={() => {
                      window.location.hash = "#/signup";
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="px-4 h-9 text-xs font-bold text-white bg-[#031b4e] hover:bg-[#2596be] rounded-md transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    id="header-signup-btn"
                  >
                    <span>Sign Up</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Wishlist Trigger */}
            <button 
              onClick={() => {
                if (b2bUser) {
                  window.location.hash = "#/account?tab=wishlist";
                } else {
                  window.location.hash = "#/login";
                }
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-1.5 text-slate-700 hover:text-rose-600 relative h-10 px-2.5 hover:bg-rose-50/60 border border-transparent hover:border-rose-100 rounded-lg transition-all focus:outline-none group shrink-0 font-semibold cursor-pointer"
              title="My Wishlist"
              id="header-wishlist-button"
            >
              <div className="relative">
                <Heart size={18} className={`group-hover:scale-110 transition-transform ${wishlistCount > 0 ? "fill-rose-500 text-rose-500" : "text-slate-600 group-hover:text-rose-500"}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center text-[9px] ring-2 ring-white">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-rose-600 transition-colors">Wishlist</span>
            </button>

            {/* 4. Quote List Trigger */}
            <button 
              onClick={onOpenCart}
              className="flex items-center gap-2 text-[#031b4e] hover:text-blue-700 relative h-10 px-3 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-lg transition-all focus:outline-none group shrink-0 font-semibold text-sm cursor-pointer"
              id="header-cart-button"
            >
              <div className="relative">
                <ShoppingCart size={18} className="group-hover:scale-105 transition-transform" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center text-[9px] ring-2 ring-white">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700 transition-colors">Quote List</span>
            </button>
          </div>

          {/* ================= MOBILE CONTROLS (lg:hidden) ================= */}
          <div className="flex lg:hidden items-center gap-1">
            {/* 1. Search Toggle Icon Button */}
            <button
              onClick={() => {
                const newSearchState = !isMobileSearchOpen;
                setIsMobileSearchOpen(newSearchState);
                if (newSearchState) {
                  setTimeout(() => {
                    const mobileInput = document.getElementById("mobile-search-input");
                    if (mobileInput) mobileInput.focus();
                  }, 100);
                }
              }}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isMobileSearchOpen || searchTerm ? "text-blue-700 bg-blue-50" : "text-slate-700 hover:text-blue-700 hover:bg-slate-100"
              }`}
              title="Search Catalog"
              id="mobile-search-toggle-btn"
            >
              <Search size={20} />
            </button>

            {/* 2. Account / Sign In Icon Button */}
            <button
              onClick={() => {
                if (b2bUser) {
                  window.location.hash = "#/account";
                  window.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                  window.location.hash = "#/login";
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="p-2 text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer relative"
              title="Account / Sign In"
              id="mobile-account-btn"
            >
              <User size={20} />
              {b2bUser && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* 3. Wishlist Icon Button */}
            <button
              onClick={() => {
                if (b2bUser) {
                  window.location.hash = "#/account?tab=wishlist";
                } else {
                  window.location.hash = "#/login";
                }
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="p-2 text-slate-700 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer relative"
              title="My Wishlist"
              id="mobile-wishlist-btn"
            >
              <Heart size={20} className={wishlistCount > 0 ? "fill-rose-500 text-rose-500" : ""} />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-rose-500 text-white font-black rounded-full w-4 h-4 flex items-center justify-center text-[9px] ring-2 ring-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* 4. Quote List Icon Button */}
            <button
              onClick={onOpenCart}
              className="p-2 text-[#031b4e] hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer relative"
              title="Quote List"
              id="mobile-cart-btn"
            >
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white font-black rounded-full w-4 h-4 flex items-center justify-center text-[9px] ring-2 ring-white">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* 5. Three-Line Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
              aria-label="Toggle menu"
              id="mobile-hamburger-btn"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Search Bar (Toggled via Search Icon in top bar or active search term) */}
      {(isMobileSearchOpen || searchTerm) && (
        <div ref={mobileSearchRef} className="md:hidden px-4 pb-3 pt-2 border-t border-slate-100 bg-slate-50 relative animate-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative flex items-center shadow-2xs rounded-md overflow-hidden border border-slate-200 bg-white">
              <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                id="mobile-search-input"
                type="text"
                placeholder="Search products & services..."
                value={searchTerm}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                onKeyDown={handleKeyDown}
                className="w-full pl-9 pr-8 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange("");
                    setIsDropdownOpen(false);
                  }}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </form>
          {renderSearchDropdown()}
        </div>
      )}

      {/* Mobile Navigation Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-lg py-4 px-6 z-40 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-4 text-xs font-bold text-slate-800">
            {/* Home Link (Direct) */}
            <button 
              onClick={() => {
                onCategorySelect(null);
                onSearchChange("");
                setIsMobileMenuOpen(false);
                window.location.hash = "#/";
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-left py-2 border-b border-slate-50 hover:text-blue-700 flex items-center gap-2"
            >
              <Wind size={15} className="text-blue-600" />
              <span>Home</span>
            </button>

            {/* Products Accordion Group */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mt-1">Products & Sourcing</p>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  window.location.hash = "#/products";
                }}
                className="w-full text-left py-2 border-b border-slate-50 hover:text-blue-700 pl-2 flex items-center gap-2"
              >
                <Package size={14} className="text-blue-600" />
                <span>Product Page</span>
              </button>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  window.location.hash = "#/categories";
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full text-left py-2 border-b border-slate-50 hover:text-blue-700 pl-2 flex items-center gap-2"
              >
                <Layers size={14} className="text-blue-600" />
                <span>Product Categories</span>
              </button>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  window.location.hash = "#/contact?category=product_support";
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full text-left py-2 border-b border-slate-50 hover:text-blue-700 pl-2 flex items-center gap-2"
              >
                <HelpCircle size={14} className="text-blue-600" />
                <span>Product Support</span>
              </button>
            </div>

            {/* Services Page Group */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mt-2">Services & Maintenance</p>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  window.location.hash = "#/services";
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full text-left py-2 border-b border-slate-50 hover:text-blue-700 pl-2 flex items-center gap-2"
              >
                <Wrench size={14} className="text-blue-600" />
                <span>Services Page</span>
              </button>
            </div>

            {/* Company & Resources Group */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mt-2">Company Directory</p>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAbout();
                }}
                className="w-full text-left py-2 border-b border-slate-50 hover:text-blue-700 pl-2 flex items-center gap-2"
              >
                <Info size={14} className="text-blue-600" />
                <span>About Us</span>
              </button>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenManagement();
                }}
                className="w-full text-left py-2 border-b border-slate-50 hover:text-blue-700 pl-2 flex items-center gap-2"
              >
                <Users size={14} className="text-blue-600" />
                <span>Management</span>
              </button>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleMediaClick();
                }}
                className="w-full text-left py-2 border-b border-slate-50 hover:text-blue-700 pl-2 flex items-center gap-2"
              >
                <FileText size={14} className="text-blue-600" />
                <span>Media</span>
              </button>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenCareer();
                }}
                className="w-full text-left py-2 border-b border-slate-50 hover:text-blue-700 pl-2 flex items-center gap-2"
              >
                <Briefcase size={14} className="text-blue-600" />
                <span>Career</span>
              </button>
            </div>

            {/* Direct Links on Mobile */}
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenBlog();
              }}
              className="text-left py-2 border-b border-slate-50 hover:text-blue-700 flex items-center gap-2 font-bold"
            >
              <BookOpen size={15} className="text-blue-600" />
              <span>Blog</span>
            </button>

            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (onOpenContact) {
                  onOpenContact();
                } else {
                  window.location.hash = "#/contact";
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className={`text-left py-2 border-b border-slate-50 hover:text-blue-700 flex items-center gap-2 font-bold ${
                window.location.hash === "#/contact" ? "text-blue-700" : ""
              }`}
            >
              <Phone size={15} className="text-blue-600" />
              <span>Contact Us</span>
            </button>


            
            <hr className="border-slate-100" />

            {b2bUser ? (
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Authorized Account</p>
                  <p className="text-xs font-bold text-slate-800">{b2bUser.companyName || b2bUser.email}</p>
                  <p className="text-[#031b4e] font-extrabold text-[10px] mt-0.5">
                    {b2bUser.isRetailer ? "Approved B2B Partner" : "Commercial Customer Account"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    window.location.hash = "#/account";
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md font-bold text-xs transition-colors cursor-pointer"
                >
                  My Account Workspace
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-center py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-md text-xs font-bold transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    window.location.hash = "#/login";
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full text-center py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    window.location.hash = "#/signup";
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full text-center py-2.5 bg-[#031b4e] text-white rounded-lg font-bold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- CUSTOM PRODUCT SUPPORT MODAL ----------------- */}
      {isSupportOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#031b4e] text-white p-6 flex justify-between items-center relative">
              <div>
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-cyan-400/20">
                  Contractor Help Desk
                </span>
                <h3 className="font-display font-extrabold text-xl mt-2 flex items-center gap-2">
                  <HelpCircle size={20} className="text-cyan-400" />
                  <span>Product Support & Downloads</span>
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsSupportOpen(false);
                  setSupportStatusResult(null);
                  setSupportTicketId("");
                }}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transition-colors focus:outline-none"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Manual Downloads */}
              <div>
                <h4 className="text-xs uppercase tracking-widest text-slate-400 font-extrabold mb-3">Mechanical Spec Sheets & Guides</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border border-slate-150 p-3.5 rounded-xl flex items-start gap-3 bg-white">
                    <div className="w-8 h-8 rounded bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">VRF Series System Specs</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Complete electrical load schedules</p>
                      <button className="text-[10px] text-blue-700 font-bold hover:underline flex items-center gap-1 mt-1.5">
                        <Download size={10} /> Download PDF (4.2 MB)
                      </button>
                    </div>
                  </div>

                  <div className="border border-slate-150 p-3.5 rounded-xl flex items-start gap-3 bg-white">
                    <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">LTL Freight Rigging Guide</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Heavy industrial unloading specs</p>
                      <button className="text-[10px] text-blue-700 font-bold hover:underline flex items-center gap-1 mt-1.5">
                        <Download size={10} /> Download PDF (1.8 MB)
                      </button>
                    </div>
                  </div>

                  <div className="border border-slate-150 p-3.5 rounded-xl flex items-start gap-3 bg-white">
                    <div className="w-8 h-8 rounded bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                      <Shield size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Warranty Bond Registration</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Full corporate warranty terms</p>
                      <button className="text-[10px] text-blue-700 font-bold hover:underline flex items-center gap-1 mt-1.5">
                        <Download size={10} /> Download PDF (2.1 MB)
                      </button>
                    </div>
                  </div>

                  <div className="border border-slate-150 p-3.5 rounded-xl flex items-start gap-3 bg-white bg-blue-50/10">
                    <div className="w-8 h-8 rounded bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                      <Info size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">EPA Compliance Directives</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Refrigerant handling procedures</p>
                      <button className="text-[10px] text-blue-700 font-bold hover:underline flex items-center gap-1 mt-1.5">
                        <Download size={10} /> Download PDF (900 KB)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Support Sourcing Ticket Lookup */}
              <div className="border-t border-slate-100 pt-5">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80">
                  <h4 className="text-xs uppercase tracking-widest text-slate-400 font-extrabold mb-1">Interactive Support Ticket Tracker</h4>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mb-4">
                    Lookup active mechanical parts dispatch or engineering tickets instantly using your ticket ID (e.g., TKT-124).
                  </p>
                  
                  <form onSubmit={handleTicketLookup} className="flex gap-2.5">
                    <input 
                      type="text" 
                      placeholder="Enter Ticket ID (e.g. TKT-2490)..."
                      value={supportTicketId}
                      onChange={(e) => setSupportTicketId(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 flex-1 placeholder:text-slate-400"
                    />
                    <button 
                      type="submit"
                      disabled={isSearchingTicket}
                      className="bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                    >
                      {isSearchingTicket ? "Searching..." : "Track Status"}
                    </button>
                  </form>

                  {supportStatusResult && (
                    <div className="mt-4 p-3 bg-white border border-slate-150 rounded-lg animate-in fade-in duration-150">
                      <p className="text-xs font-extrabold text-slate-800 leading-normal flex items-start gap-2">
                        <CheckCircle size={15} className="text-cyan-600 shrink-0 mt-0.5" />
                        <span>{supportStatusResult}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-bold">Contractor Line: 1-800-COOL-B2B</span>
              <button 
                onClick={() => {
                  setIsSupportOpen(false);
                  setSupportStatusResult(null);
                  setSupportTicketId("");
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold transition-all"
              >
                Close Support
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- RETAILER ONBOARDING & VERIFICATION MODAL ----------------- */}
      <RetailerOnboardingModal
        isOpen={isRetailerOnboardingOpen}
        onClose={() => setIsRetailerOnboardingOpen(false)}
        onSubmitSuccess={() => {
          setIsRetailerOnboardingOpen(false);
        }}
      />

      {/* ----------------- USER PROFILE MODAL ----------------- */}
      {b2bUser && (
        <UserProfileModal
          isOpen={isUserProfileOpen}
          onClose={() => setIsUserProfileOpen(false)}
          onOpenRetailerModal={() => {
            setIsUserProfileOpen(false);
            setIsRetailerOnboardingOpen(true);
          }}
        />
      )}
    </header>
  );
}
