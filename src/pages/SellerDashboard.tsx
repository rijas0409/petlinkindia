import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, ShoppingBag, MessageCircle, Truck, DollarSign, User, LogOut, PawPrint } from "lucide-react";
import { toast } from "sonner";
import ChatList from "@/components/ChatList";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeOrders: 0,
    totalEarnings: 0,
    pendingPayouts: 0,
  });

  useEffect(() => {
    checkUser();
    fetchStats();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profile?.role === "buyer") {
      navigate("/buyer-dashboard");
      return;
    }

    setUser(session.user);
  };

  const fetchStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [petsResult, ordersResult, earningsResult] = await Promise.all([
        supabase
          .from("pets")
          .select("id", { count: "exact" })
          .eq("owner_id", session.user.id),
        supabase
          .from("orders")
          .select("id", { count: "exact" })
          .eq("seller_id", session.user.id)
          .in("status", ["pending", "accepted", "preparing", "ready", "picked"]),
        supabase
          .from("seller_earnings")
          .select("amount, net_amount, payout_status")
          .eq("seller_id", session.user.id),
      ]);

      const totalEarnings = earningsResult.data?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      const pendingPayouts = earningsResult.data
        ?.filter((e) => e.payout_status === "pending")
        .reduce((sum, e) => sum + Number(e.net_amount), 0) || 0;

      setStats({
        totalListings: petsResult.count || 0,
        activeOrders: ordersResult.count || 0,
        totalEarnings,
        pendingPayouts,
      });
    } catch (error: any) {
      toast.error("Failed to load statistics");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-primary rounded-xl flex items-center justify-center shadow-float">
              <PawPrint className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-display text-xl">PetLink</span>
              <p className="text-xs text-muted-foreground">Partner Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl hover:bg-muted"
              onClick={() => navigate("/profile")}
            >
              <User className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl hover:bg-muted"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border border-border shadow-soft hover-lift">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.totalListings}</p>
              <p className="text-sm text-muted-foreground">Active Listings</p>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-soft hover-lift">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-accent" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.activeOrders}</p>
              <p className="text-sm text-muted-foreground">Active Orders</p>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-soft hover-lift">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-success" />
                </div>
              </div>
              <p className="text-2xl font-bold">₹{stats.totalEarnings.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-soft hover-lift">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5 text-warning" />
                </div>
              </div>
              <p className="text-2xl font-bold">₹{stats.pendingPayouts.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Pending Payouts</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Button */}
        <div className="mb-8">
          <Button
            size="lg"
            className="w-full md:w-auto bg-gradient-primary hover:opacity-90 rounded-xl shadow-float font-semibold"
            onClick={() => navigate("/add-pet")}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Pet
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="w-full md:w-auto bg-muted p-1 rounded-xl h-auto flex-wrap">
            <TabsTrigger value="listings" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-soft">
              <Package className="w-4 h-4 mr-2" />
              Listings
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-soft">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="chats" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-soft">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chats
            </TabsTrigger>
            <TabsTrigger value="transport" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-soft">
              <Truck className="w-4 h-4 mr-2" />
              Transport
            </TabsTrigger>
            <TabsTrigger value="earnings" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-soft">
              <DollarSign className="w-4 h-4 mr-2" />
              Earnings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle>My Pet Listings</CardTitle>
                <CardDescription>Manage your active and pending listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  No listings yet. Click "Add New Pet" to get started.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>Track and manage your customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  No orders yet. Orders will appear here once customers buy your pets.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chats">
            <Card className="border border-border shadow-soft overflow-hidden">
              <CardHeader className="border-b border-border">
                <CardTitle>Customer Chats</CardTitle>
                <CardDescription>Respond to buyer inquiries</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ChatList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transport">
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle>Transport Requests</CardTitle>
                <CardDescription>Manage pet delivery and transport</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  No transport requests yet.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle>Earnings & Payouts</CardTitle>
                <CardDescription>View your earnings history and pending payouts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  No earnings yet. Complete orders to start earning.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SellerDashboard;