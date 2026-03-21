import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Shield, Upload, Loader2, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const KYCView = () => {
  const { user, kycStatus, kycRejectionReason, refreshRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    idType: "national_id",
    idNumber: "",
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchSubmission();
  }, [user]);

  const fetchSubmission = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("kyc_submissions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setExistingSubmission(data);
      if (data) {
        setFormData({
          fullName: data.full_name,
          idType: data.id_type,
          idNumber: data.id_number,
        });
      }
    } catch (error) {
      console.error("Error fetching KYC submission:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!file && !existingSubmission) {
      toast.error("Please upload an ID document");
      return;
    }

    setSubmitting(true);
    try {
      let documentUrl = existingSubmission?.document_url;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `kyc-documents/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('kyc-documents')
          .upload(filePath, file);

        if (uploadError) {
          if (uploadError.message.includes("bucket not found")) {
            throw new Error("KYC processing is currently unavailable (Storage bucket not found). Please contact support.");
          }
          throw uploadError;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('kyc-documents')
          .getPublicUrl(filePath);
        
        documentUrl = publicUrl;
      }

      const { error: submissionError } = await supabase
        .from("kyc_submissions")
        .upsert({
          user_id: user.id,
          full_name: formData.fullName,
          id_type: formData.idType,
          id_number: formData.idNumber,
          document_url: documentUrl,
          status: "pending",
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (submissionError) throw submissionError;

      toast.success("KYC submission successful! Verification is pending.");
      await refreshRole();
      fetchSubmission();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit KYC");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  if (kycStatus === "verified") {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-6 animate-in fade-in duration-500">
        <div className="bg-emerald-50 border border-emerald-100 p-12 rounded-[40px] flex flex-col items-center gap-4">
          <div className="h-20 w-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-black text-emerald-900 uppercase italic tracking-tighter">Account Verified</h2>
          <p className="text-emerald-700 font-medium">Your identity has been successfully verified. You have full access to all platform features.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <section className="bg-white rounded-[32px] border border-zinc-100 shadow-xl overflow-hidden text-black pb-10">
        <div className="p-8 bg-gradient-to-r from-zinc-50 to-amber-50/30 border-b border-zinc-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-black flex items-center gap-3 uppercase italic tracking-tighter">
              Identity Verification <Shield className="h-6 w-6 text-amber-600" />
            </h2>
            <p className="text-zinc-500 font-medium mt-1">Upload your documents to unlock all features.</p>
          </div>
          
          {kycStatus === "pending" && (
            <div className="px-4 py-2 bg-amber-100 border border-amber-200 rounded-full flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-amber-600 animate-spin" />
              <span className="text-xs font-bold text-amber-700 uppercase">Verification Pending</span>
            </div>
          )}

          {kycStatus === "rejected" && (
            <div className="px-4 py-2 bg-red-100 border border-red-200 rounded-full flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-xs font-bold text-red-700 uppercase">Verification Rejected</span>
            </div>
          )}
        </div>

        {kycStatus === "rejected" && kycRejectionReason && (
          <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-900 uppercase">Rejection Reason:</p>
              <p className="text-sm text-red-700">{kycRejectionReason}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="text-black font-black uppercase text-xs tracking-widest ml-1">Full Name (As on ID)</Label>
              <Input 
                required
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                disabled={kycStatus === "pending"}
                placeholder="John Doe"
                className="bg-zinc-50 border-zinc-200 h-12 rounded-xl focus:ring-amber-500 focus:border-amber-500 text-black font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-black font-black uppercase text-xs tracking-widest ml-1">Document Type</Label>
              <Select 
                value={formData.idType} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, idType: val }))}
                disabled={kycStatus === "pending"}
              >
                <SelectTrigger className="bg-zinc-50 border-zinc-200 h-12 rounded-xl text-black font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-zinc-200 text-black">
                  <SelectItem value="national_id">National ID Card</SelectItem>
                  <SelectItem value="passport">Intl Passport</SelectItem>
                  <SelectItem value="drivers_license">Driver's License</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-black font-black uppercase text-xs tracking-widest ml-1">Document Number</Label>
              <Input 
                required
                value={formData.idNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
                disabled={kycStatus === "pending"}
                placeholder="ABC123456"
                className="bg-zinc-50 border-zinc-200 h-12 rounded-xl focus:ring-amber-500 focus:border-amber-500 text-black font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-black font-black uppercase text-xs tracking-widest ml-1">Upload ID (Front/Main Page)</Label>
              <div className="relative">
                <Input 
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  disabled={kycStatus === "pending"}
                  className="hidden"
                  id="kyc-file"
                />
                <label 
                  htmlFor="kyc-file"
                  className={`flex items-center justify-center gap-2 w-full h-12 px-4 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                    kycStatus === "pending" 
                      ? "bg-zinc-100 border-zinc-200 cursor-not-allowed" 
                      : "bg-amber-50/30 border-amber-200 hover:border-amber-500 hover:bg-amber-50"
                  }`}
                >
                  {file ? (
                    <>
                      <FileText className="h-5 w-5 text-amber-600" />
                      <span className="text-sm font-bold text-amber-700 truncate max-w-[200px]">{file.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-amber-600" />
                      <span className="text-sm font-bold text-amber-700 uppercase tracking-tighter">Choose File</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 flex items-start gap-4">
            <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-amber-600" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-black uppercase">Data Privacy & Security</h4>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                Your documents are securely encrypted and stored. We only use this information for identity verification purposes in compliance with financial regulations.
              </p>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={submitting || kycStatus === "pending"}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-7 rounded-2xl shadow-xl shadow-amber-600/20 text-lg uppercase tracking-widest transition-all hover:scale-[1.01]"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : kycStatus === "pending" ? (
              "Submission Received"
            ) : "Submit for Verification"}
          </Button>
        </form>
      </section>
    </div>
  );
};

export default KYCView;
