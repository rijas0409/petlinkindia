import { AdminData } from "@/pages/AdminDashboard";
import { useState } from "react";
import { Search, CheckCircle2, XCircle, Eye, Users, Shield, ShoppingBag, Truck as TruckIcon, Stethoscope } from "lucide-react";

interface Props {
  data: AdminData;
  actions: any;
}

const roleLabels: Record<string, { label: string; color: string; icon: any }> = {
  buyer: { label: "Buyer", color: "hsl(220,60%,50%)", icon: Users },
  seller: { label: "Pet Seller", color: "hsl(25,80%,50%)", icon: Shield },
  product_seller: { label: "Product Seller", color: "hsl(270,60%,55%)", icon: ShoppingBag },
  delivery_partner: { label: "Delivery", color: "hsl(145,60%,40%)", icon: TruckIcon },
  vet: { label: "Veterinary", color: "hsl(345,70%,55%)", icon: Stethoscope },
  admin: { label: "Admin", color: "hsl(0,70%,50%)", icon: Shield },
};

const AdminUserManagement = ({ data, actions }: Props) => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = data.allUsers.filter((u: any) => {
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const pendingApprovals = data.pendingSellers;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[hsl(220,20%,15%)]">User Management</h1>
          <p className="text-sm text-[hsl(220,15%,55%)] mt-1">Manage all platform users and pending approvals</p>
        </div>
      </div>

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <div className="bg-white rounded-2xl border border-[hsl(220,20%,92%)] p-6 mb-6">
          <h2 className="text-lg font-bold text-[hsl(220,20%,15%)] mb-4">Pending Approvals ({pendingApprovals.length})</h2>
          <div className="space-y-3">
            {pendingApprovals.map((seller: any) => (
              <div key={seller.id} className="flex items-center justify-between p-4 bg-[hsl(40,60%,97%)] rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[hsl(40,60%,90%)] flex items-center justify-center text-[hsl(40,70%,40%)] font-bold text-sm">
                    {(seller.name || "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-[hsl(220,20%,15%)] text-sm">{seller.full_name || seller.name}</p>
                    <p className="text-[12px] text-[hsl(220,15%,55%)]">{seller.email} • {seller.role?.replace("_", " ")}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => actions.approveSeller(seller.id)} className="px-4 py-2 bg-[hsl(220,80%,50%)] text-white text-[12px] font-medium rounded-lg hover:bg-[hsl(220,80%,45%)] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button onClick={() => actions.rejectSeller(seller.id)} className="px-4 py-2 border border-[hsl(0,60%,70%)] text-[hsl(0,65%,50%)] text-[12px] font-medium rounded-lg hover:bg-[hsl(0,60%,97%)] flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Users */}
      <div className="bg-white rounded-2xl border border-[hsl(220,20%,92%)] p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(220,15%,60%)]" />
            <input
              type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[hsl(220,20%,97%)] border border-[hsl(220,20%,92%)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(220,80%,50%)]/20"
            />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2.5 border border-[hsl(220,20%,88%)] rounded-xl text-sm bg-white focus:outline-none">
            <option value="all">All Roles</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Pet Sellers</option>
            <option value="product_seller">Product Sellers</option>
            <option value="vet">Vets</option>
            <option value="delivery_partner">Delivery</option>
          </select>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[hsl(220,20%,92%)]">
              <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">User</th>
              <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Role</th>
              <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Status</th>
              <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="py-8 text-center text-[hsl(220,15%,60%)]">No users found</td></tr>
            ) : (
              filtered.slice(0, 50).map((u: any) => {
                const rl = roleLabels[u.role] || roleLabels.buyer;
                return (
                  <tr key={u.id} className="border-b border-[hsl(220,20%,95%)] hover:bg-[hsl(220,20%,98%)]">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[hsl(220,20%,94%)] flex items-center justify-center text-[12px] font-bold text-[hsl(220,15%,45%)]">
                          {(u.name || "U")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-[hsl(220,20%,15%)]">{u.name}</p>
                          <p className="text-[11px] text-[hsl(220,15%,60%)]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{ backgroundColor: `${rl.color}15`, color: rl.color }}>{rl.label}</span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${u.is_admin_approved ? "bg-[hsl(145,50%,92%)] text-[hsl(145,60%,35%)]" : u.is_onboarding_complete ? "bg-[hsl(40,60%,92%)] text-[hsl(40,70%,35%)]" : "bg-[hsl(220,20%,94%)] text-[hsl(220,15%,55%)]"}`}>
                        {u.is_admin_approved ? "Approved" : u.is_onboarding_complete ? "Pending" : "Active"}
                      </span>
                    </td>
                    <td className="py-3 text-[hsl(220,15%,60%)]">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserManagement;
