import React from "react";
import { X, ShieldCheck, Award, Target, Eye, Settings, HeartHandshake } from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50">
          <div>
            <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-widest bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              Corporate Heritage
            </span>
            <h2 className="text-xl font-black text-[#031b4e] uppercase tracking-tight mt-1">
              About Cool Technologies
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} className="stroke-[3]" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          
          {/* Main Story Paragraph */}
          <div className="prose max-w-none text-slate-600 text-sm sm:text-base leading-relaxed space-y-4">
            <p className="font-semibold text-slate-700">
              Since our establishment in Abu Dhabi in 2012, Cool Technologies has committed to delivering unparalleled industrial climate solutions, temperature control appliances, and wholesale HVAC services across the UAE.
            </p>
            <p className="text-xs sm:text-sm">
              We leverage direct OEM agreements with over 30 leading global manufacturers to supply heavy-duty industrial water coolers, central tank chilling units, and high-efficiency multi-zone VRF systems. By consolidating region-wide supply chains, we provide mechanical contractors and corporate clients with direct wholesale pricing and express logistics routing.
            </p>
          </div>

          {/* Core Vision & Mission Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50/40 border border-blue-100/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#2596be] text-white flex items-center justify-center">
                  <Target size={20} className="stroke-[2.5]" />
                </div>
                <h3 className="font-sans font-black text-[#031b4e] uppercase text-sm tracking-wider">
                  Our Mission
                </h3>
              </div>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                To design, source, and deliver reliable, energy-efficient temperature control systems that withstand the high ambient conditions of the Gulf region, guaranteeing maximum uptime and operational efficiency for every client.
              </p>
            </div>

            <div className="bg-emerald-50/40 border border-emerald-100/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                  <Eye size={20} className="stroke-[2.5]" />
                </div>
                <h3 className="font-sans font-black text-emerald-950 uppercase text-sm tracking-wider">
                  Our Vision
                </h3>
              </div>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                To be the undisputed leader in B2B climate technology procurement within the GCC, bridging global OEM excellence with local engineering execution, and pioneering sustainable, low-GWP refrigerant initiatives.
              </p>
            </div>
          </div>

          {/* Pillars of Excellence */}
          <div>
            <h3 className="font-sans font-black text-[#031b4e] uppercase text-xs tracking-widest text-center mb-6">
              Pillars of Our Engineering Excellence
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 shadow-sm mx-auto flex items-center justify-center text-blue-600">
                  <ShieldCheck size={22} className="stroke-[2]" />
                </div>
                <h4 className="font-sans font-black text-xs text-slate-800 uppercase tracking-wide">
                  Guaranteed Quality
                </h4>
                <p className="text-[11px] text-slate-500 font-medium leading-normal">
                  All equipment undergoes comprehensive testing and features direct manufacturer warranty protection.
                </p>
              </div>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 shadow-sm mx-auto flex items-center justify-center text-blue-600">
                  <Award size={22} className="stroke-[2]" />
                </div>
                <h4 className="font-sans font-black text-xs text-slate-800 uppercase tracking-wide">
                  OEM Authorized
                </h4>
                <p className="text-[11px] text-slate-500 font-medium leading-normal">
                  Official distributor status with premium global brands, ensuring genuine parts and direct engineering channels.
                </p>
              </div>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 shadow-sm mx-auto flex items-center justify-center text-blue-600">
                  <HeartHandshake size={22} className="stroke-[2]" />
                </div>
                <h4 className="font-sans font-black text-xs text-slate-800 uppercase tracking-wide">
                  Dedicated Support
                </h4>
                <p className="text-[11px] text-slate-500 font-medium leading-normal">
                  In-house mechanical engineers and a 24/7 service desk to support installation and overhauls.
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest text-center sm:text-left">
            Cool Technologies LLC • Abu Dhabi, United Arab Emirates
          </p>
          <button
            onClick={() => {
              onClose();
              window.location.hash = "#/about";
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="bg-[#2596be] hover:bg-[#1c7e9f] text-white font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Explore Full Corporate Page</span>
          </button>
        </div>

      </div>
    </div>
  );
}
