import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  ArrowLeft, Camera, Video, X, Upload, MapPin, IndianRupee, 
  Heart, FileText, PawPrint, Check, AlertCircle 
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type PetCategory = Database["public"]["Enums"]["pet_category"];
type PetGender = Database["public"]["Enums"]["pet_gender"];

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const breeds: Record<PetCategory, string[]> = {
  dog: ["Labrador", "German Shepherd", "Golden Retriever", "Beagle", "Pug", "Rottweiler", "Bulldog", "Pomeranian", "Shih Tzu", "Husky", "Other"],
  cat: ["Persian", "Siamese", "Maine Coon", "Bengal", "British Shorthair", "Ragdoll", "Sphynx", "Other"],
  bird: ["Budgie", "Cockatiel", "Parrot", "Lovebird", "Finch", "Canary", "Other"],
  rabbit: ["Holland Lop", "Netherland Dwarf", "Mini Rex", "Lionhead", "Flemish Giant", "Other"],
  other: ["Other"]
};

interface FormData {
  name: string;
  category: PetCategory;
  breed: string;
  gender: PetGender;
  ageMonths: number;
  price: number;
  color: string;
  description: string;
  state: string;
  city: string;
  location: string;
  vaccinated: boolean;
  microchip: string;
  medicalHistory: string;
}

const AddPet = () => {
  const navigate = useNavigate();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    category: "dog",
    breed: "",
    gender: "male",
    ageMonths: 1,
    price: 0,
    color: "",
    description: "",
    state: "",
    city: "",
    location: "",
    vaccinated: false,
    microchip: "",
    medicalHistory: ""
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 20 - images.length;
    const newFiles = files.slice(0, remainingSlots);
    
    if (files.length > remainingSlots) {
      toast.warning(`Only ${remainingSlots} more images can be added (max 20)`);
    }

    setImages(prev => [...prev, ...newFiles]);
    
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 2 - videos.length;
    const newFiles = files.slice(0, remainingSlots);
    
    if (files.length > remainingSlots) {
      toast.warning(`Only ${remainingSlots} more videos can be added (max 2)`);
    }

    setVideos(prev => [...prev, ...newFiles]);
    
    newFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setVideoPreviews(prev => [...prev, url]);
    });
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocuments(prev => [...prev, ...files]);
    toast.success(`${files.length} document(s) added`);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    URL.revokeObjectURL(videoPreviews[index]);
    setVideos(prev => prev.filter((_, i) => i !== index));
    setVideoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (stepNum: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (stepNum === 1) {
      if (images.length === 0) {
        toast.error("Please add at least one image");
        return false;
      }
    }

    if (stepNum === 2) {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.breed) newErrors.breed = "Breed is required";
      if (formData.ageMonths < 1) newErrors.ageMonths = "Age must be at least 1 month";
    }

    if (stepNum === 3) {
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (formData.price < 0) newErrors.price = "Price cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to add a pet");
        navigate("/auth");
        return;
      }

      // For now, we'll use placeholder URLs since storage isn't set up
      const imageUrls = imagePreviews;
      const videoUrls = videoPreviews;

      const { error } = await supabase.from("pets").insert({
        owner_id: session.user.id,
        name: formData.name,
        category: formData.category,
        breed: formData.breed,
        gender: formData.gender,
        age_months: formData.ageMonths,
        price: formData.price,
        color: formData.color || null,
        description: formData.description || null,
        state: formData.state,
        city: formData.city,
        location: `${formData.city}, ${formData.state}`,
        vaccinated: formData.vaccinated,
        microchip: formData.microchip || null,
        medical_history: formData.medicalHistory || null,
        images: imageUrls,
        videos: videoUrls.length > 0 ? videoUrls : null,
      });

      if (error) throw error;

      toast.success("Pet listed successfully!");
      navigate("/seller-dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to add pet");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: "Photos & Videos", icon: Camera },
    { num: 2, title: "Pet Details", icon: PawPrint },
    { num: 3, title: "Location & Price", icon: MapPin },
    { num: 4, title: "Health Info", icon: Heart }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => navigate("/seller-dashboard")}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-xl">Add New Pet</h1>
            <p className="text-sm text-muted-foreground">Step {step} of 4</p>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div key={s.num} className="flex items-center">
                <button
                  onClick={() => step > s.num && setStep(s.num)}
                  className={`flex items-center gap-2 ${
                    step >= s.num ? "text-primary" : "text-muted-foreground"
                  } ${step > s.num ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    step > s.num 
                      ? "bg-primary text-primary-foreground" 
                      : step === s.num 
                        ? "bg-primary/10 text-primary border-2 border-primary" 
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">{s.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-2 ${
                    step > s.num ? "bg-primary" : "bg-border"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <main className="container mx-auto px-4 py-6 pb-32">
        {/* Step 1: Photos & Videos */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  Photos ({images.length}/20)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                  {images.length < 20 && (
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-1"
                    >
                      <Camera className="w-6 h-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Add</span>
                    </button>
                  )}
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-sm text-muted-foreground mt-3">
                  First image will be the cover. Add up to 20 clear photos.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" />
                  Videos ({videos.length}/2)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {videoPreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-video rounded-xl overflow-hidden group">
                      <video src={preview} className="w-full h-full object-cover" controls />
                      <button
                        onClick={() => removeVideo(index)}
                        className="absolute top-2 right-2 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {videos.length < 2 && (
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      className="aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2"
                    >
                      <Video className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Add Video</span>
                    </button>
                  )}
                </div>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Pet Details */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PawPrint className="w-5 h-5 text-primary" />
                  Pet Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Pet Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Bruno"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    className={`h-12 rounded-xl ${errors.name ? "border-destructive" : ""}`}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: PetCategory) => {
                        updateFormData("category", value);
                        updateFormData("breed", "");
                      }}
                    >
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dog">🐕 Dog</SelectItem>
                        <SelectItem value="cat">🐈 Cat</SelectItem>
                        <SelectItem value="bird">🐦 Bird</SelectItem>
                        <SelectItem value="rabbit">🐇 Rabbit</SelectItem>
                        <SelectItem value="other">🐾 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Breed *</Label>
                    <Select
                      value={formData.breed}
                      onValueChange={(value) => updateFormData("breed", value)}
                    >
                      <SelectTrigger className={`h-12 rounded-xl ${errors.breed ? "border-destructive" : ""}`}>
                        <SelectValue placeholder="Select breed" />
                      </SelectTrigger>
                      <SelectContent>
                        {breeds[formData.category].map(breed => (
                          <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gender *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value: PetGender) => updateFormData("gender", value)}
                    >
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">♂ Male</SelectItem>
                        <SelectItem value="female">♀ Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age (months) *</Label>
                    <Input
                      id="age"
                      type="number"
                      min="1"
                      value={formData.ageMonths}
                      onChange={(e) => updateFormData("ageMonths", parseInt(e.target.value) || 1)}
                      className={`h-12 rounded-xl ${errors.ageMonths ? "border-destructive" : ""}`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    placeholder="e.g., Golden Brown"
                    value={formData.color}
                    onChange={(e) => updateFormData("color", e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us about this pet's personality, habits, and any special traits..."
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    className="min-h-[120px] rounded-xl resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Location & Price */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>State *</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) => updateFormData("state", value)}
                    >
                      <SelectTrigger className={`h-12 rounded-xl ${errors.state ? "border-destructive" : ""}`}>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {indianStates.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="e.g., Mumbai"
                      value={formData.city}
                      onChange={(e) => updateFormData("city", e.target.value)}
                      className={`h-12 rounded-xl ${errors.city ? "border-destructive" : ""}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-primary" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.price || ""}
                      onChange={(e) => updateFormData("price", parseInt(e.target.value) || 0)}
                      className={`h-12 rounded-xl pl-8 ${errors.price ? "border-destructive" : ""}`}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Set price to 0 for free adoption
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Health Info */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Health Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                  <div className="space-y-0.5">
                    <Label htmlFor="vaccinated" className="cursor-pointer">Vaccinated</Label>
                    <p className="text-sm text-muted-foreground">Is this pet up-to-date on vaccinations?</p>
                  </div>
                  <Switch
                    id="vaccinated"
                    checked={formData.vaccinated}
                    onCheckedChange={(checked) => updateFormData("vaccinated", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="microchip">Microchip Number</Label>
                  <Input
                    id="microchip"
                    placeholder="Enter microchip number if available"
                    value={formData.microchip}
                    onChange={(e) => updateFormData("microchip", e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medical">Medical History</Label>
                  <Textarea
                    id="medical"
                    placeholder="Any past health issues, allergies, or treatments..."
                    value={formData.medicalHistory}
                    onChange={(e) => updateFormData("medicalHistory", e.target.value)}
                    className="min-h-[100px] rounded-xl resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Documents ({documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium truncate max-w-[200px]">{doc.name}</span>
                      </div>
                      <button
                        onClick={() => removeDocument(index)}
                        className="p-1 hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => documentInputRef.current?.click()}
                    className="w-full p-4 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground">Upload vaccination certificate, birth papers, etc.</span>
                  </button>
                  <input
                    ref={documentInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    onChange={handleDocumentUpload}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            {imagePreviews.length > 0 && (
              <Card className="border-0 shadow-card overflow-hidden">
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={imagePreviews[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">{formData.name || "Pet Name"}</h3>
                      <p className="text-muted-foreground text-sm">{formData.breed || "Breed"} • {formData.ageMonths} months</p>
                      <p className="text-primary font-bold mt-1">
                        {formData.price === 0 ? "Free Adoption" : `₹${formData.price.toLocaleString()}`}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {formData.city && formData.state ? `${formData.city}, ${formData.state}` : "Location"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-area-inset-bottom">
        <div className="container mx-auto flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(prev => prev - 1)}
              className="flex-1 h-12 rounded-xl"
            >
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              onClick={handleNext}
              className="flex-1 h-12 rounded-xl bg-gradient-primary hover:opacity-90"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 h-12 rounded-xl bg-gradient-primary hover:opacity-90"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Publishing...
                </span>
              ) : (
                "Publish Listing"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPet;
