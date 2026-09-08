import React, { useState } from "react";
import { X, Sparkles, Wind, Snowflake, Box, Droplet, Shield, Layers, Zap, Image as ImageIcon } from "lucide-react";
import { Product, ServiceItem, Workflow } from "../../types";
import DynamicWizardFlow from "./DynamicWizardFlow";

interface SelectionWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  services?: ServiceItem[];
  workflows: Workflow[];
  onSelectProduct: (productId: string) => void;
  onRequestQuote: (prefilledProduct: string) => void;
}

export default function SelectionWizardModal({
  isOpen,
  onClose,
  products,
  services = [],
  workflows,
  onSelectProduct,
  onRequestQuote
}: SelectionWizardModalProps) {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeWorkflow = workflows.find((w) => w.id === selectedWorkflowId);

  const handleReset = () => {
    setSelectedWorkflowId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white text-slate-900 w-full max-w-4xl max-h-[92vh] sm:max-h-[94vh] rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="p-3 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0f4c81] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles size={16} className="sm:w-[18px] sm:h-[18px]" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xs sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
                Equipment Selection Assistant
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
                Answer step-by-step questions to match equipment specifications.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="Close Assistant"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-6 overflow-y-auto overflow-x-hidden flex-1">
          
          {!activeWorkflow ? (
            /* Workflow Selector Step 1 */
            <div className="space-y-5 text-center">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  What Type of System Do You Need?
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 font-semibold">
                  Select your required equipment category below to start matching specifications.
                </p>
              </div>

              {/* Grid of Configured Workflows (Pure Image-Only or Pure Text-Only Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left pt-1">
                {workflows.map((wf) => (
                  <button
                    key={wf.id}
                    onClick={() => setSelectedWorkflowId(wf.id)}
                    className="group rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#0f4c81] shadow-2xs hover:shadow-md transition-all cursor-pointer overflow-hidden text-left h-52 relative flex flex-col justify-between"
                  >
                    {wf.image ? (
                      /* Image-Only Card: Full Container Image */
                      <div className="w-full h-full relative overflow-hidden bg-slate-100">
                        <img
                          src={wf.image}
                          alt={wf.name}
                          style={{ objectPosition: wf.imagePosition || "center" }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      /* Text-Only Card */
                      <div className="p-4 flex flex-col justify-between h-full w-full">
                        <div>
                          {wf.badge && (
                            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0f4c81] mb-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0f4c81]"></span>
                              <span>{wf.badge}</span>
                            </div>
                          )}
                          <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#0f4c81] transition-colors leading-snug">
                            {wf.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed line-clamp-3 font-medium">
                            {wf.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-extrabold text-[#0f4c81]">
                          <span>Start Selection</span>
                          <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

            </div>
          ) : (
            /* Active Dynamic Workflow Steps */
            <DynamicWizardFlow
              workflow={activeWorkflow}
              products={products}
              services={services}
              onSelectProduct={(productId) => {
                try { sessionStorage.setItem("cooltech_wizard_completed", "true"); } catch {}
                onSelectProduct(productId);
              }}
              onRequestQuote={(productTitle) => {
                try { sessionStorage.setItem("cooltech_wizard_completed", "true"); } catch {}
                onRequestQuote(productTitle);
              }}
              onResetCategory={handleReset}
            />
          )}

        </div>

      </div>
    </div>
  );
}
