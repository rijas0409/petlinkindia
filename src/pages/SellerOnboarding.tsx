import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Heart, Loader2, Upload, FileText, Camera, Award, Shield, CheckCircle } from "lucide-react";

const SellerOnboarding = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    phone: "",
    isBreeder: false,
    businessName: "",
    businessAddress: "",
    aadhaarFile: null as File | null,
    selfieFile: null as File | null,
    breederLicense: null as File | null,
    termsAccepted: false,
  });

  const handleFileChange = (field: "aadhaarFile" | "selfieFile" | "breederLicense") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setFormData({ ...formData, [field]: file });
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}/${Date.now()}.${fileExt}`;
    
    // For now, we'll store the file name as a placeholder
    // In production, you'd upload to Supabase Storage
    return fileName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.termsAccepted) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    if (!formData.aadhaarFile || !formData.selfieFile) {
      toast.error("Please upload all required documents");
      return;
    }

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Upload files (placeholder paths for now)
      const aadhaarPath = await uploadFile(formData.aadhaarFile, `aadhaar/${session.user.id}`);
      const selfiePath = await uploadFile(formData.selfieFile, `selfie/${session.user.id}`);
      let breederPath = null;
      
      if (formData.isBreeder && formData.breederLicense) {
        breederPath = await uploadFile(formData.breederLicense, `breeder/${session.user.id}`);
      }

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          phone: formData.phone,
          aadhaar_file: aadhaarPath,
          selfie_file: selfiePath,
          breeder_license: breederPath,
          is_onboarding_complete: true,
        })
        .eq("id", session.user.id);

      if (error) throw error;

      toast.success("Verification submitted! Your account is now active.");
      navigate("/seller-dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit verification");
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Personal Info", icon: FileText },
    { number: 2, title: "ID Verification", icon: Shield },
    { number: 3, title: "Confirmation", icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                PetLink
              </span>
              <p className="text-xs text-muted-foreground">Seller Verification</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex flex-col items-center ${currentStep >= step.number ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                  currentStep >= step.number 
                    ? "bg-gradient-primary text-white shadow-float" 
                    : "bg-muted"
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-2 mb-6 rounded-full transition-all ${
                  currentStep > step.number ? "bg-primary" : "bg-muted"
                }`} />
              )}
            </div>
          ))}
        </div>

        <Card className="border-0 shadow-card animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Complete Your Seller Profile</CardTitle>
            <CardDescription>
              {currentStep === 1 && "Let's start with your basic information"}
              {currentStep === 2 && "Upload your documents for verification"}
              {currentStep === 3 && "Review and confirm your details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="rounded-2xl"
                    />
                    <p className="text-xs text-muted-foreground">
                      This will be used for order notifications
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business/Shop Name (Optional)</Label>
                    <Input
                      id="businessName"
                      type="text"
                      placeholder="Happy Paws Pet Shop"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessAddress">Business Address (Optional)</Label>
                    <Input
                      id="businessAddress"
                      type="text"
                      placeholder="123, Pet Street, Mumbai"
                      value={formData.businessAddress}
                      onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-2xl">
                    <Checkbox
                      id="isBreeder"
                      checked={formData.isBreeder}
                      onCheckedChange={(checked) => setFormData({ ...formData, isBreeder: checked as boolean })}
                    />
                    <div>
                      <Label htmlFor="isBreeder" className="cursor-pointer font-medium">
                        I am a registered breeder
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Get a verified badge and priority listing
                      </p>
                    </div>
                    <Award className="w-5 h-5 text-primary ml-auto" />
                  </div>

                  <Button
                    type="button"
                    className="w-full rounded-2xl bg-gradient-primary hover:opacity-90"
                    onClick={() => setCurrentStep(2)}
                    disabled={!formData.phone}
                  >
                    Continue
                  </Button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  {/* Aadhaar Upload */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Aadhaar Card *
                    </Label>
                    <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange("aadhaarFile")}
                        className="hidden"
                        id="aadhaar-upload"
                      />
                      <label htmlFor="aadhaar-upload" className="cursor-pointer">
                        {formData.aadhaarFile ? (
                          <div className="flex items-center justify-center gap-2 text-success">
                            <CheckCircle className="w-5 h-5" />
                            <span>{formData.aadhaarFile.name}</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Click to upload Aadhaar card (front & back)
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PNG, JPG or PDF (max 5MB)
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Selfie Upload */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-primary" />
                      Live Selfie with Aadhaar *
                    </Label>
                    <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange("selfieFile")}
                        className="hidden"
                        id="selfie-upload"
                      />
                      <label htmlFor="selfie-upload" className="cursor-pointer">
                        {formData.selfieFile ? (
                          <div className="flex items-center justify-center gap-2 text-success">
                            <CheckCircle className="w-5 h-5" />
                            <span>{formData.selfieFile.name}</span>
                          </div>
                        ) : (
                          <>
                            <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Take a selfie holding your Aadhaar card
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PNG or JPG (max 5MB)
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Breeder License Upload */}
                  {formData.isBreeder && (
                    <div className="space-y-2 animate-fade-in">
                      <Label className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-primary" />
                        Breeder License
                      </Label>
                      <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-colors">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange("breederLicense")}
                          className="hidden"
                          id="breeder-upload"
                        />
                        <label htmlFor="breeder-upload" className="cursor-pointer">
                          {formData.breederLicense ? (
                            <div className="flex items-center justify-center gap-2 text-success">
                              <CheckCircle className="w-5 h-5" />
                              <span>{formData.breederLicense.name}</span>
                            </div>
                          ) : (
                            <>
                              <Award className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                Upload your breeder registration certificate
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                PNG, JPG or PDF (max 5MB)
                              </p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 rounded-2xl"
                      onClick={() => setCurrentStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 rounded-2xl bg-gradient-primary hover:opacity-90"
                      onClick={() => setCurrentStep(3)}
                      disabled={!formData.aadhaarFile || !formData.selfieFile}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4 animate-fade-in">
                  {/* Summary */}
                  <div className="bg-muted/50 rounded-2xl p-4 space-y-3">
                    <h4 className="font-semibold">Review Your Details</h4>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium">{formData.phone}</span>
                    </div>
                    
                    {formData.businessName && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Business Name</span>
                        <span className="font-medium">{formData.businessName}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Aadhaar</span>
                      <span className="font-medium text-success flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Uploaded
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Selfie</span>
                      <span className="font-medium text-success flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Uploaded
                      </span>
                    </div>
                    
                    {formData.isBreeder && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Breeder License</span>
                        <span className="font-medium text-success flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> {formData.breederLicense ? "Uploaded" : "Not Provided"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Terms */}
                  <div className="flex items-start space-x-3 p-4 bg-primary/5 rounded-2xl border border-primary/20">
                    <Checkbox
                      id="terms"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: checked as boolean })}
                    />
                    <div>
                      <Label htmlFor="terms" className="cursor-pointer text-sm">
                        I agree to the Terms of Service and Privacy Policy. I confirm that
                        all information provided is accurate and I am authorized to sell pets.
                      </Label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 rounded-2xl"
                      onClick={() => setCurrentStep(2)}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 rounded-2xl bg-gradient-primary hover:opacity-90"
                      disabled={isLoading || !formData.termsAccepted}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Complete Verification"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-card rounded-2xl shadow-card">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Your data is secure</h4>
              <p className="text-xs text-muted-foreground mt-1">
                We use industry-standard encryption to protect your documents. 
                Your information is only used for verification purposes.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerOnboarding;
