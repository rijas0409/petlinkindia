import { ShieldCheck, FileText } from "lucide-react";

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
    },
    {
      title: "DHPP Vaccine (2nd Dose)",
      subtitle: `Administered • ${Math.max(ageMonths - 1, 10)} Weeks`,
      done: true,
    },
    {
      title: "Rabies & Bordetella",
      subtitle: `Upcoming • ${ageMonths + 3} Weeks`,
      done: false,
    },
  ];

  return (
    <div className="px-5 py-4">
      <h3 className="font-bold text-[17px] text-[#151B32] mb-3">Health & Safety</h3>

      {/* Last vaccinated card */}
      {vaccinated && (
        <div className="flex items-center justify-between bg-[#ECFDF5] rounded-2xl px-4 py-3 mb-4 border border-[#A7F3D0]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#10B981] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">LAST VACCINATED</p>
              <p className="text-[13px] font-bold text-[#151B32]">
                {vaccDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full border border-[#10B981] text-[#10B981] text-[9px] font-bold uppercase">
            UP TO DATE
          </span>
        </div>
      )}

      {/* Vaccination Timeline */}
      <p className="text-[14px] font-bold text-[#151B32] mb-3">Vaccination Timeline</p>
      <div className="space-y-0 relative ml-1">
        {timeline.map((item, i) => (
          <div key={i} className="flex gap-3 relative pb-4">
            {/* Vertical line */}
            {i < timeline.length - 1 && (
              <div
                className="absolute left-[7px] top-4 w-0.5 h-full"
                style={{ backgroundColor: item.done ? "#A855F7" : "#E5E7EB" }}
              />
            )}
            {/* Dot */}
            <div className="relative z-10 mt-1 flex-shrink-0">
              <div
                className="w-[15px] h-[15px] rounded-full border-2 flex items-center justify-center"
                style={{
                  borderColor: item.done ? "#A855F7" : "#D1D5DB",
                  backgroundColor: item.done ? "#A855F7" : "transparent",
                }}
              >
                {item.done && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#151B32]">{item.title}</p>
              <p className="text-[11px] text-[#888]">{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Download button */}
      <button className="w-full mt-2 py-3 rounded-xl border border-[#D8B4FE] flex items-center justify-center gap-2 text-[13px] font-bold text-[#A855F7] bg-[#FAF5FF] hover:bg-[#F3E8FF] transition-colors">
        <FileText className="w-4 h-4 text-[#A855F7]" />
        Download Health Certificate (PDF)
      </button>
    </div>
  );
};

export default HealthSafetySection;
