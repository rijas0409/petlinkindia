import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowLeft, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import BottomNavigation from "@/components/BottomNavigation";

// Mock data for pet shop items
const SHOP_ITEMS = [
  {
    id: "1",
    name: "Premium Dog Food",
    category: "Food",
    price: 1299,
    originalPrice: 1599,
    rating: 4.5,
    reviews: 128,
    image: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400",
    inStock: true,
  },
  {
    id: "2",
    name: "Cat Scratching Post",
    category: "Accessories",
    price: 899,
    originalPrice: 1199,
    rating: 4.2,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400",
    inStock: true,
  },
  {
    id: "3",
    name: "Pet Grooming Kit",
    category: "Grooming",
    price: 599,
    originalPrice: 799,
    rating: 4.7,
    reviews: 256,
    image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400",
    inStock: true,
  },
  {
    id: "4",
    name: "Dog Leash & Collar Set",
    category: "Accessories",
    price: 449,
    originalPrice: 599,
    rating: 4.3,
    reviews: 167,
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
    inStock: false,
  },
];

const CATEGORIES = ["All", "Food", "Accessories", "Grooming", "Toys", "Health"];

const Shop = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<string[]>([]);

  const filteredItems = selectedCategory === "All" 
    ? SHOP_ITEMS 
    : SHOP_ITEMS.filter(item => item.category === selectedCategory);

  const addToCart = (itemId: string) => {
    setCart(prev => [...prev, itemId]);
    toast.success("Added to cart!");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-2xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Pet Shop
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Categories */}
      <section className="py-4 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden rounded-2xl border-0 shadow-card">
              <div className="relative aspect-square">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {!item.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="secondary">Out of Stock</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">{item.category}</p>
                <h3 className="font-medium text-sm line-clamp-2 mt-1">{item.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs">{item.rating}</span>
                  <span className="text-xs text-muted-foreground">({item.reviews})</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-bold text-primary">₹{item.price}</span>
                  <span className="text-xs text-muted-foreground line-through">₹{item.originalPrice}</span>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-3 rounded-xl"
                  disabled={!item.inStock}
                  onClick={() => addToCart(item.id)}
                >
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Shop;
