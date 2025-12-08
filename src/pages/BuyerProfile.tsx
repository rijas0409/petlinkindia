import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, User, Mail, Phone, MapPin, Loader2, Save, Plus } from "lucide-react";

interface Address {
  id: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

const BuyerProfile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState({
    address_line: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const [profileRes, addressRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", session.user.id).single(),
        supabase.from("addresses").select("*").eq("user_id", session.user.id).order("is_default", { ascending: false }),
      ]);

      if (profileRes.error) throw profileRes.error;

      setProfile({
        name: profileRes.data.name || "",
        email: profileRes.data.email || session.user.email || "",
        phone: profileRes.data.phone || "",
      });

      setAddresses(addressRes.data || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.address_line || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error("Please fill in all address fields");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("addresses")
        .insert({
          user_id: session.user.id,
          ...newAddress,
          is_default: addresses.length === 0,
        })
        .select()
        .single();

      if (error) throw error;

      setAddresses(prev => [...prev, data]);
      setNewAddress({ address_line: "", city: "", state: "", pincode: "" });
      setShowAddForm(false);
      toast.success("Address added successfully!");
    } catch (error: any) {
      console.error("Error adding address:", error);
      toast.error("Failed to add address");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate("/buyer-dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">My Profile</h1>
            <p className="text-xs text-muted-foreground">Manage your account</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        {/* Profile Card */}
        <Card className="border-0 shadow-card rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                value={profile.name}
                disabled
                className="rounded-2xl bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                value={profile.email}
                disabled
                className="rounded-2xl bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                value={profile.phone || "Not provided"}
                disabled
                className="rounded-2xl bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        {/* Addresses Card */}
        <Card className="border-0 shadow-card rounded-3xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Saved Addresses
                </CardTitle>
                <CardDescription>Manage your delivery addresses</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(!showAddForm)}
                className="rounded-2xl"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add New
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showAddForm && (
              <div className="p-4 bg-muted/50 rounded-2xl space-y-3 animate-fade-in">
                <Input
                  placeholder="Address Line"
                  value={newAddress.address_line}
                  onChange={(e) => setNewAddress({ ...newAddress, address_line: e.target.value })}
                  className="rounded-xl"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="rounded-xl"
                  />
                  <Input
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <Input
                  placeholder="Pincode"
                  value={newAddress.pincode}
                  onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                  className="rounded-xl"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddAddress}
                    disabled={isSaving}
                    className="flex-1 rounded-xl bg-gradient-primary hover:opacity-90"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {addresses.length === 0 && !showAddForm ? (
              <p className="text-center text-muted-foreground py-4">
                No addresses saved yet
              </p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-4 rounded-2xl border ${addr.is_default ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <p className="font-medium">{addr.address_line}</p>
                    <p className="text-sm text-muted-foreground">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    {addr.is_default && (
                      <span className="inline-block mt-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BuyerProfile;
