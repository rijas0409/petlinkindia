import { AdminData } from "@/pages/AdminDashboard";
import { useState } from "react";
import { Search, CheckCircle2, XCircle, Eye, Star } from "lucide-react";

interface Props {
  data: AdminData;
  actions: any;
}

const AdminVets = ({ data, actions }: Props) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = data.allVets.filter((v: any) => {
    const matchSearch = !search || v.profile?.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || v.verification_status === filter;
    return matchSearch && matchFilter;
  });

  const pendingVets = data.pendingVets;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[hsl(220,20%,15%)]">Veterinary Management</h1>
          <p className="text-sm text-[hsl(220,15%,55%)] mt-1">Manage all registered veterinary doctors</p>
        </div>
      </div>

      {/* Pending Vet Approvals */}
      {pendingVets.length > 0 && (
        <div className="bg-white rounded-2xl border border-[hsl(220,20%,92%)] p-6 mb-6">
          <h2 className="text-lg font-bold text-[hsl(220,20%,15%)] mb-4 flex items-center gap-2">
            Pending Verifications
            <span className="px-2.5 py-0.5 bg-[hsl(0,75%,55%)] text-white text-[11px] font-bold rounded-full">{pendingVets.length}</span>
          </h2>
          <div className="space-y-3">
            {pendingVets.map((vet: any) => (
              <div key={vet.id} className="flex items-center justify-between p-4 bg-[hsl(40,60%,97%)] rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-[hsl(220,20%,94%)]">
                    {vet.profile?.profile_photo ? (
                      <img src={vet.profile.profile_photo} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[hsl(220,15%,55%)] font-bold">{(vet.profile?.name || "V")[0]}</div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-[hsl(220,20%,15%)]">{vet.profile?.name || "Doctor"}</p>
                    <p className="text-[12px] text-[hsl(220,15%,55%)]">{vet.qualification} • {vet.years_of_experience} yrs exp</p>
                    <p className="text-[12px] text-[hsl(220,15%,55%)]">{vet.specializations?.join(", ")}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => actions.approveVet(vet.user_id)} className="px-4 py-2 bg-[hsl(220,80%,50%)] text-white text-[12px] font-medium rounded-lg hover:bg-[hsl(220,80%,45%)] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button onClick={() => actions.rejectVet(vet.user_id)} className="px-4 py-2 border border-[hsl(0,60%,70%)] text-[hsl(0,65%,50%)] text-[12px] font-medium rounded-lg hover:bg-[hsl(0,60%,97%)] flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Vets Table */}
      <div className="bg-white rounded-2xl border border-[hsl(220,20%,92%)] p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(220,15%,60%)]" />
            <input type="text" placeholder="Search vets..." value={search} onChange={(e) => setSearch(e.target.value)}
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
              <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Doctor</th>
              <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Qualification</th>
              <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Specializations</th>
              <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Rating</th>
              <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Status</th>
              <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Fee (Online)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-[hsl(220,15%,60%)]">No vets found</td></tr>
            ) : (
              filtered.map((v: any) => (
                <tr key={v.id} className="border-b border-[hsl(220,20%,95%)] hover:bg-[hsl(220,20%,98%)]">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[hsl(220,20%,94%)] flex items-center justify-center text-[12px] font-bold text-[hsl(220,15%,45%)]">
                        {(v.profile?.name || "V")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-[hsl(220,20%,15%)]">{v.profile?.name || "Doctor"}</p>
                        <p className="text-[11px] text-[hsl(220,15%,60%)]">{v.years_of_experience} yrs exp</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-[hsl(220,15%,45%)]">{v.qualification}</td>
                  <td className="py-3 text-[hsl(220,15%,45%)]">{v.specializations?.slice(0, 2).join(", ") || "—"}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-[hsl(40,90%,50%)] text-[hsl(40,90%,50%)]" />
                      <span className="text-[hsl(220,20%,15%)] font-medium">{v.average_rating || "0"}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                      v.verification_status === "verified" ? "bg-[hsl(145,50%,92%)] text-[hsl(145,60%,35%)]" :
                      v.verification_status === "pending" ? "bg-[hsl(40,60%,92%)] text-[hsl(40,70%,35%)]" :
                      "bg-[hsl(0,50%,93%)] text-[hsl(0,65%,45%)]"
                    }`}>{v.verification_status}</span>
                  </td>
                  <td className="py-3 font-medium text-[hsl(220,20%,15%)]">₹{v.online_fee}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminVets;
