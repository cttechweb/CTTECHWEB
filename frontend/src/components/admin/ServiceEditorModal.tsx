 import React, { useState, useEffect } from "react";
import { X, Check, Wrench, Image as ImageIcon, Sparkles, CheckCircle2 } from "lucide-react";
import { ServiceItem } from "../../types";

interface ServiceEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: ServiceItem) => void;
  editingService?: ServiceItem | null;
}

const PRESET_SERVICE_IMAGES = [
  {
    label: "AC Maintenance",
    url: "/images/services/ac_maintenance.jpg"
  },
  {
    label: "AC Repair & Gauges",
    url: "/images/services/ac_repair.jpg"
  },
  {
    label: "AC Installation",
    url: "/images/services/ac_installation.jpg"
  },
  {
    label: "Refrigerant & Gas",
    url: "/images/services/ac_gas_refilling.jpg"
  },
  {
    label: "AMC Contract & Plans",
    url: "/images/services/ac_amc_contract.jpg"
  },
  {
    label: "Duct Cleaning & Sanitization",
    url: "/images/services/duct_cleaning.jpg"
  },
  {
    label: "Engineering Consultation",
    url: "/images/services/hvac_consultation.jpg"
  },
  {
    label: "Air Quality & UV-C",
    url: "/images/services/air_quality_sanitization.jpg"
  },
  {
    label: "Compressor Overhaul",
    url: "/images/services/compressor_overhaul.jpg"
  },
  {
    label: "Chiller Plant Overhaul",
    url: "/images/services/chiller_overhaul.jpg"
  },
  {
    label: "VRF / VRV System",
    url: "/images/services/vrf_servicing.jpg"
  }
];

export default function ServiceEditorModal({
  isOpen,
  onClose,
  onSave,
  editingService
}: ServiceEditorModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("");
  const [image, setImage] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (editingService) {
      setTitle(editingService.title || "");
      setDescription(editingService.description || "");
      setBadge(editingService.badge || "");
      setImage(editingService.image || PRESET_SERVICE_IMAGES[0].url);
      setIsActive(editingService.isActive !== false);
    } else {
      setTitle("");
      setDescription("");
      setBadge("");
      setImage(PRESET_SERVICE_IMAGES[0].url);
      setIsActive(true);
    }
  }, [editingService, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const savedItem: ServiceItem = {
      id: editingService?.id || `serv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      description: description.trim(),
      image: image.trim() || PRESET_SERVICE_IMAGES[0].url,
      badge: badge.trim() || undefined,
      isActive,
      order: editingService?.order ?? 99,
      category: editingService?.category || "Services",
      tagline: editingService?.tagline || title.trim(),
      iconName: editingService?.iconName || "Wrench"
    };

    onSave(savedItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-[#031b4e] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center">
              <Wrench size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight text-white">
                {editingService ? "Edit AC / HVAC Service" : "Add New AC Service"}
              </h3>
              <p className="text-[11px] text-blue-200 font-medium">
                Streamlined configuration — only required service details
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4.5">
          
          {/* Service Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Service Title <span className="text-red-500">*</span></span>
              <span className="text-[11px] text-slate-400 normal-case font-normal">e.g. AC Maintenance, AC Repair</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AC Maintenance"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            />
          </div>

          {/* Short Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Short Description <span className="text-red-500">*</span></span>
              <span className="text-[11px] text-slate-400 normal-case font-normal">1-2 concise sentences</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Preventive AC maintenance, inspection, cleaning, and performance checks for reliable cooling."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-medium text-slate-800 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Badge / Pill (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Badge / Tag <span className="text-slate-400 font-normal">(Optional)</span></span>
              <span className="text-[11px] text-slate-400 normal-case font-normal">e.g. Preventive Care, Emergency Repair</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Preventive Care"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-medium text-slate-800 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          {/* Service Image URL & Preview */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Service Card Image <span className="text-red-500">*</span></span>
              <span className="text-[11px] text-slate-400 normal-case font-normal">Direct image URL</span>
            </label>

            <div className="flex gap-3 items-center">
              <div className="w-20 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-inner flex items-center justify-center">
                {image ? (
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={20} className="text-slate-400" />
                )}
              </div>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs font-mono text-slate-700 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            {/* Quick Pick Presets */}
            <div className="space-y-1 pt-1">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Sparkles size={12} className="text-amber-500" /> Or pick a high-quality HVAC preset image:
              </span>
              <div className="grid grid-cols-4 gap-2 pt-1">
                {PRESET_SERVICE_IMAGES.map((preset, idx) => {
                  const isSelected = image === preset.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImage(preset.url)}
                      className={`group relative rounded-lg overflow-hidden border text-left p-1 transition-all cursor-pointer ${
                        isSelected 
                          ? "border-[#0f4c81] ring-2 ring-[#0f4c81]/20 bg-blue-50/50" 
                          : "border-slate-200 hover:border-slate-300 bg-slate-50"
                      }`}
                    >
                      <div className="w-full h-10 rounded overflow-hidden mb-1 relative">
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-[#0f4c81]/30 flex items-center justify-center">
                            <CheckCircle2 size={14} className="text-white drop-shadow" />
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-slate-700 truncate">{preset.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Status Switch */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Service Status</span>
              <span className="text-[11px] text-slate-500">Enable to show on public website services page</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0f4c81] hover:bg-[#0c3d69] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Check size={16} />
              <span>{editingService ? "Update Service" : "Add Service"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
