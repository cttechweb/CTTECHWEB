import React, { useState, useEffect, useMemo } from "react";
import { ArrowRight, Compass } from "lucide-react";
import { Product, Category } from "../types";
import { PRODUCTS } from "../data";
import { getLocalCategories, getCategories } from "../services/categoryService";
import { ProductCard } from "./ProductCard";

interface ProductCatalogProps {
  products?: Product[];
  activeCategory?: string | null;
  onCategorySelect?: (category: string | null) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  onAddToCart?: (product: Product, quantity: number) => void;
  onOpenProductDetail: (product: Product) => void;
  onOpenQuoteWithProduct: (productName: string) => void;
}

function doesProductMatchCat(product: Product, category: Category): boolean {
  if (!product || !category) return false;

  const targetName = category.name.toLowerCase().trim();
  const targetId = category.id.toLowerCase().trim();
  const targetTag = (category.tag || "").toLowerCase().trim();
  const prodCat = (product.category || "").toLowerCase().trim();
  const prodCatId = (product.categoryId || "").toLowerCase().trim();

  // 1. Direct name or ID match
  if (prodCat === targetName || (prodCatId && prodCatId === targetId)) return true;
  if (targetTag && prodCat === targetTag) return true;

  // 2. Normalized match (handles A/C vs AC, punctuation)
  const norm = (s: string) => s.toLowerCase().replace(/a\/c/g, "ac").replace(/[^a-z0-9]/g, "");
  if (norm(prodCat) === norm(targetName)) return true;
  if (targetTag && norm(prodCat) === norm(targetTag)) return true;

  // 3. Room AC cross-match (Window AC, Split AC, Room Air Conditioners)
  if (
    (targetName.includes("room air") || targetName.includes("air condition") || targetId.includes("room-air")) &&
    (prodCat.includes("window") || prodCat.includes("split") || prodCat.includes("room") || prodCat.includes("air condition"))
  ) {
    return true;
  }

  // 4. Commercial AC / VRF cross-match
  if (
    (targetName.includes("commercial") || targetName.includes("vrf")) &&
    (prodCat.includes("commercial") || prodCat.includes("vrf") || prodCat.includes("package") || prodCat.includes("ducted"))
  ) {
    return true;
  }

  // 5. Chillers cross-match
  if (targetName.includes("chiller") && prodCat.includes("chiller")) return true;

  // 6. Compressors cross-match
  if (targetName.includes("compressor") && prodCat.includes("compressor")) return true;

  // 7. Product tags match
  if (Array.isArray(product.tags)) {
    if (product.tags.some((t) => norm(t) === norm(targetName) || (targetTag && norm(t) === norm(targetTag)))) {
      return true;
    }
  }

  return false;
}

export default function ProductCatalog({
  products,
  onOpenProductDetail,
  onOpenQuoteWithProduct,
  onAddToCart,
}: ProductCatalogProps) {
  const activeProducts = products || PRODUCTS;

  // Registered Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    return getLocalCategories().filter((c) => c.status !== "inactive");
  });

  const [selectedCatIndex, setSelectedCatIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Sync categories
  useEffect(() => {
    const load = async () => {
      const list = await getCategories();
      const active = list.filter((c) => c.status !== "inactive");
      if (active.length > 0) setCategories(active);
    };
    load();

    const handleUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setCategories(e.detail.filter((c: Category) => c.status !== "inactive"));
      }
    };
    window.addEventListener("cooltech_categories_updated", handleUpdate);
    return () => window.removeEventListener("cooltech_categories_updated", handleUpdate);
  }, []);

  // ONLY include categories that actually have active products
  const populatedCategories = useMemo(() => {
    const valid = activeProducts.filter((p) => {
      const status = (p.status as string) || "active";
      return status !== "inactive" && status !== "archived";
    });

    if (valid.length === 0) return [];

    const matched: { categoryName: string; category?: Category; products: Product[] }[] = [];

    // Match against registered categories
    categories.forEach((cat) => {
      const prods = valid.filter((p) => doesProductMatchCat(p, cat));
      if (prods.length > 0) {
        matched.push({
          categoryName: cat.name,
          category: cat,
          products: prods.slice(0, 8), // Up to 2 rows
        });
      }
    });

    // Fallback: If any product has a specific category string not covered
    valid.forEach((p) => {
      const catName = p.category?.trim();
      if (!catName) return;
      const alreadyCovered = matched.some(
        (m) => m.categoryName.toLowerCase() === catName.toLowerCase() || m.products.some((x) => x.id === p.id)
      );
      if (!alreadyCovered) {
        const prods = valid.filter((x) => x.category?.trim().toLowerCase() === catName.toLowerCase());
        matched.push({
          categoryName: catName,
          products: prods.slice(0, 8),
        });
      }
    });

    return matched;
  }, [activeProducts, categories]);

  // If selected index is out of bounds after list changes, reset it
  useEffect(() => {
    if (selectedCatIndex >= populatedCategories.length) {
      setSelectedCatIndex(0);
    }
  }, [populatedCategories.length, selectedCatIndex]);

  // Auto-shift between populated categories every 4.5 seconds (only when multiple populated categories exist & not hovered)
  useEffect(() => {
    if (populatedCategories.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setSelectedCatIndex((prev) => (prev + 1) % populatedCategories.length);
        setIsTransitioning(false);
      }, 180);
    }, 4500);

    return () => clearInterval(timer);
  }, [populatedCategories.length, isHovered]);

  const currentGroup = populatedCategories[selectedCatIndex] || populatedCategories[0];

  const handleExploreAll = () => {
    window.location.hash = "#/products";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewMoreCategory = () => {
    if (!currentGroup) return;
    window.location.hash = `#/products?category=${encodeURIComponent(currentGroup.categoryName)}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // If there are zero active products in the whole store, hide section
  if (!currentGroup || currentGroup.products.length === 0) return null;

  return (
    <section
      className="w-full bg-slate-50/70 py-8 sm:py-10 border-b border-slate-200/70"
      id="product-discovery"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Responsive Discovery Header */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-5">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <Compass size={16} className="text-[#0f4c81] shrink-0" />
            <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 tracking-tight whitespace-nowrap">
              Product Discovery
            </h3>
            <span className="text-slate-300">|</span>
            <span className="text-xs sm:text-sm font-bold text-[#0f4c81] truncate max-w-[130px] sm:max-w-none">
              {currentGroup.categoryName}
            </span>
          </div>

          <button
            type="button"
            onClick={handleExploreAll}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#0f4c81] hover:text-[#2596be] transition-colors cursor-pointer py-1 group shrink-0"
          >
            <span className="hidden sm:inline">Explore All Products</span>
            <span className="sm:hidden">Explore All</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Product Grid Area (Always 2 products per row on mobile, 3/4 columns on desktop) */}
        <div className={`transition-opacity duration-200 ${isTransitioning ? "opacity-30" : "opacity-100"}`}>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
            {currentGroup.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenProductDetail={onOpenProductDetail}
                onOpenQuoteWithProduct={onOpenQuoteWithProduct}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </div>

        {/* View More Link (Clean text link without side lines, reduced text size) */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleViewMoreCategory}
            className="group inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0f4c81] hover:text-[#2596be] transition-colors cursor-pointer hover:underline"
          >
            <span>View More {currentGroup.categoryName} Products</span>
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
}
