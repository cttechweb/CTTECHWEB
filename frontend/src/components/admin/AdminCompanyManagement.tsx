import React, { useState, useEffect } from "react";
import { 
  Building2, Search, Plus, Edit3, ShieldCheck, CheckCircle2, 
  X, Phone, Mail, MapPin, User, FileText 
} from "lucide-react";
import { Company } from "../../types";
import { listCompanies, updateCompany, getOrCreateCompany } from "../../services/companyService";

interface AdminCompanyManagementProps {
  onShowToast: (msg: string) => void;
}

export default function AdminCompanyManagement({ onShowToast }: AdminCompanyManagementProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Edit/Add modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formName, setFormName] = useState("");
  const [formLegalName, setFormLegalName] = useState("");
  const [formTaxId, setFormTaxId] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCity, setFormCity] = useState("Abu Dhabi");
  const [formTier, setFormTier] = useState<"Standard" | "Silver" | "Gold" | "Platinum">("Standard");
  const [formStatus, setFormStatus] = useState<"active" | "pending_verification" | "suspended">("active");

  const loadAllCompanies = async () => {
    setIsLoading(true);
    const list = await listCompanies();
    setCompanies(list);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAllCompanies();
  }, []);

  const handleOpenAdd = () => {
    setEditingCompany(null);
    setFormName("");
    setFormLegalName("");
    setFormTaxId("");
    setFormEmail("");
    setFormPhone("");
    setFormCity("Abu Dhabi");
    setFormTier("Standard");
    setFormStatus("active");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (comp: Company) => {
    setEditingCompany(comp);
    setFormName(comp.name);
    setFormLegalName(comp.legalName || comp.name);
    setFormTaxId(comp.taxId || "");
    setFormEmail(comp.email || "");
    setFormPhone(comp.phone || "");
    setFormCity(comp.city || "Abu Dhabi");
    setFormTier(comp.tier || "Standard");
    setFormStatus(comp.status);
    setIsModalOpen(true);
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingCompany) {
      await updateCompany(editingCompany.id, {
        name: formName.trim(),
        legalName: formLegalName.trim(),
        taxId: formTaxId.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        city: formCity.trim(),
        tier: formTier,
        status: formStatus,
      });
      onShowToast(`Company "${formName}" updated.`);
    } else {
      await getOrCreateCompany({
        name: formName.trim(),
        legalName: formLegalName.trim(),
        taxId: formTaxId.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        city: formCity.trim(),
      });
      onShowToast(`Company "${formName}" created.`);
    }

    setIsModalOpen(false);
    loadAllCompanies();
  };

  const filteredCompanies = companies.filter((comp) => {
    if (tierFilter !== "all" && comp.tier !== tierFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        comp.name.toLowerCase().includes(q) ||
        (comp.taxId && comp.taxId.toLowerCase().includes(q)) ||
        (comp.city && comp.city.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 size={20} className="text-[#0f4c81]" />
            <span>Registered Corporate Accounts & TRN Entities</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage B2B company records, UAE VAT/TRN tax identities, and wholesale contractor discount tiers.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-[#0f4c81] hover:bg-[#1c7e9f] text-white font-extrabold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Plus size={15} />
          <span>Register New Company</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Company Name or TRN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0f4c81] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-bold">Wholesale Tier:</span>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0f4c81]"
          >
            <option value="all">All Tiers ({companies.length})</option>
            <option value="Platinum">Platinum (15% off)</option>
            <option value="Gold">Gold (10% off)</option>
            <option value="Silver">Silver (5% off)</option>
            <option value="Standard">Standard</option>
          </select>
        </div>
      </div>

      {/* Companies List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredCompanies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider font-extrabold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Company Name</th>
                  <th className="px-4 py-3.5">UAE TRN / Tax ID</th>
                  <th className="px-4 py-3.5">Contact Details</th>
                  <th className="px-4 py-3.5">Wholesale Tier</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCompanies.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 text-xs">{comp.name}</div>
                      {comp.legalName && comp.legalName !== comp.name && (
                        <div className="text-[10px] text-slate-400">{comp.legalName}</div>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {comp.taxId ? (
                        <span className="font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[#0f4c81] font-bold">
                          {comp.taxId}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not provided</span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-slate-900 font-semibold">{comp.email || "No email"}</div>
                      <div className="text-slate-500 text-[10px]">{comp.phone || "No phone"} • {comp.city || "UAE"}</div>
                    </td>

                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        comp.tier === "Platinum" ? "bg-amber-100 text-amber-800 border-amber-300" :
                        comp.tier === "Gold" ? "bg-yellow-100 text-yellow-800 border-yellow-300" :
                        comp.tier === "Silver" ? "bg-slate-100 text-slate-700 border-slate-300" :
                        "bg-slate-50 text-slate-500 border-slate-200"
                      }`}>
                        {comp.tier || "Standard"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        comp.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        comp.status === "pending_verification" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>
                        {comp.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(comp)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#0f4c81] hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Edit Company"
                      >
                        <Edit3 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <Building2 size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="font-bold text-slate-800">No Companies Found</p>
            <p className="text-xs text-slate-400">Corporate accounts registered during order requests and RFQs will appear here.</p>
          </div>
        )}
      </div>

      {/* Edit / Add Company Modal (Light Theme) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden relative">
            
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Building2 size={18} className="text-[#0f4c81]" />
                <span>{editingCompany ? "Edit Corporate Account" : "Register B2B Company"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="p-6 space-y-4 text-xs">
              
              <div>
                <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">Company Display Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al Futtaim Mechanical Contracting"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0f4c81] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">Legal Trade Name</label>
                  <input
                    type="text"
                    placeholder="Official Trade License Name"
                    value={formLegalName}
                    onChange={(e) => setFormLegalName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0f4c81] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">UAE TRN / VAT ID</label>
                  <input
                    type="text"
                    placeholder="100XXXXXXXXXXXX"
                    value={formTaxId}
                    onChange={(e) => setFormTaxId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-[#0f4c81] font-bold focus:outline-none focus:border-[#0f4c81] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">Company Email</label>
                  <input
                    type="email"
                    placeholder="procurement@company.ae"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0f4c81] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">Telephone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+971 50 123 4567"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0f4c81] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">Wholesale Discount Tier</label>
                  <select
                    value={formTier}
                    onChange={(e) => setFormTier(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0f4c81]"
                  >
                    <option value="Standard">Standard (0%)</option>
                    <option value="Silver">Silver (5% Wholesale Discount)</option>
                    <option value="Gold">Gold (10% Wholesale Discount)</option>
                    <option value="Platinum">Platinum (15% Wholesale Discount)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">Account Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0f4c81]"
                  >
                    <option value="active">Active (Verified)</option>
                    <option value="pending_verification">Pending Verification</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0f4c81] hover:bg-[#1c7e9f] text-white font-extrabold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
                >
                  {editingCompany ? "Save Changes" : "Create Company"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
