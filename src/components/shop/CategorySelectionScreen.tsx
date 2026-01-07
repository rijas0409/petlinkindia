import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  image: string;
  discount: string;
  gradient: string;
}

const DOG_CATEGORIES: Category[] = [
  { id: "food", name: "Food", image: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400", discount: "Up to 30% off", gradient: "from-rose-400 to-pink-400" },
  { id: "treats", name: "Treats", image: "https://images.unsplash.com/photo-1582798244946-57e36bb7a8a9?w=400", discount: "Up to 50% off", gradient: "from-teal-400 to-emerald-400" },
  { id: "pharmacy", name: "Pharmacy", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400", discount: "Up to 20% off", gradient: "from-cyan-400 to-teal-400" },
  { id: "toys", name: "Toys", image: "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=400", discount: "Up to 60% off", gradient: "from-orange-400 to-rose-400" },
  { id: "prescription-diet", name: "Prescription Diet", image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400", discount: "Exclusives", gradient: "from-purple-400 to-pink-400" },
  { id: "clothing", name: "Clothing & Fashion", image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400", discount: "Up to 60% off", gradient: "from-pink-400 to-rose-400" },
  { id: "grooming", name: "Grooming Supplies", image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400", discount: "Up to 40% off", gradient: "from-rose-400 to-pink-400" },
  { id: "walking", name: "Walking & Travel Gear", image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400", discount: "Up to 35% off", gradient: "from-violet-400 to-purple-400" },
  { id: "comfort", name: "Comfort & Bedding", image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400", discount: "Up to 45% off", gradient: "from-teal-400 to-cyan-400" },
];

interface CategorySelectionScreenProps {
  petType: string;
  onBack: () => void;
  onSelectCategory: (categoryId: string) => void;
}

const CategorySelectionScreen = ({ petType, onBack, onSelectCategory }: CategorySelectionScreenProps) => {
  const petName = petType.charAt(0).toUpperCase() + petType.slice(1).replace('-', ' ');
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">{petName} Shop</h1>
        </div>
      </header>

      {/* Categories Grid */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
          {DOG_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className="group flex flex-col items-center"
            >
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-muted shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
                {/* Discount Badge */}
                <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r ${category.gradient} text-white text-xs font-medium shadow-sm whitespace-nowrap`}>
                  {category.discount}
                </div>
              </div>
              <p className="mt-2 text-sm font-medium text-foreground text-center line-clamp-2">
                {category.name}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySelectionScreen;
