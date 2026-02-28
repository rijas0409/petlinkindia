import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/contexts/CartContext";
import BottomNavigation from "@/components/BottomNavigation";
import {
  ArrowLeft, Heart, Share2, Star, ChevronDown, ChevronUp,
  Shield, Truck, Loader2, ChevronRight, Plus
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
  seller_id: string; views: number | null; total_sold: number | null;
}

const ProductProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"quick" | "deep">("quick");
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ highlights: true });
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const { toggleProductWishlist, isProductInWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Swipe refs
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const swiping = useRef(false);

  const isWishlisted = isProductInWishlist(id || "");

  useEffect(() => { fetchProduct(); }, [id]);

  // Preload all images
  useEffect(() => {
    if (product?.images) {
      product.images.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [product?.images]);

  const fetchProduct = async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase.from("shop_products").select("*").eq("id", id).single();
      if (error) throw error;
      setProduct(data as any);
      setCurrentImageIndex(0);
      setSelectedVariant(0);
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
    // Try same category first
    const { data } = await supabase
      .from("shop_products")
      .select("id, name, price, original_price, discount, images, pet_type, handling_time")
      .eq("pet_type", petType)
      .eq("category", category)
      .eq("is_active", true)
      .eq("verification_status", "verified")
      .neq("id", excludeId)
      .limit(6);
    if (data && data.length >= 2) {
      setSimilarProducts(data);
    } else {
      // Fallback: same pet_type, any category
      const { data: fallback } = await supabase
        .from("shop_products")
        .select("id, name, price, original_price, discount, images, pet_type, handling_time")
        .eq("pet_type", petType)
        .eq("is_active", true)
        .eq("verification_status", "verified")
        .neq("id", excludeId)
        .limit(6);
      setSimilarProducts(fallback || data || []);
    }
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

  // Touch swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    swiping.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!swiping.current || !product?.images) return;
    swiping.current = false;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (Math.abs(diff) < threshold) return;
    const total = product.images.length;
    if (diff > 0) {
      setCurrentImageIndex(prev => (prev + 1) % total);
    } else {
      setCurrentImageIndex(prev => (prev - 1 + total) % total);
    }
  }, [product?.images]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Product not found</div>;

  const images = product.images || [];
  // Build full variant list: first = base product (from pricing page), then inventory variants
  const rawVariants: any[] = Array.isArray(product.variants) ? product.variants.filter((v: any) => v && (v.label || v.packSize)) : [];
  const hasInventoryVariants = rawVariants.length > 0;
  const baseVariant = hasInventoryVariants ? {
    label: product.weight || product.name,
    packSize: "",
    price: product.price,
    originalPrice: product.original_price,
    discount: product.discount && product.discount > 0 ? `${product.discount}% OFF` : null,
    stock: product.stock,
  } : null;
  const variantList: any[] = baseVariant ? [baseVariant, ...rawVariants] : [];
  const ingredientsList = product.ingredients || [];
  const feedingGuide: any[] = Array.isArray(product.feeding_guide) ? product.feeding_guide : [];

  // Parse highlights as key-value pairs
  const highlightPairs: { label: string; value: string }[] = [];
  (product.highlights || []).forEach(h => {
    const sep = h.indexOf(":");
    if (sep > 0) {
      highlightPairs.push({ label: h.slice(0, sep).trim(), value: h.slice(sep + 1).trim() });
    } else {
      highlightPairs.push({ label: "Feature", value: h });
    }
  });

  return (
    <div className="min-h-screen bg-white pb-36">
      {/* ── 1) Image Section with Swipe ── */}
      <div className="relative bg-[#F8F7FC]" style={{ paddingTop: "90%" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 flex items-center justify-center p-6">
          {images.length > 0 ? (
            <img
              key={currentImageIndex}
              src={images[currentImageIndex]}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="text-6xl">📦</div>
          )}
        </div>
        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={() => setCurrentImageIndex(i)}
                className={`h-[6px] rounded-full transition-all ${i === currentImageIndex ? "w-5 bg-[#A855F7]" : "w-[6px] bg-[#D1D5DB]"}`} />
            ))}
          </div>
        )}
        {/* Top bar */}
        <div className="absolute top-10 left-4 right-4 flex justify-between">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-[#F3F0F9] flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-[#6B7280]" />
          </button>
          <div className="flex gap-2.5">
            <button onClick={handleWishlist} className="w-10 h-10 rounded-full bg-[#F3F0F9] flex items-center justify-center">
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-[#A855F7] text-[#A855F7]" : "text-[#6B7280]"}`} />
            </button>
            <button onClick={handleShare} className="w-10 h-10 rounded-full bg-[#F3F0F9] flex items-center justify-center">
              <Share2 className="w-5 h-5 text-[#6B7280]" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 2) Product Info ── */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex gap-2 mb-4">
          <span className="px-3 py-1 rounded-md text-[11px] font-bold border border-[#D8B4FE] text-[#9333EA] tracking-wide">PREMIUM GRADE</span>
          <span className="px-3 py-1 rounded-md text-[11px] font-bold border border-[#D8B4FE] text-[#9333EA] tracking-wide">VET RECOMMENDED</span>
        </div>
        <h1 className="text-[22px] font-bold text-[#111827] leading-tight">{product.name}</h1>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="text-[14px] font-bold text-[#111827]">4.6</span>
          <span className="text-[13px] text-[#9CA3AF]">(4.9k)</span>
        </div>
        {/* Dynamic price based on selected variant */}
        {(() => {
          const sv = variantList.length > 0 ? variantList[selectedVariant] : null;
          const displayPrice = sv?.price ? Number(sv.price) : product.price;
          const displayOriginal = sv?.originalPrice ? Number(sv.originalPrice) : product.original_price;
          const calcDiscount = (price: number, orig: number) => {
            if (orig > 0 && price > 0 && orig > price) return `${Math.round(((orig - price) / orig) * 100)}% OFF`;
            return null;
          };
          const displayDiscount = calcDiscount(displayPrice, Number(displayOriginal || 0))
            || (product.discount && product.discount > 0 ? `${product.discount}% OFF` : null);
          return (
            <div className="flex items-baseline gap-2.5 mt-3">
              <span className="text-[26px] font-extrabold text-[#111827]">₹{displayPrice}</span>
              {displayOriginal && Number(displayOriginal) > displayPrice && (
                <span className="text-[15px] text-[#9CA3AF] line-through">₹{displayOriginal}</span>
              )}
              {displayDiscount && (
                <span className="text-[13px] font-bold text-[#9333EA]">{displayDiscount}</span>
              )}
            </div>
          );
        })()}
        {product.weight && <p className="text-[14px] text-[#6B7280] mt-1">Quantity: {product.weight}</p>}

        {/* ── A) Pack/Variant Cards (exact reference image design) ── */}
        {variantList.length > 0 && (
          <div className="flex gap-3 mt-4 overflow-x-auto scrollbar-hide pb-1">
            {variantList.map((v: any, i: number) => {
              const isSelected = i === selectedVariant;
              const label = v.label || v.value || v.type || "";
              const packSize = v.packSize || "";
              const displayLabel = packSize || label;
              const vPrice = v.price ? Number(v.price) : null;
              const vOriginal = v.originalPrice ? Number(v.originalPrice) : null;
              const discountText = (vOriginal && vPrice && vOriginal > vPrice)
                ? `${Math.round(((vOriginal - vPrice) / vOriginal) * 100)}% OFF`
                : "";
              const vStock = v.stock ? Number(v.stock) : null;
              const showLowStock = vStock !== null && vStock > 0 && vStock < 10;

              return (
                <button key={i} onClick={() => setSelectedVariant(i)}
                  className="flex-shrink-0 text-left transition-all"
                  style={{
                    minWidth: 145,
                    borderRadius: 12,
                    border: isSelected ? "2.5px solid #1A6DFF" : "1.5px dashed #C4C4C4",
                    background: "#FFFFFF",
                    padding: "14px 16px 12px",
                    boxShadow: isSelected ? "0 2px 10px rgba(26,109,255,0.10)" : "none",
                  }}>
                  {/* Label – bold, normal (not italic) */}
                  <p style={{
                    fontSize: 15, fontWeight: 700,
                    color: "#374151",
                    marginBottom: 4,
                  }}>{displayLabel}</p>
                  {/* Discount text – green bold */}
                  {discountText && (
                    <p style={{
                      fontSize: 13, fontWeight: 700,
                      color: "#16A34A",
                      marginBottom: 6,
                    }}>{discountText}</p>
                  )}
                  {/* Price row */}
                  {vPrice !== null && (
                    <p style={{ fontSize: 17, fontWeight: 800, color: "#111827", lineHeight: "1.2" }}>
                      ₹{vPrice}{" "}
                      {vOriginal && vOriginal > vPrice && (
                        <span style={{ fontSize: 13, fontWeight: 400, color: "#9CA3AF", textDecoration: "line-through" }}>₹{vOriginal}</span>
                      )}
                    </p>
                  )}
                  {/* Low stock indicator */}
                  {showLowStock && (
                    <p style={{
                      fontSize: 12, fontWeight: 600,
                      color: "#1A6DFF",
                      marginTop: 4,
                    }}>{vStock} left</p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 3) Sruvo AI Insights (Product-Specific) ── */}
      <div className="px-5 py-4">
        <div className="rounded-3xl overflow-hidden" style={{
          border: "1.5px solid transparent",
          backgroundImage: "linear-gradient(#F9FAFB, #F9FAFB), linear-gradient(135deg, #C4B5FD, #F9A8D4, #C4B5FD)",
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
          boxShadow: "0 4px 24px -4px rgba(139,92,246,0.08)",
        }}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <img src={rjStar} alt="" className="w-[49px] h-[49px] object-contain" style={{ filter: "drop-shadow(0 0 6px rgba(139,92,246,0.3))" }} />
              <div className="flex flex-col leading-snug">
                <span className="font-semibold text-[18px] text-[#151B32] tracking-tight">Sruvo AI</span>
                <span className="font-extrabold text-[20px] text-[#151B32] tracking-tight -mt-0.5">Insights</span>
              </div>
            </div>
            <div className="flex bg-[#F3F4F6] rounded-full p-0.5">
              <button onClick={() => setActiveTab("quick")}
                className={`px-3.5 py-1.5 text-[11px] font-semibold rounded-full transition-all ${activeTab === "quick" ? "bg-white text-[#111827] shadow-sm" : "text-[#9CA3AF]"}`}>
                Quick<br/>Facts
              </button>
              <button onClick={() => setActiveTab("deep")}
                className={`px-3.5 py-1.5 text-[11px] font-semibold rounded-full transition-all ${activeTab === "deep" ? "bg-white text-[#111827] shadow-sm" : "text-[#9CA3AF]"}`}>
                Deep<br/>Dive
              </button>
            </div>
          </div>
          <div className="px-5 pb-5">
            {aiLoading ? (
              <div className="space-y-5 py-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-[#E5E7EB] flex-shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-4 bg-[#E5E7EB] rounded w-1/3" />
                      <div className="h-3 bg-[#E5E7EB] rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : aiInsights ? (
              activeTab === "quick" ? (
                <div className="space-y-5 py-2" style={{ animation: "fadeIn 0.3s ease-in-out" }}>
                  {[
                    { icon: "🍗", title: aiInsights.quick?.nutrition?.title, desc: aiInsights.quick?.nutrition?.text, bg: "#F3EEFF", color: "#7C3AED" },
                    { icon: "⚡", title: aiInsights.quick?.activity?.title, desc: aiInsights.quick?.activity?.text, bg: "#EEF4FF", color: "#3B82F6" },
                    { icon: "💚", title: aiInsights.quick?.lifespan?.title, desc: aiInsights.quick?.lifespan?.text, bg: "#FFF1F2", color: "#F43F5E" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-lg" style={{ backgroundColor: item.bg }}>
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[15px] text-[#151B32] mb-1">{item.title}</p>
                        <p className="text-[13px] text-[#6B7280] leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-5 py-2" style={{ animation: "fadeIn 0.3s ease-in-out" }}>
                  {[aiInsights.deep?.health, aiInsights.deep?.training, aiInsights.deep?.grooming].filter(Boolean).map((d: any, i: number) => (
                    <div key={i}>
                      <p className="font-bold text-[14px] text-[#111827]">{d.title}</p>
                      <p className="text-[13px] text-[#6B7280] leading-relaxed mt-1">{d.text}</p>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="flex gap-2.5">
                {["NUTRITION", "ENERGY", "WELLNESS"].map((label, i) => (
                  <div key={i} className="flex-1 rounded-2xl py-3 px-2 text-center bg-[#F3F4F6]">
                    <p className="text-[8px] font-bold text-[#9CA3AF] uppercase tracking-widest">{label}</p>
                    <p className="text-[12px] font-bold mt-1 text-[#D1D5DB]">—</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 4) Highlights ── */}
      {highlightPairs.length > 0 && (
        <div className="px-5 py-4 border-t border-[#F3F4F6]">
          <button onClick={() => toggleSection("highlights")} className="flex items-center justify-between w-full">
            <h3 className="text-[16px] font-bold text-[#111827]">Highlights</h3>
            {expandedSections.highlights ? <ChevronUp className="w-5 h-5 text-[#9CA3AF]" /> : <ChevronDown className="w-5 h-5 text-[#9CA3AF]" />}
          </button>
          {expandedSections.highlights && (
            <div className="mt-3 space-y-3">
              {highlightPairs.map((pair, i) => (
                <div key={i} className="flex">
                  <span className="text-[13px] text-[#9CA3AF] w-28 flex-shrink-0">{pair.label}</span>
                  <span className="text-[13px] text-[#374151] font-medium">{pair.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 5) Description ── */}
      {product.description && (
        <div className="px-5 py-4 border-t border-[#F3F4F6]">
          <button onClick={() => toggleSection("desc")} className="flex items-center justify-between w-full">
            <h3 className="text-[16px] font-bold text-[#111827]">Description</h3>
            {expandedSections.desc ? <ChevronUp className="w-5 h-5 text-[#9CA3AF]" /> : <ChevronDown className="w-5 h-5 text-[#9CA3AF]" />}
          </button>
          {expandedSections.desc && (
            <p className="mt-3 text-[13px] text-[#6B7280] leading-relaxed">{product.description}</p>
          )}
        </div>
      )}

      {/* ── 6) Ingredients ── */}
      {ingredientsList.length > 0 && (
        <div className="px-5 py-4 border-t border-[#F3F4F6]">
          <button onClick={() => toggleSection("ingredients")} className="flex items-center justify-between w-full">
            <h3 className="text-[16px] font-bold text-[#111827]">Ingredients</h3>
            {expandedSections.ingredients ? <ChevronUp className="w-5 h-5 text-[#9CA3AF]" /> : <ChevronDown className="w-5 h-5 text-[#9CA3AF]" />}
          </button>
          {expandedSections.ingredients && (
            <div className="mt-3 space-y-2.5">
              {ingredientsList.map((ing, i) => {
                const icons = ["🍗", "🌾", "🐟", "🥚", "🥕", "🫘"];
                return (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="text-[14px]">{icons[i % icons.length]}</span>
                    <span className="text-[13px] text-[#374151]">{ing}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 7) Feeding Guide ── */}
      {feedingGuide.length > 0 && (
        <div className="px-5 py-4 border-t border-[#F3F4F6]">
          <button onClick={() => toggleSection("feeding")} className="flex items-center justify-between w-full">
            <h3 className="text-[16px] font-bold text-[#111827]">How to Make (Feeding Guide)</h3>
            {expandedSections.feeding ? <ChevronUp className="w-5 h-5 text-[#9CA3AF]" /> : <ChevronDown className="w-5 h-5 text-[#9CA3AF]" />}
          </button>
          {expandedSections.feeding && (
            <div className="mt-3">
              <div className="flex justify-between text-[12px] font-semibold text-[#9CA3AF] mb-2">
                <span>Puppy Weight</span><span>Daily Serving</span>
              </div>
              {feedingGuide.map((row: any, i: number) => (
                <div key={i} className="flex justify-between text-[13px] text-[#374151] py-2.5 border-t border-[#F3F4F6]">
                  <span>{row.weight}</span><span>{row.serving}</span>
                </div>
              ))}
              <p className="text-[11px] text-[#9CA3AF] mt-2 italic">*Adjust servings based on activity level and age</p>
            </div>
          )}
        </div>
      )}

      {/* ── 8) Trust Badges ── */}
      <div className="px-5 py-4 border-t border-[#F3F4F6] space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#ECFDF5] flex items-center justify-center">
            <Shield className="w-4 h-4 text-[#10B981]" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#111827]">Health Guaranteed</p>
            <p className="text-[12px] text-[#9CA3AF]">100% natural ingredients only</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F5F3FF] flex items-center justify-center">
            <Truck className="w-4 h-4 text-[#A855F7]" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#111827]">{product.shipping_free ? "Free Express Delivery" : "Express Delivery"}</p>
            <p className="text-[12px] text-[#9CA3AF]">Ships within 24 hours</p>
          </div>
        </div>
      </div>

      {/* ── 9) Pet Compatibility ── */}
      <div className="px-5 py-4 border-t border-[#F3F4F6]">
        <div className="rounded-2xl border border-[#E5E7EB] p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#F5F3FF] flex items-center justify-center text-xl">
            {product.pet_type === "dog" ? "🐕" : product.pet_type === "cat" ? "🐱" : product.pet_type === "bird" ? "🐦" : product.pet_type === "fish" ? "🐠" : "🐾"}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-bold text-[#111827]">Pet Compatibility</p>
              <span className="text-[12px] font-bold text-[#9333EA] bg-[#F5F3FF] px-2.5 py-1 rounded-full">99% Match</span>
            </div>
            <p className="text-[12px] text-[#9CA3AF] mt-0.5">Perfect for your pet's current growth stage and energy level.</p>
          </div>
        </div>
      </div>

      {/* ── 10) Similar Products ── */}
      {similarProducts.length > 0 && (
        <div className="px-5 py-4 border-t border-[#F3F4F6]">
          <h3 className="text-[16px] font-bold text-[#111827] mb-3">Similar Products</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {similarProducts.map((sp) => (
              <div key={sp.id} onClick={() => { navigate(`/product/${sp.id}`); window.scrollTo(0, 0); }}
                className="flex-shrink-0 w-[160px] rounded-2xl border border-[#E5E7EB] overflow-hidden bg-white cursor-pointer">
                <div className="relative bg-[#F9FAFB] aspect-square flex items-center justify-center p-3">
                  {sp.images?.[0] ? <img src={sp.images[0]} className="max-w-full max-h-full object-contain" loading="lazy" /> : <div className="text-3xl">📦</div>}
                  <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center shadow-sm"
                    onClick={(e) => { e.stopPropagation(); addToCart({ id: sp.id, name: sp.name, price: sp.price, image: sp.images?.[0] || "" }); toast.success("Added!"); }}>
                    <Plus className="w-3.5 h-3.5 text-[#6B7280]" />
                  </button>
                </div>
                <div className="p-2.5">
                  {sp.handling_time && <p className="text-[10px] text-[#9CA3AF] mb-0.5">{sp.handling_time}</p>}
                  <p className="text-[12px] font-medium text-[#111827] line-clamp-2 leading-tight">{sp.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[11px] font-semibold text-[#111827]">4.7</span>
                    <span className="text-[10px] text-[#9CA3AF]">(1.7k)</span>
                  </div>
                  {sp.discount > 0 && <p className="text-[10px] font-semibold text-[#9333EA] mt-0.5">{sp.discount}% OFF</p>}
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-[14px] font-bold text-[#111827]">₹{sp.price}</span>
                    {sp.original_price && sp.original_price > sp.price && <span className="text-[11px] text-[#9CA3AF] line-through">₹{sp.original_price}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 11) Brand Strip ── */}
      <div className="px-5 py-4 border-t border-[#F3F4F6]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F5F3FF] flex items-center justify-center">
            <span className="text-[#9333EA] font-bold text-[14px]">{product.brand?.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-[#111827]">{product.brand}</p>
            <p className="text-[12px] text-[#9CA3AF]">Explore all products</p>
          </div>
          <ChevronRight className="w-5 h-5 text-[#9CA3AF]" />
        </div>
      </div>

      {/* ── 12) Sticky Bottom Bar ── */}
      <div className="fixed bottom-14 left-0 right-0 z-50 bg-white border-t border-[#E5E7EB] px-5 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:bottom-0">
        <div className="flex gap-3 max-w-lg mx-auto">
          <button onClick={handleAddToCart}
            className="flex-1 h-[48px] rounded-2xl border-2 border-[#A855F7] text-[#A855F7] font-bold text-[14px] flex items-center justify-center">
            Add to Cart
          </button>
          <button onClick={handleBuyNow}
            className="flex-1 h-[48px] rounded-2xl text-white font-bold text-[14px] flex items-center justify-center"
            style={{ background: "linear-gradient(90deg, #FF4D6D, #8B5CF6)" }}>
            Buy Now
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <BottomNavigation variant="buyer" />
    </div>
  );
};

export default ProductProfile;
