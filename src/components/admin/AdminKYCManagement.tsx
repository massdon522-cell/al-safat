import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ShieldQuestion, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Loader2,
  Calendar,
  User,
  Globe,
  MessageSquare,
  Search,
  ExternalLink
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface KYCProfile {
  id: string;
  kyc_full_name: string;
  country: string;
  kyc_state: string;
  kyc_zip: string;
  kyc_id_url: string;
  kyc_selfie_url: string;
  kyc_status: string;
  created_at: string;
  email: string;
}

const AdminKYCManagement = () => {
  const [submissions, setSubmissions] = useState<KYCProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKyc, setSelectedKyc] = useState<KYCProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, kyc_full_name, country, kyc_state, kyc_zip, kyc_id_url, kyc_selfie_url, kyc_status, created_at, email')
        .eq('kyc_status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching KYC submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: 'verified' | 'rejected', reason?: string) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          kyc_status: status,
          kyc_rejection_reason: reason || null
        })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Verification ${status} successfully`);
      fetchSubmissions();
      setSelectedKyc(null);
      setIsRejectDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || `Failed to ${status} verification`);
    } finally {
      setProcessing(false);
    }
  };

  const filteredSubmissions = submissions.filter(s => 
    s.kyc_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950 p-6 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white italic uppercase tracking-tighter">
            KYC VERIFICATION CENTER <ShieldQuestion className="h-6 w-6 text-amber-500" />
          </h2>
          <p className="text-zinc-500 text-sm italic">Review and manage identity verification requests</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-zinc-900 border-white/10 pl-10 h-10 rounded-xl"
          />
        </div>
      </div>

      <div className="bg-zinc-950 rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-zinc-400">Investor</TableHead>
              <TableHead className="text-zinc-400">Region</TableHead>
              <TableHead className="text-zinc-400">Submission Date</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-right text-zinc-400">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubmissions.map((sub) => (
              <TableRow key={sub.id} className="border-white/5 hover:bg-white/5">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-sm">{sub.kyc_full_name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono tracking-tighter">{sub.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                    <Globe className="h-3 w-3" /> {sub.country}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-zinc-500 text-xs">
                    <Calendar className="h-3 w-3" /> {new Date(sub.created_at).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-amber-500 font-black uppercase text-[10px] tracking-widest bg-amber-500/10 px-2 py-1 rounded-full w-fit">
                    <Loader2 className="h-2 w-2 animate-spin" /> Pending
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    size="sm" 
                    onClick={() => setSelectedKyc(sub)}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-bold h-8 px-4 rounded-xl flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" /> Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredSubmissions.length === 0 && (
          <div className="p-12 text-center text-zinc-600 italic">No pending verifications found.</div>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedKyc} onOpenChange={(open) => !open && setSelectedKyc(null)}>
        <DialogContent className="sm:max-w-[700px] bg-zinc-950 border-white/10 text-white overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
              Document Review: {selectedKyc?.kyc_full_name}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest">Profile Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-zinc-500">Full Name:</span>
                    <span className="font-bold">{selectedKyc?.kyc_full_name}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-zinc-500">Country:</span>
                    <span className="font-bold">{selectedKyc?.country}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-zinc-500">State:</span>
                    <span className="font-bold">{selectedKyc?.kyc_state}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-zinc-500">Zip Code:</span>
                    <span className="font-bold font-mono">{selectedKyc?.kyc_zip}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest">ID Card Document</h4>
                <div className="relative group aspect-video rounded-2xl overflow-hidden border border-white/10 bg-zinc-900">
                  <img 
                    src={selectedKyc?.kyc_id_url} 
                    alt="ID Card" 
                    className="w-full h-full object-cover"
                  />
                  <a 
                    href={selectedKyc?.kyc_id_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 font-bold"
                  >
                    <ExternalLink className="h-5 w-5" /> View Full Image
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest">Selfie Verification</h4>
                <div className="relative group aspect-square rounded-2xl overflow-hidden border border-white/10 bg-zinc-900">
                  <img 
                    src={selectedKyc?.kyc_selfie_url} 
                    alt="Selfie" 
                    className="w-full h-full object-cover"
                  />
                  <a 
                    href={selectedKyc?.kyc_selfie_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 font-bold"
                  >
                    <ExternalLink className="h-5 w-5" /> View Full Image
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  onClick={() => handleAction(selectedKyc!.id, 'verified')}
                  disabled={processing}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase h-12 rounded-xl flex items-center gap-2"
                >
                  <CheckCircle2 className="h-5 w-5" /> Approve Identity
                </Button>
                <Button 
                  onClick={() => setIsRejectDialogOpen(true)}
                  disabled={processing}
                  className="bg-transparent border border-red-500/50 text-red-500 hover:bg-red-500/10 font-black uppercase h-12 rounded-xl flex items-center gap-2"
                >
                  <XCircle className="h-5 w-5" /> Reject Application
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic uppercase tracking-tighter text-red-500">
              Identity Rejection Reason
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Rejection Reason / Notes</Label>
              <Input 
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g. ID card is blurry or expired"
                className="bg-zinc-900 border-white/10"
              />
            </div>
            <Button 
              onClick={() => handleAction(selectedKyc!.id, 'rejected', rejectionReason)}
              disabled={processing || !rejectionReason}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-black uppercase rounded-xl h-12"
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Rejection"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};


export default AdminKYCManagement;

