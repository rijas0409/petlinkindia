import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/contexts/CartContext";
import BottomNavigation from "@/components/BottomNavigation";
import {
  ArrowLeft, Heart, Share2, Star, ChevronDown, ChevronUp,
  Sparkles, Shield, Truck, Loader2, Plus, ChevronRight
} from "lucide-react";
import rjStar from "@/assets/rj-star.png";

interface Product {
  id: string; name: string; brand: string; description: string | null;
  price: number; original_price: number | null; discount: number | null;
  images: string[] | null; videos: string[] | null; pet_type: string;
  category: string; weight: string | null; stock: number;
  highlights: string[] | null; ingredients: string[] | null;
  feeding_guide: any[] | null; variants: any[] | null;
  country_of_origin: string | null; breed_applicable: string[] | null;
  shipping_free: boolean | null; delivery_scope: string | null;
  dispatch_city: string | null; handling_time: string | null;
  return_policy: string | null; warranty: string | null;
  storage_instructions: string | null; expiry_date: string | null;
  seller_id: string; views: number | null;
}

const ProductProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"quick" | "deep">("quick");
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const { toggleProductWishlist, isProductInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const isWishlisted = isProductInWishlist(id || "");

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from("shop_products")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      setProduct(data as any);
      await supabase.from("shop_products").update({ views: ((data as any).views || 0) + 1 }).eq("id", id);
      fetchSimilar(data.pet_type, data.category, id);
      fetchAiInsights(data as any);
    } catch {
      toast.error("Product not found");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilar = async (petType: string, category: string, excludeId: string) => {
    const { data } = await supabase
      .from("shop_products")
      .select("id, name, price, original_price, discount, images, pet_type")
      .eq("pet_type", petType)
      .eq("category", category)
      .eq("is_active", true)
      .eq("verification_status", "verified")
      .neq("id", excludeId)
      .limit(6);
    setSimilarProducts(data || []);
  };

  const fetchAiInsights = async (prod: Product) => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("pet-ai-insights", {
        body: {
          breed: prod.brand,
          category: prod.pet_type,
          ageMonths: 12,
          gender: "unknown",
          isProduct: true,
          productName: prod.name,
          productCategory: prod.category,
          productIngredients: prod.ingredients,
          productHighlights: prod.highlights,
        },
      });
      if (!error) setAiInsights(data);
    } catch { /* silent */ } finally { setAiLoading(false); }
  };

  const toggleSection = (key: string) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  const handleShare = async () => {
    try { await navigator.share({ title: product?.name, url: window.location.href }); }
    catch { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }
  };

  const handleWishlist = async () => {
    if (!product) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.info("Please login"); navigate("/auth"); return; }
    await toggleProductWishlist({ id: product.id, name: product.name, price: product.price, image: product.images?.[0] || "", petType: product.pet_type });
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.images?.[0] || "" });
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Product not found</div>;

  const images = product.images || [];
  const variantList: any[] = Array.isArray(product.variants) ? product.variants : [];
  const highlightsList = product.highlights || [];
  const ingredientsList = product.ingredients || [];
  const feedingGuide: any[] = Array.isArray(product.feeding_guide) ? product.feeding_guide : [];

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-36">
      {/* 1) Image Carousel */}
      <div className="relative" style={{ height: "45vh", minHeight: 300 }}>
        <div className="w-full h-full bg-white flex items-center justify-center overflow-hidden">
          {images.length > 0 ? (
            <img src={images[currentImageIndex]} alt={product.name} className="w-full h-full object-contain p-4" />
          ) : (
            <div className="text-6xl">📦</div>
          )}
        </div>
        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={() => setCurrentImageIndex(i)}
                className={`h-2 rounded-full transition-all ${i === currentImageIndex ? "w-5 bg-primary" : "w-2 bg-muted-foreground/30"}`} />
            ))}
          </div>
        )}
        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button onClick={handleWishlist} className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-primary text-primary" : ""}`} />
            </button>
            <button onClick={handleShare} className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2) Product Info */}
      <div className="bg-white px-4 pt-5 pb-4">
        {/* Tag chips */}
        <div className="flex gap-2 mb-3">
          <span className="px-3 py-1 rounded-xl text-[11px] font-semibold border border-primary/30 text-primary bg-primary/5">PREMIUM GRADE</span>
          <span className="px-3 py-1 rounded-xl text-[11px] font-semibold border border-primary/30 text-primary bg-primary/5">VET RECOMMENDED</span>
        </div>
        <h1 className="text-[20px] font-semibold text-foreground leading-tight">{product.name}</h1>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-semibold">4.6</span>
          <span className="text-xs text-muted-foreground">(4.9k)</span>
        </div>
        {/* Price */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[22px] font-bold text-primary">₹{product.price}</span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-sm text-muted-foreground line-through">₹{product.original_price}</span>
          )}
          {product.discount && product.discount > 0 && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{product.discount}% OFF</span>
          )}
        </div>
        {product.weight && <p className="text-sm text-muted-foreground mt-1">Quantity: {product.weight}</p>}

        {/* Variants */}
        {variantList.length > 0 && (
          <div className="flex gap-3 mt-4">
            {variantList.map((v: any, i: number) => (
              <button key={i} onClick={() => setSelectedVariant(i)}
                className={`px-4 py-3 rounded-2xl border-2 transition-all ${i === selectedVariant ? "border-primary bg-primary/5" : "border-border"}`}>
                <p className="text-sm font-semibold">{v.value || v.type}</p>
                {v.type && <p className="text-[11px] text-muted-foreground">{v.type}</p>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3) Sruvo AI Insights */}
      <div className="bg-white mt-2 py-4">
        <div className="mx-4 rounded-3xl bg-[#F9FAFB] overflow-hidden" style={{
          border: "1.5px solid transparent",
          backgroundImage: "linear-gradient(#F9FAFB, #F9FAFB), linear-gradient(135deg, #C4B5FD, #F9A8D4, #C4B5FD)",
          backgroundOrigin: "border-box", backgroundClip: "padding-box, border-box",
          boxShadow: "0 4px 24px -4px rgba(139,92,246,0.08)",
        }}>
          <div className="flex items-center justify-between px-5 pt-6 pb-4">
            <div className="flex items-center gap-1.5">
              <img src={rjStar} alt="" className="w-[49px] h-[49px] object-contain drop-shadow-[0_0_8px_rgba(139,92,246,0.35)]" />
              <div className="flex flex-col leading-snug">
                <span className="font-semibold text-[#151B32] text-[18px]">Sruvo AI</span>
                <span className="font-extrabold text-[#151B32] text-[20px] -mt-0.5">Insights</span>
              </div>
            </div>
            <div className="flex bg-[#F3F4F6] rounded-full p-1">
              <button onClick={() => setActiveTab("quick")}
                className={`px-4 py-2 text-[12px] font-semibold rounded-full transition-all ${activeTab === "quick" ? "bg-white text-[#151B32] shadow-sm" : "text-[#9CA3AF]"}`}>
                Quick Facts
              </button>
              <button onClick={() => setActiveTab("deep")}
                className={`px-4 py-2 text-[12px] font-semibold rounded-full transition-all ${activeTab === "deep" ? "bg-white text-[#151B32] shadow-sm" : "text-[#9CA3AF]"}`}>
                Deep Dive
              </button>
            </div>
          </div>
          <div className="px-5 pb-5">
            {aiLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : aiInsights ? (
              activeTab === "quick" ? (
                <div className="flex gap-3">
                  {[
                    { label: "NUTRITION", title: aiInsights.quick?.nutrition?.title || "High Protein", bg: "#F3EEFF", color: "#7C3AED" },
                    { label: "ENERGY", title: aiInsights.quick?.activity?.title || "Growth Plus", bg: "#EEF4FF", color: "#3B82F6" },
                    { label: "LIFESPAN", title: aiInsights.quick?.lifespan?.title || "+2.4 Years", bg: "#FFF1F2", color: "#F43F5E" },
                  ].map((item, i) => (
                    <div key={i} className="flex-1 rounded-2xl p-3 text-center" style={{ backgroundColor: item.bg }}>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                      <p className="text-[13px] font-bold mt-1" style={{ color: item.color }}>{item.title}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {[aiInsights.deep?.health, aiInsights.deep?.training, aiInsights.deep?.grooming].filter(Boolean).map((d: any, i: number) => (
                    <div key={i}><p className="font-bold text-sm">{d.title}</p><p className="text-xs text-muted-foreground">{d.text}</p></div>
                  ))}
                </div>
              )
            ) : (
              <div className="flex gap-3">
                {["NUTRITION", "ENERGY", "LIFESPAN"].map((label, i) => (
                  <div key={i} className="flex-1 rounded-2xl p-3 text-center bg-muted/50">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
                    <p className="text-[13px] font-bold mt-1 text-muted-foreground">—</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4) Highlights */}
      {highlightsList.length > 0 && (
        <div className="bg-white mt-2 px-4 py-4">
          <button onClick={() => toggleSection("highlights")} className="flex items-center justify-between w-full">
            <h3 className="text-[16px] font-semibold">Highlights</h3>
            {expandedSections.highlights === false ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
          {expandedSections.highlights !== false && (
            <div className="mt-3 space-y-2.5">
              {highlightsList.map((h, i) => (
                <div key={i} className="flex gap-3 text-sm"><span className="text-muted-foreground w-24 flex-shrink-0 font-medium">{i === 0 ? "Flavour" : i === 1 ? "Box Contents" : i === 2 ? "Pack Size" : "Feature"}</span><span>{h}</span></div>
              ))}
              {product.pet_type && <div className="flex gap-3 text-sm"><span className="text-muted-foreground w-24 flex-shrink-0 font-medium">Pet Type</span><span className="capitalize">{product.pet_type}</span></div>}
            </div>
          )}
        </div>
      )}

      {/* 5) Description */}
      {product.description && (
        <div className="bg-white mt-2 px-4 py-4">
          <button onClick={() => toggleSection("desc")} className="flex items-center justify-between w-full">
            <h3 className="text-[16px] font-semibold">Description</h3>
            {expandedSections.desc ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedSections.desc && <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{product.description}</p>}
        </div>
      )}

      {/* 6) Ingredients */}
      {ingredientsList.length > 0 && (
        <div className="bg-white mt-2 px-4 py-4">
          <button onClick={() => toggleSection("ingredients")} className="flex items-center justify-between w-full">
            <h3 className="text-[16px] font-semibold">Ingredients</h3>
            {expandedSections.ingredients ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedSections.ingredients && (
            <div className="mt-3 space-y-2">
              {ingredientsList.map((ing, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <span>{ing}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7) Feeding Guide */}
      {feedingGuide.length > 0 && (
        <div className="bg-white mt-2 px-4 py-4">
          <button onClick={() => toggleSection("feeding")} className="flex items-center justify-between w-full">
            <h3 className="text-[16px] font-semibold">How to Make (Feeding Guide)</h3>
            {expandedSections.feeding ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedSections.feeding && (
            <div className="mt-3">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-2 px-1">
                <span>Puppy Weight</span><span>Daily Serving</span>
              </div>
              {feedingGuide.map((row: any, i: number) => (
                <div key={i} className="flex justify-between text-sm py-2 border-t border-border px-1">
                  <span>{row.weight}</span><span>{row.serving}</span>
                </div>
              ))}
              <p className="text-[12px] text-muted-foreground mt-2 italic">*Adjust servings based on activity level and age</p>
            </div>
          )}
        </div>
      )}

      {/* 8) Trust Info */}
      <div className="bg-white mt-2 px-4 py-4 space-y-3">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-emerald-500" />
          <div><p className="text-sm font-semibold">Health Guaranteed</p><p className="text-xs text-muted-foreground">100% natural ingredients only</p></div>
        </div>
        <div className="flex items-center gap-3">
          <Truck className="w-5 h-5 text-primary" />
          <div><p className="text-sm font-semibold">{product.shipping_free ? "Free Express Delivery" : "Express Delivery"}</p><p className="text-xs text-muted-foreground">Ships within 24 hours</p></div>
        </div>
      </div>

      {/* 9) Pet Compatibility */}
      <div className="bg-white mt-2 px-4 py-4">
        <div className="rounded-2xl border border-border p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
            {product.pet_type === "dog" ? "🐕" : product.pet_type === "cat" ? "🐱" : "🐾"}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Pet Compatibility</p>
            <p className="text-xs text-muted-foreground">Perfect for your pet's current growth stage and energy level.</p>
          </div>
          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">99% Match</span>
        </div>
      </div>

      {/* 10) Similar Products */}
      {similarProducts.length > 0 && (
        <div className="bg-white mt-2 px-4 py-4">
          <h3 className="text-[16px] font-semibold mb-3">Similar Products</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {similarProducts.map((sp) => (
              <div key={sp.id} onClick={() => navigate(`/product/${sp.id}`)}
                className="flex-shrink-0 w-40 rounded-2xl border border-border overflow-hidden bg-card cursor-pointer">
                <div className="aspect-square bg-muted relative">
                  {sp.images?.[0] ? <img src={sp.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>}
                  {sp.discount > 0 && <span className="absolute top-1.5 left-1.5 text-[10px] font-bold text-white bg-primary px-1.5 py-0.5 rounded-full">{sp.discount}% OFF</span>}
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium line-clamp-2">{sp.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[11px] font-semibold">4.7</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-sm font-bold">₹{sp.price}</span>
                    {sp.original_price && sp.original_price > sp.price && <span className="text-[10px] text-muted-foreground line-through">₹{sp.original_price}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11) Brand Strip */}
      <div className="bg-white mt-2 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">{product.brand?.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{product.brand}</p>
            <p className="text-xs text-muted-foreground">Explore all products</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {/* 12) Sticky Bottom Bar */}
      <div className="fixed bottom-14 left-0 right-0 z-50 bg-white border-t border-border px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:bottom-0">
        <div className="flex gap-3 max-w-lg mx-auto">
          <button onClick={handleAddToCart}
            className="flex-1 h-[52px] rounded-3xl border-2 border-primary text-primary font-bold text-sm flex items-center justify-center gap-2">
            Add to Cart
          </button>
          <button onClick={handleBuyNow}
            className="flex-1 h-[52px] rounded-3xl text-white font-bold text-sm flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(345 80% 68%), hsl(270 60% 75%))" }}>
            Buy Now
          </button>
        </div>
      </div>

      <BottomNavigation variant="buyer" />
    </div>
  );
};

export default ProductProfile;
