import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  ShieldCheck,
  Calendar,
  Syringe,
  MessageCircle,
  Phone,
  ChevronLeft,
  ChevronRight,
  Star,
  Loader2,
} from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import { useWishlist } from "@/hooks/useWishlist";

interface Pet {
  id: string;
  name: string;
  breed: string;
  category: string;
  gender: string;
  age_months: number;
  price: number;
  description: string | null;
  images: string[] | null;
  videos: string[] | null;
  city: string;
  state: string;
  location: string;
  vaccinated: boolean;
  microchip: string | null;
  medical_history: string | null;
  verification_status: string;
  color: string | null;
  is_featured: boolean;
  views: number;
  created_at: string;
  owner_id: string;
  profiles?: {
    id: string;
    name: string;
    profile_photo: string | null;
    rating: number;
    is_breeder_verified: boolean;
  };
}

const PetDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [user, setUser] = useState<any>(null);
  const { wishlistPets, togglePetWishlist, isPetInWishlist } = useWishlist();

  const isInWishlist = isPetInWishlist(id || "");

  useEffect(() => {
    fetchPet();
    checkUser();
  }, [id]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const fetchPet = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from("pets")
        .select(`
          *,
          profiles:owner_id (id, name, profile_photo, rating, is_breeder_verified)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      
      setPet(data);

      // Increment views
      await supabase
        .from("pets")
        .update({ views: (data.views || 0) + 1 })
        .eq("id", id);

    } catch (error: any) {
      toast.error("Failed to load pet details");
      navigate("/buyer-dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${pet?.breed} for sale`,
        text: `Check out this ${pet?.breed} on PetLink!`,
        url: window.location.href,
      });
    } catch {
      // Fallback to copy link
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleContact = () => {
    if (!user) {
      toast.info("Please login to contact the seller");
      navigate("/auth");
      return;
    }
    toast.info("Chat feature coming soon!");
  };

  const handleWishlistToggle = () => {
    if (!user) {
      toast.info("Please login to add to wishlist");
      navigate("/auth");
      return;
    }
    if (pet) {
      togglePetWishlist(pet.id);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatAge = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${remainingMonths} months`;
    if (remainingMonths === 0) return `${years} year${years > 1 ? "s" : ""}`;
    return `${years}y ${remainingMonths}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">Pet not found</p>
        <Button onClick={() => navigate("/buyer-dashboard")}>Go Back</Button>
      </div>
    );
  }

  const images = pet.images || [];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
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
              onClick={handleWishlistToggle}
            >
              <Heart
                className={`w-5 h-5 ${isInWishlist ? "fill-destructive text-destructive" : ""}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Image Gallery */}
      <div className="relative aspect-square bg-muted">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={pet.name}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80"
                  onClick={() =>
                    setCurrentImageIndex((i) => (i - 1 + images.length) % images.length)
                  }
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80"
                  onClick={() =>
                    setCurrentImageIndex((i) => (i + 1) % images.length)
                  }
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex
                          ? "bg-primary"
                          : "bg-background/60"
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No images available
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {pet.verification_status === "verified" && (
            <Badge className="bg-success text-white border-0 rounded-full">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
          {pet.is_featured && (
            <Badge className="bg-gradient-primary text-white border-0 rounded-full">
              Featured
            </Badge>
          )}
        </div>
      </div>

      {/* Pet Details */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Title & Price */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold">{pet.breed}</h1>
              <p className="text-muted-foreground capitalize">
                {pet.name} • {pet.gender} • {formatAge(pet.age_months)}
              </p>
            </div>
            <p className="text-2xl font-bold text-primary">
              {formatPrice(pet.price)}
            </p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{pet.city}, {pet.state}</span>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="font-medium capitalize">{pet.category}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Color</p>
              <p className="font-medium capitalize">{pet.color || "N/A"}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Vaccinated</p>
              <p className="font-medium">{pet.vaccinated ? "Yes" : "No"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Health Info */}
        {(pet.vaccinated || pet.microchip) && (
          <Card className="border-0 shadow-card">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Syringe className="w-4 h-4 text-primary" />
                Health Information
              </h3>
              {pet.vaccinated && (
                <div className="flex items-center gap-2 text-success">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-sm">Vaccinated</span>
                </div>
              )}
              {pet.microchip && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Microchip:</span> {pet.microchip}
                </div>
              )}
              {pet.medical_history && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Medical History:</span>{" "}
                  {pet.medical_history}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Description */}
        {pet.description && (
          <Card className="border-0 shadow-card">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground text-sm">{pet.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Seller Info */}
        {pet.profiles && (
          <Card className="border-0 shadow-card">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Seller Information</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-secondary flex items-center justify-center overflow-hidden">
                  {pet.profiles.profile_photo ? (
                    <img
                      src={pet.profiles.profile_photo}
                      alt={pet.profiles.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold">
                      {pet.profiles.name?.[0]?.toUpperCase() || "S"}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{pet.profiles.name}</p>
                    {pet.profiles.is_breeder_verified && (
                      <Badge variant="secondary" className="text-xs">
                        Verified Breeder
                      </Badge>
                    )}
                  </div>
                  {pet.profiles.rating > 0 && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{pet.profiles.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Details */}
        <Card className="border-0 shadow-card">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Additional Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Listed</p>
                <p className="font-medium">
                  {new Date(pet.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Views</p>
                <p className="font-medium">{pet.views || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Location</p>
                <p className="font-medium">{pet.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border p-4">
        <div className="container mx-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-2xl"
            onClick={handleContact}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat
          </Button>
          <Button
            className="flex-1 rounded-2xl bg-gradient-primary"
            onClick={handleContact}
          >
            <Phone className="w-4 h-4 mr-2" />
            Contact Seller
          </Button>
        </div>
      </div>

      <BottomNavigation variant="buyer" />
    </div>
  );
};

export default PetDetails;
