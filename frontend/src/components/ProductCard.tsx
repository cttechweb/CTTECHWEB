import React from "react";
import { ClipboardList, Eye, Heart, Sparkles, Flame, Star } from "lucide-react";
import { Product } from "../types";
import { useWishlist } from "../context/WishlistContext";

interface ProductCardProps {
  product: Product;
  onOpenProductDetail: (product: Product) => void;
  onOpenQuoteWithProduct?: (productName: string) => void;
  onAddToCart?: (product: Product, quantity: number) => void;
  showStockBadge?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenProductDetail,
  onOpenQuoteWithProduct,
  onAddToCart,
  showStockBadge = true,
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();

  const handleCardClick = () => {
    onOpenProductDetail(product);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product, product.minOrderQty || 1);
    } else if (onOpenQuoteWithProduct) {
      onOpenQuoteWithProduct(product.name);
    }
  };

  // Helper to render clean, professional promotional badge tag
  const renderBadgeTag = () => {
    let rawBadge = product.badge || (product.isFeatured ? "Featured" : null);

    if (!rawBadge && Array.isArray(product.tags)) {
      const match = product.tags.find((t) => {
        const l = t.toLowerCase();
        return l.includes("best") || l.includes("featured") || l.includes("new") || l.includes("popular");
      });
      if (match) rawBadge = match;
    }

    if (!rawBadge) return null;

    const lower = rawBadge.toLowerCase();

    if (lower.includes("popular")) {
      return (
        <span className="px-2.5 py-0.5 bg-[#031b4e] text-white text-[10px] font-bold tracking-wider uppercase rounded shadow-2xs">
          Popular
        </span>
      );
    }

    if (lower.includes("best") || lower.includes("seller")) {
      return (
        <span className="px-2.5 py-0.5 bg-amber-600 text-white text-[10px] font-bold tracking-wider uppercase rounded shadow-2xs">
          Best Seller
        </span>
      );
    }

    if (lower.includes("featured")) {
      return (
        <span className="px-2.5 py-0.5 bg-[#0f4c81] text-white text-[10px] font-bold tracking-wider uppercase rounded shadow-2xs">
          Featured
        </span>
      );
    }

    if (lower.includes("new")) {
      return (
        <span className="px-2.5 py-0.5 bg-emerald-700 text-white text-[10px] font-bold tracking-wider uppercase rounded shadow-2xs">
          New
        </span>
      );
    }

    return (
      <span className="px-2.5 py-0.5 bg-slate-800 text-white text-[10px] font-bold tracking-wider uppercase rounded shadow-2xs">
        {rawBadge}
      </span>
    );
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group h-full text-left cursor-pointer"
      id={`product-card-${product.id}`}
    >
      <div>
        {/* Image Frame Area */}
        <div className="relative w-full bg-white p-2.5 sm:p-4 flex items-center justify-center border-b border-slate-100 shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-28 sm:h-40 md:h-44 object-contain group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />

          {/* Promotional Tag & Stock Status Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 items-start">
            {renderBadgeTag()}
            {showStockBadge && (
              product.inStock ? (
                <span className="px-1.5 sm:px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] sm:text-[10px] font-extrabold rounded-full flex items-center gap-1 border border-emerald-200">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  <span className="hidden sm:inline">In Stock</span>
                  <span className="sm:hidden">Stock</span>
                </span>
              ) : (
                <span className="px-1.5 sm:px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] sm:text-[10px] font-extrabold rounded-full flex items-center gap-1 border border-amber-200">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                  <span className="hidden sm:inline">Lead Time</span>
                  <span className="sm:hidden">Order</span>
                </span>
              )
            )}
          </div>

          {/* Wishlist Like Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist({ type: "product", product });
            }}
            className={`absolute top-2 right-2 p-1.5 rounded-full z-10 transition-all cursor-pointer shadow-xs ${
              isInWishlist(product.id)
                ? "bg-rose-50 text-rose-600 hover:bg-rose-100 scale-105"
                : "bg-white/90 hover:bg-white text-slate-400 hover:text-rose-600 backdrop-blur-xs"
            }`}
            title={isInWishlist(product.id) ? "Remove from Wishlist" : "Save to Wishlist"}
            aria-label="Save to Wishlist"
          >
            <Heart
              size={14}
              className={isInWishlist(product.id) ? "fill-rose-500 text-rose-500" : ""}
            />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-2.5 sm:p-4">
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
            <span className="truncate max-w-[70px] sm:max-w-none">{product.brand}</span>
            <span className="text-[#2596be] truncate max-w-[70px] sm:max-w-none">{product.category}</span>
          </div>

          {/* Product Title */}
          <h3
            className="font-display font-bold text-xs sm:text-sm text-slate-900 hover:text-[#2596be] line-clamp-2 min-h-[32px] sm:min-h-[40px] leading-tight sm:leading-snug transition-colors"
          >
            {product.name}
          </h3>

          {/* Price Area */}
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">Wholesale Rate</span>
              {product.hidePrice ? (
                <span className="text-[11px] sm:text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase tracking-wider block mt-0.5">
                  Price on Request
                </span>
              ) : (
                <span className="text-xs sm:text-base font-black text-[#031b4e]">
                  ${product.price.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions Row */}
      <div className="p-2.5 sm:p-4 pt-0">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleAddToCartClick}
            className="flex-1 min-w-0 bg-[#2596be] hover:bg-[#1c7e9f] text-white py-2 px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-xs active:scale-95 cursor-pointer"
            id={`request-lead-quote-${product.id}`}
          >
            <ClipboardList size={13} className="shrink-0" />
            <span className="truncate">Add to Quote</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenProductDetail(product);
            }}
            className="p-2 border border-slate-200 hover:border-[#2596be] hover:text-[#2596be] text-slate-600 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer"
            title="View Specs"
            aria-label="View spec"
          >
            <Eye size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
