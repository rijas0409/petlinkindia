import { useState } from "react";
import sruvoLogo from "@/assets/sruvo-logo.png";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Heart, Loader2, Upload, FileText, CheckCircle, Shield, Stethoscope, Calendar, Banknote, User } from "lucide-react";

const VetOnboarding = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", city: "", state: "", preferredLanguage: "English",
    qualification: "BVSc", yearsOfExperience: "", specializations: [] as string[],
    consultationType: "both",
    vetDegreeFile: null as File | null, registrationNumber: "", govtIdFile: null as File | null,
    clinicRegistrationFile: null as File | null, profilePhoto: null as File | null,
    availableDays: [] as string[], morningSlots: true, eveningSlots: true,
    onlineFee: "500", offlineFee: "800",
    bankAccountName: "", bankName: "", bankAccountNumber: "", bankIfsc: "",
    termsAccepted: false,
  });
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});

  const specializations = ["Dog", "Cat", "Bird", "Fish", "Exotic", "All"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const qualifications = ["BVSc", "MVSc", "PhD", "Other"];
  const languages = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Bengali", "Marathi", "Gujarati"];

  const handleFileChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error("File size must be less than 5MB"); return; }
      setFormData(prev => ({ ...prev, [field]: file }));
      const reader = new FileReader();
      reader.onload = (ev) => setFilePreviews(prev => ({ ...prev, [field]: ev.target?.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const toggleSpec = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const uploadFile = async (file: File, userId: string, type: string) => {
    const ext = file.name.split('.').pop();
    const path = `${userId}/${type}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('vet-documents').upload(path, file);
    if (error) throw error;
    return path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.termsAccepted) { toast.error("Please accept terms"); return; }
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth-vet"); return; }
      const userId = session.user.id;

      let vetDegreeUrl = null, govtIdUrl = null, clinicRegUrl = null, profilePhotoUrl = null;
      if (formData.vetDegreeFile) vetDegreeUrl = await uploadFile(formData.vetDegreeFile, userId, 'vet_degree');
      if (formData.govtIdFile) govtIdUrl = await uploadFile(formData.govtIdFile, userId, 'govt_id');
      if (formData.clinicRegistrationFile) clinicRegUrl = await uploadFile(formData.clinicRegistrationFile, userId, 'clinic_reg');
      if (formData.profilePhoto) profilePhotoUrl = await uploadFile(formData.profilePhoto, userId, 'profile_photo');

      // Create vet profile
      const { error: vetError } = await supabase.from("vet_profiles").insert({
        user_id: userId,
        qualification: formData.qualification,
        years_of_experience: parseInt(formData.yearsOfExperience) || 0,
        specializations: formData.specializations,
        consultation_type: formData.consultationType,
        vet_degree_file: vetDegreeUrl,
        registration_number: formData.registrationNumber,
        govt_id_file: govtIdUrl,
        clinic_registration_file: clinicRegUrl,
        profile_photo: profilePhotoUrl,
        available_days: formData.availableDays,
        morning_slots: formData.morningSlots,
        evening_slots: formData.eveningSlots,
        online_fee: parseFloat(formData.onlineFee) || 500,
        offline_fee: parseFloat(formData.offlineFee) || 800,
        bank_account_name: formData.bankAccountName,
        bank_name: formData.bankName,
        bank_account_number: formData.bankAccountNumber,
        bank_ifsc: formData.bankIfsc,
        preferred_language: formData.preferredLanguage,
      });
      if (vetError) throw vetError;

      // Update main profile
      const { error: profileError } = await supabase.from("profiles").update({
        full_name: formData.fullName,
        phone: formData.phone,
        address: `${formData.city}, ${formData.state}`,
        is_onboarding_complete: true,
        is_admin_approved: false,
      }).eq("id", userId);
      if (profileError) throw profileError;

      toast.success("Profile submitted! Verification pending.");
      navigate("/vet-pending-approval");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit");
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Basic Info", icon: User },
    { number: 2, title: "Professional", icon: Stethoscope },
    { number: 3, title: "Documents", icon: FileText },
    { number: 4, title: "Availability", icon: Calendar },
    { number: 5, title: "Bank & Confirm", icon: Banknote },
  ];

  const canProceed = (step: number) => {
    switch (step) {
      case 1: return formData.fullName && formData.phone && formData.city && formData.state;
      case 2: return formData.qualification && formData.specializations.length > 0;
      case 3: return formData.vetDegreeFile && formData.registrationNumber && formData.govtIdFile;
      case 4: return formData.availableDays.length > 0;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-1">
            <img src={sruvoLogo} alt="Sruvo" className="w-12 h-12 object-contain" />
            <div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">Sruvo</span>
              <p className="text-xs text-muted-foreground">Vet Doctor Verification</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Progress */}
        <div className="flex items-center justify-center mb-6 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex flex-col items-center ${currentStep >= step.number ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all ${
                  currentStep >= step.number ? "bg-gradient-primary text-white shadow-float" : "bg-muted"
                }`}>
                  <step.icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium whitespace-nowrap">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 mb-5 rounded-full transition-all ${currentStep > step.number ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="border-0 shadow-card animate-fade-in">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              Step {currentStep} of {steps.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Step 1: Basic Details */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Dr. Ananya Iyer" className="rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="doctor@example.com" className="rounded-2xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Phone *</Label>
                      <Input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 98765 43210" className="rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select value={formData.preferredLanguage} onValueChange={v => setFormData({...formData, preferredLanguage: v})}>
                        <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                        <SelectContent>{languages.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>City *</Label>
                      <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Mumbai" className="rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>State *</Label>
                      <Input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} placeholder="Maharashtra" className="rounded-2xl" />
                    </div>
                  </div>
                  <Button type="button" className="w-full rounded-2xl bg-gradient-primary" onClick={() => setCurrentStep(2)} disabled={!canProceed(1)}>Continue</Button>
                </div>
              )}

              {/* Step 2: Professional Details */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Qualification *</Label>
                      <Select value={formData.qualification} onValueChange={v => setFormData({...formData, qualification: v})}>
                        <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                        <SelectContent>{qualifications.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Experience (yrs) *</Label>
                      <Input type="number" value={formData.yearsOfExperience} onChange={e => setFormData({...formData, yearsOfExperience: e.target.value})} placeholder="5" className="rounded-2xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Specializations *</Label>
                    <div className="flex flex-wrap gap-2">
                      {specializations.map(spec => (
                        <button key={spec} type="button" onClick={() => toggleSpec(spec)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            formData.specializations.includes(spec) ? "bg-teal-500 text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}>{spec}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Consultation Type *</Label>
                    <Select value={formData.consultationType} onValueChange={v => setFormData({...formData, consultationType: v})}>
                      <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online Video Only</SelectItem>
                        <SelectItem value="offline">Offline Clinic Only</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" className="flex-1 rounded-2xl" onClick={() => setCurrentStep(1)}>Back</Button>
                    <Button type="button" className="flex-1 rounded-2xl bg-gradient-primary" onClick={() => setCurrentStep(3)} disabled={!canProceed(2)}>Continue</Button>
                  </div>
                </div>
              )}

              {/* Step 3: Documents */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-fade-in">
                  {[
                    { field: "vetDegreeFile", label: "Vet Degree Certificate *", accept: "image/*,.pdf" },
                    { field: "govtIdFile", label: "Govt ID (Aadhaar/PAN) *", accept: "image/*,.pdf" },
                    { field: "clinicRegistrationFile", label: "Clinic Registration (Optional)", accept: "image/*,.pdf" },
                    { field: "profilePhoto", label: "Profile Photo *", accept: "image/*" },
                  ].map(doc => (
                    <div key={doc.field} className="space-y-2">
                      <Label>{doc.label}</Label>
                      <div className="border-2 border-dashed border-border rounded-2xl p-4 text-center hover:border-primary/50 transition-colors">
                        <input type="file" accept={doc.accept} onChange={handleFileChange(doc.field)} className="hidden" id={doc.field} />
                        <label htmlFor={doc.field} className="cursor-pointer">
                          {filePreviews[doc.field] ? (
                            <div className="flex items-center justify-center gap-2 text-teal-600">
                              <CheckCircle className="w-5 h-5" />
                              <span className="text-sm">Uploaded</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <Upload className="w-5 h-5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Upload (max 5MB)</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  ))}
                  <div className="space-y-2">
                    <Label>Registration Number *</Label>
                    <Input value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} placeholder="VET/MH/2024/1234" className="rounded-2xl" />
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" className="flex-1 rounded-2xl" onClick={() => setCurrentStep(2)}>Back</Button>
                    <Button type="button" className="flex-1 rounded-2xl bg-gradient-primary" onClick={() => setCurrentStep(4)} disabled={!canProceed(3)}>Continue</Button>
                  </div>
                </div>
              )}

              {/* Step 4: Availability */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label>Available Days *</Label>
                    <div className="flex flex-wrap gap-2">
                      {days.map(day => (
                        <button key={day} type="button" onClick={() => toggleDay(day)}
                          className={`w-12 h-12 rounded-xl text-sm font-medium transition-all ${
                            formData.availableDays.includes(day) ? "bg-teal-500 text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}>{day}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>Time Slots</Label>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-2xl">
                      <Checkbox checked={formData.morningSlots} onCheckedChange={c => setFormData({...formData, morningSlots: c as boolean})} />
                      <span className="text-sm">Morning (9 AM - 1 PM)</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-2xl">
                      <Checkbox checked={formData.eveningSlots} onCheckedChange={c => setFormData({...formData, eveningSlots: c as boolean})} />
                      <span className="text-sm">Evening (4 PM - 8 PM)</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Online Fee (₹)</Label>
                      <Input type="number" value={formData.onlineFee} onChange={e => setFormData({...formData, onlineFee: e.target.value})} className="rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Offline Fee (₹)</Label>
                      <Input type="number" value={formData.offlineFee} onChange={e => setFormData({...formData, offlineFee: e.target.value})} className="rounded-2xl" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" className="flex-1 rounded-2xl" onClick={() => setCurrentStep(3)}>Back</Button>
                    <Button type="button" className="flex-1 rounded-2xl bg-gradient-primary" onClick={() => setCurrentStep(5)} disabled={!canProceed(4)}>Continue</Button>
                  </div>
                </div>
              )}

              {/* Step 5: Bank & Confirm */}
              {currentStep === 5 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label>Account Holder Name</Label>
                    <Input value={formData.bankAccountName} onChange={e => setFormData({...formData, bankAccountName: e.target.value})} placeholder="Dr. Ananya Iyer" className="rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} placeholder="State Bank of India" className="rounded-2xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Account Number</Label>
                      <Input value={formData.bankAccountNumber} onChange={e => setFormData({...formData, bankAccountNumber: e.target.value})} placeholder="1234567890" className="rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>IFSC Code</Label>
                      <Input value={formData.bankIfsc} onChange={e => setFormData({...formData, bankIfsc: e.target.value})} placeholder="SBIN0001234" className="rounded-2xl" />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-teal-50 rounded-2xl p-4 space-y-2">
                    <h4 className="font-semibold text-sm text-teal-800">Profile Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span className="text-muted-foreground">Name:</span><span className="font-medium">{formData.fullName}</span>
                      <span className="text-muted-foreground">Qualification:</span><span className="font-medium">{formData.qualification}</span>
                      <span className="text-muted-foreground">Experience:</span><span className="font-medium">{formData.yearsOfExperience} yrs</span>
                      <span className="text-muted-foreground">Specializations:</span><span className="font-medium">{formData.specializations.join(", ")}</span>
                      <span className="text-muted-foreground">Available:</span><span className="font-medium">{formData.availableDays.join(", ")}</span>
                      <span className="text-muted-foreground">Online Fee:</span><span className="font-medium">₹{formData.onlineFee}</span>
                      <span className="text-muted-foreground">Offline Fee:</span><span className="font-medium">₹{formData.offlineFee}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-2xl">
                    <Checkbox checked={formData.termsAccepted} onCheckedChange={c => setFormData({...formData, termsAccepted: c as boolean})} />
                    <Label className="text-sm cursor-pointer">I confirm all information is accurate and agree to PetLink's Terms of Service.</Label>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" className="flex-1 rounded-2xl" onClick={() => setCurrentStep(4)}>Back</Button>
                    <Button type="submit" className="flex-1 rounded-2xl bg-gradient-primary" disabled={isLoading || !formData.termsAccepted}>
                      {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>) : "Submit for Verification"}
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

export default VetOnboarding;
