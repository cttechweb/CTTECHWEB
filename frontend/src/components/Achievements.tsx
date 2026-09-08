import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building, ShieldCheck, Award, Zap, HeartHandshake, 
  Settings, Star, Compass, CheckCircle2, Trophy
} from "lucide-react";
import { AchievementMilestone } from "../types";
import { getAchievements, getGeneralSettings } from "../services/generalSettingsService";

interface RenderMilestone extends AchievementMilestone {
  icon: React.ReactNode;
  pixelX: number;
  pixelY: number;
}

const NODE_SPACING = 165; // Comfortable spacing in pixels per milestone

// Icon mapper helper
function getMilestoneIcon(iconName?: string, color?: string) {
  const iconProps = { size: 16, style: { color: color || "currentColor" } };
  switch (iconName) {
    case "Building":
      return <Building {...iconProps} />;
    case "Trophy":
    case "Clivet":
      return <Trophy {...iconProps} />;
    case "Zap":
      return <Zap {...iconProps} />;
    case "Star":
      return <Star {...iconProps} />;
    case "Compass":
      return <Compass {...iconProps} />;
    case "Settings":
      return <Settings {...iconProps} />;
    case "HeartHandshake":
      return <HeartHandshake {...iconProps} />;
    case "CheckCircle2":
      return <CheckCircle2 {...iconProps} />;
    case "ShieldCheck":
      return <ShieldCheck {...iconProps} />;
    case "Award":
    default:
      return <Award {...iconProps} />;
  }
}

export default function Achievements() {
  const [milestones, setMilestones] = useState<RenderMilestone[]>([]);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [globalBgOpacity, setGlobalBgOpacity] = useState<number>(0.3);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageWidth, setStageWidth] = useState<number>(1000);

  const loadMilestones = () => {
    const s = getGeneralSettings();
    setGlobalBgOpacity(s.achievementBgOpacity !== undefined ? s.achievementBgOpacity : 0.3);

    const raw = getAchievements().filter((m) => m.isActive !== false);
    if (raw.length === 0) {
      setMilestones([]);
      return;
    }

    const n = raw.length;
    const startX = 70;
    
    // Upward ascending growth trajectory: starts at Y=230px (bottom-left) and climbs smoothly up to Y=110px (top-right)
    const minY = 110;
    const maxY = 230;

    const computed: RenderMilestone[] = raw.map((m, idx) => {
      const pixelX = startX + idx * NODE_SPACING;
      
      // Calculate upward baseline along the growth slope
      const progress = n > 1 ? idx / (n - 1) : 0.5;
      const baselineY = maxY - progress * (maxY - minY);
      
      // Alternating upper and lower nodes along the rising growth line
      const isUp = m.position === "up" || (m.position === undefined && idx % 2 === 0);
      const pixelY = baselineY + (isUp ? -18 : 18);

      return {
        ...m,
        position: isUp ? "up" : "down",
        borderColor: m.borderColor || `${m.color}66`,
        lightBg: m.lightBg || `${m.color}0D`,
        icon: getMilestoneIcon(m.iconName, m.color),
        pixelX,
        pixelY
      };
    });

    setMilestones(computed);
    // Default to the latest active milestone
    setActiveIdx(computed.length - 1);
  };

  useEffect(() => {
    loadMilestones();
    window.addEventListener("cooltech_settings_updated", loadMilestones);
    return () => window.removeEventListener("cooltech_settings_updated", loadMilestones);
  }, []);

  // Update container width on resize for accurate translation boundaries
  useEffect(() => {
    const updateWidth = () => {
      if (stageRef.current) {
        setStageWidth(stageRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Auto-play progression
  useEffect(() => {
    if (milestones.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIdx((prevIdx) => (prevIdx + 1) % milestones.length);
    }, 4800);
    return () => clearInterval(interval);
  }, [milestones.length]);

  if (milestones.length === 0) {
    return null;
  }

  const currentMilestone = milestones[activeIdx] || milestones[0];
  const lastNode = milestones[milestones.length - 1];
  const totalTrackWidth = lastNode ? lastNode.pixelX + 80 : 900;
  const maxScroll = Math.max(0, totalTrackWidth - stageWidth);

  // Smooth translation calculation:
  // When at first milestone (idx = 0), targetX = 0 (aligned left)
  // When at last milestone (idx = N - 1), targetX = -maxScroll (aligned comfortably to right)
  // When in middle, keeps active node centered
  const activeNode = milestones[activeIdx] || milestones[0];
  const rawTargetX = -(activeNode.pixelX - stageWidth / 2);
  const targetX = maxScroll > 0 ? Math.min(0, Math.max(-maxScroll, rawTargetX)) : 0;

  // Build the upward ascending smooth cubic Bézier curve:
  // Starts EXACTLY at first node and ends EXACTLY at last node (NO trailing lines)
  const generateGrowthPathD = () => {
    if (milestones.length === 0) return "";
    let d = `M ${milestones[0].pixelX} ${milestones[0].pixelY}`;
    for (let i = 1; i < milestones.length; i++) {
      const prev = milestones[i - 1];
      const curr = milestones[i];
      const midX = (prev.pixelX + curr.pixelX) / 2;
      d += ` C ${midX} ${prev.pixelY}, ${midX} ${curr.pixelY}, ${curr.pixelX} ${curr.pixelY}`;
    }
    return d;
  };

  const activeImageOpacity = currentMilestone.imageOpacity !== undefined 
    ? currentMilestone.imageOpacity 
    : globalBgOpacity;

  return (
    <section className="w-full bg-slate-50 py-5 lg:py-7" id="achievements-section">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <h2 className="font-sans font-black text-2xl sm:text-3xl text-[#031b4e] uppercase tracking-tight">
            Achievements
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-2.5 leading-relaxed">
            Hover or click on the chronological timeline nodes to explore our decade of growth, service expansions, and official OEM partnerships in the UAE.
          </p>
        </div>

        {/* ───────────────────────────────────────────────────────────
            1. DESKTOP INTERACTIVE MAIN CONTAINER
            Holds the background image across the entire container, with the solid opaque showcase card on top
        ─────────────────────────────────────────────────────────── */}
        <div 
          ref={stageRef}
          className="hidden lg:block bg-white rounded-3xl p-6 sm:p-8 relative shadow-2xs border border-slate-200/80 mb-6 overflow-hidden select-none"
        >
          {/* Background Image across the entire container (at configured opacity, e.g. 30%) */}
          {currentMilestone.image && (
            <div 
              className="absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-500 z-0"
              style={{ opacity: activeImageOpacity }}
            >
              <img 
                src={currentMilestone.image} 
                alt={currentMilestone.title}
                className="w-full h-full object-cover filter saturate-110"
              />
              <div className="absolute inset-0 bg-white/70" />
            </div>
          )}

          {/* Subtle Background Radial Accent */}
          <div className="absolute inset-0 bg-radial-at-t from-slate-50/40 via-transparent to-transparent opacity-50 pointer-events-none z-0" />

          {/* ─────────────────────────────────────────────────────────
              UPPER GRAPH STAGE
          ───────────────────────────────────────────────────────── */}
          <div className="relative h-[340px] w-full overflow-hidden rounded-2xl z-10">
            <motion.div
              className="relative h-full cursor-grab active:cursor-grabbing"
              style={{ width: `${totalTrackWidth}px` }}
              animate={{ x: targetX }}
              transition={{
                type: "spring",
                stiffness: 85,
                damping: 24,
                mass: 0.8
              }}
              drag={maxScroll > 0 ? "x" : false}
              dragConstraints={{
                left: -maxScroll,
                right: 0
              }}
            >
              {/* Upward Ascending Dashed SVG Curve (Exact Start to Exact End) */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none" 
                style={{ width: `${totalTrackWidth}px`, height: "340px" }}
              >
                <defs>
                  <linearGradient id="upwardGrowthGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#c1245b" stopOpacity="0.85" />
                    <stop offset="35%" stopColor="#d37213" stopOpacity="0.85" />
                    <stop offset="70%" stopColor="#0f8278" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#054f8e" stopOpacity="1" />
                  </linearGradient>
                </defs>

                {/* Ascending Dashed Guide Line: Starts at node 1, ends at last node */}
                <motion.path
                  d={generateGrowthPathD()}
                  fill="none"
                  stroke="url(#upwardGrowthGrad)"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                  initial={{ strokeDashoffset: 120 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                />

                {/* Vertical node connector lines with dot endings */}
                {milestones.map((m) => {
                  const isUp = m.position === "up";
                  const startY = m.pixelY;
                  const endY = isUp ? m.pixelY - 42 : m.pixelY + 42;

                  return (
                    <g key={`stem-${m.id}`} className="opacity-75">
                      <line
                        x1={m.pixelX}
                        y1={startY}
                        x2={m.pixelX}
                        y2={endY}
                        stroke={m.color}
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                      <circle
                        cx={m.pixelX}
                        cy={endY}
                        r="3.5"
                        fill={m.color}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Render Interactive Nodes along the Upward Growth Path */}
              {milestones.map((m, idx) => {
                const isActive = activeIdx === idx;
                const isUp = m.position === "up";

                return (
                  <div
                    key={m.id}
                    className="absolute cursor-pointer select-none group"
                    style={{
                      left: `${m.pixelX}px`,
                      top: `${m.pixelY}px`,
                      transform: "translate(-50%, -50%)",
                      zIndex: isActive ? 40 : 20,
                    }}
                    onClick={() => setActiveIdx(idx)}
                    onMouseEnter={() => setActiveIdx(idx)}
                  >
                    {/* Glowing Node Circle */}
                    <div className="relative flex items-center justify-center">
                      {isActive && (
                        <motion.div
                          className="absolute w-12 h-12 rounded-full pointer-events-none"
                          style={{ backgroundColor: m.color }}
                          initial={{ scale: 0.8, opacity: 0.5 }}
                          animate={{ scale: 1.6, opacity: 0 }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                        />
                      )}

                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isActive 
                            ? "scale-125 border-4 shadow-md bg-white" 
                            : "scale-100 bg-white border-2 hover:border-slate-400 border-slate-200 shadow-sm"
                        }`}
                        style={{ 
                          borderColor: isActive ? m.color : "rgb(226, 232, 240)",
                          boxShadow: isActive ? `0 0 14px ${m.borderColor}` : undefined
                        }}
                      >
                        <div 
                          className="w-3 h-3 rounded-full transition-colors duration-300"
                          style={{ backgroundColor: m.color }}
                        />
                      </div>
                    </div>

                    {/* Year badge */}
                    <div 
                      className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
                      style={{
                        top: isUp ? "24px" : "-36px"
                      }}
                    >
                      <span 
                        className={`font-mono text-xs font-black transition-all duration-300 px-2 py-0.5 rounded shadow-2xs ${
                          isActive 
                            ? "text-white scale-105" 
                            : "text-slate-600 group-hover:text-slate-900 bg-white/95 border border-slate-200"
                        }`}
                        style={{
                          backgroundColor: isActive ? m.color : undefined
                        }}
                      >
                        {m.year}
                      </span>
                    </div>

                    {/* Multi-line Title Tooltip */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-300 opacity-85 group-hover:opacity-100 text-center w-28 flex justify-center"
                      style={{
                        top: isUp ? "-78px" : "48px"
                      }}
                    >
                      <span 
                        className="text-[9px] leading-tight font-black uppercase tracking-wider block text-slate-800 bg-white/95 border border-slate-200/90 rounded-md px-2 py-1 shadow-2xs whitespace-normal text-center"
                      >
                        {m.title}
                      </span>
                    </div>

                  </div>
                );
              })}

            </motion.div>
          </div>

          {/* ───────────────────────────────────────────────────────────
              LOWER SHOWCASE BOX: SOLID OPAQUE CONTAINER ON TOP (NOT TRANSPARENT)
          ─────────────────────────────────────────────────────────── */}
          <div className="mt-4 pt-5 border-t border-slate-200/80 relative z-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMilestone.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm relative z-20"
              >
                {/* Inner Content Grid - 100% Solid Pure White Background & Opaque */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Visual Pillar: Year & Icon */}
                  <div className="md:col-span-3 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-6">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2.5 shadow-sm border bg-white"
                      style={{ 
                        borderColor: currentMilestone.borderColor 
                      }}
                    >
                      {currentMilestone.icon}
                    </div>
                    <span className="font-mono text-3xl font-black tracking-tight" style={{ color: currentMilestone.color }}>
                      {currentMilestone.year}
                    </span>
                  </div>

                  {/* Text Details */}
                  <div className="md:col-span-5 text-left">
                    <h3 className="font-sans font-black text-lg text-slate-900 uppercase tracking-tight mb-1">
                      {currentMilestone.title}
                    </h3>
                    {currentMilestone.subtitle && (
                      <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#0f4c81] mb-2 bg-blue-50/80 inline-block px-2.5 py-0.5 rounded border border-blue-200">
                        {currentMilestone.subtitle}
                      </p>
                    )}
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                      {currentMilestone.description}
                    </p>
                  </div>

                  {/* Dealerships / Tag Chips */}
                  <div className="md:col-span-4 text-left">
                    {currentMilestone.dealerships && currentMilestone.dealerships.length > 0 ? (
                      <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 shadow-2xs">
                        <p className="text-[9px] uppercase tracking-widest text-slate-500 font-extrabold mb-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Authorized Dealerships ({currentMilestone.dealerships.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {currentMilestone.dealerships.map((brand) => (
                            <span
                              key={brand}
                              className="text-[9px] font-bold px-2 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded-md border border-slate-200 shadow-2xs transition-all"
                            >
                              {brand}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="border border-slate-200 bg-slate-50/80 rounded-xl p-4 text-center">
                        <p className="text-[10px] text-slate-500 font-bold leading-normal">
                          Internal engineering infrastructure & milestone advancement.
                        </p>
                      </div>
                    )}
                  </div>

                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* 2. MOBILE RESPONSIVE TIMELINE (Visible on screens smaller than LG) */}
        <div className="lg:hidden space-y-4 text-left">
          {milestones.map((milestone) => {
            return (
              <div 
                key={milestone.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative flex gap-4 overflow-hidden"
              >
                {/* Accent vertical left-border */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1.5 z-10"
                  style={{ backgroundColor: milestone.color }}
                />

                {/* Left side year indicator with icon */}
                <div className="flex flex-col items-center shrink-0 z-10">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm bg-white"
                    style={{ borderColor: milestone.borderColor }}
                  >
                    {milestone.icon}
                  </div>
                  <span className="font-mono text-lg font-black mt-2" style={{ color: milestone.color }}>
                    {milestone.year}
                  </span>
                </div>

                {/* Right side textual details */}
                <div className="flex-1 space-y-2 z-10">
                  <div>
                    <h4 className="font-sans font-black text-sm text-slate-900 uppercase tracking-wide">
                      {milestone.title}
                    </h4>
                    {milestone.subtitle && (
                      <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#0f4c81]">
                        {milestone.subtitle}
                      </p>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                    {milestone.description}
                  </p>

                  {milestone.dealerships && milestone.dealerships.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex flex-wrap gap-1">
                        {milestone.dealerships.map((brand) => (
                          <span 
                            key={brand}
                            className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-700 rounded"
                          >
                            {brand}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
