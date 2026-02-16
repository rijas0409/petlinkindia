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
  bloodline?: string;
}

const PetInfoSection = ({ breed, name, price, originalPrice, ageMonths, gender, color, vaccinated, verificationStatus, isFeatured, bloodline }: PetInfoSectionProps) => {
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
  const displayBloodline = bloodline || "CHAMPION BLOODLINE";

  return (
    <div className="bg-white rounded-t-3xl -mt-6 relative z-10 px-5 pt-5 pb-3">
      {/* Champion Bloodline badge + Price */}
      <div className="flex items-start justify-between mb-1">
        <div>
          {isFeatured && (
            <span className="inline-block px-3 py-1 rounded-full border border-[#10B981] text-[#10B981] text-[10px] font-bold uppercase tracking-wider mb-2">
              {displayBloodline}
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-[24px] font-bold text-[#F472D0]">
            {formatPrice(price)}
          </p>
          {originalPrice && originalPrice > price && (
            <p className="text-xs text-[#999] line-through">{formatPrice(originalPrice)}</p>
          )}
        </div>
      </div>

      {/* Pet name */}
      <h1 className="text-[26px] font-extrabold leading-tight text-[#151B32] mb-0.5">
        {name}
      </h1>

      {/* Breed name */}
      <p className="text-[16px] font-semibold text-[#888] mb-1">
        {breed}
      </p>

      {/* Status badges */}
      <div className="flex flex-wrap gap-2 mt-2 mb-4">
        {vaccinated && (
          <span className="px-2.5 py-1 rounded-md border border-[#10B981] text-[#10B981] text-[10px] font-bold uppercase">
            VACCINATED
          </span>
        )}
        {verificationStatus === "verified" && (
          <span className="px-2.5 py-1 rounded-md border border-[#60A5FA] text-[#60A5FA] text-[10px] font-bold uppercase">
            KCI REGISTERED
          </span>
        )}
      </div>

      {/* Age / Gender / Size pills */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: "AGE", value: formatAge(ageMonths) },
          { label: "GENDER", value: gender },
          { label: "SIZE", value: sizeLabel },
        ].map((item) => (
          <div key={item.label} className="bg-[#F5F5F7] rounded-xl py-2.5 px-3 text-center border border-[#ECECEC]">
            <p className="text-[9px] font-medium text-[#999] tracking-widest uppercase">{item.label}</p>
            <p className="text-[13px] font-semibold text-[#151B32] capitalize mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PetInfoSection;
