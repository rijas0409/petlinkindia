import { useState } from "react";
import { Heart, ShoppingCart, Search, MapPin, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { generateProducts } from "@/lib/shopData";
import shopPromoBanner from "@/assets/shop-promo-banner.png";

const PET_OPTIONS = [
  { id: "dog", name: "Dogs", image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200" },
  { id: "cat", name: "Cats", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200" },
  { id: "birds", name: "Birds", image: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=200" },
  { id: "fish", name: "Fish", image: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=200" },
  { id: "rabbit", name: "Rabbits", image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200" },
  { id: "hamster", name: "Hamsters", image: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=200" },
  { id: "guinea-pig", name: "Guinea Pig", image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=200" },
  { id: "turtle", name: "Turtle", image: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=200" },
  { id: "white-mouse", name: "Mouse", image: "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=200" },
];

interface ShopHomeScreenProps {
  onSelectPet: (petId: string) => void;
  onAddToCart: (productId: string) => void;
}

const ShopHomeScreen = ({ onSelectPet, onAddToCart }: ShopHomeScreenProps) => {
  const navigate = useNavigate();
  const { toggleProductWishlist, isProductInWishlist, totalWishlistCount } = useWishlist();
  const [sortBy, setSortBy] = useState("relevance");

  // Generate best sellers from mixed pet types
  const bestSellers = generateProducts("dog", "food").slice(0, 4).map((p, i) => ({
    ...p,
    id: `best-seller-${i}`,
    name: ["Hills Organic Mix For Small Dogs", "Pedigree Jumbone Peanut Butter...", "Hills Organic Mix For Small Dogs", "Pedigree Jumbone Peanut Butter..."][i],
    price: [1446, 200, 1446, 200][i],
    originalPrice: [1786, 0, 1786, 0][i],
    discount: [32, 0, 32, 0][i],
    image: [
      "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400",
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400",
      "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400",
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400",
    ][i],
  }));

  const handleToggleWishlist = async (product: any) => {
    await toggleProductWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      petType: "dog",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}>
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-lg font-bold text-foreground">PetLink</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5 ml-10">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Gurgaon</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full relative"
              onClick={() => navigate("/wishlist")}
            >
              <Heart className="w-5 h-5" />
              {totalWishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                  {totalWishlistCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ShoppingCart className="w-5 h-5" />
            </Button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg, #ec4899, #f97316)' }}>
              R
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-2.5">
          <Search className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Search food, toys, meds…</span>
        </div>
      </div>

      {/* Promo Banner */}
      <div className="px-4 pb-4">
        <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)' }}>
          <div className="flex items-center">
            <div className="flex-1 p-5">
              <h3 className="text-white text-xl font-bold leading-tight">Summer Pet<br />Care Deals</h3>
              <p className="text-white/80 text-xs mt-1">Up to 40% off sunscreens &<br />hydration kits</p>
              <button className="mt-3 bg-white text-foreground text-xs font-semibold px-4 py-1.5 rounded-full">
                Shop Now
              </button>
            </div>
            <div className="w-40 h-36">
              <img src={shopPromoBanner} alt="Pet care deals" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* Who are you shopping for? */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground">Who are you shopping for?</h2>
          <span className="text-sm font-medium" style={{ color: '#7c3aed' }}>View All</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {PET_OPTIONS.map((pet) => (
            <button
              key={pet.id}
              onClick={() => onSelectPet(pet.id)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border bg-muted">
                <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs text-foreground font-medium">{pet.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Best Sellers */}
      <div className="px-4 pb-24">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground">Best Sellers</h2>
          <button className="flex items-center gap-1 text-sm text-muted-foreground">
            Sort by <ChevronDown className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {bestSellers.map((product) => (
            <div key={product.id} className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border">
              <div className="relative aspect-square bg-muted" style={{ backgroundColor: '#fce7f3' }}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400";
                  }}
                />
                {product.discount > 0 && (
                  <span className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#ec4899' }}>
                    {product.discount}% OFF
                  </span>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className={`absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 shadow-sm ${
                    isProductInWishlist(product.id) ? "text-red-500" : "text-muted-foreground"
                  }`}
                  onClick={() => handleToggleWishlist(product)}
                >
                  <Heart className={`w-4 h-4 ${isProductInWishlist(product.id) ? "fill-current" : ""}`} />
                </Button>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-foreground line-clamp-2">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-base font-bold text-foreground">₹{product.price}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice}</span>
                  )}
                  <Button
                    size="icon"
                    className="w-7 h-7 rounded-full ml-auto"
                    style={{ backgroundColor: '#ec4899' }}
                    onClick={() => onAddToCart(product.id)}
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopHomeScreen;
