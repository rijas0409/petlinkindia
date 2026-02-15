import { useState } from "react";
import { Sparkles, Utensils, Activity, Heart } from "lucide-react";

interface AIInsightsCardProps {
  breed: string;
  category: string;
  ageMonths: number;
}

const AIInsightsCard = ({ breed, category, ageMonths }: AIInsightsCardProps) => {
  const [activeTab, setActiveTab] = useState<"quick" | "deep">("quick");

  const isYoung = ageMonths < 12;

  const quickFacts = [
    {
      icon: Utensils,
      title: "Nutrition Focus",
      desc: `High-protein ${isYoung ? "puppy" : "adult"} kibble. Small kibble size recommended for dental health.`,
      color: "hsl(345, 80%, 68%)",
    },
    {
      icon: Activity,
      title: "Activity Level",
      desc: `Moderate energy. ${isYoung ? "20-30" : "30-60"} mins of daily play is sufficient for this breed.`,
      color: "hsl(200, 70%, 55%)",
    },
    {
      icon: Heart,
      title: "Avg Lifespan",
      desc: `${category === "dog" ? "Dogs" : category === "cat" ? "Cats" : "Pets"} of this breed typically live 12-16 years with proper veterinary care.`,
      color: "hsl(0, 75%, 65%)",
    },
  ];

  return (
    <div className="mx-4 rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[hsl(345,80%,68%)] to-[hsl(270,60%,75%)] flex items-center justify-center">
            <span className="text-white text-sm font-bold">+</span>
          </div>
          <span className="font-bold text-foreground text-[15px]">Sruvo AI Insights</span>
        </div>
        <div className="flex bg-muted rounded-full p-0.5">
          <button
            onClick={() => setActiveTab("quick")}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              activeTab === "quick" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Quick Facts
          </button>
          <button
            onClick={() => setActiveTab("deep")}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              activeTab === "deep" ? "bg-[hsl(220,60%,55%)] text-white shadow-sm" : "text-muted-foreground"
            }`}
          >
            Deep Dive
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4 space-y-4">
        {activeTab === "quick" ? (
          quickFacts.map((fact, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${fact.color}15` }}>
                <fact.icon className="w-4 h-4" style={{ color: fact.color }} />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{fact.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{fact.desc}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {breed} is known for its friendly, reliable, and devoted temperament. This breed requires regular grooming and moderate exercise. 
              They are excellent family pets and are highly trainable.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Common health considerations include hip dysplasia, eye conditions, and cardiac issues. Regular vet checkups are recommended every 6 months.
            </p>
          </div>
        )}

        <button className="text-primary text-sm font-semibold flex items-center gap-1">
          Get Personalised Care Plan →
        </button>
      </div>
    </div>
  );
};

export default AIInsightsCard;
