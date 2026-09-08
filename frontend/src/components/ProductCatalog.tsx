import React, { useMemo } from "react";
import { ArrowRight, Compass, SlidersHorizontal } from "lucide-react";
import { Product } from "../types";
import { PRODUCTS } from "../data";
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

export default function ProductCatalog({
  products,
  onOpenProductDetail,
  onOpenQuoteWithProduct,
  onAddToCart,
}: ProductCatalogProps) {
  const activeProducts = products || PRODUCTS;

  // STRICT REQUIREMENT:
  // "Only product is there if that product have any proper tag. If that doesn't have any tag doesn't list here.
  // This section is actually we can showcase our main products so we selected the main products in the product creation like this"
  const showcaseProducts = useMemo(() => {
    return activeProducts
      .filter((p) => {
        if ((p.status as string) === "inactive" || (p.status as string) === "archived") {
          return false;
        }

        // Promotional badge/tag check
        const badge = (p.badge || "").trim();
        const hasValidBadge = badge !== "" && badge.toLowerCase() !== "none";
        const hasFeatured = Boolean(p.isFeatured);
        const hasPromoTag =
          Array.isArray(p.tags) &&
          p.tags.some((t) => {
            const l = t.toLowerCase().trim();
            return (
              l === "best seller" ||
              l === "featured" ||
              l === "new" ||
              l === "popular" ||
              l.includes("best") ||
              l.includes("featured") ||
              l.includes("popular")
            );
          });

        return hasValidBadge || hasFeatured || hasPromoTag;
      })
      .slice(0, 4);
  }, [activeProducts]);

  const handleGoToFilter = () => {
    window.location.hash = "#/products";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleExploreAll = () => {
    window.location.hash = "#/products";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // If no products have a promotional tag, do NOT show the section at all
  if (showcaseProducts.length === 0) return null;

  return (
    <section className="w-full bg-slate-50/70 py-8 sm:py-10 border-b border-slate-200/70" id="product-discovery">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Compact, integrated discovery bar */}
        <div className="flex items-center justify-between gap-3 mb-6">
          
          {/* Left: Discovery Label & Filter Button (No category chips) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 text-slate-900">
              <Compass size={16} className="text-[#0f4c81]" />
              <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 tracking-tight">
                Product Discovery
              </h3>
            </div>

            {/* Filter button that allows users to filter on the products page */}
            <button
              type="button"
              onClick={handleGoToFilter}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-[#2596be] hover:text-[#2596be] transition-all cursor-pointer shadow-2xs active:scale-95"
              id="homepage-filter-btn"
              title="Open filters on Products page"
            >
              <SlidersHorizontal size={13} className="text-[#0f4c81]" />
              <span>Filter</span>
            </button>
          </div>

          {/* Right: Compact Explore Products Action */}
          <button
            type="button"
            onClick={handleExploreAll}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#0f4c81] hover:text-[#2596be] transition-colors cursor-pointer py-1 group"
          >
            <span>Explore All Products</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 2-Column Mobile Grid matching ProductsPage, scaling to 3/4 columns on tablet & desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
          {showcaseProducts.map((product) => (
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
    </section>
  );
}
