import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Heart, Loader2, Upload, FileText, Camera, Award, Shield, CheckCircle, AlertCircle, Sparkles } from "lucide-react";

const SellerOnboarding = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [aiVerified, setAiVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    phone: "",
    isBreeder: false,
    businessName: "",
    businessAddress: "",
    aadhaarFrontFile: null as File | null,
    aadhaarBackFile: null as File | null,
    selfieFile: null as File | null,
    breederLicense: null as File | null,
    termsAccepted: false,
  });
  const [aadhaarFrontPreview, setAadhaarFrontPreview] = useState<string | null>(null);
  const [aadhaarBackPreview, setAadhaarBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const handleFileChange = (field: "aadhaarFrontFile" | "aadhaarBackFile" | "selfieFile" | "breederLicense") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setFormData({ ...formData, [field]: file });
      
      // Create preview for AI verification
      if (field === "aadhaarFrontFile" || field === "aadhaarBackFile" || field === "selfieFile") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          if (field === "aadhaarFrontFile") {
            setAadhaarFrontPreview(base64);
          } else if (field === "aadhaarBackFile") {
            setAadhaarBackPreview(base64);
          } else {
            setSelfiePreview(base64);
          }
        };
        reader.readAsDataURL(file);
        
        // Reset AI verification when files change
        setAiVerified(false);
        setVerificationError(null);
      }
    }
  };

  const verifyDocumentsWithAI = async () => {
    if (!aadhaarFrontPreview || !aadhaarBackPreview || !selfiePreview) {
      toast.error("Please upload both Aadhaar sides and selfie first");
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aadhaarFrontImage: aadhaarFrontPreview,
          aadhaarBackImage: aadhaarBackPreview,
          selfieImage: selfiePreview,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setVerificationError(result.error || 'Verification failed');
        toast.error(result.error || 'Verification failed');
        return;
      }

      if (result.verified) {
        setAiVerified(true);
        toast.success("Documents verified successfully!");
      } else {
        let errorMsg = result.message || 'Documents could not be verified';
        if (result.details) {
          if (result.details.aadhaarIssue) {
            errorMsg = `Aadhaar Issue: ${result.details.aadhaarIssue}`;
          }
          if (result.details.selfieIssue) {
            errorMsg = `Selfie Issue: ${result.details.selfieIssue}`;
          }
        }
        setVerificationError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      setVerificationError("Failed to verify documents. Please try again.");
      toast.error("Failed to verify documents");
    } finally {
      setIsVerifying(false);
    }
  };

  const uploadFile = async (file: File, userId: string, type: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${type}_${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('seller-documents')
      .upload(fileName, file);

    if (error) throw error;
    return fileName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.termsAccepted) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    if (!formData.aadhaarFrontFile || !formData.aadhaarBackFile || !formData.selfieFile) {
      toast.error("Please upload all required documents");
      return;
    }

    if (!aiVerified) {
      toast.error("Please verify your documents with AI first");
      return;
    }

    // If breeder is selected, license is mandatory
    if (formData.isBreeder && !formData.breederLicense) {
      toast.error("Please upload your breeder license certificate");
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

      // Upload files to storage
      const aadhaarFrontUrl = await uploadFile(formData.aadhaarFrontFile, userId, 'aadhaar_front');
      const aadhaarBackUrl = await uploadFile(formData.aadhaarBackFile, userId, 'aadhaar_back');
      const selfieUrl = await uploadFile(formData.selfieFile, userId, 'selfie');
      let breederUrl = null;
      
      if (formData.isBreeder && formData.breederLicense) {
        breederUrl = await uploadFile(formData.breederLicense, userId, 'breeder_license');
      }

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          phone: formData.phone,
          aadhaar_file: `${aadhaarFrontUrl}|${aadhaarBackUrl}`,
          selfie_file: selfieUrl,
          breeder_license: breederUrl,
          is_onboarding_complete: true,
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Verification submitted! Your account is now active.");
      navigate("/seller-dashboard");
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast.error(error.message || "Failed to submit verification");
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedToStep3 = formData.aadhaarFrontFile && formData.aadhaarBackFile && formData.selfieFile && aiVerified && 
    (!formData.isBreeder || formData.breederLicense);

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
              {currentStep === 2 && "Upload your documents for AI verification"}
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
                        Get a verified badge and priority listing (requires license upload)
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
                  {/* AI Verification Notice */}
                  <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-2xl border border-primary/20">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">AI-Powered Verification</p>
                      <p className="text-xs text-muted-foreground">
                        Your documents will be verified automatically using AI
                      </p>
                    </div>
                  </div>

                  {/* Aadhaar Upload - Front and Back Side */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Aadhaar Card *
                    </Label>
                    
                    {/* Labels for front and back */}
                    <div className="grid grid-cols-2 gap-3">
                      <p className="text-sm text-muted-foreground text-center font-medium">Aadhaar Front Side</p>
                      <p className="text-sm text-muted-foreground text-center font-medium">Aadhaar Back Side</p>
                    </div>
                    
                    {/* Upload boxes side by side */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Front Side Upload */}
                      <div className="border-2 border-dashed border-border rounded-2xl p-4 text-center hover:border-primary/50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange("aadhaarFrontFile")}
                          className="hidden"
                          id="aadhaar-front-upload"
                        />
                        <label htmlFor="aadhaar-front-upload" className="cursor-pointer">
                          {aadhaarFrontPreview ? (
                            <div className="space-y-2">
                              <img src={aadhaarFrontPreview} alt="Aadhaar Front" className="w-full h-20 object-cover mx-auto rounded-lg" />
                              <div className="flex items-center justify-center gap-1 text-success">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs truncate">{formData.aadhaarFrontFile?.name}</span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">
                                Upload Front
                              </p>
                            </>
                          )}
                        </label>
                      </div>

                      {/* Back Side Upload */}
                      <div className="border-2 border-dashed border-border rounded-2xl p-4 text-center hover:border-primary/50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange("aadhaarBackFile")}
                          className="hidden"
                          id="aadhaar-back-upload"
                        />
                        <label htmlFor="aadhaar-back-upload" className="cursor-pointer">
                          {aadhaarBackPreview ? (
                            <div className="space-y-2">
                              <img src={aadhaarBackPreview} alt="Aadhaar Back" className="w-full h-20 object-cover mx-auto rounded-lg" />
                              <div className="flex items-center justify-center gap-1 text-success">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs truncate">{formData.aadhaarBackFile?.name}</span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">
                                Upload Back
                              </p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">PNG or JPG only (max 5MB each)</p>
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
                        {selfiePreview ? (
                          <div className="space-y-2">
                            <img src={selfiePreview} alt="Selfie Preview" className="w-32 h-32 object-cover mx-auto rounded-lg" />
                            <div className="flex items-center justify-center gap-2 text-success">
                              <CheckCircle className="w-5 h-5" />
                              <span>{formData.selfieFile?.name}</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Take a selfie holding your Aadhaar card
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PNG or JPG only (max 5MB)
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* AI Verify Button */}
                  {aadhaarFrontPreview && aadhaarBackPreview && selfiePreview && !aiVerified && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-2xl border-primary text-primary hover:bg-primary/10"
                      onClick={verifyDocumentsWithAI}
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Verifying with AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Verify Documents with AI
                        </>
                      )}
                    </Button>
                  )}

                  {/* Verification Status */}
                  {aiVerified && (
                    <div className="flex items-center gap-2 p-3 bg-success/10 text-success rounded-2xl">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Documents verified successfully!</span>
                    </div>
                  )}

                  {verificationError && (
                    <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-2xl">
                      <AlertCircle className="w-5 h-5 mt-0.5" />
                      <div>
                        <p className="font-medium">Verification Failed</p>
                        <p className="text-sm">{verificationError}</p>
                      </div>
                    </div>
                  )}

                  {/* Breeder License Upload - Only if isBreeder is true */}
                  {formData.isBreeder && (
                    <div className="space-y-2 animate-fade-in">
                      <Label className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-primary" />
                        Breeder License *
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
                      <p className="text-xs text-destructive">
                        * Required for registered breeders
                      </p>
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
                      disabled={!canProceedToStep3}
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
                        <CheckCircle className="w-4 h-4" /> Verified
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Selfie with Aadhaar</span>
                      <span className="font-medium text-success flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Verified
                      </span>
                    </div>
                    
                    {formData.isBreeder && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Breeder License</span>
                        <span className="font-medium text-success flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Uploaded
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Terms */}
                  <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-2xl">
                    <Checkbox
                      id="terms"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: checked as boolean })}
                      className="mt-1"
                    />
                    <div>
                      <Label htmlFor="terms" className="cursor-pointer text-sm">
                        I agree to the Terms of Service and Privacy Policy
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        By proceeding, you confirm that all information provided is accurate
                      </p>
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
      </main>
    </div>
  );
};

export default SellerOnboarding;
