import React, { useState } from "react";
import { X, Trash2, ShoppingBag, Plus, Minus, CreditCard, Ship, Building2, CheckCircle2, AlertCircle, Phone, Mail, User, ArrowRight } from "lucide-react";
import { CartItem, Product, OrderItem } from "../types";
import { useAuth } from "../context/AuthContext";
import { createOrderRequest } from "../services/orderService";
import { getOrCreateCompany } from "../services/companyService";
import { sendEmailNotification, EmailOrderItem } from "../services/emailService";
import { openCartWhatsAppOrder } from "../utils/whatsappOrder";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  b2bDiscountRate?: number;
}

type CheckoutStep = "cart" | "checkout" | "success";

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  b2bDiscountRate = 0
}: CartDrawerProps) {
  const { user, profile } = useAuth();
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [contactName, setContactName] = useState(profile?.name || "");
  const [contactEmail, setContactEmail] = useState(profile?.email || user?.email || "");
  const [contactPhone, setContactPhone] = useState(profile?.phone || "+971 50 ");
  const [companyName, setCompanyName] = useState(profile?.companyName || "");
  const [taxId, setTaxId] = useState(profile?.taxId || "");
  const [shippingAddress, setShippingAddress] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [paymentTerm, setPaymentTerm] = useState("net30");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState("");

  // Sync profile data if loaded
  React.useEffect(() => {
    if (profile) {
      if (!contactName && profile.name) setContactName(profile.name);
      if (!contactEmail && profile.email) setContactEmail(profile.email);
      if (!contactPhone && profile.phone) setContactPhone(profile.phone);
      if (!companyName && profile.companyName) setCompanyName(profile.companyName);
      if (!taxId && profile.taxId) setTaxId(profile.taxId);
    }
  }, [profile]);

  if (!isOpen) return null;

  const totalModels = cart.length;
  const totalUnits = cart.reduce((total, item) => total + item.quantity, 0);

  const handleIncrement = (item: CartItem) => {
    onUpdateQuantity(item.product.id, item.quantity + 1);
  };

  const handleDecrement = (item: CartItem) => {
    if (item.quantity > item.product.minOrderQty) {
      onUpdateQuantity(item.product.id, item.quantity - 1);
    } else {
      if (confirm(`Minimum order quantity for this product is ${item.product.minOrderQty} units. Would you like to remove it from the cart?`)) {
        onRemoveItem(item.product.id);
      }
    }
  };

  const handleGoToB2BApplication = () => {
    onClose();
    if (!user) {
      sessionStorage.setItem("ct_redirect_after_login", "#/partner");
      window.location.hash = "#/login?redirect=" + encodeURIComponent("partner");
    } else {
      window.location.hash = "#/partner";
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError(null);

    // Only essential fields are required; Company name is optional
    if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim() || !shippingAddress.trim()) {
      setSubmitError("Please fill out all required fields marked with *.");
      return;
    }

    if (cart.length === 0) {
      setSubmitError("Your cart is empty. Add products before requesting an order.");
      return;
    }

    setIsSubmitting(true);

    try {
      const effectiveCompanyName = companyName.trim() || contactName.trim() || "Individual Client";

      // Format order item snapshots (doesn't require API)
      const orderItems: OrderItem[] = cart.map((item) => {
        const unitPrice = item.product.price || 0;
        return {
          productId: item.product.id,
          productSnapshot: {
            id: item.product.id,
            name: item.product.name,
            modelId: item.product.modelId || "",
            brand: item.product.brand,
            category: item.product.category,
            image: item.product.image,
            unitPrice,
            minOrderQty: item.product.minOrderQty || 1,
          },
          quantity: item.quantity,
          unitPrice,
          subtotal: unitPrice * item.quantity,
        };
      });

      // Build email-ready product snapshots
      const emailOrderItems: EmailOrderItem[] = cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        brand: item.product.brand,
        image: item.product.images?.[0] || item.product.image || "",
        quantity: item.quantity,
        unitPrice: item.product.price || 0,
      }));

      // Fire EmailJS notification IMMEDIATELY — does NOT depend on API/DB success
      sendEmailNotification({
        type: "order",
        title: `Product Order Request from ${contactName.trim()}`,
        senderName: contactName.trim(),
        senderEmail: contactEmail.trim(),
        senderPhone: contactPhone.trim(),
        companyName: effectiveCompanyName,
        subject: `[Cool Technologies] Order Request - ${effectiveCompanyName}`,
        message: notes.trim() || "Customer submitted an equipment order request via Cart Drawer.",
        detailsText: `Customer: ${contactName.trim()}\nCompany: ${effectiveCompanyName}\nEmail: ${contactEmail.trim()}\nPhone: ${contactPhone.trim()}\nDelivery Address: ${shippingAddress.trim()}\nPayment Terms: ${paymentTerm}\n\nOrdered Products (${orderItems.length} items, ${totalUnits} total units):\n${orderItems.map((item) => `• ${item.productSnapshot.name} x ${item.quantity} units (AED ${(item.unitPrice * item.quantity).toLocaleString()})`).join("\n")}`,
        orderItems: emailOrderItems,
        customParams: {
          total_units: totalUnits,
          shipping_address: shippingAddress.trim()
        }
      }).catch((emailErr) => {
        console.warn("[CartDrawer] Email notification dispatch notice:", emailErr);
      });

      // Persist to DB (best-effort — email was already sent above)
      let orderNumber = `ORD-${Date.now()}`;
      try {
        const company = await getOrCreateCompany({
          name: effectiveCompanyName,
          taxId: taxId.trim(),
          email: contactEmail.trim(),
          phone: contactPhone.trim(),
          address: shippingAddress.trim(),
        });

        const createdOrder = await createOrderRequest({
          companyId: company.id,
          userId: user?.uid || "",
          customerSnapshot: {
            name: contactName.trim(),
            email: contactEmail.trim(),
            phone: contactPhone.trim(),
            companyName: effectiveCompanyName,
            taxId: taxId.trim(),
            shippingAddress: shippingAddress.trim(),
            city: "Abu Dhabi",
          },
          items: orderItems,
          paymentTerm,
          poNumber: poNumber.trim(),
          notes: notes.trim(),
          discountRate: b2bDiscountRate,
          source: "web_cart",
        });
        orderNumber = createdOrder.orderNumber;
      } catch (apiErr) {
        console.warn("[CartDrawer] DB persistence error (email was already sent):", apiErr);
      }

      setOrderNumber(orderNumber);
      setIsSubmitting(false);
      setStep("success");
      onClearCart();
    } catch (err: any) {
      console.error("Error placing order request:", err);
      setSubmitError("Failed to submit order request. Please check your connection and try again.");
      setIsSubmitting(false);
    }
  };

  const resetDrawer = () => {
    setStep("cart");
    setPoNumber("");
    setShippingAddress("");
    setNotes("");
    setSubmitError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      {/* Drawer Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose}
        id="cart-drawer-backdrop"
      ></div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          
          {/* Drawer Content Panel */}
          <div className="pointer-events-auto w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-gray-100 animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="px-4 py-5 bg-slate-50 border-b border-gray-200 sm:px-6 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
                <ShoppingBag size={20} className="text-[#2596be]" />
                {step === "cart" && "B2B Procurement Cart"}
                {step === "checkout" && "Order Request"}
                {step === "success" && "Order Request Received"}
              </h2>
              <button
                onClick={onClose}
                className="rounded-full text-gray-400 hover:text-slate-800 hover:bg-gray-200/50 p-1.5 transition-colors cursor-pointer"
                id="close-cart-drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* MAIN INNER BODY */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              
              {/* STEP 1: CART VIEW */}
              {step === "cart" && (
                <>
                  {cart.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {cart.map((item) => (
                        <div 
                          key={item.product.id} 
                          className="flex gap-3.5 pb-4 border-b border-gray-100 items-start group"
                          id={`cart-item-row-${item.product.id}`}
                        >
                          {/* Product Image Thumb */}
                          <div className="w-16 h-16 rounded-lg bg-slate-50 p-1.5 border border-gray-100 flex items-center justify-center shrink-0">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-auto object-contain max-h-[52px]"
                            />
                          </div>

                          {/* Info Column */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                              {item.product.brand}
                            </p>
                            <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">
                              {item.product.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs">
                              {item.product.hidePrice ? (
                                <span className="text-[#2596be] font-extrabold uppercase text-[10px] tracking-wider">
                                  Quote on Request
                                </span>
                              ) : (
                                <span className="text-slate-900 font-extrabold text-xs">
                                  ${item.product.price ? item.product.price.toLocaleString() : "Custom"}
                                </span>
                              )}
                              <span className="text-[10px] text-gray-400 font-medium">
                                (MOQ: {item.product.minOrderQty || 1})
                              </span>
                            </div>

                            {/* Quantity Controls and Remove button */}
                            <div className="flex items-center justify-between mt-2.5">
                              <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm scale-90 origin-left">
                                <button
                                  type="button"
                                  onClick={() => handleDecrement(item)}
                                  className="px-2.5 py-1 text-gray-500 hover:bg-slate-50 transition-colors cursor-pointer"
                                  aria-label="Dec cart qty"
                                  id={`dec-cart-${item.product.id}`}
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="px-2.5 text-xs font-black text-slate-800 w-7 text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleIncrement(item)}
                                  className="px-2.5 py-1 text-gray-500 hover:bg-slate-50 transition-colors cursor-pointer"
                                  aria-label="Inc cart qty"
                                  id={`inc-cart-${item.product.id}`}
                                >
                                  <Plus size={12} />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => onRemoveItem(item.product.id)}
                                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-bold transition-colors cursor-pointer"
                                id={`remove-item-${item.product.id}`}
                              >
                                <Trash2 size={12} />
                                <span>Remove</span>
                              </button>
                            </div>

                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Cart is empty */
                    <div className="h-full flex flex-col justify-center items-center text-center py-16">
                      <div className="w-16 h-16 rounded-full bg-blue-50 text-[#2596be] flex items-center justify-center mb-4 border border-blue-100">
                        <ShoppingBag size={28} />
                      </div>
                      <h3 className="font-display font-bold text-slate-800 text-lg">Your Procurement Cart is Empty</h3>
                      <p className="text-xs text-gray-400 mt-2 max-w-xs leading-relaxed">
                        Add certified commercial HVAC units, compressors, coils, or controls to begin drafting a procurement order.
                      </p>
                      <button
                        onClick={onClose}
                        className="mt-6 px-5 py-2.5 bg-[#2596be] text-white text-xs font-bold rounded-xl hover:bg-[#1c7e9f] transition-colors shadow-sm cursor-pointer"
                      >
                        Browse HVAC Equipment
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* STEP 2: ORDER REQUEST FORM */}
              {step === "checkout" && (
                <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4">
                  
                  {submitError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-700 flex items-start gap-2">
                      <AlertCircle size={15} className="shrink-0 mt-0.5" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* B2B Wholesale Pricing Banner with Direct Application Form Action */}
                  <div className="bg-gradient-to-br from-blue-50/90 to-slate-50 p-3.5 border border-blue-200/80 rounded-2xl flex flex-col gap-2.5 shadow-2xs">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#0f4c81]/10 text-[#0f4c81] flex items-center justify-center shrink-0 mt-0.5">
                        <Building2 size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-900">
                          Wholesale Rates for B2B Buyers
                        </p>
                        <p className="text-slate-600 mt-0.5 text-[11px] leading-relaxed">
                          Wholesale pricing and bulk volume rates are available for verified commercial buyers, contractors, and corporate clients.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-blue-100 mt-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">Looking for wholesale pricing?</span>
                      <button
                        type="button"
                        onClick={handleGoToB2BApplication}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0f4c81] hover:text-[#2596be] transition-colors cursor-pointer bg-white hover:bg-blue-50/60 px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs active:scale-95"
                        id="apply-b2b-drawer-btn"
                        title="Apply for B2B Wholesale Account"
                      >
                        <span>Apply for B2B Account</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Full Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-extrabold text-gray-600 uppercase tracking-wider">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tariq Al Mansoor"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#2596be]"
                        id="checkout-name-input"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-extrabold text-gray-600 uppercase tracking-wider">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+971 50 123 4567"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#2596be]"
                        id="checkout-phone-input"
                      />
                    </div>
                  </div>

                  {/* Email & Company Name (Optional) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-extrabold text-gray-600 uppercase tracking-wider">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="tariq@example.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#2596be]"
                        id="checkout-email-input"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-extrabold text-gray-600 uppercase tracking-wider">
                        Company Name <span className="text-gray-400 font-normal lowercase">(optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Metro Cooling LLC"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#2596be]"
                        id="checkout-company-input"
                      />
                    </div>
                  </div>

                  {/* Location or Address */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-extrabold text-gray-600 uppercase tracking-wider">
                      Location / Delivery Address *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Street / Area (e.g. Musaffah / DIP), City, UAE"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#2596be] resize-none"
                      id="checkout-address-input"
                    />
                  </div>

                  {/* Optional Notes */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-extrabold text-gray-600 uppercase tracking-wider">
                      Order Notes / Remarks <span className="text-gray-400 font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Special delivery instructions, timing, or remarks..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#2596be]"
                      id="checkout-notes-input"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setStep("cart")}
                      className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Back to Cart
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2.5 bg-[#2596be] hover:bg-[#1c7e9f] text-white rounded-xl text-xs font-extrabold disabled:bg-gray-400 flex items-center justify-center gap-1.5 transition-colors shadow-md cursor-pointer"
                      id="submit-checkout-btn"
                    >
                      {isSubmitting ? "Submitting Order..." : "Order Request"}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: PERSISTENT SUCCESS VIEW */}
              {step === "success" && (
                <div className="h-full flex flex-col justify-center items-center text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 border-2 border-emerald-200 shadow-sm">
                    <CheckCircle2 size={34} />
                  </div>
                  
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-300">
                    Order Request Registered
                  </span>

                  <h3 className="font-display font-extrabold text-xl text-slate-900 mt-3">
                    Thank You for Your Order Request!
                  </h3>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 my-5 w-full text-left text-xs flex flex-col gap-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-semibold">Request Identifier:</span>
                      <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {orderNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-semibold">Registered Company:</span>
                      <span className="font-bold text-slate-800">{companyName}</span>
                    </div>
                    {poNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-semibold">PO Reference:</span>
                        <span className="font-mono font-bold text-slate-800">{poNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-gray-200 pt-2">
                      <span className="text-gray-500 font-semibold">Total Scope:</span>
                      <span className="font-black text-[#2596be]">{totalUnits} Unit(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-semibold">Initial Status:</span>
                      <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Under Review
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
                    Your request has been stored permanently in our database. Our commercial HVAC engineering desk has received this specification and will contact <span className="font-bold text-slate-800">{contactEmail}</span> with formal pricing and logistics allocation.
                  </p>

                  <button
                    onClick={resetDrawer}
                    className="mt-6 w-full py-3 bg-[#2596be] hover:bg-[#1c7e9f] text-white rounded-xl text-xs font-extrabold transition-colors shadow-md cursor-pointer"
                  >
                    Done & Return to Store
                  </button>
                </div>
              )}

            </div>

            {/* Drawer footer (only visible in Cart view) */}
            {step === "cart" && cart.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6 bg-slate-50">
                <div className="flex flex-col gap-2 text-xs text-gray-600 font-semibold">
                  <div className="flex justify-between text-sm text-slate-900 font-bold">
                    <span>Distinct Equipment Models</span>
                    <span>{totalModels} Model(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Procurement Volume</span>
                    <span>{totalUnits} Unit(s)</span>
                  </div>
                  <div className="flex justify-between text-[#2596be] font-black border-t border-gray-200 pt-2 text-xs uppercase tracking-wider">
                    <span>Pricing Status</span>
                    <span>Official B2B Quote Generated On Submission</span>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2.5">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Are you sure you want to empty your current cart?")) {
                          onClearCart();
                        }
                      }}
                      className="px-3.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors flex items-center justify-center cursor-pointer"
                      title="Empty procurement list"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep("checkout")}
                      className="flex-1 bg-[#2596be] hover:bg-[#1c7e9f] text-white py-3 px-4 rounded-xl text-xs font-extrabold shadow-md transition-colors flex items-center justify-center gap-1.5 active:scale-[0.99] cursor-pointer"
                      id="checkout-drawer-trigger"
                    >
                      <CreditCard size={15} />
                      <span>Proceed to Order Request</span>
                    </button>
                  </div>

                  {/* Direct WhatsApp Procurement Order */}
                  <button
                    type="button"
                    onClick={() => openCartWhatsAppOrder(cart)}
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 px-4 rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                    id="cart-whatsapp-order-trigger"
                    title="Send procurement list directly via WhatsApp"
                  >
                    <img src="/whatsapp-official.png" alt="WhatsApp" className="w-4 h-4 object-contain" />
                    <span>Order Cart via WhatsApp</span>
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
