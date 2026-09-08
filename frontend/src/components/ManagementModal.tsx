import React from "react";
import { X, Award, Shield, Cpu, Network } from "lucide-react";

interface ManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Executive {
  name: string;
  role: string;
  bio: string;
  initials: string;
}

const EXECUTIVES: Executive[] = [
  {
    name: "Dr. Arthur Sterling",
    role: "President & Co-Founder",
    bio: "Over 25 years of thermodynamic engineering and corporate HVAC distribution leadership. Arthur guides our strategic expansion into smart energy grids and high-efficiency central VRF systems.",
    initials: "AS"
  },
  {
    name: "Sarah Jenkins",
    role: "Vice President of Global Sourcing",
    bio: "Sarah manages our direct manufacturer relationships with Daikin, Carrier, and MHI. She oversees B2B pricing parity, quality assurance standards, and bulk volume contracts.",
    initials: "SJ"
  },
  {
    name: "David Vance",
    role: "Director of Logistics & B2B Operations",
    bio: "David streamlines our multi-state warehousing network and express LTL contractor deliveries. Under his tenure, average dispatch times have dropped to under 18 hours.",
    initials: "DV"
  }
];

export default function ManagementModal({ isOpen, onClose }: ManagementModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Company Overview</span>
            <h2 className="text-xl font-bold text-[#031b4e] mt-1">Management & Executive Leadership</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          
          {/* Mission Statement Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7 space-y-3">
              <h3 className="text-lg font-bold text-[#031b4e] uppercase tracking-wide">Our Mission</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Cool Technologies is the world's leading specialized distributor of B2B HVAC and precision climate control systems. Founded in 2012, we serve commercial developers, mechanical engineers, and local contractors by providing factory-direct sourcing, customized engineering estimates, and guaranteed delivery SLAs.
              </p>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">
                We believe in industrial transparency, sustainable coolant technologies, and long-term partnership values. By bridging the gap between major global manufacturers and field teams, we enable seamless building operations across 40+ countries.
              </p>
            </div>
            
            {/* Visual Specs / Milestones Grid */}
            <div className="md:col-span-5 grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
                <span className="block text-2xl font-black text-blue-700">14+ Years</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In Operation</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
                <span className="block text-2xl font-black text-blue-700">18,000+</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contractors Served</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
                <span className="block text-2xl font-black text-blue-700">$120M+</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Equipment Sourced</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
                <span className="block text-2xl font-black text-blue-700">99.8%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">On-Time SLA</span>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Pillars of Integrity */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#031b4e] uppercase tracking-wider text-center">Operational Pillars</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col items-center text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Award size={16} />
                </div>
                <span className="text-xs font-bold text-slate-800">Factory Certification</span>
                <p className="text-[10px] text-slate-500 leading-normal font-medium">100% genuine parts and verified manufacturer warranties.</p>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col items-center text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Shield size={16} />
                </div>
                <span className="text-xs font-bold text-slate-800">Risk Mitigation</span>
                <p className="text-[10px] text-slate-500 leading-normal font-medium">Full transit protection and freight insurance included.</p>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col items-center text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Cpu size={16} />
                </div>
                <span className="text-xs font-bold text-slate-800">Energy Optimization</span>
                <p className="text-[10px] text-slate-500 leading-normal font-medium">All recommended layouts focus strictly on green coefficients.</p>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col items-center text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Network size={16} />
                </div>
                <span className="text-xs font-bold text-slate-800">Supply Network</span>
                <p className="text-[10px] text-slate-500 leading-normal font-medium">State-of-the-art logistics tracking on cargo and line-haul.</p>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Executive Leadership */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#031b4e] uppercase tracking-wider">Executive Board</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {EXECUTIVES.map((exec, idx) => (
                <div key={idx} className="bg-slate-50/60 border border-slate-100 rounded-xl p-5 flex flex-col space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {exec.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{exec.name}</h4>
                      <p className="text-[11px] text-blue-700 font-bold">{exec.role}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium flex-1">
                    {exec.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-[10px] text-slate-400 text-center font-semibold">
          Cool Technologies B2B Sourcing Headquarters • 1200 Industrial Parkway, Dallas, TX 75201
        </div>

      </div>
    </div>
  );
}
