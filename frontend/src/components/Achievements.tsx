import React, { useState, useEffect } from "react";
import { AchievementMilestone } from "../types";
import { getAchievements } from "../services/generalSettingsService";

export default function Achievements() {
  const [milestones, setMilestones] = useState<AchievementMilestone[]>([]);

  const loadMilestones = () => {
    const raw = getAchievements().filter((m) => m.isActive !== false);
    if (raw.length === 0) {
      setMilestones([]);
      return;
    }

    // Sort chronologically by year (or order)
    const sorted = [...raw].sort((a, b) => {
      const yearA = parseInt(a.year, 10) || 0;
      const yearB = parseInt(b.year, 10) || 0;
      if (yearA !== yearB) return yearA - yearB;
      return (a.order || 0) - (b.order || 0);
    });

    setMilestones(sorted);
  };

  useEffect(() => {
    loadMilestones();
    window.addEventListener("cooltech_settings_updated", loadMilestones);
    return () => window.removeEventListener("cooltech_settings_updated", loadMilestones);
  }, []);

  if (milestones.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-slate-50/60 py-12 sm:py-16 border-t border-slate-200/80" id="achievements-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header - Clean & Simple */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#2596be] mb-2">
            Company Milestones
          </p>
          <h2 className="font-sans font-black text-2xl sm:text-3xl text-[#031b4e] uppercase tracking-tight">
            Our Journey &amp; Achievements
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2 max-w-lg mx-auto leading-relaxed">
            A decade of disciplined growth, engineering capacity, and official OEM partnerships in the UAE HVAC market.
          </p>
        </div>

        {/* Full-Width 2-Column Timeline Grid (Spans full width, no awkward left/right empty gaps) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-16 gap-y-10 sm:gap-y-12">
          {milestones.map((m) => (
            <div key={m.id} className="relative pl-6 sm:pl-7 border-l-2 border-slate-200 group">
              
              {/* Timeline Indicator Dot */}
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-[#031b4e] group-hover:bg-[#031b4e] group-hover:scale-125 transition-all duration-200 shadow-2xs" />

              {/* Milestone Year & Title */}
              <div className="flex flex-wrap items-baseline gap-2 mb-1.5">
                <span className="font-mono text-base sm:text-lg font-black text-[#031b4e]">
                  {m.year}
                </span>
                <span className="text-slate-300 font-light hidden sm:inline">•</span>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  {m.title}
                </h3>
                {m.subtitle && (
                  <span className="text-xs font-semibold text-slate-500">
                    — {m.subtitle}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {m.description}
              </p>

              {/* Authorized Dealerships & Agencies (Clean subtle tags) */}
              {m.dealerships && m.dealerships.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                    Authorized Agencies:
                  </span>
                  {m.dealerships.map((brand) => (
                    <span
                      key={brand}
                      className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[11px] font-medium shadow-2xs"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              )}

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
