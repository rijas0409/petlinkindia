import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Search, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import PetCard from "@/components/PetCard";
import CategoryFilter from "@/components/CategoryFilter";
import BottomNavigation from "@/components/BottomNavigation";
import HeaderProfileDropdown from "@/components/HeaderProfileDropdown";
import { useWishlist } from "@/hooks/useWishlist";
import { InlineBanners } from "@/components/DynamicBannerRenderer";

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { totalWishlistCount } = useWishlist();

  useEffect(() => {
    checkUser();
    fetchPets();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check role from authoritative user_roles table
    const { data: roleData } = await supabase.rpc("get_user_role", { _user_id: session.user.id });

    if (roleData === "seller") {
      navigate("/seller-dashboard");
      return;
    }
    if (roleData === "admin") {
      navigate("/admin");
      return;
    }
    if (roleData === "delivery_partner") {
      navigate("/delivery");
      return;
    }
    if (roleData === "product_seller") {
      navigate("/products-dashboard");
      return;
    }
    if (roleData === "vet") {
      navigate("/vet-dashboard");
      return;
    }

    setUser(session.user);
  };

  const fetchPets = async () => {
    try {
      // Only fetch verified and available pets
      const { data, error } = await supabase
        .from("pets")
        .select(`
          *,
          profiles:owner_id (name, rating, profile_photo)
        `)
        .eq("is_available", true)
        .eq("verification_status", "verified")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPets(data || []);
    } catch (error: any) {
      toast.error("Failed to load pets");
    } finally {
      setLoading(false);
    }
  };

  const filteredPets = selectedCategory
    ? pets.filter((pet) => pet.category === selectedCategory)
    : pets;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              PetLink
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Wishlist Button */}
            <button 
              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors relative"
              onClick={() => navigate("/wishlist")}
            >
              <Heart className="w-5 h-5" />
              {totalWishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                  {totalWishlistCount}
                </span>
              )}
            </button>
            {/* Cart Button */}
            <button 
              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
            <HeaderProfileDropdown />
          </div>
        </div>
      </header>

      {/* Dynamic Banners - Top */}
      <InlineBanners placement="top" />

      {/* Hero Section */}
      <section className="bg-gradient-soft py-12">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl md:text-5xl font-bold">
              Find Your Perfect
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Companion</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Browse thousands of verified pets from trusted sellers across India
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by breed, location, or category..."
                className="w-full pl-12 pr-4 py-4 rounded-3xl bg-card border border-border shadow-card focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 border-b border-border">
        <div className="container mx-auto px-4">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      </section>

      {/* Pet Listings */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {selectedCategory
                ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}s for You`
                : "All Pets"}
            </h2>
            <div className="text-sm text-muted-foreground">
              {filteredPets.length} pets available
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-96 bg-muted rounded-3xl animate-shimmer"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--muted-foreground) / 0.1) 50%, hsl(var(--muted)) 100%)",
                    backgroundSize: "1000px 100%",
                  }}
                />
              ))}
            </div>
          ) : filteredPets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No verified pets found in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPets.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>
          )}
        </div>
      </section>
      {/* Dynamic Banners - Bottom */}
      <InlineBanners placement="bottom" />

      <BottomNavigation variant="buyer" />
    </div>
  );
};

export default BuyerDashboard;
