import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  ArrowLeft, Heart, MapPin, Calendar, Ruler, MessageCircle, 
  ShieldCheck, Share2, Loader2, ChevronLeft, ChevronRight 
} from "lucide-react";

const PetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPetDetails();
    }
  }, [id]);

  const fetchPetDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("pets")
        .select(`
          *,
          profiles:owner_id (id, name, rating, profile_photo, is_breeder_verified)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setPet(data);

      // Increment view count
      await supabase
        .from("pets")
        .update({ views: (data.views || 0) + 1 })
        .eq("id", id);
    } catch (error: any) {
      console.error("Error fetching pet:", error);
      toast.error("Failed to load pet details");
      navigate("/buyer-dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContact = () => {
    toast.info("Chat feature coming soon!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Pet not found</p>
      </div>
    );
  }

  const images = pet.images || [];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
        {/* Image Gallery */}
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-muted">
          {images.length > 0 ? (
            <>
              <img
                src={images[currentImageIndex]}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-white"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-muted-foreground">No image available</p>
            </div>
          )}
          {pet.verification_status === "verified" && (
            <Badge className="absolute top-3 left-3 bg-success text-white border-0 rounded-full">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>

        {/* Pet Info */}
        <Card className="border-0 shadow-card rounded-3xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{pet.name}</h1>
                <p className="text-muted-foreground">{pet.breed}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  ₹{Number(pet.price).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full">
                {pet.gender}
              </Badge>
              <Badge variant="secondary" className="rounded-full">
                <Calendar className="w-3 h-3 mr-1" />
                {Math.floor(pet.age_months / 12)}y {pet.age_months % 12}m
              </Badge>
              {pet.color && (
                <Badge variant="secondary" className="rounded-full">
                  <Ruler className="w-3 h-3 mr-1" />
                  {pet.color}
                </Badge>
              )}
              {pet.vaccinated && (
                <Badge className="bg-success/20 text-success rounded-full">
                  Vaccinated
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{pet.city}, {pet.state}</span>
            </div>

            {pet.description && (
              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-muted-foreground">{pet.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seller Info */}
        {pet.profiles && (
          <Card className="border-0 shadow-card rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-secondary flex items-center justify-center text-lg font-semibold">
                  {pet.profiles.name?.[0]?.toUpperCase() || "S"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{pet.profiles.name}</h3>
                    {pet.profiles.is_breeder_verified && (
                      <Badge className="bg-primary/20 text-primary rounded-full">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Verified Breeder
                      </Badge>
                    )}
                  </div>
                  {pet.profiles.rating > 0 && (
                    <p className="text-sm text-muted-foreground">⭐ {pet.profiles.rating.toFixed(1)} rating</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card/90 backdrop-blur-lg border-t border-border">
        <div className="container mx-auto max-w-3xl flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-2xl h-12"
            onClick={handleContact}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Chat with Seller
          </Button>
          <Button
            className="flex-1 rounded-2xl h-12 bg-gradient-primary hover:opacity-90"
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PetDetails;
