import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Loader2,
  Calendar,
  MessageSquare,
  Search,
  ExternalLink,
  Settings,
  Save
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Submission {
  id: string;
  user_id: string;
  code: string;
  status: string;
  admin_notes: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const AdminWithdrawalCodeManagement = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Settings state
  const [paymentDetails, setPaymentDetails] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Submissions
      const { data: subData, error: subError } = await supabase
        .from('withdrawal_code_submissions')
        .select('*, profiles!user_id(first_name, last_name, email)')
        .order('created_at', { ascending: false });
      
      if (subError) throw subError;
      setSubmissions(subData as any || []);

      // 2. Fetch Settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('withdrawal_code_settings')
        .select('payment_details')
        .eq('id', 'fixed_settings')
        .single();
      
      if (!settingsError) {
        setPaymentDetails(settingsData.payment_details);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    setSavingSettings(true);
    try {
      const { error } = await supabase
        .from('withdrawal_code_settings')
        .upsert({ id: 'fixed_settings', payment_details: paymentDetails });

      if (error) throw error;
      toast.success('Payment instructions updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAction = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('withdrawal_code_submissions')
        .update({
          status,
          admin_notes: reason || null
        })
        .eq('id', id);

      if (error) throw error;

      // Also update any 'awaiting_payment' withdrawals for this user to 'pending'
      if (status === 'approved') {
        const { data: subData } = await supabase
          .from('withdrawal_code_submissions')
          .select('user_id')
          .eq('id', id)
          .single();
        
        if (subData) {
          await supabase
            .from('withdrawals')
            .update({ status: 'pending' })
            .eq('user_id', subData.user_id)
            .eq('status', 'awaiting_payment');
        }
      }

      toast.success(`Submission ${status} successfully`);
      fetchData();
      setSelectedSub(null);
      setIsRejectDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || `Failed to ${status} submission`);
    } finally {
      setProcessing(false);
    }
  };

  const filteredSubmissions = submissions.filter(s => 
    s.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <Tabs defaultValue="submissions" className="w-full">
        <TabsList className="bg-zinc-900 border border-white/5 p-1 rounded-xl mb-6">
          <TabsTrigger value="submissions" className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-black font-bold">
            Code Submissions
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-black font-bold">
            Payment Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950 p-6 rounded-2xl border border-white/5 mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2 text-white italic uppercase tracking-tighter">
                WITHDRAWAL CODE REVIEW <CreditCard className="h-6 w-6 text-amber-500" />
              </h2>
              <p className="text-zinc-500 text-sm italic">Approve receipts to unlock user payouts</p>
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
                  <TableHead className="text-zinc-400">User</TableHead>
                  <TableHead className="text-zinc-400">Date</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-right text-zinc-400">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((sub) => (
                  <TableRow key={sub.id} className="border-white/5 hover:bg-white/5">
                    <TableCell>
                      <div>
                        <p className="font-bold text-white">{sub.profiles?.first_name} {sub.profiles?.last_name}</p>
                        <p className="text-xs text-zinc-500">{sub.profiles?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-zinc-500 text-xs">
                        <Calendar className="h-3 w-3" /> {new Date(sub.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                        sub.status === 'pending' ? "bg-amber-500/20 text-amber-500" :
                        sub.status === 'approved' ? "bg-emerald-500/20 text-emerald-500" :
                        "bg-red-500/20 text-red-500"
                      }`}>
                        {sub.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedSub(sub)}
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
              <div className="p-12 text-center text-zinc-600 italic">No submissions found.</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="bg-zinc-950 p-8 rounded-3xl border border-white/5 space-y-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                <Settings className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold italic uppercase tracking-tighter">Payment Instructions</h3>
                <p className="text-zinc-500 text-xs font-bold">Set the bank/wallet details for the withdrawal code fee</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase font-bold">Detailed Instructions (Visible to Users)</Label>
              <Textarea 
                value={paymentDetails}
                onChange={e => setPaymentDetails(e.target.value)}
                placeholder="Bank: Al Safat Bank\nAccount: 12345...\nFee: $50"
                className="bg-zinc-900 border-white/10 min-h-[200px] font-mono text-zinc-300"
              />
            </div>

            <Button 
              onClick={handleUpdateSettings}
              disabled={savingSettings}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase rounded-xl h-12 flex items-center gap-2"
            >
              {savingSettings ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Save Instructions
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={!!selectedSub} onOpenChange={(open) => !open && setSelectedSub(null)}>
        <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-white/10 text-white p-0 overflow-hidden rounded-3xl">
          <div className="p-6 bg-zinc-900 border-b border-white/5">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold italic uppercase tracking-tighter">
                Review Receipt
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Withdrawal Code</h4>
              <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl text-center">
                 <p className="text-3xl font-black text-amber-500 tracking-[0.3em] uppercase">
                   {selectedSub?.code || "N/A"}
                 </p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Button 
                onClick={() => handleAction(selectedSub!.id, 'approved')}
                disabled={processing}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold uppercase h-12 rounded-xl flex items-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5" /> Confirm Payment
              </Button>
              <Button 
                onClick={() => setIsRejectDialogOpen(true)}
                disabled={processing}
                className="w-full bg-transparent border border-red-500/50 text-red-500 hover:bg-red-500/10 font-bold uppercase h-12 rounded-xl flex items-center gap-2"
              >
                <XCircle className="h-5 w-5" /> Reject Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold italic uppercase tracking-tighter text-red-500">
              Rejection Reason
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Note to User</Label>
              <Input 
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g. Image not clear or payment not received"
                className="bg-zinc-900 border-white/10"
              />
            </div>
            <Button 
              onClick={() => handleAction(selectedSub!.id, 'rejected', rejectionReason)}
              disabled={processing || !rejectionReason}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold uppercase rounded-xl h-12"
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Rejection"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWithdrawalCodeManagement;
