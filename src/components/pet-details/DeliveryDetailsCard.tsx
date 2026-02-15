import { MapPin, Truck } from "lucide-react";
import { ChevronRight } from "lucide-react";

interface DeliveryDetailsCardProps {
  city: string;
  state: string;
}

const DeliveryDetailsCard = ({ city, state }: DeliveryDetailsCardProps) => {
  return (
    <div className="px-5 py-4">
      <h3 className="font-bold text-[17px] text-[#151B32] mb-3">Delivery Details</h3>
      <div className="rounded-2xl border border-[#ECECEC] bg-white overflow-hidden">
        {/* Delivery address row */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#E0E7FF] flex items-center justify-center">
              <MapPin className="w-4 h-4 text-[#818CF8]" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-[#999] uppercase tracking-wider">DELIVERY ADDRESS</p>
              <p className="text-[12px] text-[#151B32]">42, Sant Nagar Palace Near Or...</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#999]" />
        </div>

        <div className="border-t border-[#F0F0F0] mx-4" />

        {/* Express delivery row */}
        <div className="flex items-center gap-2.5 px-4 py-3">
          <div className="w-9 h-9 rounded-lg bg-[#D1FAE5] flex items-center justify-center">
            <Truck className="w-4 h-4 text-[#10B981]" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-[#10B981] uppercase tracking-wider">EXPRESS DELIVERY</p>
            <p className="text-[12px] text-[#151B32]">Arriving in 2 days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetailsCard;
