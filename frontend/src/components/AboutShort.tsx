import React from "react";
import { ArrowRight, Award, ShieldCheck, Compass } from "lucide-react";
// @ts-ignore
import hqImage from "../assets/images/cool_tech_hq_1784538496855.jpg";

interface AboutShortProps {
  onOpenAbout: () => void;
}

export default function AboutShort({ onOpenAbout }: AboutShortProps) {
  // Dynamically calculate years of trust since 2012
  const startYear = 2012;
  const currentYear = new Date().getFullYear();
  // Safe fallback if client clock is wrong or in case of static 2026 requirement
  const yearsOfTrust = Math.max(14, currentYear - startYear);

  return (
    <section className="w-full bg-white py-12 lg:py-16" id="about-short-section">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          {/* Left Column: Image with Overlaid Years of Trust Badge */}
          <div className="lg:col-span-5 relative">
            {/* Elegant corner dots background accent */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] [background-size:12px_12px] opacity-70 pointer-events-none"></div>
            
            {/* Main Headquarters Image container */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-slate-50 aspect-[4/3] group">
              <img
                src={hqImage}
                alt="Cool Technologies Corporate Headquarters"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
              
              {/* Dynamic Years of Trust Solid Overlaid Badge */}
              <div className="absolute bottom-4 left-4 bg-[#2596be] text-white px-6 py-4 rounded-xl shadow-xl z-10 select-none min-w-[160px] animate-fade-in">
                <p className="font-sans font-black text-4xl leading-none flex items-center tracking-tight">
                  {yearsOfTrust}+
                </p>
                <p className="text-xs text-slate-100 font-extrabold tracking-wider uppercase mt-1.5 whitespace-nowrap">
                  Years of Trust
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Clean, Structured, Professional Typography */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] bg-blue-50 text-[#2596be] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
                Company Profile
              </span>
              <h2 className="font-sans font-black text-3xl sm:text-4xl text-[#031b4e] uppercase tracking-tight leading-none pt-1">
                Cool Technologies
              </h2>
            </div>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-semibold text-justify">
              Founded in the Emirate of Abu Dhabi in {startYear}, Cool Technologies have emerged to be one of the leading suppliers of industrial cooling equipment in the UAE for the past {yearsOfTrust} years. We have partnered with 30+ leading brands to deliver a wide range of cooling equipment and appliances along with industry-standard installation, maintenance & service to our clientele ranging from individuals to large-scale industries and government institutions. We ensure superior quality through our lineup of <strong className="text-[#031b4e] font-black">COOLTECH</strong> brand water-coolers and chillers which has been among the top selling water cooling equipment in the market since 2014.
            </p>

            {/* Divider Line */}
            <div className="h-[1px] bg-slate-100 w-full pt-1"></div>

            {/* Interactive Button to Open Dedicated About Us Page (Modal) */}
            <div className="pt-2">
              <button
                onClick={onOpenAbout}
                className="inline-flex items-center gap-2 bg-[#2596be] hover:bg-[#1c7e9f] text-white font-black text-xs px-6 py-3.5 rounded-lg shadow-sm hover:shadow transition-all group"
              >
                <span>Know more</span>
                <ArrowRight size={14} className="stroke-[3] transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
