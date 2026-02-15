import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SellerInfoCardProps {
  seller: {
    id: string;
    name: string;
    profile_photo: string | null;
    rating: number;
    is_breeder_verified: boolean;
  } | null;
}

const SellerInfoCard = ({ seller }: SellerInfoCardProps) => {
  const navigate = useNavigate();

  if (!seller) return null;

  return (
    <div className="px-4 py-4">
      <h3 className="font-bold text-lg text-foreground mb-3">Seller Information</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[hsl(200,40%,88%)] to-[hsl(160,50%,75%)] flex items-center justify-center overflow-hidden">
            {seller.profile_photo ? (
              <img src={seller.profile_photo} alt={seller.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-base font-bold text-foreground">{seller.name?.[0]?.toUpperCase() || "S"}</span>
            )}
          </div>
          <div>
            <p className="font-semibold text-foreground">{seller.name}</p>
            {seller.rating > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs text-muted-foreground">{seller.rating.toFixed(1)} Seller Rating</span>
              </div>
            )}
          </div>
        </div>
        <button className="text-primary text-sm font-semibold">View Profile</button>
      </div>
    </div>
  );
};

export default SellerInfoCard;
