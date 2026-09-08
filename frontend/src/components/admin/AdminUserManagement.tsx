import React, { useState, useEffect } from "react";
import { 
  Users, Search, ShieldCheck, CheckCircle2, Clock, 
  AlertCircle, X, Building2, User, Mail, Phone, Shield,
  Eye, MapPin, Briefcase, FileText, CheckCircle, Check,
  Percent, Calendar, Lock, Sparkles, RefreshCw, Loader2
} from "lucide-react";
import { UserProfile, UserRole, UserStatus } from "../../types";
import { listUsers, setUserRole, setUserStatus, verifyRetailer, updateUserProfile } from "../../services/userService";

interface AdminUserManagementProps {
  onShowToast?: (msg: string) => void;
}

export default function AdminUserManagement({ onShowToast }: AdminUserManagementProps) {
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | UserRole | "pending">("all");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Inspector form states
  const [editRole, setEditRole] = useState<UserRole>("customer");
  const [editStatus, setEditStatus] = useState<UserStatus>("active");
  const [isSaving, setIsSaving] = useState(false);

  const loadAllUsers = async () => {
    setIsLoading(true);
    const users = await listUsers();
    setUsersList(users);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAllUsers();
  }, []);

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch = 
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.companyName && u.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterRole === "pending") return matchesSearch && u.status === "pending";
    if (filterRole !== "all") return matchesSearch && u.role === filterRole;
    return matchesSearch;
  });

  const handleOpenInspector = (user: UserProfile) => {
    setSelectedUser(user);
    setEditRole(user.role || "customer");
    setEditStatus(user.status || "active");
    setIsInspectorOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    setIsSaving(true);

    try {
      await updateUserProfile(selectedUser.uid, {
        role: editRole,
        status: editStatus,
        isVerifiedRetailer: editRole === "retailer",
      });

      if (onShowToast) onShowToast(`User account ${selectedUser.email} updated.`);
      setIsInspectorOpen(false);
      loadAllUsers();
    } catch (err) {
      console.error("Error updating user:", err);
      if (onShowToast) onShowToast("Failed to update user.");
    } finally {
      setIsSaving(false);
    }
  };

  // Exactly matches the 6 fields from My Account -> My Profile Details
  const calculateProfileCompleteness = (u: UserProfile) => {
    const fields = [
      { 
        name: "Full Name", 
        value: u.name,
        filled: !!u.name && u.name.trim() !== "" && u.name.trim().toLowerCase() !== "valued user" 
      },
      { 
        name: "Designation / Role", 
        value: u.designation,
        filled: !!u.designation && u.designation.trim() !== "" 
      },
      { 
        name: "Registered Email", 
        value: u.email,
        filled: !!u.email && u.email.trim() !== "" 
      },
      { 
        name: "Mobile / WhatsApp", 
        value: u.phone,
        filled: !!u.phone && u.phone.trim() !== "" 
      },
      { 
        name: "Company Name", 
        value: u.companyName,
        filled: !!u.companyName && u.companyName.trim() !== "" 
      },
      { 
        name: "Delivery / Business Address", 
        value: u.address,
        filled: !!u.address && u.address.trim() !== "" 
      },
    ];

    const filledCount = fields.filter((f) => f.filled).length;
    const percentage = Math.round((filledCount / fields.length) * 100);

    return {
      fields,
      filledCount,
      totalCount: fields.length,
      percentage,
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Users size={20} className="text-[#0f4c81]" />
            <span>User Directory & Role-Based Access Control (RBAC)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            View registered user profiles, profile completion progress, and manage administrative roles.
          </p>
        </div>

        {/* User Counts */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full font-bold border border-blue-200">
            {usersList.length} Accounts
          </span>
          <span className="px-3 py-1 bg-amber-50 text-amber-800 rounded-full font-bold border border-amber-200">
            {usersList.filter((u) => u.role === "retailer").length} Retailers
          </span>
          <span className="px-3 py-1 bg-purple-50 text-purple-800 rounded-full font-bold border border-purple-200">
            {usersList.filter((u) => u.role === "admin" || u.role === "superAdmin").length} Admins
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Name, Email, or Company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0f4c81] shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterRole("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
              filterRole === "all" ? "bg-[#0f4c81] text-white font-extrabold shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            All Roles ({usersList.length})
          </button>
          <button
            onClick={() => setFilterRole("customer")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
              filterRole === "customer" ? "bg-[#0f4c81] text-white font-extrabold shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => setFilterRole("retailer")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
              filterRole === "retailer" ? "bg-[#0f4c81] text-white font-extrabold shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            Verified Retailers
          </button>
          <button
            onClick={() => setFilterRole("sales")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
              filterRole === "sales" ? "bg-[#0f4c81] text-white font-extrabold shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            Sales Team
          </button>
          <button
            onClick={() => setFilterRole("admin")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
              filterRole === "admin" ? "bg-[#0f4c81] text-white font-extrabold shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            Admins
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider font-extrabold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">User Identity</th>
                  <th className="px-4 py-3.5">Company / Entity</th>
                  <th className="px-4 py-3.5">Profile Status</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Last Login</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const completeness = calculateProfileCompleteness(u);

                  return (
                    <tr key={u.uid} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-900">{u.name || "Customer Account"}</div>
                        <div className="text-slate-500 text-[11px]">{u.email}</div>
                      </td>

                      <td className="px-4 py-4">
                        {u.companyName ? (
                          <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            <Building2 size={13} className="text-[#0f4c81] shrink-0" />
                            <span>{u.companyName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Individual Account</span>
                        )}
                      </td>

                      {/* Profile Completeness Meter (6 Profile Fields) */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div
                              className={`h-full rounded-full transition-all ${
                                completeness.percentage >= 80 ? "bg-emerald-500" :
                                completeness.percentage >= 50 ? "bg-blue-500" :
                                "bg-amber-400"
                              }`}
                              style={{ width: `${completeness.percentage}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700">
                            {completeness.percentage}% ({completeness.filledCount}/6)
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          u.role === "admin" || u.role === "superAdmin" ? "bg-purple-100 text-purple-800 border border-purple-200" :
                          u.role === "retailer" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                          u.role === "sales" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                          "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}>
                          {u.role || "customer"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          u.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          u.status === "pending" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}>
                          {u.status || "active"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-slate-500 text-[10px]">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "Active Session"}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenInspector(u)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-[#0f4c81] hover:text-white text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer border border-slate-200 flex items-center gap-1.5 shadow-2xs"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <Users size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="font-bold text-slate-800">No Users Found</p>
            <p className="text-xs text-slate-400">Users created via authentication or registration will be listed here.</p>
          </div>
        )}
      </div>

      {/* User Profile View & RBAC Modal */}
      {isInspectorOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#031b4e] text-white flex items-center justify-center font-bold text-sm">
                  {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <span>{selectedUser.name || "Customer Account"}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      selectedUser.role === "admin" ? "bg-purple-100 text-purple-800" :
                      selectedUser.role === "retailer" ? "bg-amber-100 text-amber-800" :
                      "bg-blue-50 text-blue-700"
                    }`}>
                      {selectedUser.role || "customer"}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">{selectedUser.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsInspectorOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto text-xs">
              
              {/* Profile Completion Meter (Exact 6 Fields from My Profile) */}
              {(() => {
                const comp = calculateProfileCompleteness(selectedUser);
                return (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-[#0f4c81]" />
                        <span className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">
                          Profile Completion Status
                        </span>
                      </div>
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900">
                        {comp.percentage}% Complete ({comp.filledCount} of 6 fields)
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          comp.percentage >= 80 ? "bg-emerald-500" :
                          comp.percentage >= 50 ? "bg-blue-600" :
                          "bg-amber-400"
                        }`}
                        style={{ width: `${comp.percentage}%` }}
                      />
                    </div>

                    {/* Exact 6 Profile Questions Overview */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                      {comp.fields.map((f, idx) => (
                        <div key={idx} className={`p-2 rounded-xl text-[10px] flex items-center gap-1.5 border ${
                          f.filled ? "bg-emerald-50/70 border-emerald-200 text-emerald-800 font-bold" : "bg-slate-100 border-slate-200 text-slate-400 font-normal"
                        }`}>
                          {f.filled ? (
                            <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border border-slate-300 shrink-0" />
                          )}
                          <span className="truncate">{f.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Exact 6 Profile Details from My Profile */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <User size={13} className="text-[#0f4c81]" />
                  <span>My Profile Details (Submitted by User)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Field 1: Full Name */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Full Name *</span>
                    <span className="font-bold text-slate-900">{selectedUser.name || "—"}</span>
                  </div>

                  {/* Field 2: Designation / Role */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Designation / Role</span>
                    <span className="font-semibold text-slate-900">{selectedUser.designation || "—"}</span>
                  </div>

                  {/* Field 3: Registered Email */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Registered Email</span>
                    <span className="font-bold text-slate-900">{selectedUser.email || "—"}</span>
                  </div>

                  {/* Field 4: Mobile / WhatsApp */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Mobile / WhatsApp</span>
                    <span className="font-semibold text-slate-900">{selectedUser.phone || "—"}</span>
                  </div>

                  {/* Field 5: Company Name */}
                  <div className="col-span-1 sm:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Company Name</span>
                    <span className="font-semibold text-slate-900">{selectedUser.companyName || "—"}</span>
                  </div>

                  {/* Field 6: Delivery / Business Address */}
                  <div className="col-span-1 sm:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Delivery / Business Address</span>
                    <span className="font-semibold text-slate-900">{selectedUser.address || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Registered Date Timestamp */}
              <div className="pt-2 flex items-center justify-end text-[11px] text-slate-400 border-t border-slate-100">
                <span>Account Created: <strong className="text-slate-700">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "Active"}</strong></span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsInspectorOpen(false)}
                className="px-5 py-2 bg-[#031b4e] hover:bg-[#0f4c81] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
