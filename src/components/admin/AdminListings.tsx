import { AdminData } from "@/pages/AdminDashboard";
import { useState } from "react";
import { Search, CheckCircle2, XCircle, PawPrint, RefreshCw, Eye, X, MapPin, Calendar, Weight, Ruler, Dna, Heart, FileText, Camera, Syringe, ShieldCheck } from "lucide-react";

interface Props {
  data: AdminData;
  actions: any;
}

const DocViewer = ({ label, url }: { label: string; url: string | null }) => {
  if (!url) return (
    <div className="flex items-center gap-2 p-3 bg-[hsl(0,50%,97%)] rounded-xl border border-[hsl(0,40%,90%)]">
      <FileText className="w-4 h-4 text-[hsl(0,50%,60%)]" />
      <span className="text-sm text-[hsl(0,50%,50%)]">{label}: Not uploaded</span>
    </div>
  );
  const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i);
  return (
    <div className="rounded-xl border border-[hsl(220,20%,90%)] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(220,20%,97%)]">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[hsl(220,80%,50%)]" />
          <span className="text-sm font-medium text-[hsl(220,20%,25%)]">{label}</span>
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium text-[hsl(220,80%,50%)] hover:underline">Open Full</a>
      </div>
      {isImage ? (
        <img src={url} alt={label} className="w-full max-h-[200px] object-contain bg-[hsl(220,20%,98%)]" />
      ) : (
        <div className="p-4 bg-[hsl(220,20%,98%)] text-center">
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-[hsl(220,80%,50%)] hover:underline">View Document ↗</a>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | null | undefined }) => (
  <div className="flex items-start gap-3 py-2">
    <Icon className="w-4 h-4 text-[hsl(220,15%,55%)] mt-0.5 shrink-0" />
    <div>
      <p className="text-[11px] text-[hsl(220,15%,60%)] uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-[hsl(220,20%,15%)]">{value || "Not provided"}</p>
    </div>
  </div>
);

const AdminListings = ({ data, actions }: Props) => {
  const [tab, setTab] = useState<"pending" | "reverify">("pending");
  const [selectedPet, setSelectedPet] = useState<any>(null);

  const items = tab === "pending" ? data.pendingPets : data.reVerificationPets;
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[hsl(220,20%,15%)]">Pet Listings</h1>
        <p className="text-sm text-[hsl(220,15%,55%)] mt-1">Verify new pet listings and re-verification requests</p>
      </div>

      {/* Pet Detail Modal */}
      {selectedPet && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={() => setSelectedPet(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-[hsl(220,20%,92%)] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div>
                <h2 className="text-lg font-bold text-[hsl(220,20%,15%)]">Pet Listing Review</h2>
                <p className="text-[12px] text-[hsl(220,15%,55%)]">Listed {new Date(selectedPet.created_at).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setSelectedPet(null)} className="w-8 h-8 rounded-lg bg-[hsl(220,20%,96%)] flex items-center justify-center hover:bg-[hsl(220,20%,92%)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Pet Images Gallery */}
              {selectedPet.images && selectedPet.images.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-[hsl(220,20%,15%)] mb-3 flex items-center gap-2"><Camera className="w-4 h-4" /> Pet Photos ({selectedPet.images.length})</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedPet.images.map((img: string, i: number) => (
                      <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-xl overflow-hidden bg-[hsl(220,20%,94%)] hover:opacity-80 transition-opacity">
                        <img src={img} alt={`Pet ${i + 1}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {selectedPet.videos && selectedPet.videos.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-[hsl(220,20%,15%)] mb-3">Videos ({selectedPet.videos.length})</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedPet.videos.map((vid: string, i: number) => (
                      <video key={i} src={vid} controls className="w-full rounded-xl" />
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Info */}
              <div className="bg-[hsl(220,20%,97%)] rounded-xl p-4">
                <h4 className="text-sm font-bold text-[hsl(220,20%,15%)] mb-3 flex items-center gap-2"><PawPrint className="w-4 h-4" /> Pet Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  <InfoRow icon={PawPrint} label="Name" value={selectedPet.name} />
                  <InfoRow icon={Dna} label="Breed" value={selectedPet.breed} />
                  <InfoRow icon={PawPrint} label="Category" value={selectedPet.category} />
                  <InfoRow icon={Heart} label="Gender" value={selectedPet.gender} />
                  <InfoRow icon={Calendar} label="Age" value={`${selectedPet.age_months} months ${selectedPet.age_type === "exact" ? "(exact)" : "(approx)"}`} />
                  {selectedPet.birth_date && <InfoRow icon={Calendar} label="Birth Date" value={selectedPet.birth_date} />}
                  <InfoRow icon={Ruler} label="Size" value={selectedPet.size} />
                  {selectedPet.weight_kg && <InfoRow icon={Weight} label="Weight" value={`${selectedPet.weight_kg} kg`} />}
                  <InfoRow icon={PawPrint} label="Color" value={selectedPet.color} />
                  <InfoRow icon={Dna} label="Bloodline" value={selectedPet.bloodline} />
                  <InfoRow icon={ShieldCheck} label="Microchip" value={selectedPet.microchip} />
                  <InfoRow icon={FileText} label="Registered With" value={selectedPet.registered_with} />
                </div>
              </div>

              {/* Pricing & Location */}
              <div className="bg-[hsl(145,30%,97%)] rounded-xl p-4">
                <h4 className="text-sm font-bold text-[hsl(220,20%,15%)] mb-3">Pricing & Location</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  <InfoRow icon={FileText} label="Price" value={fmt(selectedPet.price)} />
                  {selectedPet.original_price && <InfoRow icon={FileText} label="Original Price" value={fmt(selectedPet.original_price)} />}
                  <InfoRow icon={MapPin} label="Location" value={selectedPet.location} />
                  <InfoRow icon={MapPin} label="City" value={selectedPet.city} />
                  <InfoRow icon={MapPin} label="State" value={selectedPet.state} />
                </div>
              </div>

              {/* Health Info */}
              <div className="bg-[hsl(40,40%,97%)] rounded-xl p-4">
                <h4 className="text-sm font-bold text-[hsl(220,20%,15%)] mb-3 flex items-center gap-2"><Syringe className="w-4 h-4" /> Health Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  <InfoRow icon={Syringe} label="Vaccinated" value={selectedPet.vaccinated ? "Yes" : "No"} />
                  <InfoRow icon={FileText} label="Medical History" value={selectedPet.medical_history} />
                </div>
              </div>

              {/* Description */}
              {selectedPet.description && (
                <div className="bg-[hsl(220,20%,97%)] rounded-xl p-4">
                  <h4 className="text-sm font-bold text-[hsl(220,20%,15%)] mb-2">Description</h4>
                  <p className="text-sm text-[hsl(220,15%,40%)] leading-relaxed">{selectedPet.description}</p>
                </div>
              )}

              {/* Seller Info */}
              <div className="bg-[hsl(270,30%,97%)] rounded-xl p-4">
                <h4 className="text-sm font-bold text-[hsl(220,20%,15%)] mb-2">Seller Information</h4>
                <InfoRow icon={PawPrint} label="Seller Name" value={selectedPet.owner?.name} />
                <InfoRow icon={FileText} label="Seller Phone" value={selectedPet.owner?.phone} />
              </div>

              {/* Priority Badge */}
              {selectedPet.priority_fee_paid && (
                <div className="flex items-center gap-2 p-3 bg-[hsl(35,90%,95%)] rounded-xl border border-[hsl(35,80%,80%)]">
                  <ShieldCheck className="w-5 h-5 text-[hsl(35,80%,40%)]" />
                  <span className="text-sm font-semibold text-[hsl(35,80%,35%)]">Priority Verification Paid — Review within 3-4 hours</span>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="sticky bottom-0 bg-white border-t border-[hsl(220,20%,92%)] px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => { actions.rejectPet(selectedPet.id); setSelectedPet(null); }} className="px-6 py-2.5 border border-[hsl(0,60%,70%)] text-[hsl(0,65%,50%)] text-sm font-medium rounded-xl hover:bg-[hsl(0,60%,97%)] flex items-center gap-2">
                <XCircle className="w-4 h-4" /> Reject Listing
              </button>
              <button onClick={() => { actions.verifyPet(selectedPet.id); setSelectedPet(null); }} className="px-6 py-2.5 bg-[hsl(145,55%,42%)] text-white text-sm font-medium rounded-xl hover:bg-[hsl(145,55%,38%)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Approve Listing
              </button>
            </div>
          </div>
        </div>
      )}

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
                    <p className="text-[11px] text-[hsl(220,15%,60%)]">By: {pet.owner?.name || "Unknown"} • {pet.city}, {pet.state}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedPet(pet)} className="px-4 py-2 bg-white border border-[hsl(220,20%,85%)] text-[hsl(220,15%,40%)] text-[12px] font-medium rounded-lg hover:bg-[hsl(220,20%,96%)] flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Review
                  </button>
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
