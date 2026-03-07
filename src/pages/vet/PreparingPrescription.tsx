import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Stethoscope, PawPrint } from "lucide-react";
import dpAnimation from "@/assets/dp-animation.gif";

const PreparingPrescription = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/vet/prescription", { replace: true });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background px-4 py-5 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-full bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Digital Prescription</h1>
        <div className="w-11 h-11" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-[260px] h-[260px] rounded-full border border-border flex items-center justify-center mb-6">
          <img src={dpAnimation} alt="Preparing digital prescription" className="w-[210px] h-[210px] object-contain" />
        </div>

        <h2 className="text-5xl leading-tight font-extrabold text-foreground max-w-sm">
          Preparing Your
          <span className="block bg-gradient-primary bg-clip-text text-transparent">Digital Prescription</span>
        </h2>

        <p className="mt-4 text-muted-foreground text-xl max-w-md">
          Your vet is finalizing the prescription. Feel free to stay here or leave — we&apos;ll notify you as soon as it&apos;s ready.
        </p>

        <div className="mt-8 w-full max-w-md rounded-3xl border border-border bg-card p-6 text-left space-y-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <Stethoscope className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-xs tracking-widest text-muted-foreground font-bold">VETERINARIAN</p>
              <p className="text-2xl font-bold text-foreground">Dr. Vikram Malhotra</p>
            </div>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <PawPrint className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-xs tracking-widest text-muted-foreground font-bold">PATIENT</p>
              <p className="text-2xl font-bold text-foreground">Luna – Persian Cat</p>
            </div>
          </div>
        </div>
      </div>

      <button className="w-full py-4 rounded-2xl bg-gradient-primary text-primary-foreground font-bold text-xl shadow-float">
        Notify Me When Ready
      </button>
    </div>
  );
};

export default PreparingPrescription;
