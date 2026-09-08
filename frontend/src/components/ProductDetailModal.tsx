import { X, Check, ShoppingCart, Info, AlertTriangle, MessageSquareQuote } from "lucide-react";
import { useState, useEffect } from "react";
import { Product } from "../types";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onOpenQuoteWithProduct: (productName: string) => void;
  b2bDiscountRate?: number;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onOpenQuoteWithProduct,
  b2bDiscountRate = 0
}: ProductDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"specs" | "features">("specs");

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        id="detail-modal-backdrop"
      ></div>

      {/* Modal Positioning */}
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-4xl flex flex-col md:flex-row border border-gray-100">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-slate-800 z-30 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            id="close-detail-modal"
          >
            <X size={20} />
          </button>

          {/* Left Side: Product Image Display */}
          <div className="md:w-5/12 bg-gray-50/50 p-6 sm:p-8 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-gray-150 relative">
            
            {/* Custom Brand Tag */}
            <div className="absolute top-4 left-4 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] font-black uppercase tracking-wider text-gray-500 shadow-sm">
              {product.brand}
            </div>

            <div className="w-full aspect-square max-w-[280px] flex items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-auto object-contain max-h-[250px]"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/src/assets/images/hvac_air_conditioner_1784350824930.jpg";
                }}
              />
            </div>

            {/* Minimum Order Alert */}
            <div className="mt-6 w-full bg-blue-50/70 rounded-xl p-3 border border-blue-100 flex items-start gap-2 text-xs text-[#0f4c81]">
              <Info size={16} className="shrink-0 mt-0.5 text-blue-500" />
              <div>
                <p className="font-bold">B2B Wholesale Ordering Rules</p>
                <p className="text-gray-500 mt-0.5">
                  Minimum Order Quantity for this product is <span className="font-bold text-slate-800">{product.minOrderQty} units</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Detailed Technical Info */}
          <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Category tag */}
              <span className="text-xs font-bold text-[#2596be] bg-[#2596be]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {product.category}
              </span>

              {/* Product Title */}
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight mt-3 mb-2 leading-tight">
                {product.name}
              </h2>

              {/* Sourcing & Technical Certifications Row */}
              <div className="border-t border-b border-slate-100 py-3 mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Sourcing Channel</span>
                  <span className="text-xs font-black text-slate-700 uppercase">Direct OEM Wholesale</span>
                </div>
                <div className="h-4 w-px bg-slate-250"></div>
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Certification</span>
                  <span className="text-xs font-black text-slate-700 uppercase">CE / AHRI Certified</span>
                </div>
                <div className="h-4 w-px bg-slate-250"></div>
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Primary Region</span>
                  <span className="text-xs font-black text-[#2596be] uppercase">GCC & UAE Market</span>
                </div>
              </div>

              {/* Dynamic Tabs (Specs vs Features) */}
              <div className="border-b border-gray-200 flex gap-4 mb-4 text-sm font-bold">
                <button
                  onClick={() => setActiveTab("specs")}
                  className={`pb-2.5 transition-colors relative ${
                    activeTab === "specs"
                      ? "text-[#2596be]"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  id="tab-specs"
                >
                  Technical Specifications
                  {activeTab === "specs" && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2596be]"></span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("features")}
                  className={`pb-2.5 transition-colors relative ${
                    activeTab === "features"
                      ? "text-[#2596be]"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  id="tab-features"
                >
                  Key Commercial Features
                  {activeTab === "features" && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2596be]"></span>
                  )}
                </button>
              </div>

              {/* Tab Contents */}
              <div className="min-h-[200px] max-h-[300px] overflow-y-auto pr-2 custom-scrollbar text-sm">
                
                {/* Tech Specs Table */}
                {activeTab === "specs" && (
                  <div className="border border-gray-150 rounded-lg overflow-hidden divide-y divide-gray-150">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key} className="flex p-3 hover:bg-slate-50 transition-colors">
                        <div className="w-1/3 font-bold text-gray-400 uppercase tracking-wider text-[10px] self-center">
                          {key}
                        </div>
                        <div className="w-2/3 text-gray-800 font-semibold pl-2">
                          {val}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bulleted Key Features list */}
                {activeTab === "features" && (
                  <ul className="flex flex-col gap-3">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex gap-2.5 text-gray-600 font-medium">
                        <span className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                          <Check size={12} strokeWidth={3} />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

              </div>
            </div>

            {/* Footer Interactive Actions */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              
              {product.inStock ? (
                /* Interactive Add to Cart panel */
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  
                  {/* Add action */}
                  <div className="flex-1 flex gap-2">
                    <button
                      onClick={() => {
                        onAddToCart(product, product.minOrderQty || 1);
                        onClose();
                      }}
                      className="flex-1 h-11 bg-[#2596be] hover:bg-[#1c7e9f] text-white rounded-lg text-sm font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                      id="modal-add-to-cart-btn"
                    >
                      <ShoppingCart size={16} />
                      Add to Project Enquiry ({product.minOrderQty} Unit MOQ)
                    </button>
                  </div>

                </div>
              ) : (
                /* Contact/Quotation Panel for Backorders */
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-amber-50/50 p-4 border border-amber-200 rounded-xl gap-4">
                  <div className="flex gap-2 items-start text-xs text-amber-900">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <p className="font-bold">Lead Time Advisory</p>
                      <p className="text-amber-800 mt-0.5 leading-relaxed">
                        This industrial component is backordered due to supply schedules. Submit a quote request for a custom fulfillment plan.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onOpenQuoteWithProduct(product.name);
                      onClose();
                    }}
                    className="h-10 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold px-4 flex items-center justify-center gap-2 shadow-sm shrink-0"
                    id="modal-request-quote-btn"
                  >
                    <MessageSquareQuote size={14} />
                    Request Quote Setup
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
