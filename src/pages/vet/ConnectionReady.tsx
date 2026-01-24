import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, Star, Video, BadgeCheck } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";

const ConnectionReady = () => {
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
            <h1 className="text-lg font-bold">Connection Ready</h1>
            <p className="text-xs text-pink-500 font-medium">STEP 3 OF 3</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Success Message */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground">Great news!</h2>
          <h2 className="text-2xl font-bold text-foreground">Dr. Sameer is ready.</h2>
        </div>

        {/* Doctor Card */}
        <div className="bg-card rounded-3xl p-6 border border-border shadow-lg mb-8">
          {/* Doctor Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-36 h-36 rounded-full overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100 p-1">
                <img 
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop"
                  alt="Dr. Sameer"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              {/* Verified Badge */}
              <div className="absolute bottom-2 right-2 w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <BadgeCheck className="w-5 h-5 text-white" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-foreground mb-1">Dr. Sameer</h3>
            <p className="text-pink-500 font-semibold mb-3">Senior Emergency Surgeon</p>
            
            <div className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">4.9</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">12+ Years Exp.</span>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span className="font-semibold text-foreground">Connecting...</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Dr. Sameer is ready to see you and your pet. Tap below to begin the secure video call.
          </p>
        </div>

        {/* Network Stability */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-pink-500 font-semibold tracking-wider text-xs">NETWORK STABILITY</span>
            <span className="font-semibold text-foreground">Excellent</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-500 to-pink-400 rounded-full w-full" />
          </div>
        </div>

        {/* Start Call Button */}
        <button 
          onClick={() => navigate("/vet/video-call")}
          className="w-full bg-gradient-to-r from-pink-500 to-pink-400 text-white py-4 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
        >
          <Video className="w-5 h-5" />
          Start Video Call
        </button>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ConnectionReady;
