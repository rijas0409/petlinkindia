import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Home, Clock, Briefcase, PawPrint, ChevronDown, ArrowRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const cityTypes = ["Metro / Major City", "Tier 2 City", "Small Town", "Rural"];
const freeTimeOptions = ["< 1 hour", "1-3 hours", "3-5 hours", "5+ hours"];
const workSchedules = ["Remote", "Hybrid", "Office"];
const travelFrequencies = ["Rarely", "Monthly", "Weekly", "Frequently"];

const CarePlanForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const petData = location.state?.petData;

  const [homeType, setHomeType] = useState<"apartment" | "house">("apartment");
  const [cityType, setCityType] = useState("");
  const [hasKids, setHasKids] = useState(false);
  const [otherPets, setOtherPets] = useState(false);
  const [freeTime, setFreeTime] = useState("");
  const [workSchedule, setWorkSchedule] = useState("");
  const [travelFrequency, setTravelFrequency] = useState("");

  const [cityDropdown, setCityDropdown] = useState(false);
  const [freeTimeDropdown, setFreeTimeDropdown] = useState(false);
  const [travelDropdown, setTravelDropdown] = useState(false);

  if (!petData) {
    navigate(-1);
    return null;
  }

  const handleContinue = () => {
    if (!cityType) { toast.error("Please select your City Type"); return; }
    if (!freeTime) { toast.error("Please select your Daily free time"); return; }
    if (!workSchedule) { toast.error("Please select your Work Schedule"); return; }
    if (!travelFrequency) { toast.error("Please select your Travel Frequency"); return; }

    navigate("/care-plan/form-step2", {
      state: {
        petData,
        step1Data: { homeType, cityType, hasKids, otherPets, freeTime, workSchedule, travelFrequency },
      },
    });
  };

  const DropdownSelect = ({ 
    value, placeholder, options, open, setOpen 
  }: { value: string; placeholder: string; options: string[]; open: boolean; setOpen: (v: boolean) => void; onChange?: (v: string) => void }) => (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-[#F9FAFB] rounded-xl px-4 py-3 text-[14px] border border-[#E5E7EB]"
      >
        <span className={value ? "text-[#151B32]" : "text-[#9CA3AF]"}>{value || placeholder}</span>
        <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden">
          {options.map(opt => (
            <button key={opt} onClick={() => { setOpen(false); return opt; }} className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#FFF0F6] text-[#151B32]">
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 pt-4 pb-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-[#151B32]" />
        </button>
        <h1 className="flex-1 text-center font-bold text-[17px] text-[#151B32] pr-7">Personalisation Form</h1>
      </div>

      {/* Progress */}
      <div className="px-6 pt-2 pb-1 flex items-center justify-between">
        <span className="text-[13px] font-bold text-[#EC4899]">STEP 1 OF 2</span>
        <span className="text-[12px] text-[#9CA3AF] font-medium">50% Complete</span>
      </div>
      <div className="mx-6 h-1.5 rounded-full bg-[#FDE2EC]">
        <div className="h-full rounded-full bg-[#EC4899] w-1/2 transition-all" />
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pt-5 pb-6 space-y-5 overflow-y-auto">
        {/* Living Situation */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#FFF0F6] flex items-center justify-center">
              <Home className="w-5 h-5 text-[#EC4899]" />
            </div>
            <span className="font-bold text-[17px] text-[#151B32]">Living Situation</span>
          </div>

          <p className="text-[13px] text-[#6B7280] mb-2">Home Type</p>
          <div className="flex gap-2 mb-4">
            {(["apartment", "house"] as const).map(opt => (
              <button
                key={opt}
                onClick={() => setHomeType(opt)}
                className={`flex-1 py-2.5 rounded-full text-[13px] font-semibold border transition-all ${
                  homeType === opt ? "border-[#EC4899] text-[#EC4899] bg-[#FFF0F6]" : "border-[#E5E7EB] text-[#6B7280] bg-white"
                }`}
              >
                {opt === "apartment" ? "Apartment" : "House"}
              </button>
            ))}
          </div>

          <p className="text-[13px] text-[#6B7280] mb-2">City Type</p>
          <div className="relative mb-4">
            <button
              onClick={() => { setCityDropdown(!cityDropdown); setFreeTimeDropdown(false); setTravelDropdown(false); }}
              className="w-full flex items-center justify-between bg-[#F9FAFB] rounded-xl px-4 py-3 text-[14px] border border-[#E5E7EB]"
            >
              <span className={cityType ? "text-[#151B32]" : "text-[#9CA3AF]"}>{cityType || "Select city type"}</span>
              <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
            </button>
            {cityDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden">
                {cityTypes.map(opt => (
                  <button key={opt} onClick={() => { setCityType(opt); setCityDropdown(false); }} className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#FFF0F6] text-[#151B32]">{opt}</button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] text-[#151B32] font-medium">Do you have kids?</p>
            <Switch checked={hasKids} onCheckedChange={setHasKids} />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[14px] text-[#151B32] font-medium">Other pets at home?</p>
            <Switch checked={otherPets} onCheckedChange={setOtherPets} />
          </div>
        </div>

        {/* Daily Routine */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#FFF0F6] flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#EC4899]" />
            </div>
            <span className="font-bold text-[17px] text-[#151B32]">Daily Routine</span>
          </div>

          <p className="text-[13px] text-[#6B7280] mb-2">Daily free time</p>
          <div className="relative mb-4">
            <button
              onClick={() => { setFreeTimeDropdown(!freeTimeDropdown); setCityDropdown(false); setTravelDropdown(false); }}
              className="w-full flex items-center justify-between bg-[#F9FAFB] rounded-xl px-4 py-3 text-[14px] border border-[#E5E7EB]"
            >
              <span className={freeTime ? "text-[#151B32]" : "text-[#9CA3AF]"}>{freeTime || "Select free time"}</span>
              <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
            </button>
            {freeTimeDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden">
                {freeTimeOptions.map(opt => (
                  <button key={opt} onClick={() => { setFreeTime(opt); setFreeTimeDropdown(false); }} className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#FFF0F6] text-[#151B32]">{opt}</button>
                ))}
              </div>
            )}
          </div>

          <p className="text-[13px] text-[#6B7280] mb-2">Work Schedule</p>
          <div className="flex gap-2 mb-4">
            {workSchedules.map(opt => (
              <button
                key={opt}
                onClick={() => setWorkSchedule(opt)}
                className={`flex-1 py-2.5 rounded-full text-[12px] font-semibold border transition-all ${
                  workSchedule === opt ? "border-[#EC4899] text-white bg-[#EC4899]" : "border-[#E5E7EB] text-[#6B7280] bg-white"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <p className="text-[13px] text-[#6B7280] mb-2">Travel Frequency</p>
          <div className="relative">
            <button
              onClick={() => { setTravelDropdown(!travelDropdown); setCityDropdown(false); setFreeTimeDropdown(false); }}
              className="w-full flex items-center justify-between bg-[#F9FAFB] rounded-xl px-4 py-3 text-[14px] border border-[#E5E7EB]"
            >
              <span className={travelFrequency ? "text-[#151B32]" : "text-[#9CA3AF]"}>{travelFrequency || "Select travel frequency"}</span>
              <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
            </button>
            {travelDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden">
                {travelFrequencies.map(opt => (
                  <button key={opt} onClick={() => { setTravelFrequency(opt); setTravelDropdown(false); }} className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#FFF0F6] text-[#151B32]">{opt}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-8 pt-2">
        <button
          onClick={handleContinue}
          className="w-full py-4 rounded-2xl font-bold text-[16px] text-white flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #EC4899, #8B5CF6)" }}
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CarePlanForm;
