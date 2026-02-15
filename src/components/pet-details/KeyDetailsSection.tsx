import { ShieldCheck, Syringe, MapPin } from "lucide-react";

interface KeyDetailsSectionProps {
  vaccinated: boolean;
  city: string;
  state: string;
  isVerified: boolean;
}

const KeyDetailsSection = ({ vaccinated, city, state, isVerified }: KeyDetailsSectionProps) => {
  const details = [
    {
      icon: ShieldCheck,
      title: "Health Guaranteed",
      subtitle: "2-year congenital health warranty",
      color: "hsl(145, 60%, 50%)",
    },
    {
      icon: Syringe,
      title: "Up to Date",
      subtitle: "All shots & deworming complete",
      color: "hsl(200, 70%, 55%)",
    },
    {
      icon: MapPin,
      title: "Origin",
      subtitle: `Certified Breeder in ${city}, ${state}`,
      color: "hsl(270, 60%, 60%)",
    },
  ];

  return (
    <div className="px-4 py-4">
      <h3 className="font-bold text-lg text-foreground mb-3">Key Details</h3>
      <div className="space-y-3">
        {details.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${d.color}18` }}>
              <d.icon className="w-4 h-4" style={{ color: d.color }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{d.title}</p>
              <p className="text-xs text-muted-foreground">{d.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyDetailsSection;
