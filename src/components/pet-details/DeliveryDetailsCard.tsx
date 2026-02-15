import { MapPin, Truck } from "lucide-react";
import { ChevronRight } from "lucide-react";

interface DeliveryDetailsCardProps {
  city: string;
  state: string;
}

const DeliveryDetailsCard = ({ city, state }: DeliveryDetailsCardProps) => {
  return (
    <div className="mx-4 rounded-2xl border border-border bg-card p-4 space-y-3">
      <h3 className="font-bold text-lg text-foreground">Delivery Details</h3>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[hsl(270,60%,92%)] flex items-center justify-center">
            <MapPin className="w-4 h-4 text-[hsl(270,60%,55%)]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">DELIVERY ADDRESS</p>
            <p className="text-sm text-foreground">42, Sant Nagar Palace Near Or...</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[hsl(145,60%,92%)] flex items-center justify-center">
          <Truck className="w-4 h-4 text-[hsl(145,60%,45%)]" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-[hsl(145,60%,40%)] uppercase tracking-wider">EXPRESS DELIVERY</p>
          <p className="text-sm text-foreground">Arriving in 2 days</p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetailsCard;
