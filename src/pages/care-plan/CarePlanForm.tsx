import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Home, Clock, Wallet, Info, ArrowRight } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

const CarePlanForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const petData = location.state?.petData;

  const [living, setLiving] = useState<"apartment" | "house">("apartment");
  const [hasChildren, setHasChildren] = useState(false);
  const [freeTime, setFreeTime] = useState<"< 1 hr" | "1 – 3 hrs" | "3+ hrs">("< 1 hr");
  const [budgetRange, setBudgetRange] = useState([2000, 8000]);

  if (!petData) {
    navigate(-1);
    return null;
  }

  const handleGenerate = () => {
    navigate("/care-plan/report", {
      state: {
        petData,
        formData: { living, hasChildren, freeTime, budgetMin: budgetRange[0], budgetMax: budgetRange[1] },
      },
    });
  };

  const formatBudget = (v: number) => `₹${v.toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 pt-4 pb-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-[#151B32]" />
        </button>
        <h1 className="flex-1 text-center font-bold text-[17px] text-[#151B32] pr-7">
          Personalised Care Plan
        </h1>
      </div>

      {/* Progress */}
      <div className="px-6 pt-2 pb-4 flex items-center justify-between">
        <span className="text-[13px] font-bold text-[#EC4899]">Quick Facts</span>
        <span className="text-[12px] text-[#9CA3AF] font-medium">STEP 1 OF 1</span>
      </div>
      <div className="mx-6 h-1 rounded-full bg-[#FDE2EC]">
        <div className="h-full rounded-full bg-[#EC4899] w-full" />
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pt-5 pb-6 space-y-5 overflow-y-auto">
        {/* Living Situation */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-3">
            <Home className="w-5 h-5 text-[#151B32]" />
            <span className="font-bold text-[16px] text-[#151B32]">Living Situation</span>
          </div>
          <p className="text-[13px] text-[#6B7280] mb-3">Where do you live?</p>
          <div className="flex gap-2 mb-4">
            {(["apartment", "house"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setLiving(opt)}
                className={`flex-1 py-2.5 rounded-full text-[13px] font-semibold border transition-all ${
                  living === opt
                    ? "border-[#EC4899] text-[#EC4899] bg-[#FFF0F6]"
                    : "border-[#E5E7EB] text-[#6B7280] bg-white"
                }`}
              >
                {opt === "apartment" ? "Apartment" : "House"}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] text-[#151B32] font-medium">Do you have children?</p>
              <p className="text-[11px] text-[#9CA3AF]">Under 18 living with you</p>
            </div>
            <Switch checked={hasChildren} onCheckedChange={setHasChildren} />
          </div>
        </div>

        {/* Daily Routine */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-[#EC4899]" />
            <span className="font-bold text-[16px] text-[#151B32]">Daily Routine</span>
          </div>
          <p className="text-[13px] text-[#6B7280] mb-3">How much free time do you have daily?</p>
          <div className="flex gap-2">
            {(["< 1 hr", "1 – 3 hrs", "3+ hrs"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setFreeTime(opt)}
                className={`flex-1 py-2.5 rounded-full text-[12px] font-semibold border transition-all ${
                  freeTime === opt
                    ? "border-[#EC4899] text-[#EC4899] bg-[#FFF0F6]"
                    : "border-[#E5E7EB] text-[#6B7280] bg-white"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Monthly Budget */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-5 h-5 text-[#EC4899]" />
            <span className="font-bold text-[16px] text-[#151B32]">Monthly Budget</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] text-[#6B7280]">Estimated monthly spend</p>
            <span className="font-bold text-[16px] text-[#EC4899]">
              {formatBudget(budgetRange[0])} - {formatBudget(budgetRange[1])}
            </span>
          </div>
          <Slider
            value={budgetRange}
            onValueChange={setBudgetRange}
            min={1000}
            max={25000}
            step={500}
            className="mb-2 [&_[data-radix-slider-track]]:bg-[#FDE2EC] [&_[data-radix-slider-range]]:bg-[#EC4899] [&_[data-radix-slider-thumb]]:border-[#EC4899] [&_[data-radix-slider-thumb]]:bg-white [&_[data-radix-slider-thumb]]:w-5 [&_[data-radix-slider-thumb]]:h-5"
          />
          <div className="flex justify-between text-[11px] text-[#9CA3AF]">
            <span>₹1,000</span>
            <span>₹25,000+</span>
          </div>
          <div className="mt-4 bg-[#F9FAFB] rounded-xl p-3 flex gap-2">
            <Info className="w-4 h-4 text-[#9CA3AF] flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              This helps us recommend plans that match your financial comfort zone without compromising care quality.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-8 pt-2">
        <button
          onClick={handleGenerate}
          className="w-full py-4 rounded-2xl font-bold text-[16px] text-white flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #EC4899, #8B5CF6)" }}
        >
          Generate My Care Plan
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-center text-[10px] text-[#9CA3AF] mt-3 tracking-widest uppercase">
          Secure 256-bit encrypted process
        </p>
      </div>
    </div>
  );
};

export default CarePlanForm;
