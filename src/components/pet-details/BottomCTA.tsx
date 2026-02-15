import { ShoppingBag } from "lucide-react";

interface BottomCTAProps {
  price: number;
  onBuyNow: () => void;
}

const BottomCTA = ({ price, onBuyNow }: BottomCTAProps) => {
  const emiPrice = Math.round(price / 6);
  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

  return (
    <div className="fixed bottom-14 left-0 right-0 z-50 bg-white border-t border-[#ECECEC] px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:bottom-0">
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        {/* Small bag icon */}
        <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="w-5 h-5 text-[#151B32]" />
        </div>

        {/* EMI option */}
        <div className="flex-1 py-2 px-3 rounded-xl border border-[#ECECEC] bg-white">
          <p className="text-[12px] font-bold text-[#151B32]">Buy with EMI</p>
          <p className="text-[10px] text-[#888]">from {formatPrice(emiPrice)}/mo</p>
        </div>

        {/* Buy Now */}
        <button
          onClick={onBuyNow}
          className="py-3 px-6 rounded-2xl text-white font-bold text-[13px] text-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #FF4BCD, #A855F7)" }}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default BottomCTA;
