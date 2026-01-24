import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, Plus, Check, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import BottomNavigation from "@/components/BottomNavigation";

const pets = [
  { id: "1", name: "Fluffy", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop", selected: true },
  { id: "2", name: "Max", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&h=100&fit=crop", selected: false },
  { id: "3", name: "Bella", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop&sat=-100", selected: false },
];

const vetAvatars = [
  { id: "1", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop" },
  { id: "2", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop" },
];

const FindingVet = () => {
  const navigate = useNavigate();
  const [selectedPet, setSelectedPet] = useState("1");
  const [searchTime, setSearchTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSearchTime(prev => prev + 1);
    }, 1000);

    // Auto-navigate to connection ready after 5-8 seconds
    const autoNavigate = setTimeout(() => {
      navigate("/vet/connection-ready");
    }, Math.random() * 3000 + 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(autoNavigate);
    };
  }, [navigate]);

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
            <h1 className="text-lg font-bold">Finding a Vet</h1>
            <p className="text-xs text-pink-500 font-medium">STEP 2 OF 3</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Animated Search Area */}
        <div className="relative h-80 mb-8 flex items-center justify-center">
          {/* Outer rotating orbits */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Orbit 1 - Slow */}
            <div 
              className="absolute w-64 h-64 border border-purple-200/50 rounded-full"
              style={{ animation: "spin 15s linear infinite" }}
            />
            {/* Orbit 2 - Medium */}
            <div 
              className="absolute w-72 h-72 border border-pink-200/30 rounded-full"
              style={{ animation: "spin 20s linear infinite reverse" }}
            />
            {/* Orbit 3 - Outer */}
            <div 
              className="absolute w-80 h-80 border border-blue-200/20 rounded-full"
              style={{ animation: "spin 25s linear infinite" }}
            />
          </div>

          {/* Floating vet avatars on orbit */}
          <div 
            className="absolute"
            style={{ 
              animation: "orbit1 8s ease-in-out infinite",
              transformOrigin: "center center"
            }}
          >
            <div className="w-14 h-14 rounded-full overflow-hidden border-3 border-pink-400 shadow-lg bg-white p-0.5">
              <img 
                src={vetAvatars[0].image} 
                alt="Vet" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
          
          <div 
            className="absolute"
            style={{ 
              animation: "orbit2 10s ease-in-out infinite",
              transformOrigin: "center center"
            }}
          >
            <div className="w-12 h-12 rounded-full overflow-hidden border-3 border-purple-400 shadow-lg bg-white p-0.5">
              <img 
                src={vetAvatars[1].image} 
                alt="Vet" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>

          {/* Central pulsing stethoscope */}
          <div className="relative z-10">
            {/* Glow effect */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full blur-xl opacity-40"
              style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
            />
            {/* Main circle */}
            <div 
              className="relative w-28 h-28 bg-gradient-to-br from-pink-500 via-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl"
              style={{ animation: "heartbeat 1.5s ease-in-out infinite" }}
            >
              {/* Shimmer effect */}
              <div 
                className="absolute inset-0 rounded-full overflow-hidden"
                style={{ animation: "shimmer 3s ease-in-out infinite" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full" 
                  style={{ animation: "shimmer-move 3s ease-in-out infinite" }}
                />
              </div>
              <Stethoscope className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Connecting you with a<br />specialist in seconds
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span className="text-pink-500 font-semibold tracking-wider text-sm">SEARCHING NEARBY...</span>
          </div>
        </div>

        {/* Who is this for? */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-muted-foreground mb-4 tracking-wider">WHO IS THIS FOR?</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedPet(pet.id)}
                className="flex flex-col items-center gap-2 min-w-[80px]"
              >
                <div className={cn(
                  "relative w-20 h-20 rounded-full overflow-hidden border-3 transition-all",
                  selectedPet === pet.id 
                    ? "border-pink-500 ring-4 ring-pink-100" 
                    : "border-muted"
                )}>
                  <img 
                    src={pet.image} 
                    alt={pet.name}
                    className="w-full h-full object-cover"
                  />
                  {selectedPet === pet.id && (
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center border-2 border-white">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  selectedPet === pet.id ? "text-foreground" : "text-muted-foreground"
                )}>
                  {pet.name}
                </span>
              </button>
            ))}
            {/* Add new pet */}
            <button className="flex flex-col items-center gap-2 min-w-[80px]">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-muted flex items-center justify-center">
                <Plus className="w-6 h-6 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">New</span>
            </button>
          </div>
        </div>

        {/* Cancel Button */}
        <button 
          onClick={() => navigate("/vet")}
          className="w-full bg-muted text-muted-foreground py-4 rounded-2xl font-semibold"
        >
          Cancel Search
        </button>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes orbit1 {
          0% { transform: translate(-100px, -60px); }
          25% { transform: translate(80px, -80px); }
          50% { transform: translate(100px, 50px); }
          75% { transform: translate(-60px, 80px); }
          100% { transform: translate(-100px, -60px); }
        }
        @keyframes orbit2 {
          0% { transform: translate(90px, 70px); }
          25% { transform: translate(-80px, 60px); }
          50% { transform: translate(-100px, -40px); }
          75% { transform: translate(70px, -90px); }
          100% { transform: translate(90px, 70px); }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes shimmer-move {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <BottomNavigation />
    </div>
  );
};

export default FindingVet;
