import { useState, useMemo, useEffect } from "react";
import { ArrowLeft, Search, ChevronDown, Plus, Heart, X, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { useWishlist } from "@/hooks/useWishlist";
import { supabase } from "@/integrations/supabase/client";
import { PET_CATEGORIES, PET_NAMES, SORT_OPTIONS, QUICK_FILTERS } from "@/lib/shopData";

interface ProductListingScreenProps {
  petType: string;
  initialBreed?: string;
  initialSearch?: string;
  initialCategory?: string;
  onBack: () => void;
  onAddToCart: (product: { id: string; name: string; price: number; image: string }) => void;
}

interface ShopProduct {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  discount: number | null;
  brand: string;
  category: string;
  pet_type: string;
  images: string[] | null;
}

const ProductListingScreen = ({ petType, initialBreed, initialSearch, initialCategory, onBack, onAddToCart }: ProductListingScreenProps) => {
  const navigate = useNavigate();
  const categories = PET_CATEGORIES[petType] || PET_CATEGORIES.dog;
  const petName = PET_NAMES[petType] || "Pet";
  const { cartCount } = useCart();
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || categories[0]?.id || "food");
  const [sortBy, setSortBy] = useState("relevance");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialSearch || "");
  const [isSearchOpen, setIsSearchOpen] = useState(!!initialSearch);
  const [isPriceFilterOpen, setIsPriceFilterOpen] = useState(false);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { toggleProductWishlist, isProductInWishlist, totalWishlistCount } = useWishlist();

  // Task I: Fetch real products from database
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase
        .from("shop_products")
        .select("id, name, price, original_price, discount, brand, category, pet_type, images")
        .eq("is_active", true)
        .eq("verification_status", "verified")
        .eq("pet_type", petType);

      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }

      const { data } = await query.order("created_at", { ascending: false }).limit(50);
      setProducts(data || []);
      setLoading(false);
    };
    fetchProducts();
  }, [petType, selectedCategory]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (activeQuickFilters.includes("price-drop")) result = result.filter(p => (p.discount || 0) >= 20);
    if (activeQuickFilters.includes("best-seller")) result = result.slice(0, 6);

    switch (sortBy) {
      case "price-low": result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "discount": result.sort((a, b) => (b.discount || 0) - (a.discount || 0)); break;
    }
    return result;
  }, [products, searchQuery, priceRange, activeQuickFilters, sortBy]);

  const toggleQuickFilter = (id: string) => {
    setActiveQuickFilters(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handleAddToCart = (product: ShopProduct) => {
    onAddToCart({ id: product.id, name: product.name, price: product.price, image: product.images?.[0] || "" });
    toast.success(`${product.name} added to cart!`);
  };

  const handleToggleWishlist = async (product: ShopProduct) => {
    await toggleProductWishlist({
      id: product.id, name: product.name, price: product.price,
      image: product.images?.[0] || "", petType,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
            {isSearchOpen ? (
              <div className="flex items-center gap-2 flex-1">
                <Input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 rounded-full h-9" autoFocus />
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <h1 className="text-lg font-bold text-foreground">{petName} Shop</h1>
            )}
          </div>
          {!isSearchOpen && (
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center" onClick={() => setIsSearchOpen(true)}><Search className="w-5 h-5" /></button>
              <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center relative" onClick={() => navigate("/wishlist")}>
                <Heart className="w-5 h-5" />
                {totalWishlistCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">{totalWishlistCount}</span>}
              </button>
              <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center relative" onClick={() => navigate("/cart")}>
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">{cartCount}</span>}
              </button>
            </div>
          )}
        </div>
        <div className="px-4 py-2 border-t border-border space-y-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full whitespace-nowrap flex items-center gap-1">Sort By <ChevronDown className="w-3 h-3" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="rounded-xl">
                {SORT_OPTIONS.map(o => (
                  <DropdownMenuItem key={o.id} onClick={() => setSortBy(o.id)} className={sortBy === o.id ? "bg-primary/10" : ""}>{o.name}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full whitespace-nowrap flex items-center gap-1">Type <ChevronDown className="w-3 h-3" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="rounded-xl max-h-60 overflow-y-auto">
                {categories.map(cat => (
                  <DropdownMenuItem key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={selectedCategory === cat.id ? "bg-primary/10" : ""}>
                    {cat.icon} {cat.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Sheet open={isPriceFilterOpen} onOpenChange={setIsPriceFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full whitespace-nowrap flex items-center gap-1">Price <ChevronDown className="w-3 h-3" /></Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-3xl">
                <SheetHeader><SheetTitle>Price Range</SheetTitle></SheetHeader>
                <div className="py-6 space-y-6">
                  <div className="flex justify-between text-sm"><span>₹{priceRange[0]}</span><span>₹{priceRange[1]}</span></div>
                  <Slider value={priceRange} onValueChange={setPriceRange} max={50000} min={0} step={100} className="w-full" />
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setPriceRange([0, 50000])}>Reset</Button>
                    <Button className="flex-1 rounded-xl" onClick={() => setIsPriceFilterOpen(false)}>Apply</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {QUICK_FILTERS.map(filter => (
              <Button key={filter.id} variant={activeQuickFilters.includes(filter.id) ? "default" : "outline"}
                size="sm" className="rounded-full whitespace-nowrap text-xs" onClick={() => toggleQuickFilter(filter.id)}>
                {filter.icon} {filter.name}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-20 min-h-screen bg-card border-r border-border py-2 flex-shrink-0 overflow-y-auto">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
              className={`w-full flex flex-col items-center py-3 px-1 transition-colors ${selectedCategory === cat.id ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-muted"}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${selectedCategory === cat.id ? "bg-primary/20" : "bg-muted"}`}>{cat.icon}</div>
              <span className="text-[10px] text-center mt-1 text-muted-foreground line-clamp-2 px-1">{cat.name}</span>
            </button>
          ))}
        </aside>

        <main className="flex-1 p-3 pb-24">
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-card rounded-xl overflow-hidden shadow-sm border border-border animate-pulse">
                  <div className="aspect-square bg-muted" /><div className="p-3 space-y-2"><div className="h-4 bg-muted rounded" /></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No products found</p>
              <p className="text-sm text-muted-foreground/70">Products from seller panel will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map(product => {
                const imgUrl = product.images?.[0] || "";
                return (
                  <div key={product.id} className="bg-card rounded-xl overflow-hidden shadow-sm border border-border">
                    <div className="relative aspect-square bg-muted">
                      {imgUrl ? <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">🛒</div>}
                      {product.discount && product.discount > 0 && (
                        <span className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#ec4899' }}>{product.discount}% OFF</span>
                      )}
                      <Button size="icon" variant="ghost"
                        className={`absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 shadow-sm ${isProductInWishlist(product.id) ? "text-red-500" : "text-muted-foreground"}`}
                        onClick={() => handleToggleWishlist(product)}>
                        <Heart className={`w-4 h-4 ${isProductInWishlist(product.id) ? "fill-current" : ""}`} />
                      </Button>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-foreground line-clamp-2">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-base font-bold text-foreground">₹{product.price}</span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-xs text-muted-foreground line-through">₹{product.original_price}</span>
                        )}
                        <Button size="icon" className="w-7 h-7 rounded-full ml-auto" style={{ backgroundColor: '#ec4899' }}
                          onClick={() => handleAddToCart(product)}>
                          <Plus className="w-4 h-4 text-white" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductListingScreen;
