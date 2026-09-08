import React, { useState, useEffect } from "react";
import { X, Check, Wrench, Sparkles, Trash2, Plus } from "lucide-react";
import { ServiceItem } from "../../types";

interface ServiceEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: ServiceItem) => void;
  editingService?: ServiceItem | null;
}

export default function ServiceEditorModal({
  isOpen,
  onClose,
  onSave,
  editingService
}: ServiceEditorModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Contracting & Installation");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [iconName, setIconName] = useState("Wrench");
  const [image, setImage] = useState("");

  const [sla, setSla] = useState("Same-Day Emergency Dispatch");
  const [warranty, setWarranty] = useState("1-Year Workmanship Warranty");
  const [targetAudience, setTargetAudience] = useState("Commercial & Industrial Contractors");
  const [certifiedFor, setCertifiedFor] = useState("ISO 9001:2015 Registered Technicians");

  const [features, setFeatures] = useState<string[]>([
    "24/7 Rapid Mechanical Response",
    "Complete OEM Spare Parts Inventory",
    "ASHRAE Certified Load Calculations"
  ]);
  const [newFeature, setNewFeature] = useState("");

  useEffect(() => {
    if (editingService) {
      setTitle(editingService.title || "");
      setCategory(editingService.category || "Contracting & Installation");
      setTagline(editingService.tagline || "");
      setDescription(editingService.description || "");
      setIconName(editingService.iconName || "Wrench");
      setImage(editingService.image || "");
      if (editingService.specs) {
        setSla(editingService.specs.sla || "");
        setWarranty(editingService.specs.warranty || "");
        setTargetAudience(editingService.specs.targetAudience || "");
        setCertifiedFor(editingService.specs.certifiedFor || "");
      }
      setFeatures(editingService.features || []);
    } else {
      setTitle("");
      setCategory("Contracting & Installation");
      setTagline("Certified HVAC Contracting & System Installation");
      setDescription("Turnkey mechanical engineering, ductwork fabrication, chiller commissioning, and emergency overhauling across the UAE.");
      setIconName("Wrench");
      setImage("https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop");
      setSla("Same-Day Dispatch");
      setWarranty("1-Year Guarantee");
      setTargetAudience("Commercial Developers");
      setCertifiedFor("HVAC Licensed Engineers");
      setFeatures([
        "Turnkey Chiller & VRF Commissioning",
        "PPM Preventive Maintenance Contracts",
        "Emergency Compressor Replacement"
      ]);
    }
  }, [editingService, isOpen]);

  if (!isOpen) return null;

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newService: ServiceItem = {
      id: editingService?.id || `serv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: title.trim(),
      category,
      tagline: tagline.trim(),
      description: description.trim(),
      iconName,
      image: image.trim() || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
      features,
      specs: {
        sla,
        warranty,
        targetAudience,
        certifiedFor
      }
    };

    onSave(newService);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        
        <div className="px-6 py-4 bg-[#031b4e] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center">
              <Wrench size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">
                {editingService ? "Edit Service Offering" : "Add New Engineering Service"}
              </h3>
              <p className="text-[11px] text-blue-200 font-medium">
                Configure technical service specifications, SLAs, and service features.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Service Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Commercial Chiller Overhaul & Commissioning"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Icon Selector
              </label>
              <select
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
              >
                <option value="Wrench">Wrench (Mechanical Repairs)</option>
                <option value="Sparkles">Sparkles (Hygienic / Duct Cleaning)</option>
                <option value="Wind">Wind (VRF & Ventilation)</option>
                <option value="Droplet">Droplet (Pumps & Chillers)</option>
                <option value="Snowflake">Snowflake (Cold Rooms)</option>
                <option value="Thermometer">Thermometer (Submittals)</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tagline / Short Summary
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Detailed Service Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                SLA Response Time
              </label>
              <input
                type="text"
                value={sla}
                onChange={(e) => setSla(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Warranty Terms
              </label>
              <input
                type="text"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Header Image URL
              </label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-200">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Key Features
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add service feature..."
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-3 py-1.5 bg-blue-700 text-white font-bold text-xs rounded hover:bg-blue-800"
              >
                Add
              </button>
            </div>
            <div className="space-y-1">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded border text-xs">
                  <span>✓ {feat}</span>
                  <button type="button" onClick={() => handleRemoveFeature(idx)} className="text-slate-400 hover:text-red-600">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Check size={16} />
              <span>{editingService ? "Save Changes" : "Create Service"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
