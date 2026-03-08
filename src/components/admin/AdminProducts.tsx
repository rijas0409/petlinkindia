import { AdminData } from "@/pages/AdminDashboard";
import { useState } from "react";
import { Search, CheckCircle2, XCircle, Package } from "lucide-react";

interface Props {
  data: AdminData;
  actions: any;
}

const AdminProducts = ({ data, actions }: Props) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = data.allProducts.filter((p: any) => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.verification_status === filter;
    return matchSearch && matchFilter;
  });

  const pendingProducts = data.pendingProducts;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[hsl(220,20%,15%)]">Product Management</h1>
        <p className="text-sm text-[hsl(220,15%,55%)] mt-1">Manage shop products and verifications</p>
      </div>

      {/* Pending */}
      {pendingProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-[hsl(220,20%,92%)] p-6 mb-6">
          <h2 className="text-lg font-bold text-[hsl(220,20%,15%)] mb-4 flex items-center gap-2">
            Pending Verifications
            <span className="px-2.5 py-0.5 bg-[hsl(0,75%,55%)] text-white text-[11px] font-bold rounded-full">{pendingProducts.length}</span>
          </h2>
          <div className="space-y-3">
            {pendingProducts.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-[hsl(40,60%,97%)] rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-[hsl(220,20%,94%)]">
                    {p.images?.[0] ? <img src={p.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-[hsl(220,15%,60%)]" /></div>}
                  </div>
                  <div>
                    <p className="font-semibold text-[hsl(220,20%,15%)] text-sm">{p.name}</p>
                    <p className="text-[12px] text-[hsl(220,15%,55%)]">{p.brand} • ₹{p.price} • By {p.seller?.name || "Unknown"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => actions.verifyProduct(p.id)} className="px-4 py-2 bg-[hsl(220,80%,50%)] text-white text-[12px] font-medium rounded-lg hover:bg-[hsl(220,80%,45%)] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button onClick={() => actions.rejectProduct(p.id)} className="px-4 py-2 border border-[hsl(0,60%,70%)] text-[hsl(0,65%,50%)] text-[12px] font-medium rounded-lg hover:bg-[hsl(0,60%,97%)] flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Products */}
      <div className="bg-white rounded-2xl border border-[hsl(220,20%,92%)] p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(220,15%,60%)]" />
            <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[hsl(220,20%,97%)] border border-[hsl(220,20%,92%)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(220,80%,50%)]/20"
            />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2.5 border border-[hsl(220,20%,88%)] rounded-xl text-sm bg-white focus:outline-none">
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="failed">Rejected</option>
          </select>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[hsl(220,20%,92%)]">
              <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Product</th>
              <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Brand</th>
              <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Price</th>
              <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Stock</th>
              <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Status</th>
              <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Seller</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-[hsl(220,15%,60%)]">No products found</td></tr>
            ) : (
              filtered.slice(0, 50).map((p: any) => (
                <tr key={p.id} className="border-b border-[hsl(220,20%,95%)] hover:bg-[hsl(220,20%,98%)]">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-[hsl(220,20%,94%)]">
                        {p.images?.[0] ? <img src={p.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-[hsl(220,15%,60%)]" /></div>}
                      </div>
                      <p className="font-medium text-[hsl(220,20%,15%)]">{p.name}</p>
                    </div>
                  </td>
                  <td className="py-3 text-[hsl(220,15%,45%)]">{p.brand || "—"}</td>
                  <td className="py-3 font-medium text-[hsl(220,20%,15%)]">₹{p.price}</td>
                  <td className="py-3 text-[hsl(220,15%,45%)]">{p.stock}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                      p.verification_status === "verified" ? "bg-[hsl(145,50%,92%)] text-[hsl(145,60%,35%)]" :
                      p.verification_status === "pending" ? "bg-[hsl(40,60%,92%)] text-[hsl(40,70%,35%)]" :
                      "bg-[hsl(0,50%,93%)] text-[hsl(0,65%,45%)]"
                    }`}>{p.verification_status}</span>
                  </td>
                  <td className="py-3 text-[hsl(220,15%,45%)]">{p.seller?.name || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
