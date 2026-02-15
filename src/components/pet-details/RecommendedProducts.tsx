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
    <div className="px-5 py-4">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-[#A855F7]" />
        <span className="text-[9px] font-bold text-[#999] uppercase tracking-widest">AI CURATED</span>
      </div>
      <h3 className="font-bold text-[17px] text-[#151B32] mb-3">Recommended for this Pet</h3>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
        {products.map((p, i) => (
          <div key={i} className="min-w-[140px] max-w-[140px] bg-white rounded-2xl border border-[#ECECEC] overflow-hidden shadow-sm flex-shrink-0">
            <div className="aspect-square bg-[#F5F5F7] flex items-center justify-center text-4xl relative">
              {p.image}
              <button className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-[#A855F7] flex items-center justify-center shadow">
                <Plus className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <div className="p-2.5">
              <p className="text-[11px] font-semibold text-[#151B32] line-clamp-2 leading-tight">{p.name}</p>
              <p className="text-[13px] font-bold text-[#F472D0] mt-1">{p.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
