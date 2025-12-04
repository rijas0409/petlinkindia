import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  Heart, Loader2, Upload, ArrowLeft, ArrowRight, X, 
  Image as ImageIcon, FileText, Syringe, MapPin, IndianRupee,
  CheckCircle, Eye, Video
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type PetCategory = Database["public"]["Enums"]["pet_category"];
type PetGender = Database["public"]["Enums"]["pet_gender"];

interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

const STEPS = [
  { id: 1, title: "Media", icon: ImageIcon, description: "Upload photos & videos" },
  { id: 2, title: "Basic Info", icon: FileText, description: "Pet details" },
  { id: 3, title: "Pricing", icon: IndianRupee, description: "Set your price" },
  { id: 4, title: "Location", icon: MapPin, description: "Where is your pet" },
  { id: 5, title: "Health", icon: Syringe, description: "Health information" },
  { id: 6, title: "Documents", icon: FileText, description: "Upload certificates" },
  { id: 7, title: "Preview", icon: Eye, description: "Review & submit" },
];

const AddPet = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [vaccinationDocs, setVaccinationDocs] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    category: "" as PetCategory,
    breed: "",
    gender: "" as PetGender,
    ageMonths: "",
    color: "",
    price: "",
    description: "",
    location: "",
    city: "",
    state: "",
    vaccinated: false,
    microchip: "",
    medicalHistory: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_onboarding_complete")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "seller") {
      navigate("/buyer-dashboard");
      return;
    }

    if (!profile?.is_onboarding_complete) {
      navigate("/seller-onboarding");
      return;
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageCount = media.filter(m => m.type === 'image').length;
    const videoCount = media.filter(m => m.type === 'video').length;
    
    const newMedia: MediaFile[] = [];
    
    for (const file of files) {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      
      if (!isVideo && !isImage) {
        toast.error(`${file.name} is not a valid image or video`);
        continue;
      }
      
      if (isImage && imageCount + newMedia.filter(m => m.type === 'image').length >= 20) {
        toast.error("Maximum 20 images allowed");
        continue;
      }
      
      if (isVideo && videoCount + newMedia.filter(m => m.type === 'video').length >= 2) {
        toast.error("Maximum 2 videos allowed");
        continue;
      }
      
      const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Max ${isVideo ? '50MB' : '10MB'}`);
        continue;
      }
      
      const preview = URL.createObjectURL(file);
      newMedia.push({
        file,
        preview,
        type: isVideo ? 'video' : 'image',
      });
    }
    
    setMedia(prev => [...prev, ...newMedia]);
  };

  const removeMedia = (index: number) => {
    setMedia(prev => {
      const item = prev[index];
      URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 10MB per document.`);
        return false;
      }
      return true;
    });
    setDocuments(prev => [...prev, ...validFiles]);
  };

  const handleVaccinationDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 10MB per document.`);
        return false;
      }
      return true;
    });
    setVaccinationDocs(prev => [...prev, ...validFiles]);
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const removeVaccinationDoc = (index: number) => {
    setVaccinationDocs(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files: File[], userId: string, type: string) => {
    const paths: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${type}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const bucket = type === 'document' || type === 'vaccination' ? 'pet-documents' : 'pet-media';
      
      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) {
        console.error("Upload error:", error);
        throw error;
      }

      if (bucket === 'pet-documents') {
        paths.push(fileName);
      } else {
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);
        paths.push(urlData.publicUrl);
      }
    }
    
    return paths;
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (media.filter(m => m.type === 'image').length === 0) {
          toast.error("Please upload at least one image");
          return false;
        }
        return true;
      case 2:
        if (!formData.name || !formData.category || !formData.breed || !formData.gender || !formData.ageMonths) {
          toast.error("Please fill in all required fields");
          return false;
        }
        return true;
      case 3:
        if (!formData.price || parseFloat(formData.price) <= 0) {
          toast.error("Please enter a valid price");
          return false;
        }
        return true;
      case 4:
        if (!formData.state || !formData.city || !formData.location) {
          toast.error("Please fill in all location fields");
          return false;
        }
        return true;
      case 5:
        if (formData.vaccinated && vaccinationDocs.length === 0) {
          toast.error("Please upload vaccination documents or uncheck 'Pet is vaccinated'");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const userId = session.user.id;

      // Upload media
      const images = media.filter(m => m.type === 'image').map(m => m.file);
      const videos = media.filter(m => m.type === 'video').map(m => m.file);
      
      const imageUrls = await uploadFiles(images, userId, 'image');
      const videoUrls = videos.length > 0 ? await uploadFiles(videos, userId, 'video') : [];

      // Create pet listing
      const { data: pet, error: petError } = await supabase
        .from("pets")
        .insert({
          owner_id: userId,
          name: formData.name,
          category: formData.category,
          breed: formData.breed,
          gender: formData.gender,
          age_months: parseInt(formData.ageMonths),
          color: formData.color || null,
          price: parseFloat(formData.price),
          description: formData.description || null,
          location: formData.location,
          city: formData.city,
          state: formData.state,
          vaccinated: formData.vaccinated,
          microchip: formData.microchip || null,
          medical_history: formData.medicalHistory || null,
          images: imageUrls,
          videos: videoUrls,
          verification_status: 'pending',
          is_available: true,
        })
        .select()
        .single();

      if (petError) throw petError;

      // Upload documents
      if (documents.length > 0 && pet) {
        const docUrls = await uploadFiles(documents, userId, 'document');
        for (const url of docUrls) {
          await supabase.from("pet_documents").insert({
            pet_id: pet.id,
            document_type: 'medical_certificate',
            file_url: url,
            verified: false,
          });
        }
      }

      // Upload vaccination documents
      if (vaccinationDocs.length > 0 && pet) {
        const vacDocUrls = await uploadFiles(vaccinationDocs, userId, 'vaccination');
        for (const url of vacDocUrls) {
          await supabase.from("pet_documents").insert({
            pet_id: pet.id,
            document_type: 'vaccination_certificate',
            file_url: url,
            verified: false,
          });
        }
      }

      toast.success("Pet listed successfully!");
      navigate("/seller-dashboard");
    } catch (error: any) {
      console.error("Error creating listing:", error);
      toast.error(error.message || "Failed to create listing");
    } finally {
      setIsLoading(false);
    }
  };

  const categories: { value: PetCategory; label: string }[] = [
    { value: "dog", label: "Dog" },
    { value: "cat", label: "Cat" },
    { value: "bird", label: "Bird" },
    { value: "rabbit", label: "Rabbit" },
    { value: "other", label: "Other" },
  ];

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh"
  ];

  const imageCount = media.filter(m => m.type === 'image').length;
  const videoCount = media.filter(m => m.type === 'video').length;

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
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Add New Pet
              </span>
              <p className="text-xs text-muted-foreground">Step {currentStep} of {STEPS.length}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Step Progress */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max px-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                  disabled={currentStep < step.id}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                    currentStep === step.id 
                      ? "bg-primary/10 text-primary" 
                      : currentStep > step.id 
                        ? "text-success cursor-pointer hover:bg-success/10" 
                        : "text-muted-foreground"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep === step.id 
                      ? "bg-gradient-primary text-white" 
                      : currentStep > step.id 
                        ? "bg-success text-white" 
                        : "bg-muted"
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs font-medium whitespace-nowrap">{step.title}</span>
                </button>
                {index < STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 ${
                    currentStep > step.id ? "bg-success" : "bg-muted"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const StepIcon = STEPS[currentStep - 1].icon;
                return <StepIcon className="w-5 h-5 text-primary" />;
              })()}
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Media Upload */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {media.map((item, index) => (
                    <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group">
                      {item.type === 'image' ? (
                        <img src={item.preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Video className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-1 left-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.type === 'video' ? 'bg-primary text-white' : 'bg-success text-white'
                        }`}>
                          {item.type === 'video' ? 'Video' : 'Photo'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                    <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Add</span>
                  </label>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{imageCount}/20 photos</span>
                  <span>{videoCount}/2 videos</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload up to 20 photos (max 10MB each) and 2 videos (max 50MB each)
                </p>
              </div>
            )}

            {/* Step 2: Basic Info */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Pet Name *</Label>
                    <Input
                      id="name"
                      placeholder="Max"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: PetCategory) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="breed">Breed *</Label>
                    <Input
                      id="breed"
                      placeholder="Golden Retriever"
                      value={formData.breed}
                      onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value: PetGender) => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age (Months) *</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="12"
                      value={formData.ageMonths}
                      onChange={(e) => setFormData({ ...formData, ageMonths: e.target.value })}
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      placeholder="Golden"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="rounded-2xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell buyers about your pet's personality, habits, and any special traits..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="rounded-2xl"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Pricing */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      placeholder="15000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="rounded-2xl pl-10 text-lg"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Set a competitive price based on breed, age, and market rates
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Location */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => setFormData({ ...formData, state: value })}
                  >
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="Mumbai"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Full Address *</Label>
                  <Textarea
                    id="location"
                    placeholder="House/Flat No., Street, Area, Landmark..."
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    rows={3}
                    className="rounded-2xl"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Health */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-2xl">
                  <Checkbox
                    id="vaccinated"
                    checked={formData.vaccinated}
                    onCheckedChange={(checked) => {
                      setFormData({ ...formData, vaccinated: checked as boolean });
                      if (!checked) setVaccinationDocs([]);
                    }}
                  />
                  <div className="flex-1">
                    <Label htmlFor="vaccinated" className="cursor-pointer font-medium">
                      Pet is vaccinated
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Check this if your pet has received vaccinations
                    </p>
                  </div>
                  <Syringe className="w-5 h-5 text-primary" />
                </div>

                {formData.vaccinated && (
                  <div className="space-y-2 animate-fade-in">
                    <Label className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Vaccination Documents *
                    </Label>
                    <div className="border-2 border-dashed border-border rounded-2xl p-4">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        multiple
                        onChange={handleVaccinationDocUpload}
                        className="hidden"
                        id="vaccination-upload"
                      />
                      <label htmlFor="vaccination-upload" className="cursor-pointer block text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload vaccination certificates
                        </p>
                      </label>
                    </div>
                    {vaccinationDocs.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {vaccinationDocs.map((doc, index) => (
                          <div key={index} className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm truncate max-w-[150px]">{doc.name}</span>
                            <button
                              type="button"
                              onClick={() => removeVaccinationDoc(index)}
                              className="w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="microchip">Microchip ID (Optional)</Label>
                  <Input
                    id="microchip"
                    placeholder="Enter microchip ID if available"
                    value={formData.microchip}
                    onChange={(e) => setFormData({ ...formData, microchip: e.target.value })}
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalHistory">Medical History</Label>
                  <Textarea
                    id="medicalHistory"
                    placeholder="Any known health conditions, allergies, or medical history..."
                    value={formData.medicalHistory}
                    onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                    rows={3}
                    className="rounded-2xl"
                  />
                </div>
              </div>
            )}

            {/* Step 6: Documents */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Other Documents (Optional)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Upload pedigree papers, health certificates, or other relevant documents
                  </p>
                  <div className="border-2 border-dashed border-border rounded-2xl p-4">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      onChange={handleDocumentUpload}
                      className="hidden"
                      id="document-upload"
                    />
                    <label htmlFor="document-upload" className="cursor-pointer block text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload documents
                      </p>
                    </label>
                  </div>
                  {documents.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {documents.map((doc, index) => (
                        <div key={index} className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm truncate max-w-[150px]">{doc.name}</span>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 7: Preview */}
            {currentStep === 7 && (
              <div className="space-y-6">
                {/* Preview Images */}
                <div className="grid grid-cols-4 gap-2">
                  {media.slice(0, 4).map((item, index) => (
                    <div key={index} className="aspect-square rounded-xl overflow-hidden">
                      {item.type === 'image' ? (
                        <img src={item.preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Video className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Preview Details */}
                <div className="space-y-3 bg-muted/50 rounded-2xl p-4">
                  <h3 className="font-semibold text-lg">{formData.name}</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <span className="ml-2 font-medium capitalize">{formData.category}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Breed:</span>
                      <span className="ml-2 font-medium">{formData.breed}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gender:</span>
                      <span className="ml-2 font-medium capitalize">{formData.gender}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Age:</span>
                      <span className="ml-2 font-medium">{formData.ageMonths} months</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Price:</span>
                      <span className="ml-2 font-medium text-primary">₹{parseInt(formData.price).toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <span className="ml-2 font-medium">{formData.city}, {formData.state}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Vaccinated:</span>
                      <span className="ml-2 font-medium">{formData.vaccinated ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Media:</span>
                      <span className="ml-2 font-medium">{imageCount} photos, {videoCount} videos</span>
                    </div>
                  </div>
                  {formData.description && (
                    <div>
                      <span className="text-muted-foreground text-sm">Description:</span>
                      <p className="mt-1 text-sm">{formData.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-6">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-2xl"
                  onClick={handleBack}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  className="flex-1 rounded-2xl bg-gradient-primary hover:opacity-90"
                  onClick={handleNext}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  className="flex-1 rounded-2xl bg-gradient-primary hover:opacity-90"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Publish Listing
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AddPet;
