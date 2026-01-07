import { useState } from "react";
import { ArrowLeft, Search, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  mrp: number;
  discount: number;
  image: string;
  isAd?: boolean;
  deliveryTime: string;
}

const PRODUCTS: Product[] = [
  { id: "1", name: "Fresh Puppy Kibble Puppy", brand: "Royal Canin", price: 999, mrp: 1299, discount: 23, image: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400", isAd: true, deliveryTime: "18 MINS" },
  { id: "2", name: "Purina Pro Plan Adult Kibble", brand: "Purina", price: 1899, mrp: 2199, discount: 14, image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400", isAd: true, deliveryTime: "18 MINS" },
  { id: "3", name: "Adult Dog Kibble Premium", brand: "Perlina", price: 1899, mrp: 2499, discount: 24, image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400", isAd: true, deliveryTime: "18 MINS" },
  { id: "4", name: "Fresh Dog Food (Chicken Recipe)", brand: "Fresh Pet", price: 19, mrp: 250, discount: 30, image: "https://images.unsplash.com/photo-1582798244946-57e36bb7a8a9?w=400", isAd: true, deliveryTime: "18 MINS" },
  { id: "5", name: "Wellness Core Dog Food", brand: "Wellness", price: 19, mrp: 60, discount: 20, image: "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=400", isAd: true, deliveryTime: "18 MINS" },
  { id: "6", name: "Canned Dog Food (Phaaliyan)", brand: "Fresh Pet", price: 19, mrp: 40, discount: 30, image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400", isAd: true, deliveryTime: "18 MINS" },
  { id: "7", name: "Comfort Dog Bed Premium", brand: "PetComfort", price: 2499, mrp: 3499, discount: 29, image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400", deliveryTime: "18 MINS" },
  { id: "8", name: "Leash & Collar Set", brand: "PetGear", price: 599, mrp: 899, discount: 33, image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400", deliveryTime: "18 MINS" },
];

const SIDEBAR_CATEGORIES = [
  { id: "food", name: "Food", image: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=100" },
  { id: "pharmacy", name: "Pharmacy", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100" },
  { id: "treats", name: "Treats", image: "https://images.unsplash.com/photo-1582798244946-57e36bb7a8a9?w=100" },
  { id: "toys", name: "Toys", image: "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=100" },
  { id: "exclusives", name: "Exclusives", image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=100" },
  { id: "grooming", name: "Grooming Supplies", image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=100" },
];

const FILTER_CHIPS = ["Price Drop", "Fresh", "Organic", "Verified"];

interface ProductListingScreenProps {
  petType: string;
  category: string;
  onBack: () => void;
  onAddToCart: (productId: string) => void;
}

const ProductListingScreen = ({ petType, category, onBack, onAddToCart }: ProductListingScreenProps) => {
  const [selectedSidebarCategory, setSelectedSidebarCategory] = useState(category);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const petName = petType.charAt(0).toUpperCase() + petType.slice(1).replace('-', ' ');

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const handleAddToCart = (productId: string) => {
    onAddToCart(productId);
    toast.success("Added to cart!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={onBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold text-foreground">{petName} Supplies</h1>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="w-5 h-5" />
          </Button>
        </div>

        {/* Filter Section */}
        <div className="px-4 py-2 border-t border-border">
          {/* Sort & Filter Dropdowns */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button variant="outline" size="sm" className="rounded-full whitespace-nowrap flex items-center gap-1">
              Sort By <ChevronDown className="w-3 h-3" />
            </Button>
            <Button variant="outline" size="sm" className="rounded-full whitespace-nowrap flex items-center gap-1">
              Type <ChevronDown className="w-3 h-3" />
            </Button>
            <Button variant="outline" size="sm" className="rounded-full whitespace-nowrap flex items-center gap-1">
              Price <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
          
          {/* Quick Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mt-1">
            {FILTER_CHIPS.map((filter) => (
              <Button
                key={filter}
                variant={activeFilters.includes(filter) ? "default" : "outline"}
                size="sm"
                className="rounded-full whitespace-nowrap text-xs"
                onClick={() => toggleFilter(filter)}
              >
                {filter === "Price Drop" && "🏷️ "}
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-20 min-h-screen bg-card border-r border-border py-2">
          {SIDEBAR_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedSidebarCategory(cat.id)}
              className={`w-full flex flex-col items-center py-3 px-1 transition-colors ${
                selectedSidebarCategory === cat.id 
                  ? "bg-primary/10 border-l-2 border-primary" 
                  : "hover:bg-muted"
              }`}
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[10px] text-center mt-1 text-muted-foreground line-clamp-2">
                {cat.name}
              </span>
            </button>
          ))}
        </aside>

        {/* Products Grid */}
        <main className="flex-1 p-3">
          <div className="grid grid-cols-2 gap-3">
            {PRODUCTS.map((product) => (
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
                  />
                  {product.isAd && (
                    <Badge className="absolute top-2 left-2 bg-muted-foreground/80 text-[10px] px-1.5 py-0.5">
                      AD
                    </Badge>
                  )}
                  <Button
                    size="icon"
                    className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground shadow-md"
                    onClick={() => handleAddToCart(product.id)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Product Info */}
                <div className="p-2">
                  <p className="text-[10px] text-muted-foreground">{product.deliveryTime}</p>
                  <h3 className="text-xs font-medium text-foreground line-clamp-2 mt-0.5">
                    {product.name}
                  </h3>
                  
                  {product.discount > 0 && (
                    <span className="text-xs font-bold text-emerald-600">
                      {product.discount}% OFF
                    </span>
                  )}
                  
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-sm font-bold text-foreground">₹{product.price}</span>
                    {product.mrp > product.price && (
                      <span className="text-xs text-muted-foreground line-through">₹{product.mrp}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductListingScreen;
