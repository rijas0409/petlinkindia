import { useState } from "react";
import { Utensils, Activity, Heart } from "lucide-react";

interface AIInsightsCardProps {
  breed: string;
  category: string;
  ageMonths: number;
}

const AIInsightsCard = ({ breed, category, ageMonths }: AIInsightsCardProps) => {
  const [activeTab, setActiveTab] = useState<"insights" | "quick" | "deep">("insights");

  const isYoung = ageMonths < 12;

  const quickFacts = [
    {
      icon: Utensils,
      title: "Nutrition Focus",
      desc: `High-protein ${isYoung ? "puppy" : "adult"} kibble. Small kibble size recommended for dental health.`,
      bgColor: "#FFE4EF",
      iconColor: "#E8457C",
    },
    {
      icon: Activity,
      title: "Activity Level",
      desc: `Moderate energy. ${isYoung ? "20-30" : "30-60"} mins of daily play is sufficient for this breed.`,
      bgColor: "#E0F0FF",
      iconColor: "#4A90D9",
    },
    {
      icon: Heart,
      title: "Avg Lifespan",
      desc: `Pomeranians typically live 12-16 years with proper veterinary care.`,
      bgColor: "#FFE4E4",
      iconColor: "#E84545",
    },
  ];

  return (
    <div className="mx-4 rounded-2xl border border-[#F9D4E8] bg-white overflow-hidden">
      {/* Tab header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FF4BCD] to-[#A855F7] flex items-center justify-center">
            <span className="text-white text-sm font-bold">+</span>
          </div>
          <span className="font-bold text-[#151B32] text-[15px]">Sruvo AI Insights</span>
        </div>
        <div className="flex bg-[#F3F3F5] rounded-full p-0.5">
          <button
            onClick={() => setActiveTab("quick")}
            className={`px-3 py-1 text-[10px] font-semibold rounded-full transition-colors ${
              activeTab === "quick" ? "bg-white text-[#151B32] shadow-sm" : "text-[#999]"
            }`}
          >
            Quick Facts
          </button>
          <button
            onClick={() => setActiveTab("deep")}
            className={`px-3 py-1 text-[10px] font-semibold rounded-full transition-colors ${
              activeTab === "deep" ? "bg-[#4A6CF7] text-white shadow-sm" : "text-[#999]"
            }`}
          >
            Deep Dive
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4 space-y-4">
        {activeTab !== "deep" ? (
          quickFacts.map((fact, i) => (
            <div key={i} className="flex gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: fact.bgColor }}
              >
                <fact.icon className="w-4 h-4" style={{ color: fact.iconColor }} />
              </div>
              <div>
                <p className="font-bold text-[13px] text-[#151B32]">{fact.title}</p>
                <p className="text-[11px] text-[#888] leading-relaxed mt-0.5">{fact.desc}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-[#888] leading-relaxed">
              {breed} is known for its friendly, reliable, and devoted temperament. This breed requires regular grooming and moderate exercise.
              They are excellent family pets and are highly trainable.
            </p>
            <p className="text-xs text-[#888] leading-relaxed">
              Common health considerations include hip dysplasia, eye conditions, and cardiac issues. Regular vet checkups are recommended every 6 months.
            </p>
          </div>
        )}

        <button className="text-[#FF4BCD] text-[13px] font-bold flex items-center gap-1">
          Get Personalised Care Plan →
        </button>
      </div>
    </div>
  );
};

export default AIInsightsCard;
