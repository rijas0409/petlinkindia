import { ShieldCheck, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HealthSafetySectionProps {
  vaccinated: boolean;
  medicalHistory: string | null;
  ageMonths: number;
}

const HealthSafetySection = ({ vaccinated, medicalHistory, ageMonths }: HealthSafetySectionProps) => {
  const now = new Date();
  const vaccDate = new Date(now);
  vaccDate.setMonth(vaccDate.getMonth() - 2);

  const timeline = [
    {
      title: "DHPP Vaccine (1st Dose)",
      subtitle: `Administered • ${Math.max(ageMonths - 3, 6)} Weeks`,
      done: true,
      color: "hsl(345, 80%, 68%)",
    },
    {
      title: "DHPP Vaccine (2nd Dose)",
      subtitle: `Administered • ${Math.max(ageMonths - 1, 10)} Weeks`,
      done: true,
      color: "hsl(345, 80%, 68%)",
    },
    {
      title: "Rabies & Bordetella",
      subtitle: `Upcoming • ${ageMonths + 3} Weeks`,
      done: false,
      color: "hsl(220, 15%, 70%)",
    },
  ];

  return (
    <div className="px-4 py-4">
      <h3 className="font-bold text-lg text-foreground mb-3">Health & Safety</h3>

      {/* Last vaccinated */}
      {vaccinated && (
        <div className="flex items-center justify-between bg-[hsl(145,60%,95%)] rounded-xl px-4 py-3 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[hsl(145,60%,45%)]" />
            <div>
              <p className="text-xs font-semibold text-[hsl(145,60%,30%)]">LAST VACCINATED</p>
              <p className="text-sm font-medium text-[hsl(145,60%,30%)]">
                {vaccDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
          <Badge className="bg-[hsl(145,60%,45%)] text-white border-0 text-[10px] font-bold rounded-full">
            UP TO DATE
          </Badge>
        </div>
      )}

      {/* Vaccination Timeline */}
      <p className="text-sm font-semibold text-foreground mb-3">Vaccination Timeline</p>
      <div className="space-y-0 relative ml-2">
        {timeline.map((item, i) => (
          <div key={i} className="flex gap-3 relative pb-4">
            {/* Line */}
            {i < timeline.length - 1 && (
              <div className="absolute left-[7px] top-4 w-0.5 h-full" style={{ backgroundColor: item.done ? "hsl(345, 80%, 68%)" : "hsl(220, 20%, 88%)" }} />
            )}
            {/* Dot */}
            <div className="relative z-10 mt-1.5 flex-shrink-0">
              <div className="w-[15px] h-[15px] rounded-full border-2 flex items-center justify-center"
                style={{
                  borderColor: item.done ? "hsl(345, 80%, 68%)" : "hsl(220, 20%, 85%)",
                  backgroundColor: item.done ? "hsl(345, 80%, 68%)" : "transparent",
                }}>
                {item.done && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Download button */}
      <button className="w-full mt-2 py-3 rounded-xl border border-border flex items-center justify-center gap-2 text-sm font-semibold text-foreground bg-card hover:bg-muted transition-colors">
        <FileText className="w-4 h-4 text-primary" />
        Download Health Certificate (PDF)
      </button>
    </div>
  );
};

export default HealthSafetySection;
