import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PET_CATEGORIES, PET_NAMES } from "@/lib/shopData";
import {
  ArrowLeft, ArrowRight, Heart, Loader2, Upload, X, Plus, Trash2,
  ImageIcon, FileText, IndianRupee, Package, Truck, Shield, Eye, Video, Camera, Check
} from "lucide-react";

const ALL_PET_TYPES = Object.keys(PET_NAMES);

const DOG_BREEDS = ["Golden Retriever", "Labrador", "Pomeranian", "German Shepherd", "Beagle", "Pug", "Rottweiler", "Shih Tzu", "Husky", "Doberman", "All Breeds"];
const CAT_BREEDS = ["Persian", "Siamese", "Maine Coon", "Ragdoll", "Bengal", "British Shorthair", "Sphynx", "All Breeds"];

const STEPS = [
  { id: 1, title: "Media", icon: ImageIcon, desc: "Upload photos & videos" },
  { id: 2, title: "Basic Info", icon: FileText, desc: "Product details" },
  { id: 3, title: "Pricing", icon: IndianRupee, desc: "Set your price" },
  { id: 4, title: "Inventory", icon: Package, desc: "Stock & variants" },
  { id: 5, title: "Shipping", icon: Truck, desc: "Location & delivery" },
  { id: 6, title: "Documents", icon: FileText, desc: "Certificates" },
  { id: 7, title: "Compliance", icon: Shield, desc: "Regulations" },
  { id: 8, title: "Preview", icon: Eye, desc: "Review & submit" },
];

interface VariantItem { type: string; value: string; }
interface FeedingRow { weight: string; serving: string; }

const AddProduct = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Step 1 - Media
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [videos, setVideos] = useState<{ file: File; preview: string }[]>([]);

  // Step 2 - Basic Info
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [petType, setPetType] = useState("");
  const [category, setCategory] = useState("");
  const [breedApplicable, setBreedApplicable] = useState<string[]>([]);
  const [sku, setSku] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("India");
  const [description, setDescription] = useState("");
  const [highlights, setHighlights] = useState<string[]>([""]);

  // Step 3 - Pricing
  const [sellingPrice, setSellingPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [gstInclusive, setGstInclusive] = useState(true);
  const [taxPercentage, setTaxPercentage] = useState("");

  // Step 4 - Inventory
  const [stock, setStock] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("piece");
  const [variants, setVariants] = useState<VariantItem[]>([]);
  const [lowStockAlert, setLowStockAlert] = useState(false);

  // Step 5 - Shipping
  const [dispatchCity, setDispatchCity] = useState("");
  const [handlingTime, setHandlingTime] = useState("");
  const [shippingFree, setShippingFree] = useState(true);
  const [shippingCharges, setShippingCharges] = useState("");
  const [deliveryScope, setDeliveryScope] = useState("pan_india");

  // Step 6 - Documents
  const [gstCertFile, setGstCertFile] = useState<File | null>(null);
  const [tradeLicenseFile, setTradeLicenseFile] = useState<File | null>(null);
  const [fssaiFile, setFssaiFile] = useState<File | null>(null);
  const [brandAuthFile, setBrandAuthFile] = useState<File | null>(null);

  // Step 7 - Compliance
  const [expiryDate, setExpiryDate] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [storageInstructions, setStorageInstructions] = useState("");
  const [returnPolicy, setReturnPolicy] = useState("");
  const [warranty, setWarranty] = useState("");

  // Step 8 - Preview extras
  const [feedingGuide, setFeedingGuide] = useState<FeedingRow[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([""]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth-products"); return; }
      setUser(session.user);
    };
    init();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 20) { toast.error("Maximum 20 images"); return; }
    const newImages = files.filter(f => f.type.startsWith("image/")).map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setImages(prev => [...prev, ...newImages]);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (videos.length + files.length > 2) { toast.error("Maximum 2 videos"); return; }
    const newVideos = files.filter(f => f.type.startsWith("video/") && f.size <= 50 * 1024 * 1024).map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setVideos(prev => [...prev, ...newVideos]);
  };

  const discount = mrp && sellingPrice ? Math.round(((parseFloat(mrp) - parseFloat(sellingPrice)) / parseFloat(mrp)) * 100) : 0;
  const categories = petType ? (PET_CATEGORIES[petType] || []) : [];
  const breedOptions = petType === "dog" ? DOG_BREEDS : petType === "cat" ? CAT_BREEDS : [];

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: if (images.length === 0) { toast.error("Upload at least one image"); return false; } return true;
      case 2: if (!name || !brand || !petType || !category) { toast.error("Fill all required fields"); return false; } return true;
      case 3: if (!sellingPrice) { toast.error("Enter selling price"); return false; } return true;
      case 4: if (!stock) { toast.error("Enter stock quantity"); return false; } return true;
      default: return true;
    }
  };

  const handleNext = () => { if (validateStep(currentStep)) setCurrentStep(prev => Math.min(prev + 1, STEPS.length)); };
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const uploadFile = async (file: File, bucket: string, folder: string) => {
    const ext = file.name.split('.').pop();
    const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (isDraft = false) => {
    if (!isDraft && !validateStep(currentStep)) return;
    if (!user) return;
    setIsLoading(true);
    try {
      const imageUrls = await Promise.all(images.map(i => uploadFile(i.file, "product-images", user.id)));
      const videoUrls = await Promise.all(videos.map(v => uploadFile(v.file, "product-images", user.id)));

      let gstCertUrl = null, tradeLicUrl = null, fssaiUrl = null, brandAuthUrl = null;
      if (gstCertFile) gstCertUrl = await uploadFile(gstCertFile, "product-images", `${user.id}/docs`);
      if (tradeLicenseFile) tradeLicUrl = await uploadFile(tradeLicenseFile, "product-images", `${user.id}/docs`);
      if (fssaiFile) fssaiUrl = await uploadFile(fssaiFile, "product-images", `${user.id}/docs`);
      if (brandAuthFile) brandAuthUrl = await uploadFile(brandAuthFile, "product-images", `${user.id}/docs`);

      const { error } = await supabase.from("shop_products").insert({
        seller_id: user.id,
        name, brand, pet_type: petType, category, sku: sku || null,
        country_of_origin: countryOfOrigin || null,
        description: description || null,
        highlights: highlights.filter(h => h.trim()),
        ingredients: ingredients.filter(i => i.trim()),
        feeding_guide: feedingGuide.length > 0 ? feedingGuide : [],
        price: parseFloat(sellingPrice),
        original_price: mrp ? parseFloat(mrp) : parseFloat(sellingPrice),
        discount: discount > 0 ? discount : 0,
        gst_inclusive: gstInclusive,
        tax_percentage: taxPercentage ? parseFloat(taxPercentage) : 0,
        stock: parseInt(stock) || 0,
        weight: weight || null, unit,
        variants: variants.length > 0 ? variants : [],
        low_stock_alert: lowStockAlert,
        dispatch_city: dispatchCity || null,
        handling_time: handlingTime || null,
        shipping_free: shippingFree,
        shipping_charges: shippingCharges ? parseFloat(shippingCharges) : 0,
        delivery_scope: deliveryScope,
        gst_certificate: gstCertUrl,
        trade_license: tradeLicUrl,
        fssai_certificate: fssaiUrl,
        brand_authorization: brandAuthUrl,
        expiry_date: expiryDate || null,
        batch_number: batchNumber || null,
        storage_instructions: storageInstructions || null,
        return_policy: returnPolicy || null,
        warranty: warranty || null,
        images: imageUrls,
        videos: videoUrls,
        breed_applicable: breedApplicable,
        tags: highlights.filter(h => h.trim()),
        is_draft: isDraft,
        verification_status: isDraft ? "pending" : "pending",
      } as any);

      if (error) throw error;
      toast.success(isDraft ? "Draft saved!" : "Product submitted for approval!");
      navigate("/products-dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit");
    } finally {
      setIsLoading(false);
    }
  };

  const addHighlight = () => setHighlights(prev => [...prev, ""]);
  const updateHighlight = (i: number, v: string) => setHighlights(prev => prev.map((h, idx) => idx === i ? v : h));
  const removeHighlight = (i: number) => setHighlights(prev => prev.filter((_, idx) => idx !== i));

  const addIngredient = () => setIngredients(prev => [...prev, ""]);
  const updateIngredient = (i: number, v: string) => setIngredients(prev => prev.map((ing, idx) => idx === i ? v : ing));
  const removeIngredient = (i: number) => setIngredients(prev => prev.filter((_, idx) => idx !== i));

  const addFeedingRow = () => setFeedingGuide(prev => [...prev, { weight: "", serving: "" }]);
  const updateFeedingRow = (i: number, field: "weight" | "serving", v: string) =>
    setFeedingGuide(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: v } : r));
  const removeFeedingRow = (i: number) => setFeedingGuide(prev => prev.filter((_, idx) => idx !== i));

  const addVariant = () => setVariants(prev => [...prev, { type: "size", value: "" }]);
  const updateVariant = (i: number, field: "type" | "value", v: string) =>
    setVariants(prev => prev.map((vr, idx) => idx === i ? { ...vr, [field]: v } : vr));
  const removeVariant = (i: number) => setVariants(prev => prev.filter((_, idx) => idx !== i));

  const renderStep = () => {
    switch (currentStep) {
      case 1: return (
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-semibold flex items-center gap-2 mb-3">
              <ImageIcon className="w-4 h-4 text-primary" /> Gallery Images *
              <span className="text-xs text-muted-foreground font-normal">({images.length}/20)</span>
            </Label>
            <div className="flex gap-2 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                  <img src={img.preview} className="w-full h-full object-cover" />
                  <button onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </button>
                  {i === 0 && <span className="absolute bottom-0 inset-x-0 bg-primary/80 text-white text-[9px] text-center py-0.5">Cover</span>}
                </div>
              ))}
              {images.length < 20 && (
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors gap-1">
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground">Upload</span>
                </label>
              )}
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Video className="w-4 h-4 text-primary" /> Product Videos
              <span className="text-xs text-muted-foreground font-normal">(optional, max 2)</span>
            </Label>
            <div className="flex gap-2 flex-wrap">
              {videos.map((vid, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center">
                  <Video className="w-6 h-6 text-muted-foreground" />
                  <button onClick={() => setVideos(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {videos.length < 2 && (
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors gap-1">
                  <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                  <Video className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground">Video</span>
                </label>
              )}
            </div>
          </div>
        </div>
      );

      case 2: return (
        <div className="space-y-4">
          <div><Label className="text-sm font-semibold">Product Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Premium Chicken Dog Food" className="rounded-xl mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-sm font-semibold">Brand *</Label>
              <Input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Royal Canin" className="rounded-xl mt-1.5" />
            </div>
            <div><Label className="text-sm font-semibold">Pet Type *</Label>
              <Select value={petType} onValueChange={v => { setPetType(v); setCategory(""); setBreedApplicable([]); }}>
                <SelectTrigger className="rounded-xl mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{ALL_PET_TYPES.map(pt => <SelectItem key={pt} value={pt}>{PET_NAMES[pt]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-sm font-semibold">Category *</Label>
              <Select value={category} onValueChange={setCategory} disabled={!petType}>
                <SelectTrigger className="rounded-xl mt-1.5"><SelectValue placeholder={petType ? "Select" : "Pick pet first"} /></SelectTrigger>
                <SelectContent>{categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-sm font-semibold">SKU</Label>
              <Input value={sku} onChange={e => setSku(e.target.value)} placeholder="RC-DOG-001" className="rounded-xl mt-1.5" />
            </div>
          </div>
          {breedOptions.length > 0 && (
            <div><Label className="text-sm font-semibold">Applicable Breeds</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {breedOptions.map(b => (
                  <button key={b} onClick={() => setBreedApplicable(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${breedApplicable.includes(b) ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border text-foreground"}`}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div><Label className="text-sm font-semibold">Country of Origin</Label>
            <Input value={countryOfOrigin} onChange={e => setCountryOfOrigin(e.target.value)} className="rounded-xl mt-1.5" />
          </div>
          <div><Label className="text-sm font-semibold">Description</Label>
            <div className="relative mt-1.5">
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your product..." className="rounded-xl min-h-[100px]" maxLength={2000} />
              <span className="absolute bottom-2 right-3 text-[10px] text-muted-foreground">{description.length}/2000</span>
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold">Product Highlights</Label>
            <div className="space-y-2 mt-1.5">
              {highlights.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={h} onChange={e => updateHighlight(i, e.target.value)} placeholder={`Highlight ${i + 1}`} className="rounded-xl" />
                  {highlights.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeHighlight(i)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addHighlight} className="rounded-xl"><Plus className="w-4 h-4 mr-1" /> Add</Button>
            </div>
          </div>
        </div>
      );

      case 3: return (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-sm font-semibold">Selling Price (₹) *</Label>
              <div className="relative mt-1.5"><IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} placeholder="499" className="rounded-xl pl-9" min="0" />
              </div>
            </div>
            <div><Label className="text-sm font-semibold">MRP (₹)</Label>
              <div className="relative mt-1.5"><IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="number" value={mrp} onChange={e => setMrp(e.target.value)} placeholder="699" className="rounded-xl pl-9" min="0" />
              </div>
            </div>
          </div>
          {discount > 0 && <Badge className="bg-emerald-100 text-emerald-700">Auto-calculated Discount: {discount}% OFF</Badge>}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50">
            <div><Label className="text-sm font-semibold">GST Inclusive</Label><p className="text-xs text-muted-foreground">Price includes GST</p></div>
            <Switch checked={gstInclusive} onCheckedChange={setGstInclusive} />
          </div>
          {!gstInclusive && (
            <div><Label className="text-sm font-semibold">Tax Percentage (%)</Label>
              <Input type="number" value={taxPercentage} onChange={e => setTaxPercentage(e.target.value)} placeholder="18" className="rounded-xl mt-1.5" min="0" max="100" />
            </div>
          )}
        </div>
      );

      case 4: return (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-xs font-semibold">Stock Qty *</Label>
              <Input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="100" className="rounded-xl mt-1.5" min="0" />
            </div>
            <div><Label className="text-xs font-semibold">Weight/Size</Label>
              <Input value={weight} onChange={e => setWeight(e.target.value)} placeholder="1kg" className="rounded-xl mt-1.5" />
            </div>
            <div><Label className="text-xs font-semibold">Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="rounded-xl mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{["piece","kg","gm","litre","ml","pack","box","bag"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold">Variants</Label>
            <div className="space-y-2 mt-2">
              {variants.map((v, i) => (
                <div key={i} className="flex gap-2">
                  <Select value={v.type} onValueChange={val => updateVariant(i, "type", val)}>
                    <SelectTrigger className="rounded-xl w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>{["size","flavor","color","weight"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input value={v.value} onChange={e => updateVariant(i, "value", e.target.value)} placeholder="Value" className="rounded-xl flex-1" />
                  <Button variant="ghost" size="icon" onClick={() => removeVariant(i)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addVariant} className="rounded-xl"><Plus className="w-4 h-4 mr-1" /> Add Variant</Button>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50">
            <div><Label className="text-sm font-semibold">Low Stock Alert</Label><p className="text-xs text-muted-foreground">Get notified when stock is low</p></div>
            <Switch checked={lowStockAlert} onCheckedChange={setLowStockAlert} />
          </div>
        </div>
      );

      case 5: return (
        <div className="space-y-5">
          <div><Label className="text-sm font-semibold">Dispatch City</Label>
            <Input value={dispatchCity} onChange={e => setDispatchCity(e.target.value)} placeholder="Mumbai" className="rounded-xl mt-1.5" />
          </div>
          <div><Label className="text-sm font-semibold">Handling Time</Label>
            <Select value={handlingTime} onValueChange={setHandlingTime}>
              <SelectTrigger className="rounded-xl mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{["Same Day","1-2 Days","3-5 Days","5-7 Days"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {handlingTime && (
            <div className="p-3 rounded-xl bg-muted/50 text-sm text-muted-foreground">
              Estimated delivery: {handlingTime === "Same Day" ? "1-3 days" : handlingTime === "1-2 Days" ? "3-5 days" : "5-10 days"}
            </div>
          )}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50">
            <div><Label className="text-sm font-semibold">Free Shipping</Label></div>
            <Switch checked={shippingFree} onCheckedChange={setShippingFree} />
          </div>
          {!shippingFree && (
            <div><Label className="text-sm font-semibold">Shipping Charges (₹)</Label>
              <Input type="number" value={shippingCharges} onChange={e => setShippingCharges(e.target.value)} placeholder="49" className="rounded-xl mt-1.5" />
            </div>
          )}
          <div><Label className="text-sm font-semibold">Delivery Availability</Label>
            <Select value={deliveryScope} onValueChange={setDeliveryScope}>
              <SelectTrigger className="rounded-xl mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pan_india">PAN India</SelectItem>
                <SelectItem value="local">Local Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

      case 6: return (
        <div className="space-y-5">
          {[
            { label: "GST Certificate", file: gstCertFile, setter: setGstCertFile },
            { label: "Shop / Trade License", file: tradeLicenseFile, setter: setTradeLicenseFile },
            { label: "FSSAI Certificate (if pet food)", file: fssaiFile, setter: setFssaiFile },
            { label: "Brand Authorization", file: brandAuthFile, setter: setBrandAuthFile },
          ].map(doc => (
            <div key={doc.label} className="space-y-1.5">
              <Label className="text-sm font-semibold">{doc.label}</Label>
              {doc.file ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-sm flex-1 truncate">{doc.file.name}</span>
                  <button onClick={() => doc.setter(null)}><X className="w-4 h-4 text-destructive" /></button>
                </div>
              ) : (
                <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors">
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => { if (e.target.files?.[0]) doc.setter(e.target.files[0]); }} className="hidden" />
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload</span>
                </label>
              )}
            </div>
          ))}
        </div>
      );

      case 7: return (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-sm font-semibold">Expiry Date</Label>
              <Input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="rounded-xl mt-1.5" />
            </div>
            <div><Label className="text-sm font-semibold">Batch Number</Label>
              <Input value={batchNumber} onChange={e => setBatchNumber(e.target.value)} placeholder="BATCH-001" className="rounded-xl mt-1.5" />
            </div>
          </div>
          <div><Label className="text-sm font-semibold">Storage Instructions</Label>
            <Textarea value={storageInstructions} onChange={e => setStorageInstructions(e.target.value)} placeholder="Store in a cool, dry place..." className="rounded-xl mt-1.5" rows={3} />
          </div>
          <div><Label className="text-sm font-semibold">Return Policy</Label>
            <Textarea value={returnPolicy} onChange={e => setReturnPolicy(e.target.value)} placeholder="7-day return policy..." className="rounded-xl mt-1.5" rows={3} />
          </div>
          <div><Label className="text-sm font-semibold">Warranty (optional)</Label>
            <Input value={warranty} onChange={e => setWarranty(e.target.value)} placeholder="6 months manufacturer warranty" className="rounded-xl mt-1.5" />
          </div>
        </div>
      );

      case 8: return (
        <div className="space-y-6">
          {/* Preview Card */}
          <Card className="border-0 shadow-card rounded-3xl overflow-hidden">
            <div className="aspect-video bg-muted relative">
              {images[0] ? <img src={images[0].preview} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-12 h-12 text-muted-foreground" /></div>}
              {discount > 0 && <Badge className="absolute top-3 left-3 bg-emerald-500 text-white">{discount}% OFF</Badge>}
            </div>
            <CardContent className="p-5">
              <h3 className="text-lg font-bold">{name || "Product Name"}</h3>
              <p className="text-sm text-muted-foreground">{brand} • {PET_NAMES[petType] || "Pet Type"}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xl font-bold text-primary">₹{sellingPrice || "0"}</span>
                {mrp && <span className="text-sm text-muted-foreground line-through">₹{mrp}</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{description?.slice(0, 100) || "No description"}</p>
            </CardContent>
          </Card>

          {/* Feeding Guide Builder */}
          <div>
            <Label className="text-sm font-semibold">Feeding Guide Table</Label>
            <div className="space-y-2 mt-2">
              {feedingGuide.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={row.weight} onChange={e => updateFeedingRow(i, "weight", e.target.value)} placeholder="Weight range" className="rounded-xl" />
                  <Input value={row.serving} onChange={e => updateFeedingRow(i, "serving", e.target.value)} placeholder="Daily serving" className="rounded-xl" />
                  <Button variant="ghost" size="icon" onClick={() => removeFeedingRow(i)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addFeedingRow} className="rounded-xl"><Plus className="w-4 h-4 mr-1" /> Add Row</Button>
            </div>
          </div>

          {/* Ingredients Builder */}
          <div>
            <Label className="text-sm font-semibold">Ingredients List</Label>
            <div className="space-y-2 mt-2">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={ing} onChange={e => updateIngredient(i, e.target.value)} placeholder={`Ingredient ${i + 1}`} className="rounded-xl" />
                  {ingredients.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeIngredient(i)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addIngredient} className="rounded-xl"><Plus className="w-4 h-4 mr-1" /> Add</Button>
            </div>
          </div>

          {/* Section edit buttons */}
          <div className="grid grid-cols-2 gap-2">
            {STEPS.slice(0, 7).map(s => (
              <Button key={s.id} variant="outline" size="sm" className="rounded-xl text-xs" onClick={() => setCurrentStep(s.id)}>
                Edit {s.title}
              </Button>
            ))}
          </div>

          {/* Submit Buttons */}
          <div className="space-y-3">
            <Button className="w-full rounded-2xl h-14 text-base font-bold" style={{ background: "linear-gradient(135deg, hsl(345 80% 68%), hsl(270 60% 75%))" }}
              onClick={() => handleSubmit(false)} disabled={isLoading}>
              {isLoading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...</> : "Submit for Approval"}
            </Button>
            <Button variant="outline" className="w-full rounded-2xl" onClick={() => handleSubmit(true)} disabled={isLoading}>
              Save as Draft
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate("/products-dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">Add Product</span>
              <p className="text-xs text-muted-foreground">Step {currentStep} of {STEPS.length}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Step Progress */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max px-1">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                  disabled={currentStep < step.id}
                  className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
                    currentStep === step.id ? "bg-primary/10 text-primary" : currentStep > step.id ? "text-emerald-600 cursor-pointer" : "text-muted-foreground"
                  }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep === step.id ? "bg-primary text-primary-foreground" : currentStep > step.id ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground"
                  }`}>
                    {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <span className="text-[10px] font-medium whitespace-nowrap">{step.title}</span>
                </button>
                {index < STEPS.length - 1 && <div className={`w-4 h-0.5 mx-0.5 ${currentStep > step.id ? "bg-emerald-300" : "bg-border"}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-0 shadow-card rounded-3xl">
          <CardContent className="p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold">{STEPS[currentStep - 1].title}</h2>
              <p className="text-sm text-muted-foreground">{STEPS[currentStep - 1].desc}</p>
            </div>
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        {currentStep < 8 && (
          <div className="flex gap-3 mt-6 pb-8">
            {currentStep > 1 && (
              <Button variant="outline" className="flex-1 rounded-2xl h-12" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            )}
            <Button className="flex-1 rounded-2xl h-12 bg-gradient-primary hover:opacity-90" onClick={handleNext}>
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AddProduct;
