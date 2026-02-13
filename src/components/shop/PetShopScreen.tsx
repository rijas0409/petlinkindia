import { useState } from "react";
import { ArrowLeft, Heart, ShoppingCart, Search, Plus, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/contexts/CartContext";
import { PET_NAMES, generateProducts } from "@/lib/shopData";

import shopBannerDog from "@/assets/shop-banner-dog.png";
import shopBannerCat from "@/assets/shop-banner-cat.png";
import shopBannerBird from "@/assets/shop-banner-bird.png";
import shopBannerFish from "@/assets/shop-banner-fish.png";
import shopBannerRabbit from "@/assets/shop-banner-rabbit.png";
import shopBannerHamster from "@/assets/shop-banner-hamster.png";
import shopBannerMouse from "@/assets/shop-banner-mouse.png";
import shopBannerGuineaPig from "@/assets/shop-banner-guinea-pig.png";
import shopBannerTurtle from "@/assets/shop-banner-turtle.png";
import dogShopBanner from "@/assets/dog-shop-banner.png";
import dogBreedsGrid from "@/assets/dog-breeds-grid.png";
import catShopBanner from "@/assets/cat-shop-banner.png";
import catBreedsGrid from "@/assets/cat-breeds-grid.png";
import birdShopBanner from "@/assets/bird-shop-banner.png";
import birdBreedsGrid from "@/assets/bird-breeds-grid.png";
import fishShopBanner from "@/assets/fish-shop-banner.png";
import fishBreedsGrid from "@/assets/fish-breeds-grid.png";
import rabbitShopBanner from "@/assets/rabbit-shop-banner.png";

const BANNER_IMAGES: Record<string, string> = {
  dog: shopBannerDog,
  cat: shopBannerCat,
  birds: shopBannerBird,
  fish: shopBannerFish,
  rabbit: shopBannerRabbit,
  hamster: shopBannerHamster,
  "white-mouse": shopBannerMouse,
  "guinea-pig": shopBannerGuineaPig,
  turtle: shopBannerTurtle,
};

const BANNER_GRADIENTS: Record<string, string> = {
  dog: "linear-gradient(135deg, #fce7f3, #fdf2f8, #ffffff)",
  cat: "linear-gradient(135deg, #fce7f3, #ede9fe, #ffffff)",
  birds: "linear-gradient(135deg, #ecfdf5, #f0fdf4, #ffffff)",
  fish: "linear-gradient(135deg, #e0f2fe, #eff6ff, #ffffff)",
  rabbit: "linear-gradient(135deg, #ecfdf5, #fce7f3, #ffffff)",
  hamster: "linear-gradient(135deg, #fce7f3, #fff7ed, #ffffff)",
  "white-mouse": "linear-gradient(135deg, #e0f2fe, #ede9fe, #ffffff)",
  "guinea-pig": "linear-gradient(135deg, #ecfdf5, #f0fdf4, #ffffff)",
  turtle: "linear-gradient(135deg, #ccfbf1, #e0f2fe, #ffffff)",
};

// Pet-specific breed/category cards
const PET_BREED_CATEGORIES: Record<string, { name: string; image: string; bgColor: string }[]> = {
  dog: [
    { name: "Golden Retriever", image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200", bgColor: "#fef3c7" },
    { name: "Labrador Retriever", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200", bgColor: "#fce7f3" },
    { name: "German Shepherd", image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=200", bgColor: "#fce7f3" },
    { name: "Beagle", image: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=200", bgColor: "#ede9fe" },
    { name: "Pug", image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=200", bgColor: "#fef3c7" },
    { name: "Shih Tzu", image: "https://images.unsplash.com/photo-1583337130417-13104dec14a3?w=200", bgColor: "#fce7f3" },
    { name: "Husky", image: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=200", bgColor: "#ede9fe" },
    { name: "Cocker Spaniel", image: "https://images.unsplash.com/photo-1537151608828-ea2b11305ee2?w=200", bgColor: "#fef3c7" },
  ],
  cat: [
    { name: "Persian", image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=200", bgColor: "#fef3c7" },
    { name: "British Shorthair", image: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=200", bgColor: "#d1d5db" },
    { name: "Maine Coon", image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=200", bgColor: "#fce7f3" },
    { name: "Siamese", image: "https://images.unsplash.com/photo-1513245543132-31f507417b26?w=200", bgColor: "#ede9fe" },
    { name: "Bengal", image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200", bgColor: "#fef3c7" },
    { name: "Ragdoll", image: "https://images.unsplash.com/photo-1494256997604-768d1f608cac?w=200", bgColor: "#fce7f3" },
    { name: "Himalayan", image: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=200", bgColor: "#ede9fe" },
    { name: "Domestic Shorthair", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200", bgColor: "#fef3c7" },
  ],
  birds: [
    { name: "Parrots", image: "https://images.unsplash.com/photo-1544923408-75c5cef46f14?w=200", bgColor: "#d1fae5" },
    { name: "Budgies", image: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=200", bgColor: "#fce7f3" },
    { name: "Cockatiels", image: "https://images.unsplash.com/photo-1591198936750-16d8e15edb9e?w=200", bgColor: "#fef3c7" },
    { name: "Love Birds", image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200", bgColor: "#ede9fe" },
    { name: "Finches", image: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=200", bgColor: "#fef3c7" },
    { name: "Canaries", image: "https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?w=200", bgColor: "#fce7f3" },
    { name: "Pigeons", image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=200", bgColor: "#d1d5db" },
    { name: "Doves", image: "https://images.unsplash.com/photo-1557401620-67270b4f9c87?w=200", bgColor: "#ede9fe" },
  ],
  fish: [
    { name: "Goldfish", image: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=200", bgColor: "#fed7aa" },
    { name: "Betta", image: "https://images.unsplash.com/photo-1520302519878-3286b6a0d47d?w=200", bgColor: "#fecaca" },
    { name: "Tropical Fish", image: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=200", bgColor: "#bfdbfe" },
    { name: "Koi", image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=200", bgColor: "#fef3c7" },
    { name: "Shrimp", image: "https://images.unsplash.com/photo-1565680018093-ebb6d2ea3ef1?w=200", bgColor: "#fce7f3" },
    { name: "Catfish", image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=200", bgColor: "#d1d5db" },
    { name: "Arowana", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200", bgColor: "#ede9fe" },
    { name: "Discus Fish", image: "https://images.unsplash.com/photo-1520990652892-927abd5313e7?w=200", bgColor: "#fed7aa" },
  ],
  rabbit: [
    { name: "Food", image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200", bgColor: "#fef3c7" },
    { name: "Treats", image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200", bgColor: "#d1fae5" },
    { name: "Pharmacy", image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200", bgColor: "#fce7f3" },
    { name: "Toys", image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200", bgColor: "#bfdbfe" },
    { name: "Clothing & Fashion", image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200", bgColor: "#fce7f3" },
    { name: "Prescription Diet", image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200", bgColor: "#ede9fe" },
  ],
  hamster: [
    { name: "Food", image: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=200", bgColor: "#fef3c7" },
    { name: "Treats", image: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=200", bgColor: "#d1fae5" },
    { name: "Health Care", image: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=200", bgColor: "#fce7f3" },
    { name: "Toys", image: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=200", bgColor: "#bfdbfe" },
    { name: "Habitat", image: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=200", bgColor: "#fce7f3" },
    { name: "Accessories", image: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=200", bgColor: "#ede9fe" },
  ],
  "white-mouse": [
    { name: "Food", image: "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=200", bgColor: "#fef3c7" },
    { name: "Treats", image: "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=200", bgColor: "#d1fae5" },
    { name: "Health Care", image: "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=200", bgColor: "#fce7f3" },
    { name: "Toys", image: "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=200", bgColor: "#bfdbfe" },
    { name: "Habitat", image: "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=200", bgColor: "#fce7f3" },
    { name: "Accessories", image: "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=200", bgColor: "#ede9fe" },
  ],
  "guinea-pig": [
    { name: "Food", image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=200", bgColor: "#fef3c7" },
    { name: "Treats", image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=200", bgColor: "#d1fae5" },
    { name: "Health Care", image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=200", bgColor: "#fce7f3" },
    { name: "Toys", image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=200", bgColor: "#bfdbfe" },
    { name: "Habitat", image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=200", bgColor: "#fce7f3" },
    { name: "Accessories", image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=200", bgColor: "#ede9fe" },
  ],
  turtle: [
    { name: "Food", image: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=200", bgColor: "#ccfbf1" },
    { name: "Pharmacy", image: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=200", bgColor: "#fce7f3" },
    { name: "Tanks", image: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=200", bgColor: "#bfdbfe" },
    { name: "Lighting", image: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=200", bgColor: "#fef3c7" },
    { name: "Decor", image: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=200", bgColor: "#d1fae5" },
    { name: "Cleaning", image: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=200", bgColor: "#ede9fe" },
  ],
};

const DOG_BREED_NAMES = [
  "Golden Retriever", "Labrador Retriever", "German Shepherd", "Beagle",
  "Pug", "Shih Tzu", "Husky", "Cocker Spaniel",
];

const CAT_BREED_NAMES = [
  "Persian", "British Shorthair", "Maine Coon", "Siamese",
  "Bengal", "Ragdoll", "Himalayan", "Domestic Shorthair",
];

const BIRD_BREED_NAMES = [
  "Parrots", "Budgies", "Cockatiels", "Love Birds",
  "Finches", "Canaries", "Pigeons", "Doves",
];

const FISH_BREED_NAMES = [
  "Goldfish", "Betta", "Tropical Fish", "Koi",
  "Shrimp", "Catfish", "Arowana", "Discus Fish",
];

const RABBIT_CATEGORY_NAMES = [
  { name: "Food", categoryId: "food" },
  { name: "Treats", categoryId: "hay" },
  { name: "Pharmacy", categoryId: "pharmacy" },
  { name: "Toys", categoryId: "toys" },
  { name: "Clothing & Fashion", categoryId: "grooming" },
  { name: "Prescription Diet", categoryId: "feeders" },
];

const MOUSE_CATEGORY_NAMES = [
  { name: "Food", categoryId: "food" },
  { name: "Treats", categoryId: "hay" },
  { name: "Health Care", categoryId: "pharmacy" },
  { name: "Toys", categoryId: "toys" },
  { name: "Habitat", categoryId: "feeders" },
  { name: "Accessories", categoryId: "grooming" },
];

const HAMSTER_CATEGORY_NAMES = [
  { name: "Food", categoryId: "food" },
  { name: "Treats", categoryId: "hay" },
  { name: "Health Care", categoryId: "pharmacy" },
  { name: "Toys", categoryId: "toys" },
  { name: "Habitat", categoryId: "feeders" },
  { name: "Accessories", categoryId: "grooming" },
];

const GUINEA_PIG_CATEGORY_NAMES = [
  { name: "Food", categoryId: "food" },
  { name: "Treats", categoryId: "hay" },
  { name: "Pharmacy", categoryId: "pharmacy" },
  { name: "Toys", categoryId: "toys" },
  { name: "Bedding & Care", categoryId: "grooming" },
  { name: "Special Diet", categoryId: "feeders" },
];

const TURTLE_CATEGORY_NAMES = [
  { name: "Food", categoryId: "food" },
  { name: "Habitat", categoryId: "feeders" },
  { name: "Health Care", categoryId: "pharmacy" },
  { name: "Toys", categoryId: "toys" },
  { name: "Bedding & Care", categoryId: "grooming" },
  { name: "Faattc & Water", categoryId: "hay" },
];

// No FadeImage needed — all assets are bundled locally and load instantly

interface PetShopScreenProps {
  petType: string;
  onBack: () => void;
  onViewAllProducts: (breed?: string) => void;
  onViewAllProductsWithCategory?: (category: string) => void;
  onAddToCart: (productId: string) => void;
  onSearch?: (query: string) => void;
}

const PetShopScreen = ({ petType, onBack, onViewAllProducts, onViewAllProductsWithCategory, onAddToCart, onSearch }: PetShopScreenProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const petName = PET_NAMES[petType] || "Pet";
  const bannerImage = BANNER_IMAGES[petType] || shopBannerDog;
  const bannerGradient = BANNER_GRADIENTS[petType] || BANNER_GRADIENTS.dog;
  const breedCategories = PET_BREED_CATEGORIES[petType] || PET_BREED_CATEGORIES.dog;
  const { toggleProductWishlist, isProductInWishlist, totalWishlistCount } = useWishlist();
  const { cartCount } = useCart();

  const featuredProducts = generateProducts(petType, "food").slice(0, 2).map((p, i) => ({
    ...p,
    id: `featured-${petType}-${i}`,
    name: ["Hills Organic Mix For Small Dogs", "Pedigree Jumbone Peanut Butter..."][i],
    price: [1446, 200][i],
    originalPrice: [1786, 0][i],
    discount: [32, 0][i],
    image: [
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
      petType,
    });
  };

  // Determine grid cols based on pet type
  const gridCols = ["dog", "cat", "birds", "fish"].includes(petType) ? "grid-cols-4" : "grid-cols-3";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold text-foreground">{petName} Shop</h1>
          </div>
          <div className="flex items-center gap-2">
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
            <button
              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors relative"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-4 py-3">
        {isSearchOpen ? (
          <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-1.5">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim() && onSearch) {
                  onSearch(searchQuery.trim());
                }
              }}
              placeholder={`Search ${petName.toLowerCase()} products...`}
              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
              autoFocus
            />
            <button onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <button
            className="flex items-center gap-2 bg-muted rounded-xl px-4 py-2.5 w-full"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Search {petName.toLowerCase()} products...</span>
          </button>
        )}
      </div>

      {/* Banner */}
      <div className="px-4 pb-4">
        {petType === "dog" ? (
          <div className="relative rounded-2xl overflow-hidden" style={{ backgroundColor: '#fce7f3' }}>
            <img src={dogShopBanner} alt="Shop for Dogs" className="w-full rounded-2xl" />
          </div>
        ) : petType === "cat" ? (
          <div className="relative rounded-2xl overflow-hidden" style={{ backgroundColor: '#fce7f3' }}>
            <img src={catShopBanner} alt="Shop for Cats" className="w-full rounded-2xl" />
          </div>
        ) : petType === "birds" ? (
          <div className="relative rounded-2xl overflow-hidden" style={{ backgroundColor: '#fce7f3' }}>
            <img src={birdShopBanner} alt="Shop for Birds" className="w-full rounded-2xl" />
          </div>
        ) : petType === "fish" ? (
          <div className="relative rounded-2xl overflow-hidden" style={{ backgroundColor: '#fce7f3' }}>
            <img src={fishShopBanner} alt="Shop for Fish" className="w-full" />
            <div className="absolute bottom-0 left-0 right-0" style={{ height: "55%" }}>
              <div className="grid grid-cols-4 grid-rows-2 w-full h-full">
                {FISH_BREED_NAMES.map((breed, i) => (
                  <button
                    key={i}
                    className="w-full h-full hover:bg-black/5 active:bg-black/15 active:scale-95 transition-all duration-150 rounded-lg"
                    onClick={() => onViewAllProducts(breed)}
                    aria-label={breed}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : ["rabbit", "white-mouse", "hamster", "guinea-pig", "turtle"].includes(petType) ? (
          <div className="relative rounded-2xl overflow-hidden" style={{ backgroundColor: '#fce7f3' }}>
            <img 
              src={petType === "rabbit" ? rabbitShopBanner : petType === "white-mouse" ? shopBannerMouse : petType === "hamster" ? shopBannerHamster : petType === "guinea-pig" ? shopBannerGuineaPig : shopBannerTurtle} 
              alt={`Shop for ${petName}s`} 
              className="w-full" 
            />
            <div className="absolute bottom-0 left-0 right-0" style={{ height: "65%" }}>
              <div className="grid grid-cols-3 grid-rows-2 w-full h-full">
                {(petType === "rabbit" ? RABBIT_CATEGORY_NAMES : petType === "white-mouse" ? MOUSE_CATEGORY_NAMES : petType === "hamster" ? HAMSTER_CATEGORY_NAMES : petType === "guinea-pig" ? GUINEA_PIG_CATEGORY_NAMES : TURTLE_CATEGORY_NAMES).map((cat, i) => (
                  <button
                    key={i}
                    className="w-full h-full hover:bg-black/5 active:bg-black/15 active:scale-95 transition-all duration-150 rounded-lg"
                    onClick={() => onViewAllProductsWithCategory?.(cat.categoryId)}
                    aria-label={cat.name}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: bannerGradient }}>
            <div className="flex items-center">
              <div className="flex-1 p-5">
                <h3 className="text-foreground text-xl font-bold leading-tight">Shop for {petName}s</h3>
                <p className="text-muted-foreground text-xs mt-1">Find everything your {petName.toLowerCase()}<br />needs in one place.</p>
              </div>
              <div className="w-40 h-32">
                <img src={bannerImage} alt={`Shop for ${petName}s`} className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Breed/Category Grid */}
      <div className="px-4 pb-4">
        {petType === "dog" ? (
          <div className="relative rounded-2xl overflow-hidden" style={{ backgroundColor: '#fce7f3' }}>
            <img src={dogBreedsGrid} alt="Dog Breeds" className="w-full rounded-2xl" />
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-2">
              {DOG_BREED_NAMES.map((breed, i) => (
                <button
                  key={i}
                  className="w-full h-full rounded-2xl hover:bg-black/5 active:bg-black/10 transition-colors"
                  onClick={() => onViewAllProducts(breed)}
                  aria-label={breed}
                />
              ))}
            </div>
          </div>
        ) : petType === "cat" ? (
          <div className="relative rounded-2xl overflow-hidden" style={{ backgroundColor: '#fce7f3' }}>
            <img src={catBreedsGrid} alt="Cat Breeds" className="w-full rounded-2xl" />
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-2">
              {CAT_BREED_NAMES.map((breed, i) => (
                <button
                  key={i}
                  className="w-full h-full rounded-2xl hover:bg-black/5 active:bg-black/10 transition-colors"
                  onClick={() => onViewAllProducts(breed)}
                  aria-label={breed}
                />
              ))}
            </div>
          </div>
        ) : petType === "birds" ? (
          <div className="relative rounded-2xl overflow-hidden" style={{ backgroundColor: '#fce7f3' }}>
            <img src={birdBreedsGrid} alt="Bird Breeds" className="w-full rounded-2xl" />
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-2">
              {BIRD_BREED_NAMES.map((breed, i) => (
                <button
                  key={i}
                  className="w-full h-full rounded-2xl hover:bg-black/5 active:bg-black/10 transition-colors"
                  onClick={() => onViewAllProducts(breed)}
                  aria-label={breed}
                />
              ))}
            </div>
          </div>
        ) : petType === "fish" ? null : ["rabbit", "white-mouse", "hamster", "guinea-pig", "turtle"].includes(petType) ? null : (
          <div className={`grid ${gridCols} gap-2.5`}>
            {breedCategories.map((item, index) => (
              <button
                key={index}
                className="flex flex-col items-center"
              >
                <div
                  className="w-full aspect-square rounded-2xl overflow-hidden flex items-center justify-center p-2"
                  style={{ backgroundColor: item.bgColor }}
                >
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                </div>
                <span className="text-[11px] text-foreground font-medium text-center mt-1.5 line-clamp-2 leading-tight">{item.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Featured Products */}
      <div className="px-4 pb-24">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground">Featured Products</h2>
          <button
            className="flex items-center gap-0.5 text-sm font-medium"
            style={{ color: '#7c3aed' }}
            onClick={() => onViewAllProducts()}
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {featuredProducts.map((product) => (
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

export default PetShopScreen;
