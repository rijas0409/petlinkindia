import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Star, Shield, MapPin, Clock, Share2, MessageCircle } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import BottomNavigation from "@/components/BottomNavigation";

interface SellerData {
  id: string;
  name: string;
  business_name: string | null;
  profile_photo: string | null;
  rating: number;
  is_breeder_verified: boolean;
  is_admin_approved: boolean;
  created_at: string;
  address: string | null;
}

interface PetListing {
  id: string;
  name: string;
  breed: string;
  category: string;
  price: number;
  original_price: number | null;
  age_months: number;
  gender: string;
  images: string[] | null;
  city: string;
  state: string;
  is_featured: boolean;
  verification_status: string;
  vaccinated: boolean;
}

const SellerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [seller, setSeller] = useState<SellerData | null>(null);
  const [pets, setPets] = useState<PetListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSold, setTotalSold] = useState(0);

  useEffect(() => {
    if (id) fetchSellerData();
  }, [id]);

  const fetchSellerData = async () => {
    try {
      // Fetch seller info via RPC (bypasses RLS)
      const { data: sellerData } = await supabase.rpc("get_public_seller_info", { _seller_id: id! });

      if (!sellerData || sellerData.length === 0) {
        toast.error("Breeder not found");
        navigate(-1);
        return;
      }

      const s = sellerData[0];
      setSeller({
        id: s.id,
        name: s.name,
        business_name: null,
        profile_photo: s.profile_photo,
        rating: s.rating > 0 ? s.rating : 4.8,
        is_breeder_verified: s.is_breeder_verified,
        is_admin_approved: true,
        created_at: "",
        address: null,
      });

      // Fetch all verified, available pets by this seller
      const { data: petData } = await supabase
        .from("pets")
        .select("id, name, breed, category, price, original_price, age_months, gender, images, city, state, is_featured, verification_status, vaccinated")
        .eq("owner_id", id!)
        .eq("is_available", true)
        .eq("verification_status", "verified")
        .order("created_at", { ascending: false });

      setPets(petData || []);

      // Count orders for this seller
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", id!)
        .eq("status", "delivered");
      setTotalSold(count || 0);
    } catch {
      toast.error("Failed to load breeder profile");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: `${seller?.name} - Breeder Profile`, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    }
  };

  const formatAge = (months: number) => {
    if (months >= 12) {
      const years = Math.floor(months / 12);
      const rem = months % 12;
      return rem > 0 ? `${years}y ${rem}m` : `${years}y`;
    }
    return `${months}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">Breeder not found</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const displayName = seller.business_name || seller.name;

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-24">
      {/* Header Banner */}
      <div className="relative h-48 bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#ec4899]">
        {/* Glass overlay pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-8 w-24 h-24 rounded-full bg-white/30" />
          <div className="absolute bottom-6 right-12 w-32 h-32 rounded-full bg-white/20" />
          <div className="absolute top-12 right-24 w-16 h-16 rounded-full bg-white/25" />
        </div>

        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-12 z-10">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <button onClick={handleShare} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center">
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Profile Card - overlaps banner */}
      <div className="relative -mt-16 mx-4">
        <div className="bg-card rounded-2xl shadow-lg p-5">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C4B5FD] to-[#A78BFA] flex items-center justify-center overflow-hidden shadow-md flex-shrink-0 -mt-10 border-4 border-card">
              {seller.profile_photo ? (
                <img src={seller.profile_photo} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white">{displayName[0]?.toUpperCase()}</span>
              )}
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-foreground truncate">{displayName}</h1>
                {seller.is_breeder_verified && (
                  <Shield className="w-5 h-5 text-[#7c3aed] flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold text-foreground">{seller.rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground ml-1">Seller Rating</span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-foreground">{pets.length}</p>
              <p className="text-[11px] text-muted-foreground">Active Pets</p>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-foreground">{totalSold}</p>
              <p className="text-[11px] text-muted-foreground">Pets Sold</p>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-foreground">{seller.rating.toFixed(1)}</p>
              <p className="text-[11px] text-muted-foreground">Rating</p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            {seller.is_breeder_verified && (
              <Badge className="bg-[#7c3aed]/10 text-[#7c3aed] border-0 text-xs font-medium px-3 py-1">
                <Shield className="w-3 h-3 mr-1" /> Verified Breeder
              </Badge>
            )}
            <Badge className="bg-[#ec4899]/10 text-[#ec4899] border-0 text-xs font-medium px-3 py-1">
              <Clock className="w-3 h-3 mr-1" /> Active Seller
            </Badge>
          </div>
        </div>
      </div>

      {/* Pet Listings */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">
            Listed Pets ({pets.length})
          </h2>
        </div>

        {pets.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center">
            <p className="text-muted-foreground text-sm">No pets listed yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {pets.map((pet) => {
              const img = pet.images?.[0] || "/placeholder.svg";
              return (
                <div
                  key={pet.id}
                  className="bg-card rounded-2xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
                  onClick={() => navigate(`/pet/${pet.id}`)}
                >
                  <div className="relative aspect-square">
                    <img src={img} alt={pet.breed} className="w-full h-full object-cover" />
                    {pet.is_featured && (
                      <span className="absolute top-2 left-2 bg-[#ec4899] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                        FEATURED
                      </span>
                    )}
                    {pet.vaccinated && (
                      <span className="absolute top-2 right-2 bg-[#10b981]/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                        VACCINATED
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-sm text-foreground truncate">{pet.breed}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {pet.gender} · {formatAge(pet.age_months)}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground truncate">{pet.city}, {pet.state}</span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-bold text-primary">₹{pet.price.toLocaleString("en-IN")}</p>
                      {pet.original_price && pet.original_price > pet.price && (
                        <p className="text-[11px] text-muted-foreground line-through">
                          ₹{pet.original_price.toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Contact CTA */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-3 pt-2 bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7] to-transparent z-30">
        <button
          onClick={() => {
            toast.info("Chat feature coming soon!");
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
        >
          <MessageCircle className="w-5 h-5" />
          Contact Breeder
        </button>
      </div>

      <BottomNavigation variant="buyer" />
    </div>
  );
};

export default SellerProfile;
