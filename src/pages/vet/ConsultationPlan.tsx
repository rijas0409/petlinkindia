import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, Check, Video, FileText, MessageSquare, Shield, ArrowRight } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";

const ConsultationPlan = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 py-4">
          <button 
            onClick={() => navigate("/vet")}
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold">Consultation Plan</h1>
            <p className="text-xs text-pink-500 font-medium">STEP 1 OF 3</p>
          </div>
          <button className="w-10 h-10 rounded-full border border-pink-200 bg-pink-50 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-pink-500" />
          </button>
        </div>
      </header>

      <div className="px-4 space-y-6">
        {/* Hero Image Card */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-pink-50 to-teal-50 p-1">
          <div className="rounded-3xl overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop"
              alt="Vet with pet"
              className="w-full h-64 object-cover"
            />
            {/* Overlay Badge */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl py-3 px-4 flex items-center gap-3 shadow-lg">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-green-600 font-semibold">AVAILABLE NOW</p>
                  <p className="text-sm font-bold text-foreground">24 Top-rated Vets Online</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Title & Pricing */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Quick Connect</h2>
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="text-3xl font-bold text-pink-600">₹499</span>
            <span className="text-lg text-muted-foreground line-through">₹799</span>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">SAVINGS 35%</span>
          </div>
        </div>

        {/* Plan Inclusions */}
        <div className="bg-card rounded-3xl p-5 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-foreground">Plan Inclusions</h3>
          </div>

          <div className="space-y-4">
            {/* Video Call */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center shrink-0">
                <Video className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">15 Mins Video Call</h4>
                <p className="text-sm text-muted-foreground">Direct HD consultation with a specialist</p>
              </div>
            </div>

            {/* Digital Prescription */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Instant Digital Prescription</h4>
                <p className="text-sm text-muted-foreground">Valid at all pharmacies nationwide</p>
              </div>
            </div>

            {/* Follow-up Chat */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center shrink-0">
                <MessageSquare className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">24-Hour Follow-up Chat</h4>
                <p className="text-sm text-muted-foreground">Free follow-up messages for clarity</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Secure & private end-to-end encrypted call.</p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-20 md:bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border p-4 space-y-3">
        <button 
          onClick={() => navigate("/vet/payment-summary")}
          className="w-full bg-gradient-to-r from-pink-500 to-pink-400 text-white py-4 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          Continue to Payment
          <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-center text-xs text-muted-foreground">
          By proceeding, you agree to our <span className="text-pink-500 font-medium">Terms & Refund Policy</span>
        </p>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ConsultationPlan;
