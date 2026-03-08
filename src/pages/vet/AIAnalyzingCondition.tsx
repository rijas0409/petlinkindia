import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Stethoscope, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type FlowMode = "smart_match" | "instant_video";

const vetAvatars = [
  { id: "1", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop" },
  { id: "2", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop" },
];

const steps = [
  "Symptoms registered",
  "Identifying required specialization...",
  "Searching for nearest available vets...",
  "Finding the best match...",
];

const toText = (v: unknown) => (typeof v === "string" ? v.toLowerCase() : "");

const normalizeFlowMode = (raw: string | null): FlowMode => (raw === "instant_video" ? "instant_video" : "smart_match");

const AIAnalyzingCondition = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const inferredFlow = normalizeFlowMode(sessionStorage.getItem("vet_flow_mode"));
  const flowMode: FlowMode = inferredFlow;
  const assessmentData = useMemo(() => {
    const stateObj = (location.state || {}) as Record<string, unknown>;
    const { flowType, ...rest } = stateObj;
    return rest;
  }, [location.state]);

  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const fetchMatchingVet = async () => {
    const selectedPet = toText((assessmentData as any)?.selectedPet);
    const symptomText = [
      ...(((assessmentData as any)?.selectedSymptoms || []) as string[]),
      toText((assessmentData as any)?.additionalDetails),
      toText((assessmentData as any)?.existingConditions),
    ]
      .join(" ")
      .toLowerCase();

    const tokens = new Set<string>([selectedPet]);
    if (symptomText.includes("rabies")) tokens.add("rabies");
    if (symptomText.includes("skin") || symptomText.includes("itch")) tokens.add("dermatology");
    if (symptomText.includes("vomit") || symptomText.includes("stomach")) tokens.add("gastro");
    if (symptomText.includes("injury") || symptomText.includes("fracture")) tokens.add("surgery");

    const { data: vets, error } = await supabase
      .from("vet_profiles")
      .select("id, user_id, specializations, is_active, years_of_experience, online_fee, consultation_type")
      .eq("is_active", true);

    if (error || !vets?.length) return null;

    const userIds = vets.map((v: any) => v.user_id);
    const { data: profiles } = await supabase.from("profiles").select("id, name, full_name, profile_photo").in("id", userIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

    const scored = vets
      .map((v: any) => {
        const specs = ((v.specializations || []) as string[]).map((s) => s.toLowerCase());
        let score = 0;
        if (!specs.length || specs.includes("all")) score += 1;
        if (selectedPet && specs.some((s) => s.includes(selectedPet))) score += 5;
        tokens.forEach((t) => {
          if (!t) return;
          if (specs.some((s) => s.includes(t))) score += 2;
        });
        return { vet: v, score };
      })
      .sort((a, b) => b.score - a.score);

    const best = scored[0];
    if (!best || best.score <= 0) return null;

    const profile = profileMap.get(best.vet.user_id);
    return {
      id: best.vet.user_id,
      name: profile?.full_name || profile?.name || "Dr. Sameer",
      title: "Specialist Veterinarian",
      yearsOfExperience: best.vet.years_of_experience || 5,
      onlineFee: best.vet.online_fee || 499,
      profilePhoto:
        profile?.profile_photo ||
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop",
    };
  };

  useEffect(() => {
    if (flowMode === "smart_match") {
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 100 : prev + 1));
      }, 80);

      const timers = steps.map((_, i) => setTimeout(() => setActiveStep(i), i * 2000));
      const navTimer = setTimeout(() => {
        navigate("/vet/booking-details", { state: assessmentData });
      }, 8000);

      return () => {
        clearInterval(progressInterval);
        timers.forEach(clearTimeout);
        clearTimeout(navTimer);
      };
    }

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 92) return prev + 2;
        if (prev < 97) return prev + 0.5;
        return prev;
      });
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 1200);

    const pollVet = async () => {
      const matchedVet = await fetchMatchingVet();
      if (cancelled) return;

      if (matchedVet) {
        sessionStorage.setItem("vet_instant_assessment_data", JSON.stringify(assessmentData));
        navigate("/vet/connection-ready", {
          state: {
            flowType: "instant_video",
            assessmentData,
            matchedVet,
          },
          replace: true,
        });
        return;
      }

      retryTimer = setTimeout(pollVet, 2500);
    };

    pollVet();

    return () => {
      cancelled = true;
      clearInterval(progressInterval);
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [assessmentData, flowMode, navigate]);

  return (
    <div className="h-screen bg-background flex flex-col items-center justify-between px-4 py-8">
      <div className="text-center pt-4">
        <h1 className="text-2xl font-black text-foreground">AI Analyzing Condition</h1>
        <p className="text-sm text-muted-foreground mt-1">Please stay on this screen while we process</p>
      </div>

      <div className="relative flex items-center justify-center w-full" style={{ height: 300 }}>
        <div className="absolute w-56 h-56 border border-muted/60 rounded-full" style={{ animation: "spin 15s linear infinite" }} />
        <div className="absolute w-64 h-64 border border-muted/40 rounded-full" style={{ animation: "spin 20s linear infinite reverse" }} />
        <div className="absolute w-72 h-72 border border-muted/20 rounded-full" style={{ animation: "spin 25s linear infinite" }} />

        <div className="absolute" style={{ animation: "orbit1 8s ease-in-out infinite" }}>
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary shadow-lg bg-background p-0.5">
            <img src={vetAvatars[0].image} alt="Vet" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>
        <div className="absolute" style={{ animation: "orbit2 10s ease-in-out infinite" }}>
          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-primary shadow-lg bg-background p-0.5">
            <img src={vetAvatars[1].image} alt="Vet" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>

        <div className="relative z-10">
          <div className="absolute inset-0 bg-gradient-primary rounded-full blur-xl opacity-40" style={{ animation: "pulse-glow 2s ease-in-out infinite" }} />
          <div className="relative w-28 h-28 bg-gradient-primary rounded-full flex items-center justify-center shadow-2xl" style={{ animation: "heartbeat 1.5s ease-in-out infinite" }}>
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full" style={{ animation: "shimmer-move 3s ease-in-out infinite" }} />
            </div>
            <Stethoscope className="w-12 h-12 text-primary-foreground" />
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4 mb-5">
          {steps.map((label, i) => (
            <div key={i} className="flex items-start gap-3">
              {i <= activeStep ? (
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-green-500" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                </div>
              )}
              <span className={`text-sm font-medium ${i <= activeStep ? "text-foreground" : "text-muted-foreground/50"}`}>{label}</span>
            </div>
          ))}
        </div>

        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-4">
          <div className="h-full bg-gradient-primary rounded-full transition-all duration-300" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>

        <button
          onClick={() => navigate("/vet/ai-assessment")}
          className="w-full text-center text-sm font-semibold text-muted-foreground py-2"
        >
          Cancel Analysis
        </button>
      </div>

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
    </div>
  );
};

export default AIAnalyzingCondition;
