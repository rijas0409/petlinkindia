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
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  Truck,
  Users,
  Clock,
  CheckCircle2,
  MapPin,
  LogOut,
  Search,
  Filter,
  UserPlus,
  IndianRupee,
  BarChart3,
  ShieldCheck,
  UserCheck,
  PawPrint,
  RefreshCw,
  XCircle,
  Eye,
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

interface PendingSeller {
  id: string;
  name: string;
  email: string;
  phone: string;
  full_name: string;
  address: string;
  is_onboarding_complete: boolean;
  is_admin_approved: boolean;
  priority_fee_paid?: boolean;
  created_at: string;
}

interface PendingPet {
  id: string;
  name: string;
  breed: string;
  category: string;
  price: number;
  images: string[];
  verification_status: string;
  priority_verification: boolean;
  priority_fee_paid: boolean;
  created_at: string;
  owner?: {
    name: string;
    phone: string;
  };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [pendingSellers, setPendingSellers] = useState<PendingSeller[]>([]);
  const [pendingPets, setPendingPets] = useState<PendingPet[]>([]);
  const [reVerificationPets, setReVerificationPets] = useState<PendingPet[]>([]);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
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
      navigate("/auth-admin");
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
    const { data: requestsData } = await supabase
      .from("transport_requests")
      .select(`
        *,
        pet:pets(name, breed, images),
        seller:profiles!transport_requests_seller_id_fkey(name, phone),
        buyer:profiles!transport_requests_buyer_id_fkey(name, phone),
        partner:profiles!transport_requests_assigned_partner_id_fkey(name, phone)
      `)
      .order("created_at", { ascending: false });

    setRequests(requestsData || []);

    // Fetch delivery partners
    const { data: partnersData } = await supabase
      .from("profiles")
      .select("id, name, phone, email")
      .eq("role", "delivery_partner");

    setPartners(partnersData || []);

    // Fetch pending sellers (both pet sellers and product sellers, onboarding complete but not approved)
    const { data: sellersData } = await supabase
      .from("profiles")
      .select("*")
      .in("role", ["seller", "product_seller", "vet"])
      .eq("is_onboarding_complete", true)
      .eq("is_admin_approved", false)
      .order("created_at", { ascending: false });

    setPendingSellers(sellersData || []);

    // Fetch pending pet verifications
    const { data: petsData } = await supabase
      .from("pets")
      .select(`
        *,
        owner:profiles!pets_owner_id_fkey(name, phone)
      `)
      .eq("verification_status", "pending")
      .order("priority_fee_paid", { ascending: false })
      .order("created_at", { ascending: false });

    // Separate new listings from re-verifications
    const newListings = (petsData || []).filter(pet => !pet.updated_at || pet.created_at === pet.updated_at);
    const reVerifications = (petsData || []).filter(pet => pet.updated_at && pet.created_at !== pet.updated_at);
    
    setPendingPets(newListings);
    setReVerificationPets(reVerifications);

    // Fetch pending shop products
    const { data: productsData } = await supabase
      .from("shop_products")
      .select("*, seller:profiles!shop_products_seller_id_fkey(name, phone)")
      .eq("verification_status", "pending")
      .order("priority_fee_paid", { ascending: false })
      .order("created_at", { ascending: false });

    setPendingProducts(productsData || []);

    setLoading(false);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('admin-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transport_requests' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pets' }, () => fetchData())
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const approveSeller = async (sellerId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_admin_approved: true })
      .eq("id", sellerId);

    if (error) {
      toast({ title: "Error", description: "Failed to approve seller", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Seller approved successfully" });
      fetchData();
    }
  };

  const rejectSeller = async (sellerId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_onboarding_complete: false, is_admin_approved: false })
      .eq("id", sellerId);

    if (error) {
      toast({ title: "Error", description: "Failed to reject seller", variant: "destructive" });
    } else {
      toast({ title: "Seller Rejected", description: "Seller must re-submit verification" });
      fetchData();
    }
  };

  const verifyPet = async (petId: string) => {
    const { error } = await supabase
      .from("pets")
      .update({ verification_status: "verified" })
      .eq("id", petId);

    if (error) {
      toast({ title: "Error", description: "Failed to verify pet", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Pet listing verified and now live" });
      fetchData();
    }
  };

  const rejectPet = async (petId: string) => {
    const { error } = await supabase
      .from("pets")
      .update({ verification_status: "failed" })
      .eq("id", petId);

    if (error) {
      toast({ title: "Error", description: "Failed to reject pet", variant: "destructive" });
    } else {
      toast({ title: "Pet Rejected", description: "Seller will be notified" });
      fetchData();
    }
  };

  const verifyProduct = async (productId: string) => {
    const { error } = await supabase.from("shop_products").update({ verification_status: "verified" }).eq("id", productId);
    if (error) toast({ title: "Error", description: "Failed to verify product", variant: "destructive" });
    else { toast({ title: "Success", description: "Product verified and now live in shop" }); fetchData(); }
  };

  const rejectProduct = async (productId: string) => {
    const { error } = await supabase.from("shop_products").update({ verification_status: "failed" }).eq("id", productId);
    if (error) toast({ title: "Error", description: "Failed to reject product", variant: "destructive" });
    else { toast({ title: "Product Rejected", description: "Seller will be notified" }); fetchData(); }
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
      toast({ title: "Error", description: "Failed to assign partner", variant: "destructive" });
    } else {
      toast({ title: "Partner Assigned", description: "Delivery partner has been assigned successfully" });
      setAssignDialogOpen(false);
      setSelectedRequest(null);
      setSelectedPartner("");
      fetchData();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth-admin");
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
    if (statusFilter !== "all") filtered = filtered.filter(r => r.status === statusFilter);
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.pet?.name?.toLowerCase().includes(query) ||
        r.seller?.name?.toLowerCase().includes(query) ||
        r.buyer?.name?.toLowerCase().includes(query)
      );
    }
    return filtered;
  };

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "requested").length,
    inTransit: requests.filter(r => ["assigned", "picked"].includes(r.status)).length,
    delivered: requests.filter(r => r.status === "delivered" || r.status === "completed").length,
    totalRevenue: requests.filter(r => r.status === "delivered" || r.status === "completed").reduce((sum, r) => sum + (r.fee || 0), 0),
    partnersCount: partners.length,
    pendingSellersCount: pendingSellers.length,
    pendingPetsCount: pendingPets.length,
    reVerificationCount: reVerificationPets.length,
    pendingProductsCount: pendingProducts.length,
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
                <p className="text-xs text-muted-foreground">Management Dashboard</p>
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
          <TabsList className="w-full bg-muted/50 rounded-2xl p-1 mb-6 flex flex-wrap">
            <TabsTrigger value="overview" className="flex-1 rounded-xl text-xs">
              <BarChart3 className="w-4 h-4 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="sellers" className="flex-1 rounded-xl text-xs relative">
              <UserCheck className="w-4 h-4 mr-1" />
              Sellers
              {stats.pendingSellersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {stats.pendingSellersCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="pets" className="flex-1 rounded-xl text-xs relative">
              <PawPrint className="w-4 h-4 mr-1" />
              Pets
              {stats.pendingPetsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {stats.pendingPetsCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="reverify" className="flex-1 rounded-xl text-xs relative">
              <RefreshCw className="w-4 h-4 mr-1" />
              Re-verify
              {stats.reVerificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {stats.reVerificationCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="transport" className="flex-1 rounded-xl text-xs">
              <Truck className="w-4 h-4 mr-1" />
              Transport
            </TabsTrigger>
            <TabsTrigger value="products" className="flex-1 rounded-xl text-xs relative">
              <Package className="w-4 h-4 mr-1" />
              Products
              {stats.pendingProductsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {stats.pendingProductsCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="rounded-2xl shadow-card border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.pendingSellersCount}</p>
                      <p className="text-xs text-muted-foreground">Pending Sellers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-card border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <PawPrint className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.pendingPetsCount}</p>
                      <p className="text-xs text-muted-foreground">Pending Pets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-card border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.reVerificationCount}</p>
                      <p className="text-xs text-muted-foreground">Re-verification</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-card border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <Truck className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.pending}</p>
                      <p className="text-xs text-muted-foreground">Transport Pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Priority Sellers */}
              <Card className="rounded-2xl shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Priority Seller Approvals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingSellers.filter(s => s.priority_fee_paid).length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No priority requests</p>
                  ) : (
                    <div className="space-y-3">
                      {pendingSellers.filter(s => s.priority_fee_paid).map(seller => (
                        <div key={seller.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                          <div>
                            <p className="font-medium">{seller.full_name || seller.name}</p>
                            <p className="text-xs text-muted-foreground">{seller.email}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="rounded-lg" onClick={() => approveSeller(seller.id)}>
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" className="rounded-lg" onClick={() => rejectSeller(seller.id)}>
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Priority Pet Verifications */}
              <Card className="rounded-2xl shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Priority Pet Verifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingPets.filter(p => p.priority_fee_paid).length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No priority requests</p>
                  ) : (
                    <div className="space-y-3">
                      {pendingPets.filter(p => p.priority_fee_paid).map(pet => (
                        <div key={pet.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                            {pet.images?.[0] && <img src={pet.images[0]} alt={pet.name} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{pet.name}</p>
                            <p className="text-xs text-muted-foreground">{pet.breed} • {formatPrice(pet.price)}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="rounded-lg" onClick={() => verifyPet(pet.id)}>
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" className="rounded-lg" onClick={() => rejectPet(pet.id)}>
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sellers Approval Tab */}
          <TabsContent value="sellers">
            <Card className="rounded-2xl shadow-card border-0">
              <CardHeader>
                <CardTitle>Pending Seller Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingSellers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pending seller approvals</p>
                ) : (
                  <div className="space-y-4">
                    {pendingSellers.map(seller => (
                      <div key={seller.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{seller.full_name || seller.name}</p>
                              {seller.priority_fee_paid && (
                                <Badge className="bg-amber-100 text-amber-800 text-[10px]">PRIORITY</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{seller.email}</p>
                            <p className="text-xs text-muted-foreground">{seller.phone} • {seller.address?.slice(0, 30)}...</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="rounded-xl">
                            <Eye className="w-4 h-4 mr-1" />
                            View Docs
                          </Button>
                          <Button size="sm" className="rounded-xl bg-green-500 hover:bg-green-600" onClick={() => approveSeller(seller.id)}>
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" className="rounded-xl" onClick={() => rejectSeller(seller.id)}>
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pet Verification Tab */}
          <TabsContent value="pets">
            <Card className="rounded-2xl shadow-card border-0">
              <CardHeader>
                <CardTitle>Pending Pet Verifications</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingPets.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pending pet verifications</p>
                ) : (
                  <div className="space-y-4">
                    {pendingPets.map(pet => (
                      <div key={pet.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted">
                            {pet.images?.[0] ? (
                              <img src={pet.images[0]} alt={pet.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <PawPrint className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{pet.name}</p>
                              {pet.priority_fee_paid && (
                                <Badge className="bg-amber-100 text-amber-800 text-[10px]">PRIORITY</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{pet.breed} • {pet.category}</p>
                            <p className="text-sm font-medium text-primary">{formatPrice(pet.price)}</p>
                            <p className="text-xs text-muted-foreground">By: {pet.owner?.name}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="rounded-xl" onClick={() => navigate(`/pet/${pet.id}`)}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" className="rounded-xl bg-green-500 hover:bg-green-600" onClick={() => verifyPet(pet.id)}>
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Verify
                          </Button>
                          <Button size="sm" variant="destructive" className="rounded-xl" onClick={() => rejectPet(pet.id)}>
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Re-verification Tab */}
          <TabsContent value="reverify">
            <Card className="rounded-2xl shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-purple-500" />
                  Re-verification Listings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reVerificationPets.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No re-verification requests</p>
                ) : (
                  <div className="space-y-4">
                    {reVerificationPets.map(pet => (
                      <div key={pet.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted">
                            {pet.images?.[0] ? (
                              <img src={pet.images[0]} alt={pet.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <PawPrint className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{pet.name}</p>
                              <Badge className="bg-purple-100 text-purple-800 text-[10px]">EDITED</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{pet.breed} • {pet.category}</p>
                            <p className="text-sm font-medium text-primary">{formatPrice(pet.price)}</p>
                            <p className="text-xs text-muted-foreground">By: {pet.owner?.name}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="rounded-xl" onClick={() => navigate(`/pet/${pet.id}`)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                          <Button size="sm" className="rounded-xl bg-green-500 hover:bg-green-600" onClick={() => verifyPet(pet.id)}>
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" className="rounded-xl" onClick={() => rejectPet(pet.id)}>
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transport Tab */}
          <TabsContent value="transport">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
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
                </SelectContent>
              </Select>
            </div>

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
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                          {request.pet?.images?.[0] ? (
                            <img src={request.pet.images[0]} alt={request.pet.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
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
                            {request.partner && (
                              <Badge variant="outline" className="rounded-lg">
                                <Users className="w-3 h-3 mr-1" />
                                {request.partner.name}
                              </Badge>
                            )}
                          </div>
                        </div>
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
                            Assign
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Products Verification Tab */}
          <TabsContent value="products">
            <Card className="rounded-2xl shadow-card border-0">
              <CardHeader>
                <CardTitle>Pending Product Verifications</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingProducts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pending product verifications</p>
                ) : (
                  <div className="space-y-4">
                    {pendingProducts.map((product: any) => (
                      <div key={product.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-muted-foreground" /></div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.brand} • {product.pet_type} • ₹{product.price}</p>
                            <p className="text-xs text-muted-foreground">By: {product.seller?.name || "Unknown"}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="rounded-xl bg-emerald-500 hover:bg-emerald-600" onClick={() => verifyProduct(product.id)}>
                            <CheckCircle2 className="w-4 h-4 mr-1" />Approve
                          </Button>
                          <Button size="sm" variant="destructive" className="rounded-xl" onClick={() => rejectProduct(product.id)}>
                            <XCircle className="w-4 h-4 mr-1" />Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Assign Partner Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Assign Delivery Partner</DialogTitle>
            <DialogDescription>Select a delivery partner for this transport request</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-xl">
                <p className="font-medium">{selectedRequest.pet?.name || "Pet"}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedRequest.pickup_address?.split(',')[0]} → {selectedRequest.delivery_address?.split(',')[0]}
                </p>
                <p className="text-sm font-medium text-primary mt-1">{formatPrice(selectedRequest.fee)}</p>
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
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => {
                  setAssignDialogOpen(false);
                  setSelectedRequest(null);
                  setSelectedPartner("");
                }}>
                  Cancel
                </Button>
                <Button className="flex-1 rounded-xl bg-gradient-primary" onClick={assignPartner} disabled={!selectedPartner}>
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
