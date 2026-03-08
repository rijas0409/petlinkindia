import { AdminData } from "@/pages/AdminDashboard";
import { useState } from "react";
import { Search, CheckCircle2, XCircle, PawPrint, RefreshCw } from "lucide-react";

interface Props {
  data: AdminData;
  actions: any;
}

const AdminListings = ({ data, actions }: Props) => {
  const [tab, setTab] = useState<"pending" | "reverify">("pending");

  const items = tab === "pending" ? data.pendingPets : data.reVerificationPets;

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[hsl(220,20%,15%)]">Pet Listings</h1>
        <p className="text-sm text-[hsl(220,15%,55%)] mt-1">Verify new pet listings and re-verification requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("pending")} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === "pending" ? "bg-[hsl(220,80%,50%)] text-white" : "bg-white border border-[hsl(220,20%,88%)] text-[hsl(220,15%,45%)]"}`}>
          New Listings ({data.pendingPets.length})
        </button>
        <button onClick={() => setTab("reverify")} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === "reverify" ? "bg-[hsl(220,80%,50%)] text-white" : "bg-white border border-[hsl(220,20%,88%)] text-[hsl(220,15%,45%)]"}`}>
          <RefreshCw className="w-4 h-4 inline mr-1" /> Re-verification ({data.reVerificationPets.length})
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[hsl(220,20%,92%)] p-6">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <PawPrint className="w-12 h-12 mx-auto text-[hsl(220,15%,80%)] mb-3" />
            <p className="text-[hsl(220,15%,60%)]">No {tab === "pending" ? "pending" : "re-verification"} listings</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((pet: any) => (
              <div key={pet.id} className={`flex items-center justify-between p-4 rounded-xl ${tab === "reverify" ? "bg-[hsl(270,40%,97%)]" : "bg-[hsl(220,20%,97%)]"}`}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-[hsl(220,20%,94%)]">
                    {pet.images?.[0] ? <img src={pet.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><PawPrint className="w-6 h-6 text-[hsl(220,15%,60%)]" /></div>}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[hsl(220,20%,15%)]">{pet.name}</p>
                      {pet.priority_fee_paid && <span className="px-2 py-0.5 bg-[hsl(35,90%,90%)] text-[hsl(35,80%,35%)] text-[10px] font-bold rounded-md">PRIORITY</span>}
                      {tab === "reverify" && <span className="px-2 py-0.5 bg-[hsl(270,40%,92%)] text-[hsl(270,60%,45%)] text-[10px] font-bold rounded-md">EDITED</span>}
                    </div>
                    <p className="text-[12px] text-[hsl(220,15%,55%)]">{pet.breed} • {pet.category} • {fmt(pet.price)}</p>
                    <p className="text-[11px] text-[hsl(220,15%,60%)]">By: {pet.owner?.name || "Unknown"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => actions.verifyPet(pet.id)} className="px-4 py-2 bg-[hsl(220,80%,50%)] text-white text-[12px] font-medium rounded-lg hover:bg-[hsl(220,80%,45%)] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button onClick={() => actions.rejectPet(pet.id)} className="px-4 py-2 border border-[hsl(0,60%,70%)] text-[hsl(0,65%,50%)] text-[12px] font-medium rounded-lg hover:bg-[hsl(0,60%,97%)] flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminListings;
