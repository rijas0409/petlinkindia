import { useState, useMemo } from "react";
import { ArrowLeft, Search, ChevronDown, Plus, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { useWishlist } from "@/hooks/useWishlist";
import { PET_CATEGORIES, PET_NAMES, generateProducts, SORT_OPTIONS, BRAND_OPTIONS, QUICK_FILTERS } from "@/lib/shopData";

const DOG_BREEDS = [
  "All Breeds",
  "Golden Retriever", "Labrador Retriever", "German Shepherd", "Beagle",
  "Pug", "Shih Tzu", "Cocker Spaniel",
];

interface ProductListingScreenProps {
  petType: string;
  initialBreed?: string;
  onBack: () => void;
  onAddToCart: (productId: string) => void;
}

const ProductListingScreen = ({ petType, initialBreed, onBack, onAddToCart }: ProductListingScreenProps) => {
  const categories = PET_CATEGORIES[petType] || PET_CATEGORIES.dog;
  const petName = PET_NAMES[petType] || "Pet";
  
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || "food");
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedBreed, setSelectedBreed] = useState(initialBreed || "All Breeds");
  const [selectedBrand, setSelectedBrand] = useState("All Brands");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPriceFilterOpen, setIsPriceFilterOpen] = useState(false);
  
  const { toggleProductWishlist, isProductInWishlist } = useWishlist();

  // Generate products based on selected pet type and category
  const allProducts = useMemo(() => {
    return generateProducts(petType, selectedCategory);
  }, [petType, selectedCategory]);

  // Apply filters and sorting
  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query)
      );
    }

    // Brand filter
    if (selectedBrand !== "All Brands") {
      products = products.filter((p) => p.brand === selectedBrand);
    }

    // Price range filter
    products = products.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Quick filters
    if (activeQuickFilters.includes("price-drop")) {
      products = products.filter((p) => p.discount >= 20);
    }
    if (activeQuickFilters.includes("best-seller")) {
      products = products.slice(0, 6);
    }
    if (activeQuickFilters.includes("trending")) {
      products = products.filter((p) => p.discount >= 15);
    }

    // Sorting
    switch (sortBy) {
      case "price-low":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        products.sort((a, b) => b.price - a.price);
        break;
      case "discount":
        products.sort((a, b) => b.discount - a.discount);
        break;
      default:
        // Relevance - sponsored first
        products.sort((a, b) => (b.isSponsored ? 1 : 0) - (a.isSponsored ? 1 : 0));
    }

    return products;
  }, [allProducts, searchQuery, selectedBrand, priceRange, activeQuickFilters, sortBy]);

  const toggleQuickFilter = (filterId: string) => {
    setActiveQuickFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId]
    );
  };

  const handleAddToCart = (product: any) => {
    onAddToCart(product.id);
    toast.success(`${product.name} added to cart!`);
  };

  const handleToggleWishlist = async (product: any) => {
    await toggleProductWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      petType: petType,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={onBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            {isSearchOpen ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 rounded-full h-9"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <h1 className="text-lg font-bold text-foreground">{petName} Shop</h1>
            )}
          </div>
          {!isSearchOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Filter Section */}
        <div className="px-4 py-2 border-t border-border space-y-2">
          {/* Sort & Filter Dropdowns */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {/* Sort By */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full whitespace-nowrap flex items-center gap-1"
                >
                  Sort By <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="rounded-xl">
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    onClick={() => setSortBy(option.id)}
                    className={sortBy === option.id ? "bg-primary/10" : ""}
                  >
                    {option.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Breed (dog only) */}
            {petType === "dog" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={selectedBreed !== "All Breeds" ? "default" : "outline"}
                    size="sm"
                    className="rounded-full whitespace-nowrap flex items-center gap-1"
                  >
                    {selectedBreed !== "All Breeds" ? `🐕 ${selectedBreed}` : "Breed"} <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="rounded-xl max-h-60 overflow-y-auto">
                  {DOG_BREEDS.map((breed) => (
                    <DropdownMenuItem
                      key={breed}
                      onClick={() => setSelectedBreed(breed)}
                      className={selectedBreed === breed ? "bg-primary/10" : ""}
                    >
                      {breed}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Brand */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full whitespace-nowrap flex items-center gap-1"
                >
                  Brand <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="rounded-xl max-h-60 overflow-y-auto">
                {BRAND_OPTIONS.map((brand) => (
                  <DropdownMenuItem
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={selectedBrand === brand ? "bg-primary/10" : ""}
                  >
                    {brand}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Type - Category selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full whitespace-nowrap flex items-center gap-1"
                >
                  Type <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="rounded-xl max-h-60 overflow-y-auto">
                {categories.map((cat) => (
                  <DropdownMenuItem
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={selectedCategory === cat.id ? "bg-primary/10" : ""}
                  >
                    {cat.icon} {cat.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Price Range */}
            <Sheet open={isPriceFilterOpen} onOpenChange={setIsPriceFilterOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full whitespace-nowrap flex items-center gap-1"
                >
                  Price <ChevronDown className="w-3 h-3" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-3xl">
                <SheetHeader>
                  <SheetTitle>Price Range</SheetTitle>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  <div className="flex justify-between text-sm">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={5000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl"
                      onClick={() => setPriceRange([0, 5000])}
                    >
                      Reset
                    </Button>
                    <Button
                      className="flex-1 rounded-xl"
                      onClick={() => setIsPriceFilterOpen(false)}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {QUICK_FILTERS.map((filter) => (
              <Button
                key={filter.id}
                variant={activeQuickFilters.includes(filter.id) ? "default" : "outline"}
                size="sm"
                className="rounded-full whitespace-nowrap text-xs"
                onClick={() => toggleQuickFilter(filter.id)}
              >
                {filter.icon} {filter.name}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Left Sidebar - Pet-Specific Categories */}
        <aside className="w-20 min-h-screen bg-card border-r border-border py-2 flex-shrink-0 overflow-y-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full flex flex-col items-center py-3 px-1 transition-colors ${
                selectedCategory === cat.id
                  ? "bg-primary/10 border-l-2 border-primary"
                  : "hover:bg-muted"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  selectedCategory === cat.id ? "bg-primary/20" : "bg-muted"
                }`}
              >
                {cat.icon}
              </div>
              <span className="text-[10px] text-center mt-1 text-muted-foreground line-clamp-2 px-1">
                {cat.name}
              </span>
            </button>
          ))}
        </aside>

        {/* Products Grid */}
        <main className="flex-1 p-3 pb-24">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No products found</p>
              <p className="text-sm text-muted-foreground/70">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-card rounded-xl overflow-hidden shadow-sm border border-border"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-muted">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400";
                      }}
                    />
                    {product.isSponsored && (
                      <Badge className="absolute top-2 left-2 bg-muted-foreground/80 text-[10px] px-1.5 py-0.5">
                        AD
                      </Badge>
                    )}
                    {product.discount >= 20 && (
                      <Badge className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5">
                        {product.discount}% OFF
                      </Badge>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className={`absolute bottom-10 right-2 w-7 h-7 rounded-full bg-white/80 shadow-sm ${
                        isProductInWishlist(product.id) ? "text-red-500" : "text-muted-foreground"
                      }`}
                      onClick={() => handleToggleWishlist(product)}
                    >
                      <Heart className={`w-4 h-4 ${isProductInWishlist(product.id) ? "fill-current" : ""}`} />
                    </Button>
                    <Button
                      size="icon"
                      className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground shadow-md"
                      onClick={() => handleAddToCart(product)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Product Info */}
                  <div className="p-2">
                    <p className="text-[10px] text-muted-foreground">
                      {product.deliveryTime} MINS
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {product.brand}
                    </p>
                    <h3 className="text-xs font-medium text-foreground line-clamp-2 mt-0.5">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-sm font-bold text-foreground">
                        ₹{product.price}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-xs text-muted-foreground line-through">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductListingScreen;
