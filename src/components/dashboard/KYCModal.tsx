import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Upload, 
  User, 
  Globe, 
  MapPin, 
  CreditCard, 
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const COUNTRIES = [
  "Algeria", "Bahrain", "Comoros", "Djibouti", "Egypt", "Iraq", "Jordan", 
  "Kuwait", "Lebanon", "Libya", "Mauritania", "Morocco", "Oman", "Palestine", 
  "Qatar", "Saudi Arabia", "Somalia", "Sudan", "Syria", "Tunisia", 
  "United Arab Emirates", "Yemen",
  "United States", "United Kingdom", "Canada", "Australia", "Germany", 
  "France", "Italy", "Spain", "Japan", "China", "India", "Brazil", 
  "Mexico", "South Africa", "Turkey", "Russia", "South Korea"
];

const KYCModal: React.FC<KYCModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, refreshRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    country: "",
    state: "",
    zipCode: ""
  });
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  const handleUpload = async (file: File, type: string) => {
    if (!user) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('kyc-documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('kyc-documents')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.fullName || !formData.country || !formData.state || !formData.zipCode || !idFile || !selfieFile) {
      toast.error("Please fill all fields and upload required documents");
      return;
    }

    setLoading(true);
    try {
      // 1. Upload ID Card
      const idUrl = await handleUpload(idFile, 'id_card');
      // 2. Upload Selfie
      const selfieUrl = await handleUpload(selfieFile, 'selfie');

      // 3. Update Profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          kyc_status: 'pending',
          kyc_full_name: formData.fullName,
          country: formData.country,
          kyc_state: formData.state,
          kyc_zip: formData.zipCode,
          kyc_id_url: idUrl,
          kyc_selfie_url: selfieUrl,
          kyc_rejection_reason: null // Clear any previous rejection
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success("KYC Submitted Successfully! Your verification is now pending review.");
      await refreshRole();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error("KYC Submission error:", error);
      toast.error(error.message || "Failed to submit KYC. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-white/10 text-white overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
            Identity Verification <CheckCircle2 className="h-6 w-6 text-amber-500" />
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Please provide valid documents to unlock all platform features.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Identity Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase font-black">Full Name (As shown on ID)</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input 
                  placeholder="John Doe" 
                  value={formData.fullName}
                  onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="bg-zinc-900/50 border-white/10 pl-10 focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs uppercase font-black">Country</Label>
                <Select onValueChange={val => setFormData(prev => ({ ...prev, country: val }))}>
                  <SelectTrigger className="bg-zinc-900/50 border-white/10">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white">
                    {COUNTRIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs uppercase font-black">State/Region</Label>
                <Input 
                  placeholder="California" 
                  value={formData.state}
                  onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className="bg-zinc-900/50 border-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase font-black">Zip / Postal Code</Label>
              <Input 
                placeholder="10001" 
                value={formData.zipCode}
                onChange={e => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                className="bg-zinc-900/50 border-white/10"
              />
            </div>
          </div>

          {/* Document Uploads */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest">Document Uploads</h4>
            
            <div className="grid grid-cols-1 gap-4">
              {/* ID Card */}
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs font-bold">Official ID Card (Front View)</Label>
                <div className="relative group p-4 border-2 border-dashed border-white/10 rounded-2xl hover:border-amber-500/50 transition-all bg-zinc-900/30 flex flex-col items-center justify-center gap-2 cursor-pointer">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setIdFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  {idFile ? (
                    <div className="flex items-center gap-2 text-emerald-500 font-bold">
                      <CheckCircle2 className="h-5 w-5" /> {idFile.name}
                    </div>
                  ) : (
                    <>
                      <CreditCard className="h-8 w-8 text-zinc-500 group-hover:text-amber-500 transition-colors" />
                      <span className="text-xs text-zinc-500 font-medium">Click to upload ID Card</span>
                    </>
                  )}
                </div>
              </div>

              {/* Selfie */}
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs font-bold">Selfie with ID / Portrait Photo</Label>
                <div className="relative group p-4 border-2 border-dashed border-white/10 rounded-2xl hover:border-amber-500/50 transition-all bg-zinc-900/30 flex flex-col items-center justify-center gap-2 cursor-pointer">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setSelfieFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  {selfieFile ? (
                    <div className="flex items-center gap-2 text-emerald-500 font-bold">
                      <CheckCircle2 className="h-5 w-5" /> {selfieFile.name}
                    </div>
                  ) : (
                    <>
                      <Camera className="h-8 w-8 text-zinc-500 group-hover:text-amber-500 transition-colors" />
                      <span className="text-xs text-zinc-500 font-medium">Click to upload Photo</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black uppercase rounded-2xl h-12 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit for Verification"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default KYCModal;
