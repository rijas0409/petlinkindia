interface BottomCTAProps {
  price: number;
  onBuyNow: () => void;
}

const BottomCTA = ({ price, onBuyNow }: BottomCTAProps) => {
  const emiPrice = Math.round(price / 6);
  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground font-medium">Buy with EMI</p>
          <p className="text-sm font-bold text-foreground">from {formatPrice(emiPrice)}/month</p>
        </div>
        <button
          onClick={onBuyNow}
          className="flex-1 py-3 rounded-2xl text-white font-bold text-sm text-center"
          style={{ background: "linear-gradient(135deg, hsl(345, 80%, 68%), hsl(270, 60%, 75%))" }}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default BottomCTA;
