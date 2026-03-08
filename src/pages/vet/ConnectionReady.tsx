import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, Star, BadgeCheck, Gift, Percent, ChevronRight, Lock } from "lucide-react";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const ConnectionReady = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPaying, setIsPaying] = useState(false);

  const matchedVet = useMemo(() => {
    const stateVet = (location.state as any)?.matchedVet;
    return (
      stateVet || {
        name: "Dr. Sameer",
        title: "Senior Emergency Surgeon",
        yearsOfExperience: 12,
        onlineFee: 499,
        profilePhoto: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop",
      }
    );
  }, [location.state]);

  useEffect(() => {
    const scriptId = "razorpay-checkout-script";
    if (document.getElementById(scriptId)) return;

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const proceedToPayment = () => {
    if (isPaying) return;
    setIsPaying(true);

    const amount = 49900;
    const keyId = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID as string | undefined;

    if (keyId && window.Razorpay) {
      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency: "INR",
        name: "PetLink",
        description: "Instant Vet Consultation",
        image: undefined,
        handler: (response: any) => {
          setIsPaying(false);
          navigate("/vet/video-call", {
            state: {
              flowType: "instant_video",
              paymentId: response?.razorpay_payment_id,
              matchedVet,
              assessmentData: (location.state as any)?.assessmentData || null,
            },
          });
        },
        modal: {
          ondismiss: () => {
            setIsPaying(false);
            navigate("/vet/payment-failed", { state: { source: "instant_video" } });
          },
        },
        prefill: {
          name: "Pet Parent",
        },
        theme: {
          color: "#FF4D6D",
        },
      });

      rzp.open();
      return;
    }

    setTimeout(() => {
      setIsPaying(false);
      navigate("/vet/payment-failed", { state: { source: "instant_video" } });
    }, 1200);
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
          <h1 className="text-lg font-bold">Consultation Summary</h1>
          <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="px-4 py-6 space-y-5">
        <div className="bg-card rounded-3xl p-6 border border-border shadow-lg">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-36 h-36 rounded-full overflow-hidden bg-muted p-1">
                <img src={matchedVet.profilePhoto} alt={matchedVet.name} className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="absolute bottom-2 right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-background shadow-lg">
                <BadgeCheck className="w-5 h-5 text-white" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-foreground mb-1">{matchedVet.name}</h3>
            <p className="text-primary font-semibold mb-3">{matchedVet.title}</p>

            <div className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">4.9</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{matchedVet.yearsOfExperience}+ Years Exp.</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Gift className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Saving Corner</h3>
              <p className="text-xs text-muted-foreground">Apply coupons & save more</p>
            </div>
          </div>
          <button className="w-full bg-background/80 border-2 border-dashed border-green-300 rounded-xl py-3 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-600">Apply Coupon</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground">BILL DETAILS</h2>
          <div className="flex justify-between text-sm">
            <span className="text-foreground">Consultation Fee</span>
            <span className="font-semibold">₹400</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground">Platform Fee</span>
            <span className="font-semibold">₹23</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground">GST (18%)</span>
            <span className="font-semibold">₹76</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between">
            <span className="font-bold text-foreground">Total Payable</span>
            <span className="font-bold text-xl text-primary">₹499</span>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4">
          <h2 className="text-sm font-bold text-muted-foreground mb-3">PAYMENT DETAILS</h2>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Method</span>
            <span className="font-semibold text-foreground">Razorpay</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Status</span>
            <span className="font-semibold text-foreground">Pending</span>
          </div>
        </div>

        <button
          onClick={proceedToPayment}
          disabled={isPaying}
          className="w-full bg-gradient-primary text-primary-foreground py-4 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          <Lock className="w-5 h-5" />
          {isPaying ? "Processing..." : "Proceed to Payment"}
        </button>
      </div>
    </div>
  );
};

export default ConnectionReady;
