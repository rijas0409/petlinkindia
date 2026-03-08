import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, X, Info } from "lucide-react";

const PaymentFailed = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goBackToSummary = () => {
    navigate("/vet/connection-ready", { state: (location.state as any)?.state || undefined });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => navigate("/vet")}
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Payment Status</h1>
          <button className="w-10 h-10 rounded-full border border-border bg-muted flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="px-4 py-8 flex flex-col items-center">
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full bg-red-100 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
              <X className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Payment Failed</h1>
        <p className="text-muted-foreground text-center mb-8">Something went wrong with your transaction. Please try again.</p>

        <div className="w-full bg-card rounded-2xl border border-border p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-foreground">Transaction Error</h3>
              <p className="text-sm text-muted-foreground">Veterinary Consultation Fee</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">₹499</p>
              <p className="text-xs font-semibold text-destructive">FAILED</p>
            </div>
          </div>
        </div>

        <div className="w-full bg-muted rounded-2xl p-4 border border-border flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-muted-foreground/20 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4 text-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            If any amount was deducted, it will be refunded to your source account within 5-7 business days.
          </p>
        </div>
      </div>

      <div className="fixed bottom-20 md:bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border p-4 space-y-3">
        <button onClick={goBackToSummary} className="w-full bg-gradient-primary text-primary-foreground py-4 rounded-2xl font-bold text-base shadow-lg">
          Retry Payment
        </button>
        <button onClick={goBackToSummary} className="w-full text-primary font-semibold py-3">
          Try Another Method
        </button>
      </div>
    </div>
  );
};

export default PaymentFailed;
