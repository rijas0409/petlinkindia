import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, SlidersHorizontal, MapPin, ChevronDown, Star, 
  MessageCircle, Stethoscope, Syringe, Sparkles, Heart, ShoppingCart,
  ChevronRight, Play, BadgeCheck, X, Check, Video, Brain, ArrowRight
} from "lucide-react";
import vetDoctorIllustration from "@/assets/vet-doctor-illustration.png";
import { cn } from "@/lib/utils";
import BottomNavigation from "@/components/BottomNavigation";
import HeaderProfileDropdown from "@/components/HeaderProfileDropdown";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const cities = [
  { id: "greater-noida", name: "Greater Noida", state: "Uttar Pradesh" },
  { id: "noida", name: "Noida", state: "Uttar Pradesh" },
  { id: "delhi", name: "Delhi", state: "Delhi" },
  { id: "gurgaon", name: "Gurgaon", state: "Haryana" },
  { id: "mumbai", name: "Mumbai", state: "Maharashtra" },
  { id: "bangalore", name: "Bangalore", state: "Karnataka" },
  { id: "hyderabad", name: "Hyderabad", state: "Telangana" },
  { id: "chennai", name: "Chennai", state: "Tamil Nadu" },
  { id: "pune", name: "Pune", state: "Maharashtra" },
  { id: "kolkata", name: "Kolkata", state: "West Bengal" },
];
const petCategories = [
  { id: "dogs", name: "Dogs", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop" },
  { id: "cats", name: "Cats", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&h=100&fit=crop" },
  { id: "birds", name: "Birds", image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=100&h=100&fit=crop" },
  { id: "hamsters", name: "Hamsters", image: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=100&h=100&fit=crop" },
  { id: "rabbits", name: "Rabbits", image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=100&h=100&fit=crop" },
  { id: "fish", name: "Fish", image: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=100&h=100&fit=crop" },
  { id: "guinea-pig", name: "Guinea Pig", image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=100&h=100&fit=crop" },
  { id: "turtle", name: "Turtle", image: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=100&h=100&fit=crop" },
];

const specialties = [
  { id: "surgery", name: "Surgery", icon: "➕", bgColor: "bg-blue-100", iconColor: "text-blue-500" },
  { id: "vaccination", name: "Vaccination", icon: "💉", bgColor: "bg-pink-100", iconColor: "text-pink-500" },
  { id: "skin-care", name: "Skin Care", icon: "🌿", bgColor: "bg-green-100", iconColor: "text-green-500" },
  { id: "dental", name: "Dental", icon: "🦷", bgColor: "bg-purple-100", iconColor: "text-purple-500" },
  { id: "nutrition", name: "Nutrition", icon: "🥗", bgColor: "bg-orange-100", iconColor: "text-orange-500" },
  { id: "checkup", name: "Checkup", icon: "🩺", bgColor: "bg-teal-100", iconColor: "text-teal-500" },
];

const vetsNearYou = [
  {
    id: "1",
    name: "Dr. Ananya Iyer",
    specialty: "Senior Surgeon",
    experience: "8 yrs exp.",
    rating: 4.9,
    price: 500,
    availability: "AVAILABLE NOW",
    availabilityColor: "text-green-500",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop"
  },
  {
    id: "2",
    name: "Dr. Rohan Sharma",
    specialty: "Paws & Claws",
    experience: "5 yrs exp.",
    rating: 4.8,
    price: 450,
    availability: "NEXT: 2 PM",
    availabilityColor: "text-muted-foreground",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop"
  },
];

const clinicsNearby = [
  {
    id: "1",
    name: "Pawprints Clinic",
    location: "Bandra West, Mumbai",
    doctors: 3,
    verified: true,
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=100&h=100&fit=crop"
  },
  {
    id: "2",
    name: "Happy Paws Clinic",
    location: "Juhu, Mumbai",
    doctors: 1,
    verified: true,
    image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=100&h=100&fit=crop"
  },
];

const eliteDoctors = [
  {
    id: "1",
    name: "Dr. Amara S.",
    specialty: "Senior Orthopedic Specialist",
    experience: "12+ Years Exp.",
    rating: 4.9,
    price: 800,
    verified: true,
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop"
  },
];

const Vet = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [location, setLocation] = useState("Greater Noida");
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [searchCity, setSearchCity] = useState("");
  const { totalWishlistCount } = useWishlist();

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchCity.toLowerCase()) ||
    city.state.toLowerCase().includes(searchCity.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header - Same as Home page with Location Selector */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                PetLink
              </span>
              <button 
                onClick={() => setLocationModalOpen(true)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <MapPin className="w-3 h-3" />
                <span>{location}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Wishlist Button */}
            <button 
              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors relative"
              onClick={() => navigate("/wishlist")}
            >
              <Heart className="w-5 h-5" />
              {totalWishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                  {totalWishlistCount}
                </span>
              )}
            </button>
            {/* Cart Button */}
            <button 
              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              onClick={() => toast.info("Cart coming soon")}
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
            <HeaderProfileDropdown />
          </div>
        </div>
      </header>

      {/* Location Selector Modal */}
      <Dialog open={locationModalOpen} onOpenChange={setLocationModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-lg font-bold">Select Your Location</DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search city..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* City List */}
            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredCities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => {
                    setLocation(city.name);
                    setLocationModalOpen(false);
                    setSearchCity("");
                    toast.success(`Location set to ${city.name}`);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left",
                    location === city.name 
                      ? "bg-pink-50 border border-pink-200" 
                      : "hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      location === city.name ? "bg-pink-100" : "bg-muted"
                    )}>
                      <MapPin className={cn(
                        "w-4 h-4",
                        location === city.name ? "text-pink-500" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <p className={cn(
                        "font-medium text-sm",
                        location === city.name ? "text-pink-600" : "text-foreground"
                      )}>
                        {city.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{city.state}</p>
                    </div>
                  </div>
                  {location === city.name && (
                    <Check className="w-5 h-5 text-pink-500" />
                  )}
                </button>
              ))}
              {filteredCities.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No cities found
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="px-4 py-4 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search vets by specialty or clinic"
            className="w-full pl-12 pr-12 py-3 bg-muted/50 border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2">
            <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Pet Categories */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-4">
            {petCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="flex flex-col items-center gap-2 min-w-[60px]"
              >
                <div className={cn(
                  "w-14 h-14 rounded-full overflow-hidden border-2 transition-all",
                  selectedCategory === category.id 
                    ? "border-pink-500 ring-2 ring-pink-200" 
                    : "border-pink-200"
                )}>
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  selectedCategory === category.id ? "text-pink-500" : "text-muted-foreground"
                )}>
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Instant Video Call Banner */}
        <div className="rounded-[22px] overflow-hidden min-h-[180px] flex shadow-sm">
          {/* Left - Pink section */}
          <div className="flex-1 bg-[#FDE7EC] p-5 flex flex-col justify-center">
            <p className="text-xs font-bold tracking-widest text-[#FF4D6D] mb-2">AVAILABLE NOW</p>
            <h3 className="text-xl font-bold text-foreground leading-tight mb-1">Instant Video Call</h3>
            <p className="text-sm text-muted-foreground mb-4">Medical advice in 60 seconds</p>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate("/vet/consultation-plan")}
                className="bg-white text-[#FF4D6D] px-5 py-2 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-105"
              >
                Call Now
              </button>
              <button 
                onClick={() => navigate("/vet/consultation-plan")}
                className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm"
              >
                <Play className="w-4 h-4 text-[#FF4D6D] fill-[#FF4D6D]" />
              </button>
            </div>
          </div>
          {/* Right - Teal section with doctor */}
          <div className="w-[42%] bg-[#6FB7B1] flex items-end justify-center">
            <img 
              src={vetDoctorIllustration}
              alt="Doctor"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>

        {/* Smart Match Card */}
        <button 
          onClick={() => navigate("/vet/ai-assistant")}
          className="w-full bg-card rounded-[20px] p-4 shadow-md border border-border flex items-center gap-4 hover:shadow-lg transition-shadow text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-[#F2EAFE] flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-[#8B5CF6]" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold tracking-widest text-[#8B5CF6] mb-0.5">SMART MATCH</p>
            <p className="font-semibold text-sm text-foreground">Not sure which vet to choose?</p>
            <p className="text-xs text-muted-foreground">Let our AI find the perfect specialist</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
        </button>

        {/* Expert Specialties */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Expert Specialties</h2>
            <button className="text-sm font-medium text-pink-500">See All</button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {specialties.slice(0, 3).map((specialty) => (
              <button
                key={specialty.id}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all",
                  specialty.bgColor
                )}
              >
                <span className="text-2xl">{specialty.icon}</span>
                <span className="text-xs font-medium text-foreground">{specialty.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Vets Near You */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Vets Near You</h2>
            <button className="text-sm font-medium text-pink-500">See All</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {vetsNearYou.map((vet) => (
              <div key={vet.id} className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border">
                <div className="relative h-32">
                  <img 
                    src={vet.image} 
                    alt={vet.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-semibold">{vet.rating}</span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-foreground">{vet.name}</h3>
                  <p className="text-xs text-muted-foreground">{vet.specialty} • {vet.experience}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={cn("text-xs font-semibold", vet.availabilityColor)}>
                      {vet.availability}
                    </span>
                    <span className="text-sm font-bold text-pink-500">₹{vet.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Verified Clinics Nearby */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">Verified Clinics Nearby</h2>
              <span className="bg-muted text-xs px-2 py-0.5 rounded-full text-muted-foreground">18 found</span>
            </div>
            <button className="text-sm font-medium text-pink-500">See All</button>
          </div>
          <div className="space-y-3">
            {clinicsNearby.map((clinic) => (
              <div key={clinic.id} className="bg-card rounded-2xl p-4 shadow-sm border border-border flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-pink-100 flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-pink-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-foreground">{clinic.name}</h3>
                    {clinic.verified && (
                      <span className="bg-green-100 text-green-600 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3" />
                        VERIFIED
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{clinic.location}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex -space-x-1">
                      {[...Array(Math.min(clinic.doctors, 3))].map((_, i) => (
                        <div key={i} className="w-5 h-5 rounded-full bg-pink-200 border-2 border-white" />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">+{clinic.doctors} Doctors</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            ))}
          </div>
        </section>

        {/* All Specialized Doctors */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold text-foreground">All Specialized Doctors</h2>
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">ELITE</span>
          </div>
          {eliteDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-gradient-to-br from-white to-pink-50 rounded-3xl p-5 shadow-lg border border-pink-100">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden">
                    <img 
                      src={doctor.image} 
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {doctor.verified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                      <BadgeCheck className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground">{doctor.name}</h3>
                    <div className="flex items-center gap-1 bg-green-100 px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3 fill-green-500 text-green-500" />
                      <span className="text-xs font-semibold text-green-600">{doctor.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-pink-500 font-medium mt-0.5">{doctor.specialty}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{doctor.experience}</span>
                    <span className="text-lg font-bold text-pink-500">₹{doctor.price}<span className="text-xs font-normal">/session</span></span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <button className="flex-1 bg-gradient-to-r from-pink-500 to-pink-400 text-white py-3 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-shadow">
                  Book Now
                </button>
                <button 
                  onClick={() => toast.info("Chat with doctor coming soon")}
                  className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center border border-pink-100 hover:bg-pink-50 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-pink-500" />
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* Vet's Daily Tip */}
        <section className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-5 border border-pink-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-pink-500" />
            </div>
            <h3 className="font-bold text-foreground">Vet's Daily Tip</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Hydration is key! Always ensure your pet has access to fresh water, especially during summer months in India. Adding ice cubes to their bowl can make drinking more fun.
          </p>
        </section>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Vet;
