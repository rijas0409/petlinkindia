import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save } from "lucide-react";

const EditPet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    price: "",
    description: "",
    city: "",
    state: "",
    location: "",
  });

  useEffect(() => {
    if (id) fetchPet();
  }, [id]);

  const fetchPet = async () => {
    try {
      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setFormData({
        name: data.name || "",
        breed: data.breed || "",
        price: data.price?.toString() || "",
        description: data.description || "",
        city: data.city || "",
        state: data.state || "",
        location: data.location || "",
      });
    } catch (error) {
      toast.error("Failed to load pet details");
      navigate("/seller-dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("pets")
        .update({
          name: formData.name,
          breed: formData.breed,
          price: parseFloat(formData.price),
          description: formData.description,
          city: formData.city,
          state: formData.state,
          location: formData.location,
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("Pet updated successfully!");
      navigate("/seller-dashboard");
    } catch (error) {
      toast.error("Failed to update pet");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate("/seller-dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Edit Pet Listing</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-0 shadow-card rounded-3xl">
          <CardHeader>
            <CardTitle>Edit Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pet Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Label>Breed</Label>
              <Input value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} className="rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Label>Price (₹)</Label>
              <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="rounded-2xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="rounded-2xl" />
              </div>
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="w-full rounded-2xl bg-gradient-primary hover:opacity-90">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EditPet;
