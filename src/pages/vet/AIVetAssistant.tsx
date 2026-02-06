import { useNavigate } from "react-router-dom";
import { ArrowLeft, X, ChevronRight, PawPrint, FileText, PlusSquare, ArrowRight } from "lucide-react";

const petImages = [
  { src: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop", alt: "Dog", rotate: "-rotate-3" },
  { src: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop", alt: "Cat", rotate: "rotate-2" },
  { src: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=300&h=300&fit=crop", alt: "Bird", rotate: "rotate-3" },
  { src: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=300&h=300&fit=crop", alt: "Hamster", rotate: "-rotate-2" },
];

const features = [
  {
    icon: <PawPrint className="w-5 h-5 text-white" />,
    bg: "bg-purple-600",
    title: "Profile Your Pet",
    subtitle: "Quick setup with breed and age.",
  },
  {
    icon: <FileText className="w-5 h-5 text-white" />,
    bg: "bg-pink-500",
    title: "Share Symptoms",
    subtitle: "Chat naturally about your concerns.",
  },
  {
    icon: <PlusSquare className="w-5 h-5 text-white" />,
    bg: "bg-purple-500",
    title: "Expert Guidance",
    subtitle: "Instant advice & clinic matching.",
  },
];

const AIVetAssistant = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/80 to-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-xs font-bold tracking-widest text-pink-500">PREMIUM CARE</p>
          <p className="text-sm font-bold text-foreground">AI Vet Assistant</p>
        </div>
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Pet Image Collage */}
      <div className="flex justify-center py-6">
        <div className="grid grid-cols-2 gap-3 w-64">
          {petImages.map((pet, i) => (
            <div key={i} className={`w-28 h-28 rounded-2xl overflow-hidden shadow-lg ${pet.rotate} border-2 border-white`}>
              <img src={pet.src} alt={pet.alt} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Heading */}
      <div className="text-center px-6 mb-2">
        <h1 className="text-2xl font-bold text-foreground">
          Smart Care for{" "}
          <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Your Best Friend
          </span>
        </h1>
      </div>
      <p className="text-center text-sm text-muted-foreground px-8 mb-6">
        Get instant veterinary guidance and book appointments with top-rated local experts.
      </p>

      {/* Feature Cards */}
      <div className="px-4 space-y-3 flex-1">
        {features.map((f, i) => (
          <div key={i} className="bg-card rounded-2xl p-4 shadow-sm border border-border flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center flex-shrink-0`}>
              {f.icon}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-foreground">{f.title}</p>
              <p className="text-xs text-muted-foreground">{f.subtitle}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </div>
        ))}
      </div>

      {/* Footer CTAs */}
      <div className="px-4 py-6 space-y-3">
        <button
          onClick={() => navigate("/vet/consultation-plan")}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
        >
          Start AI Assessment <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => navigate("/vet")}
          className="w-full text-center text-sm font-bold tracking-widest text-muted-foreground"
        >
          SKIP TO VET LIST
        </button>
      </div>
    </div>
  );
};

export default AIVetAssistant;
