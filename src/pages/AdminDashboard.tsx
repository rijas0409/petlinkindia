import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  Truck,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  MapPin,
  LogOut,
  Search,
  Filter,
  UserPlus,
  IndianRupee,
  BarChart3,
  Settings,
  Home,
  ShieldCheck,
} from "lucide-react";

interface TransportRequest {
  id: string;
  order_id: string;
  pet_id: string;
  seller_id: string;
  buyer_id: string;
  pickup_address: string;
  delivery_address: string;
  distance_km: number | null;
  fee: number;
  status: string;
  assigned_partner_id: string | null;
  created_at: string;
  pet?: {
    name: string;
    breed: string;
    images: string[];
  };
  seller?: {
    name: string;
    phone: string;
  };
  buyer?: {
    name: string;
    phone: string;
  };
  partner?: {
    name: string;
    phone: string;
  };
}

interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  email: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TransportRequest | null>(null);
  const [selectedPartner, setSelectedPartner] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
      setupRealtimeSubscription();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: userRole } = await supabase.rpc('get_user_role', { _user_id: session.user.id });
    
    if (userRole !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Admin access required.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setUser(session.user);
  };

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch transport requests
    const { data: requestsData, error: requestsError } = await supabase
      .from("transport_requests")
      .select(`
        *,
        pet:pets(name, breed, images),
        seller:profiles!transport_requests_seller_id_fkey(name, phone),
        buyer:profiles!transport_requests_buyer_id_fkey(name, phone),
        partner:profiles!transport_requests_assigned_partner_id_fkey(name, phone)
      `)
      .order("created_at", { ascending: false });

    if (requestsError) {
      console.error("Error fetching requests:", requestsError);
    } else {
      setRequests(requestsData || []);
    }

    // Fetch delivery partners
    const { data: partnersData, error: partnersError } = await supabase
      .from("profiles")
      .select("id, name, phone, email")
      .eq("role", "delivery_partner");

    if (partnersError) {
      console.error("Error fetching partners:", partnersError);
    } else {
      setPartners(partnersData || []);
    }

    setLoading(false);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('admin-transport-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transport_requests'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const assignPartner = async () => {
    if (!selectedRequest || !selectedPartner) return;

    const { error } = await supabase
      .from("transport_requests")
      .update({ 
        assigned_partner_id: selectedPartner, 
        status: "assigned",
        updated_at: new Date().toISOString() 
      })
      .eq("id", selectedRequest.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to assign partner",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Partner Assigned",
        description: "Delivery partner has been assigned successfully",
      });
      setAssignDialogOpen(false);
      setSelectedRequest(null);
      setSelectedPartner("");
      fetchData();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      requested: { color: "bg-yellow-100 text-yellow-800", label: "Requested" },
      assigned: { color: "bg-blue-100 text-blue-800", label: "Assigned" },
      picked: { color: "bg-purple-100 text-purple-800", label: "Picked Up" },
      delivered: { color: "bg-green-100 text-green-800", label: "Delivered" },
      completed: { color: "bg-emerald-100 text-emerald-800", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    };
    const config = statusConfig[status] || statusConfig.requested;
    return <Badge className={`${config.color} border-0`}>{config.label}</Badge>;
  };

  const filterRequests = () => {
    let filtered = requests;
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.pet?.name?.toLowerCase().includes(query) ||
        r.seller?.name?.toLowerCase().includes(query) ||
        r.buyer?.name?.toLowerCase().includes(query) ||
        r.pickup_address?.toLowerCase().includes(query) ||
        r.delivery_address?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Stats
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "requested").length,
    inTransit: requests.filter(r => ["assigned", "picked"].includes(r.status)).length,
    delivered: requests.filter(r => r.status === "delivered" || r.status === "completed").length,
    totalRevenue: requests
      .filter(r => r.status === "delivered" || r.status === "completed")
      .reduce((sum, r) => sum + (r.fee || 0), 0),
    partnersCount: partners.length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">PetLink Admin</h1>
                <p className="text-xs text-muted-foreground">Transport Management</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-muted/50 rounded-2xl p-1 mb-6">
            <TabsTrigger value="overview" className="flex-1 rounded-xl">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex-1 rounded-xl">
              <Truck className="w-4 h-4 mr-2" />
              Requests
            </TabsTrigger>
            <TabsTrigger value="partners" className="flex-1 rounded-xl">
              <Users className="w-4 h-4 mr-2" />
              Partners
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <Card className="rounded-2xl shadow-card border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.total}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-card border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.pending}</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-card border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Truck className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.inTransit}</p>
                      <p className="text-xs text-muted-foreground">In Transit</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-card border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.delivered}</p>
                      <p className="text-xs text-muted-foreground">Delivered</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-card border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <IndianRupee className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{formatPrice(stats.totalRevenue)}</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-card border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.partnersCount}</p>
                      <p className="text-xs text-muted-foreground">Partners</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Pending Requests */}
            <Card className="rounded-2xl shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  Pending Assignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {requests.filter(r => r.status === "requested").length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pending requests</p>
                ) : (
                  <div className="space-y-4">
                    {requests.filter(r => r.status === "requested").slice(0, 5).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted">
                            {request.pet?.images?.[0] ? (
                              <img
                                src={request.pet.images[0]}
                                alt={request.pet.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{request.pet?.name || "Pet"}</p>
                            <p className="text-sm text-muted-foreground">
                              {request.pickup_address?.split(',')[0]} → {request.delivery_address?.split(',')[0]}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="rounded-xl"
                          onClick={() => {
                            setSelectedRequest(request);
                            setAssignDialogOpen(true);
                          }}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Assign
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by pet, seller, buyer, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="requested">Requested</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="picked">Picked Up</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Requests List */}
            <div className="space-y-4">
              {filterRequests().length === 0 ? (
                <Card className="rounded-2xl shadow-card border-0">
                  <CardContent className="p-8 text-center">
                    <Truck className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No transport requests found</p>
                  </CardContent>
                </Card>
              ) : (
                filterRequests().map((request) => (
                  <Card key={request.id} className="rounded-2xl shadow-card border-0">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Pet Image */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                          {request.pet?.images?.[0] ? (
                            <img
                              src={request.pet.images[0]}
                              alt={request.pet.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{request.pet?.name || "Pet"}</h3>
                            {getStatusBadge(request.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="w-4 h-4 text-green-500" />
                              <span className="truncate">{request.pickup_address}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="w-4 h-4 text-primary" />
                              <span className="truncate">{request.delivery_address}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-medium text-primary">{formatPrice(request.fee)}</span>
                            {request.distance_km && (
                              <span className="text-muted-foreground">{request.distance_km} km</span>
                            )}
                            {request.partner && (
                              <Badge variant="outline" className="rounded-lg">
                                <Users className="w-3 h-3 mr-1" />
                                {request.partner.name}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {request.status === "requested" && (
                          <Button
                            size="sm"
                            className="rounded-xl"
                            onClick={() => {
                              setSelectedRequest(request);
                              setAssignDialogOpen(true);
                            }}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Assign Partner
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {partners.length === 0 ? (
                <Card className="col-span-full rounded-2xl shadow-card border-0">
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No delivery partners registered</p>
                  </CardContent>
                </Card>
              ) : (
                partners.map((partner) => {
                  const activeDeliveries = requests.filter(
                    r => r.assigned_partner_id === partner.id && ["assigned", "picked"].includes(r.status)
                  ).length;
                  const completedDeliveries = requests.filter(
                    r => r.assigned_partner_id === partner.id && (r.status === "delivered" || r.status === "completed")
                  ).length;

                  return (
                    <Card key={partner.id} className="rounded-2xl shadow-card border-0">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{partner.name}</h3>
                            <p className="text-sm text-muted-foreground">{partner.phone || partner.email}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-4">
                          <div className="flex-1 text-center p-2 bg-blue-50 rounded-xl">
                            <p className="text-lg font-bold text-blue-600">{activeDeliveries}</p>
                            <p className="text-xs text-muted-foreground">Active</p>
                          </div>
                          <div className="flex-1 text-center p-2 bg-green-50 rounded-xl">
                            <p className="text-lg font-bold text-green-600">{completedDeliveries}</p>
                            <p className="text-xs text-muted-foreground">Completed</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Assign Partner Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Assign Delivery Partner</DialogTitle>
            <DialogDescription>
              Select a delivery partner for this transport request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-xl">
                <p className="font-medium">{selectedRequest.pet?.name || "Pet"}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedRequest.pickup_address?.split(',')[0]} → {selectedRequest.delivery_address?.split(',')[0]}
                </p>
                <p className="text-sm font-medium text-primary mt-1">
                  {formatPrice(selectedRequest.fee)}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Select Partner</Label>
                <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Choose a delivery partner" />
                  </SelectTrigger>
                  <SelectContent>
                    {partners.map((partner) => (
                      <SelectItem key={partner.id} value={partner.id}>
                        {partner.name} - {partner.phone || partner.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => {
                    setAssignDialogOpen(false);
                    setSelectedRequest(null);
                    setSelectedPartner("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 rounded-xl bg-gradient-primary"
                  onClick={assignPartner}
                  disabled={!selectedPartner}
                >
                  Assign Partner
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;