import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, Upload, X, Image as ImageIcon } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  gradient: string;
  cta_text: string;
  cta_link: string;
  location: string;
  position: number;
  is_active: boolean;
  created_at: string;
}

const LOCATIONS = [
  { id: "shop_home", label: "Shop Home Carousel" },
  { id: "pet_shop", label: "Pet Shop Banner" },
  { id: "buyer_home", label: "Buyer Home Carousel" },
];

const GRADIENT_PRESETS = [
  "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)",
  "linear-gradient(135deg, #0ea5e9, #6366f1, #8b5cf6)",
  "linear-gradient(135deg, #f59e0b, #ef4444, #ec4899)",
  "linear-gradient(135deg, #10b981, #14b8a6, #0ea5e9)",
  "linear-gradient(135deg, #ec4899, #f43f5e, #f59e0b)",
  "linear-gradient(135deg, #1e293b, #334155, #475569)",
];

const emptyBanner = {
  title: "", subtitle: "", image_url: "", gradient: GRADIENT_PRESETS[0],
  cta_text: "Shop Now", cta_link: "", location: "shop_home", position: 0, is_active: true,
};

const AdminBanners = () => {
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLocation, setFilterLocation] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyBanner);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("location")
      .order("position");
    if (error) toast({ title: "Error fetching banners", variant: "destructive" });
    setBanners((data as Banner[]) || []);
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `banners/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("banner-images").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("banner-images").getPublicUrl(path);
    setForm(f => ({ ...f, image_url: urlData.publicUrl }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title && !form.image_url) {
      toast({ title: "Title or image required", variant: "destructive" });
      return;
    }

    if (editingId) {
      const { error } = await supabase.from("banners").update({
        title: form.title, subtitle: form.subtitle, image_url: form.image_url,
        gradient: form.gradient, cta_text: form.cta_text, cta_link: form.cta_link,
        location: form.location, position: form.position, is_active: form.is_active,
        updated_at: new Date().toISOString(),
      }).eq("id", editingId);
      if (error) toast({ title: "Update failed", variant: "destructive" });
      else toast({ title: "Banner updated" });
    } else {
      const { error } = await supabase.from("banners").insert({
        title: form.title, subtitle: form.subtitle, image_url: form.image_url,
        gradient: form.gradient, cta_text: form.cta_text, cta_link: form.cta_link,
        location: form.location, position: form.position, is_active: form.is_active,
      });
      if (error) toast({ title: "Create failed", variant: "destructive" });
      else toast({ title: "Banner created" });
    }
    setShowForm(false);
    setEditingId(null);
    setForm(emptyBanner);
    fetchBanners();
  };

  const handleEdit = (b: Banner) => {
    setForm({
      title: b.title, subtitle: b.subtitle, image_url: b.image_url,
      gradient: b.gradient, cta_text: b.cta_text, cta_link: b.cta_link,
      location: b.location, position: b.position, is_active: b.is_active,
    });
    setEditingId(b.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", variant: "destructive" });
    else { toast({ title: "Banner deleted" }); fetchBanners(); }
  };

  const toggleActive = async (b: Banner) => {
    await supabase.from("banners").update({ is_active: !b.is_active, updated_at: new Date().toISOString() }).eq("id", b.id);
    fetchBanners();
  };

  const filtered = filterLocation === "all" ? banners : banners.filter(b => b.location === filterLocation);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-xl md:text-[28px] font-bold text-[hsl(220,20%,15%)]">Banner Management</h1>
          <p className="text-xs md:text-sm text-[hsl(220,15%,55%)] mt-1">Manage promotional banners across all app sections</p>
        </div>
        <button
          onClick={() => { setForm(emptyBanner); setEditingId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-[hsl(220,80%,50%)] hover:bg-[hsl(220,80%,45%)] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      {/* Location Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilterLocation("all")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterLocation === "all" ? "bg-[hsl(220,80%,50%)] text-white" : "bg-white border border-[hsl(220,20%,88%)] text-[hsl(220,20%,30%)] hover:bg-[hsl(220,20%,96%)]"}`}
        >
          All ({banners.length})
        </button>
        {LOCATIONS.map(loc => {
          const count = banners.filter(b => b.location === loc.id).length;
          return (
            <button key={loc.id}
              onClick={() => setFilterLocation(loc.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterLocation === loc.id ? "bg-[hsl(220,80%,50%)] text-white" : "bg-white border border-[hsl(220,20%,88%)] text-[hsl(220,20%,30%)] hover:bg-[hsl(220,20%,96%)]"}`}
            >
              {loc.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[hsl(220,20%,15%)]">{editingId ? "Edit Banner" : "Create Banner"}</h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); }}>
                <X className="w-5 h-5 text-[hsl(220,15%,55%)]" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="text-sm font-medium text-[hsl(220,20%,25%)] mb-1.5 block">Banner Image</label>
                {form.image_url ? (
                  <div className="relative rounded-xl overflow-hidden h-36 bg-[hsl(220,20%,96%)]">
                    <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setForm(f => ({ ...f, image_url: "" }))}
                      className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-36 rounded-xl border-2 border-dashed border-[hsl(220,20%,85%)] bg-[hsl(220,20%,98%)] cursor-pointer hover:bg-[hsl(220,20%,96%)] transition-colors">
                    {uploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(220,80%,50%)]" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-[hsl(220,15%,60%)] mb-2" />
                        <span className="text-sm text-[hsl(220,15%,55%)]">Upload image</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-medium text-[hsl(220,20%,25%)] mb-1.5 block">Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[hsl(220,20%,88%)] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(220,80%,50%)]/30"
                  placeholder="e.g. Premium Pet Food" />
              </div>

              {/* Subtitle */}
              <div>
                <label className="text-sm font-medium text-[hsl(220,20%,25%)] mb-1.5 block">Subtitle</label>
                <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[hsl(220,20%,88%)] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(220,80%,50%)]/30"
                  placeholder="e.g. Up to 40% Off" />
              </div>

              {/* Gradient */}
              <div>
                <label className="text-sm font-medium text-[hsl(220,20%,25%)] mb-1.5 block">Overlay Gradient</label>
                <div className="flex gap-2 flex-wrap">
                  {GRADIENT_PRESETS.map((g, i) => (
                    <button key={i} onClick={() => setForm(f => ({ ...f, gradient: g }))}
                      className={`w-10 h-10 rounded-xl border-2 transition-all ${form.gradient === g ? "border-[hsl(220,80%,50%)] scale-110" : "border-transparent"}`}
                      style={{ background: g }} />
                  ))}
                </div>
                <input value={form.gradient} onChange={e => setForm(f => ({ ...f, gradient: e.target.value }))}
                  className="w-full mt-2 px-4 py-2 rounded-xl border border-[hsl(220,20%,88%)] text-xs focus:outline-none"
                  placeholder="Custom CSS gradient" />
              </div>

              {/* CTA */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-[hsl(220,20%,25%)] mb-1.5 block">CTA Text</label>
                  <input value={form.cta_text} onChange={e => setForm(f => ({ ...f, cta_text: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-[hsl(220,20%,88%)] text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[hsl(220,20%,25%)] mb-1.5 block">CTA Link</label>
                  <input value={form.cta_link} onChange={e => setForm(f => ({ ...f, cta_link: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-[hsl(220,20%,88%)] text-sm focus:outline-none"
                    placeholder="/shop or URL" />
                </div>
              </div>

              {/* Location & Position */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-[hsl(220,20%,25%)] mb-1.5 block">Location</label>
                  <select value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-[hsl(220,20%,88%)] text-sm focus:outline-none bg-white">
                    {LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[hsl(220,20%,25%)] mb-1.5 block">Position</label>
                  <input type="number" value={form.position} onChange={e => setForm(f => ({ ...f, position: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-[hsl(220,20%,88%)] text-sm focus:outline-none" min={0} />
                </div>
              </div>

              {/* Active */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                  className="w-5 h-5 rounded" />
                <span className="text-sm font-medium text-[hsl(220,20%,25%)]">Active (visible to users)</span>
              </label>

              {/* Preview */}
              {(form.title || form.image_url) && (
                <div>
                  <label className="text-sm font-medium text-[hsl(220,20%,25%)] mb-1.5 block">Preview</label>
                  <div className="relative rounded-2xl overflow-hidden h-32" style={{ background: form.gradient }}>
                    <div className="flex items-center h-full">
                      <div className="flex-1 p-4">
                        <h3 className="text-white text-lg font-bold leading-tight whitespace-pre-line">{form.title || "Title"}</h3>
                        <p className="text-white/80 text-xs mt-1 whitespace-pre-line">{form.subtitle}</p>
                        {form.cta_text && <button className="mt-2 bg-white text-black text-xs font-semibold px-3 py-1 rounded-full">{form.cta_text}</button>}
                      </div>
                      {form.image_url && (
                        <div className="w-28 h-full flex-shrink-0">
                          <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[hsl(220,20%,88%)] text-sm font-medium text-[hsl(220,20%,30%)]">
                  Cancel
                </button>
                <button onClick={handleSave}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-[hsl(220,80%,50%)] hover:bg-[hsl(220,80%,45%)]">
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[hsl(220,80%,50%)]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[hsl(220,20%,92%)] p-12 text-center">
          <ImageIcon className="w-12 h-12 mx-auto text-[hsl(220,15%,75%)] mb-3" />
          <p className="text-[hsl(220,15%,55%)] text-sm">No banners yet. Click "Add Banner" to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(b => (
            <div key={b.id} className={`bg-white rounded-2xl border overflow-hidden transition-all ${b.is_active ? "border-[hsl(220,20%,92%)]" : "border-[hsl(0,0%,85%)] opacity-60"}`}>
              {/* Banner Preview */}
              <div className="relative h-32 overflow-hidden" style={{ background: b.gradient }}>
                <div className="flex items-center h-full">
                  <div className="flex-1 p-4">
                    <h3 className="text-white text-base font-bold leading-tight whitespace-pre-line line-clamp-2">{b.title || "No title"}</h3>
                    <p className="text-white/80 text-xs mt-1 line-clamp-1">{b.subtitle}</p>
                    {b.cta_text && <span className="inline-block mt-2 bg-white text-black text-[10px] font-semibold px-2.5 py-0.5 rounded-full">{b.cta_text}</span>}
                  </div>
                  {b.image_url && (
                    <div className="w-28 h-full flex-shrink-0">
                      <img src={b.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                {/* Location Badge */}
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/40 text-white text-[10px] font-semibold rounded-lg backdrop-blur-sm">
                  {LOCATIONS.find(l => l.id === b.location)?.label || b.location}
                </span>
              </div>

              {/* Actions */}
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[hsl(220,15%,55%)]">Position: {b.position}</span>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${b.is_active ? "bg-[hsl(145,50%,92%)] text-[hsl(145,60%,35%)]" : "bg-[hsl(0,0%,92%)] text-[hsl(0,0%,45%)]"}`}>
                    {b.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleActive(b)} className="p-2 rounded-lg hover:bg-[hsl(220,20%,96%)] transition-colors" title={b.is_active ? "Deactivate" : "Activate"}>
                    {b.is_active ? <EyeOff className="w-4 h-4 text-[hsl(220,15%,55%)]" /> : <Eye className="w-4 h-4 text-[hsl(220,15%,55%)]" />}
                  </button>
                  <button onClick={() => handleEdit(b)} className="p-2 rounded-lg hover:bg-[hsl(220,20%,96%)] transition-colors">
                    <Pencil className="w-4 h-4 text-[hsl(220,80%,50%)]" />
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="p-2 rounded-lg hover:bg-[hsl(0,80%,96%)] transition-colors">
                    <Trash2 className="w-4 h-4 text-[hsl(0,70%,50%)]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
