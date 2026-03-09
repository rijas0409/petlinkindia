import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, Package, Loader2, MapPin, Truck, CheckCircle2, Clock, XCircle, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomNavigation from "@/components/BottomNavigation";

interface OrderWithPet {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  pet_id: string;
  pets: {
    name: string;
    breed: string;
    images: string[] | null;
    city: string;
    state: string;
    category: string;
  } | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  pending: { label: "Order Placed", color: "text-amber-700", icon: Clock, bg: "bg-amber-50" },
  accepted: { label: "Accepted", color: "text-blue-700", icon: CheckCircle2, bg: "bg-blue-50" },
  preparing: { label: "Preparing", color: "text-purple-700", icon: Package, bg: "bg-purple-50" },
  ready: { label: "Ready for Pickup", color: "text-indigo-700", icon: Package, bg: "bg-indigo-50" },
  picked: { label: "In Transit", color: "text-orange-700", icon: Truck, bg: "bg-orange-50" },
  delivered: { label: "Delivered", color: "text-green-700", icon: CheckCircle2, bg: "bg-green-50" },
  cancelled: { label: "Cancelled", color: "text-red-600", icon: XCircle, bg: "bg-red-50" },
};

const statusSteps = ["pending", "accepted", "preparing", "ready", "picked", "delivered"];

const Bookings = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithPet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("id, amount, status, created_at, pet_id, pets(name, breed, images, city, state, category)")
        .eq("buyer_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data as unknown as OrderWithPet[]) || []);
    } catch {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: string) => {
    const idx = statusSteps.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-24">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">My Bookings</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg space-y-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2 text-foreground">No bookings yet</h2>
            <p className="text-muted-foreground text-sm mb-6">Your pet orders will appear here</p>
            <Button onClick={() => navigate("/buyer-dashboard")} className="rounded-2xl">
              Browse Pets
            </Button>
          </div>
        ) : (
          orders.map((order) => {
            const pet = order.pets;
            const config = statusConfig[order.status || "pending"] || statusConfig.pending;
            const StatusIcon = config.icon;
            const currentStep = getStepIndex(order.status || "pending");
            const isCancelled = order.status === "cancelled";
            const isDelivered = order.status === "delivered";
            const img = pet?.images?.[0] || "/placeholder.svg";

            return (
              <Card
                key={order.id}
                className="rounded-2xl border-0 shadow-sm overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
                onClick={() => navigate(`/pet/${order.pet_id}`)}
              >
                {/* Top section */}
                <div className="p-4 flex gap-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                    <img src={img} alt={pet?.breed || "Pet"} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-[15px] text-foreground truncate">
                          {pet?.name} ({pet?.breed})
                        </h3>
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">{pet?.category}</p>
                      </div>
                      <p className="font-bold text-primary text-sm">₹{order.amount.toLocaleString("en-IN")}</p>
                    </div>

                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">{pet?.city}, {pet?.state}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${config.bg}`}>
                        <StatusIcon className={`w-3 h-3 ${config.color}`} />
                        <span className={`text-[11px] font-semibold ${config.color}`}>{config.label}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{formatDate(order.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Progress tracker */}
                {!isCancelled && (
                  <div className="px-4 pb-4">
                    <div className="flex items-center gap-1">
                      {statusSteps.map((step, i) => (
                        <div key={step} className="flex-1 flex items-center">
                          <div
                            className={`h-1.5 w-full rounded-full transition-colors ${
                              i <= currentStep
                                ? isDelivered
                                  ? "bg-green-500"
                                  : "bg-primary"
                                : "bg-muted"
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[9px] text-muted-foreground">Ordered</span>
                      <span className="text-[9px] text-muted-foreground">Delivered</span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </main>
      <BottomNavigation variant="buyer" />
    </div>
  );
};

export default Bookings;
