import React, { useState, useEffect, useMemo } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Category } from "../types";
import { getCategories, getLocalCategories } from "../services/categoryService";
import { getCategoryColorTheme, CategoryColorTheme } from "../utils/categoryColors";
import { ScrollingTagBadge } from "./ScrollingTagBadge";

interface CategoriesProps {
  onCategorySelect: (categoryName: string | null) => void;
  activeCategory: string | null;
}

interface MainCategoryGroup {
  tag: string;
  theme: CategoryColorTheme;
  subcategories: Category[];
}

interface MainCategoryCardProps {
  group: MainCategoryGroup;
  activeCategory: string | null;
  onCategorySelect: (categoryName: string | null) => void;
}

const MainCategoryCard: React.FC<MainCategoryCardProps> = ({
  group,
  activeCategory,
  onCategorySelect,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const subcats = group.subcategories;
  const count = subcats.length;

  // Auto-shift through subcategory products every 3.5s (pauses on hover)
  useEffect(() => {
    if (count <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % count);
        setIsTransitioning(false);
      }, 200);
    }, 3500);

    return () => clearInterval(timer);
  }, [count, isHovered]);

  const currentCat = subcats[currentIndex] || subcats[0];
  const isActive = activeCategory === currentCat.name || subcats.some((s) => s.name === activeCategory);
  const colorTheme = group.theme;

  const handleCardClick = () => {
    onCategorySelect(currentCat.name);
    const catalogElement = document.getElementById("product-catalog");
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.hash = `#/products?category=${encodeURIComponent(currentCat.name)}`;
    }
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex items-stretch bg-white border rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group h-[250px] ${
        isActive 
          ? "border-[#2596be] ring-2 ring-blue-100 bg-[#2596be]/5" 
          : "border-gray-200 hover:border-gray-300"
      }`}
      id={`category-card-${currentCat.id}`}
    >
      {/* Left content (Text & Arrow) - Fixed internal layout for uniform height */}
      <div className="flex-1 p-5 flex flex-col justify-between overflow-hidden">
        <div>
          {/* Main Category Tag Badge (auto-scrolls when content overflows) */}
          <div className="mb-2.5">
            <ScrollingTagBadge
              tag={group.tag}
              theme={colorTheme}
              maxWidthClass="max-w-[170px] sm:max-w-[200px]"
            />
          </div>

          {/* Subcategory title and description with smooth transition and fixed heights */}
          <div className={`transition-opacity duration-200 ${isTransitioning ? "opacity-30 translate-y-0.5" : "opacity-100 translate-y-0"}`}>
            <div className="h-11 flex items-start overflow-hidden">
              <h3 className="font-display font-bold text-sm md:text-base text-slate-900 group-hover:text-[#2596be] transition-colors leading-tight line-clamp-2">
                {currentCat.name}
              </h3>
            </div>
            <div className="h-10 overflow-hidden mt-1.5">
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                {currentCat.subtitle || currentCat.description}
              </p>
            </div>
          </div>

          {/* Simple Read more trigger */}
          <div className="mt-2.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0f4c81] group-hover:text-[#2596be] transition-colors">
              <span>Read more</span>
              <ChevronDown size={12} />
            </span>
          </div>
        </div>

        {/* Bottom bar with circular Arrow */}
        <div className="mt-auto pt-3">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 border border-gray-200 text-[#2596be] group-hover:bg-[#2596be] group-hover:text-white group-hover:border-transparent transition-all duration-300">
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Right content (Image Thumbnail) */}
      <div className="w-28 sm:w-36 bg-gray-50/50 p-2 flex items-center justify-center shrink-0 border-l border-gray-50 relative overflow-hidden h-full">
        <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors z-10"></div>
        <img
          src={currentCat.image || "/src/assets/images/hvac_air_conditioner_1784350824930.jpg"}
          alt={currentCat.name}
          className={`w-full h-auto object-contain max-h-[110px] group-hover:scale-110 transition-all duration-500 z-0 ${
            isTransitioning ? "opacity-40 scale-95" : "opacity-100 scale-100"
          }`}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/src/assets/images/hvac_air_conditioner_1784350824930.jpg";
          }}
        />
      </div>
    </div>
  );
};

export default function Categories({ onCategorySelect, activeCategory }: CategoriesProps) {
  const [categories, setCategories] = useState<Category[]>(getLocalCategories);
  const [showAll, setShowAll] = useState(false);

  const loadData = async () => {
    const list = await getCategories();
    setCategories(list);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setCategories(e.detail);
      } else {
        setCategories(getLocalCategories());
      }
    };
    window.addEventListener("cooltech_categories_updated", handleUpdate);
    return () => window.removeEventListener("cooltech_categories_updated", handleUpdate);
  }, []);

  // Sorted active categories
  const activeCategories = useMemo(() => {
    return categories
      .filter((c) => c.status !== "inactive")
      .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
  }, [categories]);

  // Group categories dynamically by tag / main category
  const mainCategoryGroups = useMemo(() => {
    const map = new Map<string, Category[]>();

    activeCategories.forEach((cat) => {
      const tagKey = (cat.tag || cat.name || "General").trim();
      if (!map.has(tagKey)) {
        map.set(tagKey, []);
      }
      map.get(tagKey)!.push(cat);
    });

    return Array.from(map.entries()).map(([tag, subcats]) => ({
      tag,
      theme: getCategoryColorTheme(tag),
      subcategories: subcats,
    }));
  }, [activeCategories]);

  // 2 rows initially (3 cols per row on desktop = 6 cards)
  const INITIAL_COUNT = 6;
  const visibleGroups = showAll ? mainCategoryGroups : mainCategoryGroups.slice(0, INITIAL_COUNT);
  const hasRemaining = mainCategoryGroups.length > INITIAL_COUNT;

  return (
    <section className="w-full bg-white py-12 md:py-16" id="categories-section">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header with View All */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-8">
          <div>
            <h2 className="font-display font-extrabold text-2xl md:text-3xl text-slate-900 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              Browse our professional-grade wholesale HVAC inventories
            </p>
          </div>
          <button
            onClick={() => {
              window.location.hash = "#/categories";
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-sm font-bold text-[#0f4c81] hover:text-cyan-600 flex items-center gap-1 transition-colors cursor-pointer"
          >
            View All Categories <span className="text-xs">&gt;</span>
          </button>
        </div>

        {/* Categories Grid (2 rows = 6 cards on lg) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleGroups.map((group) => (
            <MainCategoryCard
              key={group.tag}
              group={group}
              activeCategory={activeCategory}
              onCategorySelect={onCategorySelect}
            />
          ))}
        </div>

        {/* Single clean View More Button for the balance main categories */}
        {hasRemaining && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="text-sm font-bold text-[#0f4c81] hover:text-[#2596be] transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <span>{showAll ? "View Less" : "View More"}</span>
              <span className="text-xs">&gt;</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
