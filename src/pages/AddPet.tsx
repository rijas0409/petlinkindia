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
  Heart, Loader2, Upload, ArrowLeft, X, Image as ImageIcon, 
  Video, FileText, Syringe, MapPin, IndianRupee
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type PetCategory = Database["public"]["Enums"]["pet_category"];
type PetGender = Database["public"]["Enums"]["pet_gender"];

const AddPet = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 20) {
      toast.error("Maximum 20 images allowed");
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 10MB per image.`);
        return false;
      }
      return true;
    });

    setImages(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (videos.length + files.length > 2) {
      toast.error("Maximum 2 videos allowed");
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 50MB per video.`);
        return false;
      }
      return true;
    });

    setVideos(prev => [...prev, ...validFiles]);
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

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files: File[], userId: string, type: string) => {
    const paths: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${type}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const bucket = type === 'document' ? 'pet-documents' : 'pet-media';
      
      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) {
        console.error("Upload error:", error);
        throw error;
      }

      // For private buckets (pet-documents), store only file path
      // For public buckets (pet-media), we can use getPublicUrl
      if (bucket === 'pet-documents') {
        // Store only the file path - signed URLs should be generated on-demand
        paths.push(fileName);
      } else {
        // pet-media is public, so getPublicUrl works correctly
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);
        paths.push(urlData.publicUrl);
      }
    }
    
    return paths;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.breed || 
        !formData.gender || !formData.ageMonths || !formData.price ||
        !formData.location || !formData.city || !formData.state) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const userId = session.user.id;

      // Upload images
      const imageUrls = await uploadFiles(images, userId, 'image');
      
      // Upload videos if any
      const videoUrls = videos.length > 0 
        ? await uploadFiles(videos, userId, 'video')
        : [];

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

      // Upload and save documents
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
              <p className="text-xs text-muted-foreground">Create your listing</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                Pet Images *
              </CardTitle>
              <CardDescription>Upload up to 20 high-quality images</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group">
                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {images.length < 20 && (
                  <label className="aspect-square border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Add</span>
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{images.length}/20 images uploaded</p>
            </CardContent>
          </Card>

          {/* Video Upload */}
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                Pet Videos
              </CardTitle>
              <CardDescription>Upload up to 2 videos (max 50MB each)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 mb-4">
                {videos.map((video, index) => (
                  <div key={index} className="flex items-center gap-2 bg-muted rounded-2xl px-4 py-2">
                    <Video className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm truncate max-w-[150px]">{video.name}</span>
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {videos.length < 2 && (
                  <label className="flex items-center gap-2 border-2 border-dashed border-border rounded-2xl px-4 py-2 cursor-pointer hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Add Video</span>
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Tell us about your pet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  placeholder="Tell buyers about your pet's personality, habits, and why they would make a great companion..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="rounded-2xl min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-primary" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="25000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="rounded-2xl"
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Full Address *</Label>
                <Input
                  id="location"
                  placeholder="123, Pet Street, Andheri West"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="rounded-2xl"
                />
              </div>
            </CardContent>
          </Card>

          {/* Health Info */}
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-primary" />
                Health Information
              </CardTitle>
              <CardDescription>Medical details about your pet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-2xl">
                <Checkbox
                  id="vaccinated"
                  checked={formData.vaccinated}
                  onCheckedChange={(checked) => setFormData({ ...formData, vaccinated: checked as boolean })}
                />
                <Label htmlFor="vaccinated" className="cursor-pointer">
                  Pet is vaccinated
                </Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="microchip">Microchip Number</Label>
                  <Input
                    id="microchip"
                    placeholder="123456789012345"
                    value={formData.microchip}
                    onChange={(e) => setFormData({ ...formData, microchip: e.target.value })}
                    className="rounded-2xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalHistory">Medical History</Label>
                <Textarea
                  id="medicalHistory"
                  placeholder="Any surgeries, allergies, ongoing treatments..."
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  className="rounded-2xl min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Documents
              </CardTitle>
              <CardDescription>Upload vaccination certificates, birth papers, vet records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 mb-4">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center gap-2 bg-muted rounded-2xl px-4 py-2">
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
                <label className="flex items-center gap-2 border-2 border-dashed border-border rounded-2xl px-4 py-2 cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    multiple
                    onChange={handleDocumentUpload}
                    className="hidden"
                  />
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Add Document</span>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload vaccination certificates, pedigree papers, health records (PDF or images)
              </p>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-2xl"
              onClick={() => navigate("/seller-dashboard")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-2xl bg-gradient-primary hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Listing...
                </>
              ) : (
                "Publish Listing"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddPet;
