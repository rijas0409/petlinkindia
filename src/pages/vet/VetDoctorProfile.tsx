import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Heart, Share2, Star, BadgeCheck, ChevronRight,
  Stethoscope, Syringe, Scissors, Shield, Clock,
  Dog, Cat, Bird, Rabbit
} from "lucide-react";

// Mock doctor data - in production this would come from DB
const doctorsData: Record<string, {
  name: string;
  title: string;
  rating: number;
  reviews: number;
  yearsExp: number;
  clinic: string;
  patients: string;
  support: string;
  about: string;
  specializations: string[];
  services: { icon: string; label: string }[];
  animals: { icon: string; label: string }[];
  qualifications: { title: string; institution: string }[];
  fee: number;
  coverImage: string;
  profileImage: string;
  verified: boolean;
}> = {
  "1": {
    name: "Dr. Ananya Iyer",
    title: "Senior Veterinary Surgeon",
    rating: 4.9,
    reviews: 120,
    yearsExp: 12,
    patients: "5k+",
    support: "24/7",
    about: "Dr. Ananya Iyer is a renowned veterinary specialist with over 12 years of experience in small animal surgery and emergency care. Her clinic provides advanced treatment and compassionate care for pets across all breeds.",
    specializations: ["Dog Surgery", "Cat Treatment", "Exotic Pets", "Orthopedics"],
    services: [
      { icon: "checkup", label: "General Checkup" },
      { icon: "vaccination", label: "Vaccination" },
      { icon: "surgery", label: "Surgery" },
      { icon: "dental", label: "Dental Care" },
    ],
    animals: [
      { icon: "dog", label: "Dog" },
      { icon: "cat", label: "Cat" },
      { icon: "bird", label: "Bird" },
      { icon: "rabbit", label: "Rabbit" },
    ],
    qualifications: [
      { title: "BVSc & AH", institution: "Indian Veterinary Research Institute" },
      { title: "Gold Medalist in Surgery", institution: "Board of Veterinary Medicine, India" },
    ],
    fee: 1500,
    coverImage: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=400&fit=crop",
    profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop",
    verified: true,
  },
  "2": {
    name: "Dr. Rohan Sharma",
    title: "Paws & Claws Specialist",
    rating: 4.8,
    reviews: 85,
    yearsExp: 5,
    patients: "2k+",
    support: "Mon-Sat",
    about: "Dr. Rohan Sharma specializes in dermatology and nutrition for small animals. With 5 years of hands-on experience, he focuses on preventive care and holistic wellness for your furry companions.",
    specializations: ["Dermatology", "Nutrition", "Preventive Care", "Small Animals"],
    services: [
      { icon: "checkup", label: "General Checkup" },
      { icon: "vaccination", label: "Vaccination" },
      { icon: "surgery", label: "Minor Surgery" },
      { icon: "dental", label: "Skin Treatment" },
    ],
    animals: [
      { icon: "dog", label: "Dog" },
      { icon: "cat", label: "Cat" },
    ],
    qualifications: [
      { title: "BVSc & AH", institution: "Maharashtra Animal & Fishery Sciences University" },
      { title: "Diploma in Veterinary Dermatology", institution: "Royal College of Veterinary Surgeons" },
    ],
    fee: 800,
    coverImage: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&h=400&fit=crop",
    profileImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop",
    verified: true,
  },
  // Elite doctor
  "elite-1": {
    name: "Dr. Amara S.",
    title: "Senior Orthopedic Specialist",
    rating: 4.9,
    reviews: 200,
    yearsExp: 12,
    patients: "8k+",
    support: "24/7",
    about: "Dr. Amara S. is one of India's leading veterinary orthopedic surgeons with 12+ years of experience. She has performed over 3000 successful surgeries and is known for her compassionate approach to animal care.",
    specializations: ["Orthopedics", "Bone Surgery", "Joint Replacement", "Rehabilitation"],
    services: [
      { icon: "checkup", label: "General Checkup" },
      { icon: "vaccination", label: "Vaccination" },
      { icon: "surgery", label: "Orthopedic Surgery" },
      { icon: "dental", label: "Rehabilitation" },
    ],
    animals: [
      { icon: "dog", label: "Dog" },
      { icon: "cat", label: "Cat" },
      { icon: "bird", label: "Bird" },
      { icon: "rabbit", label: "Rabbit" },
    ],
    qualifications: [
      { title: "MVSc in Veterinary Surgery", institution: "IVRI, Bareilly" },
      { title: "Fellowship in Orthopedic Surgery", institution: "Royal Veterinary College, London" },
    ],
    fee: 1500,
    coverImage: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=400&fit=crop",
    profileImage: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop",
    verified: true,
  },
};

const ServiceIcon = ({ type }: { type: string }) => {
  const iconClass = "w-5 h-5";
  const color = "#E8599C";
  switch (type) {
    case "checkup": return <Stethoscope className={iconClass} style={{ color }} />;
    case "vaccination": return <Syringe className={iconClass} style={{ color }} />;
    case "surgery": return <Scissors className={iconClass} style={{ color }} />;
    case "dental": return <Shield className={iconClass} style={{ color }} />;
    default: return <Stethoscope className={iconClass} style={{ color }} />;
  }
};

const AnimalIcon = ({ type }: { type: string }) => {
  const iconClass = "w-5 h-5";
  const color = "#9B6FE8";
  switch (type) {
    case "dog": return <Dog className={iconClass} style={{ color }} />;
    case "cat": return <Cat className={iconClass} style={{ color }} />;
    case "bird": return <Bird className={iconClass} style={{ color }} />;
    case "rabbit": return <Rabbit className={iconClass} style={{ color }} />;
    default: return <Dog className={iconClass} style={{ color }} />;
  }
};

const VetDoctorProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);

  const doctor = doctorsData[id || "1"] || doctorsData["1"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-28">
        {/* Cover Image */}
        <div className="relative h-[260px]">
          <img
            src={doctor.coverImage}
            alt="Clinic"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

          {/* Top buttons */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-foreground"}`} />
              </button>
              <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <Share2 className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Doctor Profile Card - floating over image */}
        <div className="px-4 -mt-16 relative z-10">
          <div className="bg-card rounded-3xl p-4 shadow-lg border border-border">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden border-[3px] border-white shadow-md">
                  <img
                    src={doctor.profileImage}
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
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-foreground">{doctor.name}</h1>
                <p className="text-sm font-medium" style={{ color: "#8E7CFF" }}>{doctor.title}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="px-4 mt-4">
          <div className="bg-card rounded-2xl p-4 shadow-sm border border-border flex items-center">
            <div className="flex-1 text-center">
              <p className="text-lg font-bold text-foreground">{doctor.yearsExp}+</p>
              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Years Exp</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex-1 text-center">
              <p className="text-lg font-bold text-foreground">{doctor.patients}</p>
              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Patients</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <p className="text-lg font-bold text-foreground">{doctor.rating}</p>
              </div>
              <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Rating</p>
            </div>
          </div>
        </div>

        <div className="px-4 mt-5 space-y-5">
          {/* About Doctor */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-base font-bold text-foreground">About Doctor</h2>
              {doctor.verified && (
                <span className="bg-blue-50 text-blue-600 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                  VERIFIED PROVIDER
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{doctor.about}</p>
          </section>

          {/* Specializations */}
          <section>
            <h2 className="text-base font-bold text-foreground mb-3">Specializations</h2>
            <div className="flex flex-wrap gap-2">
              {doctor.specializations.map((spec) => (
                <span
                  key={spec}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: "#FDE7EC", color: "#E8599C" }}
                >
                  {spec}
                </span>
              ))}
            </div>
          </section>

          {/* Services Offered */}
          <section>
            <h2 className="text-base font-bold text-foreground mb-3">Services Offered</h2>
            <div className="grid grid-cols-2 gap-3">
              {doctor.services.map((service) => (
                <div
                  key={service.label}
                  className="bg-card rounded-2xl p-4 shadow-sm border border-border flex items-center gap-3"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#FDE7EC" }}
                  >
                    <ServiceIcon type={service.icon} />
                  </div>
                  <span className="text-xs font-semibold text-foreground">{service.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Animals Treated */}
          <section>
            <h2 className="text-base font-bold text-foreground mb-3">Animals Treated</h2>
            <div className="flex gap-4">
              {doctor.animals.map((animal) => (
                <div key={animal.label} className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#F3F0FF" }}
                  >
                    <AnimalIcon type={animal.icon} />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">{animal.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Professional Qualifications */}
          <section>
            <h2 className="text-base font-bold text-foreground mb-3">Professional Qualifications</h2>
            <div className="space-y-3">
              {doctor.qualifications.map((qual, i) => (
                <div
                  key={i}
                  className="bg-card rounded-2xl p-4 shadow-sm border border-border flex items-start gap-3"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: "#F3F0FF" }}
                  >
                    <BadgeCheck className="w-5 h-5" style={{ color: "#8E7CFF" }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{qual.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{qual.institution}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Sticky Bottom Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <button
          onClick={() => navigate("/vet/booking-details")}
          className="w-full py-4 rounded-2xl text-white font-semibold text-base shadow-lg"
          style={{ background: "linear-gradient(135deg, #FF4D6D, #8B5CF6)" }}
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
};

export default VetDoctorProfile;
