import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "../types";
import { ProductCard } from "./ProductCard";

interface FeaturedProductsProps {
  products: Product[];
  onOpenProductDetail: (product: Product) => void;
  onOpenQuoteWithProduct: (productName: string) => void;
  onAddToCart?: (product: Product, quantity: number) => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  onOpenProductDetail,
  onOpenQuoteWithProduct,
  onAddToCart,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Filter only products explicitly starred / featured
  const featuredList = useMemo(() => {
    return (products || []).filter(
      (p) => p && (p.isFeatured === true || p.badge === "Featured") && p.status !== "draft" && p.status !== "archived"
    );
  }, [products]);

  const hasMultiple = featuredList.length > 4;

  const getScrollStep = () => {
    if (!scrollRef.current) return 280;
    const firstCard = scrollRef.current.firstElementChild as HTMLElement;
    return firstCard ? firstCard.offsetWidth + 16 : 280;
  };

  // Auto-scrolling when there are multiple products beyond the 4-column viewport
  useEffect(() => {
    if (!hasMultiple || isHovered) return;

    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const el = scrollRef.current;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const step = getScrollStep();

      if (el.scrollLeft + step >= maxScroll - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [hasMultiple, isHovered]);

  const scrollPrev = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: -getScrollStep(), behavior: "smooth" });
  };

  const scrollNext = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const step = getScrollStep();
    if (el.scrollLeft + step >= maxScroll - 10) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      el.scrollBy({ left: step, behavior: "smooth" });
    }
  };

  if (!featuredList || featuredList.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-white py-8 md:py-12 border-b border-gray-100" id="spotlight-section">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header matching standard section titles */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-6">
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-slate-900 tracking-tight">
            Spotlight
          </h2>

          {hasMultiple && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={scrollPrev}
                className="w-8 h-8 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Previous products"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                className="w-8 h-8 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Next products"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Product Cards Layout — exactly matches standard 4-column catalog grid size */}
        {hasMultiple ? (
          <div
            ref={scrollRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex gap-2.5 sm:gap-4 lg:gap-5 overflow-x-auto scrollbar-none scroll-smooth pb-1 select-none"
          >
            {featuredList.map((product) => (
              <div
                key={product.id}
                className="w-[calc(50%-5px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-15px)] shrink-0"
              >
                <ProductCard
                  product={product}
                  onOpenProductDetail={onOpenProductDetail}
                  onOpenQuoteWithProduct={onOpenQuoteWithProduct}
                  onAddToCart={onAddToCart}
                  showStockBadge={true}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
            {featuredList.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenProductDetail={onOpenProductDetail}
                onOpenQuoteWithProduct={onOpenQuoteWithProduct}
                onAddToCart={onAddToCart}
                showStockBadge={true}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
