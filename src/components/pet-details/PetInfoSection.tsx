import { Badge } from "@/components/ui/badge";

interface PetInfoSectionProps {
  breed: string;
  name: string;
  price: number;
  originalPrice?: number;
  ageMonths: number;
  gender: string;
  color: string | null;
  vaccinated: boolean;
  verificationStatus: string;
  isFeatured: boolean;
}

const PetInfoSection = ({ breed, name, price, originalPrice, ageMonths, gender, color, vaccinated, verificationStatus, isFeatured }: PetInfoSectionProps) => {
  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

  const formatAge = (months: number) => {
    if (months < 12) return `${months} Weeks`;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    if (rem === 0) return `${years} Year${years > 1 ? "s" : ""}`;
    return `${years}y ${rem}m`;
  };

  const sizeLabel = ageMonths < 6 ? "Small" : ageMonths < 18 ? "Medium" : "Large";

  return (
    <div className="px-4 pt-5 pb-3 space-y-4">
      {/* Price + Name */}
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <h1 className="text-2xl font-bold leading-tight text-foreground">{breed}</h1>
          <p className="text-sm text-muted-foreground capitalize">{name}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold bg-gradient-to-r from-[hsl(345,80%,68%)] to-[hsl(270,60%,75%)] bg-clip-text text-transparent">
            {formatPrice(price)}
          </p>
          {originalPrice && originalPrice > price && (
            <p className="text-sm text-muted-foreground line-through">{formatPrice(originalPrice)}</p>
          )}
        </div>
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-2">
        {vaccinated && (
          <Badge className="bg-[hsl(145,60%,92%)] text-[hsl(145,60%,35%)] border-0 rounded-md text-xs font-semibold px-2.5 py-1">
            VACCINATED
          </Badge>
        )}
        {verificationStatus === "verified" && (
          <Badge className="bg-[hsl(220,20%,92%)] text-[hsl(220,20%,35%)] border-0 rounded-md text-xs font-semibold px-2.5 py-1">
            KCI REGISTERED
          </Badge>
        )}
        {isFeatured && (
          <Badge className="bg-[hsl(270,60%,92%)] text-[hsl(270,60%,45%)] border-0 rounded-md text-xs font-semibold px-2.5 py-1">
            FEATURED
          </Badge>
        )}
      </div>

      {/* Age / Gender / Size chips */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "AGE", value: formatAge(ageMonths) },
          { label: "GENDER", value: gender },
          { label: "SIZE", value: sizeLabel },
        ].map((item) => (
          <div key={item.label} className="bg-muted rounded-xl py-2.5 px-3 text-center">
            <p className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase">{item.label}</p>
            <p className="text-sm font-semibold text-foreground capitalize mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PetInfoSection;
