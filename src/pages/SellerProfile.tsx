import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, User, Mail, Phone, MapPin, Building2, Loader2, Save } from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessAddress: string;
}

const SellerProfile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    businessAddress: "",
  });
  const [editableAddress, setEditableAddress] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;

      // Parse business_address from the stored format (if needed)
      const businessInfo = data.breeder_license ? JSON.parse(data.breeder_license) : {};

      setProfile({
        name: data.name || "",
        email: data.email || session.user.email || "",
        phone: data.phone || "",
        businessName: businessInfo.businessName || "",
        businessAddress: businessInfo.businessAddress || "",
      });
      setEditableAddress(businessInfo.businessAddress || "");
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Store address in a JSON format within breeder_license or a new field
      const businessInfo = {
        businessName: profile.businessName,
        businessAddress: editableAddress,
      };

      const { error } = await supabase
        .from("profiles")
        .update({
          breeder_license: JSON.stringify(businessInfo),
        })
        .eq("id", session.user.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev, businessAddress: editableAddress }));
      toast.success("Address updated successfully!");
    } catch (error: any) {
      console.error("Error saving address:", error);
      toast.error("Failed to update address");
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
            onClick={() => navigate("/seller-dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">My Profile</h1>
            <p className="text-xs text-muted-foreground">Manage your seller profile</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-0 shadow-card rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profile Information
            </CardTitle>
            <CardDescription>
              View your profile details. Only address can be edited.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Non-editable fields */}
            <div className="space-y-4">
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
                <p className="text-xs text-muted-foreground">Name cannot be changed</p>
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
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  value={profile.phone}
                  disabled
                  className="rounded-2xl bg-muted"
                />
                <p className="text-xs text-muted-foreground">Phone cannot be changed</p>
              </div>

              {profile.businessName && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    Business Name
                  </Label>
                  <Input
                    value={profile.businessName}
                    disabled
                    className="rounded-2xl bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Business name cannot be changed</p>
                </div>
              )}
            </div>

            {/* Editable Address */}
            <div className="pt-4 border-t border-border">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Business Address
                </Label>
                <Input
                  value={editableAddress}
                  onChange={(e) => setEditableAddress(e.target.value)}
                  placeholder="Enter your business address"
                  className="rounded-2xl"
                />
                <p className="text-xs text-muted-foreground">You can update your address here</p>
              </div>

              <Button
                onClick={handleSaveAddress}
                disabled={isSaving || editableAddress === profile.businessAddress}
                className="w-full mt-4 rounded-2xl bg-gradient-primary hover:opacity-90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Address
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SellerProfile;
