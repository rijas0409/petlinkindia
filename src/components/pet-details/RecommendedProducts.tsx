import { Sparkles, Plus } from "lucide-react";

interface RecommendedProductsProps {
  category: string;
}

const RecommendedProducts = ({ category }: RecommendedProductsProps) => {
  const products = [
    { name: `Premium ${category === "cat" ? "Cat" : "Puppy"} Starter Kibble`, price: "₹1,899", image: "🐾" },
    { name: "Indestructible Rubber Bone", price: "₹949", image: "🦴" },
    { name: "Cozy Pet Bed - Medium", price: "₹2,499", image: "🛏️" },
  ];

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-1.5 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">AI CURATED</span>
      </div>
      <h3 className="font-bold text-lg text-foreground mb-3">Recommended for this Pet</h3>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {products.map((p, i) => (
          <div key={i} className="min-w-[140px] max-w-[140px] bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex-shrink-0">
            <div className="aspect-square bg-muted flex items-center justify-center text-4xl">
              {p.image}
            </div>
            <div className="p-2.5">
              <p className="text-xs font-medium text-foreground line-clamp-2 leading-tight">{p.name}</p>
              <p className="text-sm font-bold text-foreground mt-1">{p.price}</p>
            </div>
          </div>
        ))}
        {/* Add more card */}
        <div className="min-w-[140px] max-w-[140px] bg-muted/50 rounded-2xl border border-dashed border-border flex items-center justify-center flex-shrink-0">
          <Plus className="w-6 h-6 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};

export default RecommendedProducts;
