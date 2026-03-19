import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2,
  MessageSquare,
  Wallet,
  AlertTriangle
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
  DialogTrigger 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  method: string;
  details: string;
  status: string;
  created_at: string;
  admin_notes: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const AdminWithdrawalManagement = () => {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select(`
          *,
          profiles!user_id (first_name, last_name, email)
        `)
        .neq('status', 'awaiting_payment') // Hide those still needing code payment
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setRequests(data as any || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast.error('Failed to load withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;

    setProcessing(selectedRequest.id);
    try {
      // 1. Update the withdrawal request status
      const { error: requestError } = await supabase
        .from('withdrawals')
        .update({ 
          status, 
          admin_notes: adminNotes 
        })
        .eq('id', selectedRequest.id);

      if (requestError) throw requestError;

      if (status === 'approved') {
        const { data: wallet, error: walletFetchError } = await supabase
          .from('wallets')
          .select('profit, total_withdrawals')
          .eq('user_id', selectedRequest.user_id)
          .single();

        if (walletFetchError) throw walletFetchError;

        // Deduct profit and increment total_withdrawals ONLY on approval
        const { error: walletUpdateError } = await supabase
          .from('wallets')
          .update({ 
            profit: Number(wallet.profit) - Number(selectedRequest.amount),
            total_withdrawals: Number(wallet.total_withdrawals || 0) + Number(selectedRequest.amount)
          })
          .eq('user_id', selectedRequest.user_id);

        if (walletUpdateError) throw walletUpdateError;
      }

      // 3. Log the transaction final state
      await supabase.from('transactions').insert({
        user_id: selectedRequest.user_id,
        type: 'withdrawal',
        amount: selectedRequest.amount,
        status: status === 'approved' ? 'completed' : 'failed',
        description: `Withdrawal ${status} by admin. Method: ${selectedRequest.method}`
      });

      toast.success(`Withdrawal ${status} successfully`);
      setSelectedRequest(null);
      setAdminNotes("");
      fetchRequests();
    } catch (error: any) {
      toast.error(error.message || 'Failed to process request');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-zinc-950 p-6 rounded-2xl border border-white/5 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white italic uppercase tracking-tighter">
            Withdrawal Requests <ArrowUpRight className="h-6 w-6 text-red-500" />
          </h2>
          <p className="text-zinc-500 text-sm">Review and authorize fund releases</p>
        </div>
        <div className={`px-4 py-2 rounded-xl border ${
          pendingCount > 0 
            ? "bg-red-500/10 border-red-500/20" 
            : "bg-emerald-500/10 border-emerald-500/20"
        }`}>
           <p className={`text-xs font-bold uppercase tracking-widest leading-none ${
             pendingCount > 0 ? "text-red-500" : "text-emerald-500"
           }`}>Pending Queue</p>
           <p className={`text-xl font-black ${
             pendingCount > 0 ? "text-red-500" : "text-emerald-500"
           }`}>{pendingCount} Requests</p>
        </div>
      </div>

      <div className="bg-zinc-950 rounded-2xl border border-white/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-zinc-400">User & System</TableHead>
              <TableHead className="text-zinc-400">Amount</TableHead>
              <TableHead className="text-zinc-400">Method</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-right text-zinc-400">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                <TableCell>
                  <div>
                    <p className="font-bold text-white">{request.profiles?.first_name} {request.profiles?.last_name}</p>
                    <p className="text-xs text-zinc-500">{request.profiles?.email}</p>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-red-500 font-bold">
                  -${request.amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <span className="text-xs text-zinc-400 font-bold uppercase bg-white/5 px-2 py-1 rounded">
                    {request.method}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                    request.status === 'pending' ? "bg-amber-500/20 text-amber-500" :
                    request.status === 'approved' ? "bg-emerald-500/20 text-emerald-500" :
                    "bg-red-500/20 text-red-500"
                  }`}>
                    {request.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {request.status === 'pending' ? (
                    <Dialog open={selectedRequest?.id === request.id} onOpenChange={(open) => {
                      if (open) setSelectedRequest(request);
                      else setSelectedRequest(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-xl border border-red-500/20">
                          Review Request
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-md p-8 rounded-3xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-black text-amber-500 italic uppercase">
                             Authorize Payout
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                          <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 space-y-3">
                             <div className="flex justify-between">
                                <span className="text-zinc-500 text-sm">Amount Requested</span>
                                <span className="font-bold text-red-500">${request.amount}</span>
                             </div>
                             <div className="flex justify-between">
                                <span className="text-zinc-500 text-sm">Method</span>
                                <span className="font-bold uppercase">{request.method}</span>
                             </div>
                             <div className="pt-2 border-t border-white/5">
                                <Label className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Payout Details</Label>
                                <p className="text-xs font-mono break-all text-white/70 bg-black/30 p-2 rounded mt-1">
                                   {request.details}
                                </p>
                             </div>
                          </div>

                          <div className="space-y-2">
                             <Label className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                                <MessageSquare className="h-3 w-3" /> Admin Approval Notes
                             </Label>
                             <Textarea 
                               placeholder="Add payment confirmation link, transaction hash, or reason for denial..."
                               className="bg-zinc-900 border-white/10 min-h-[100px]"
                               value={adminNotes}
                               onChange={(e) => setAdminNotes(e.target.value)}
                             />
                          </div>

                          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3 text-amber-500">
                             <AlertTriangle className="h-5 w-5 shrink-0" />
                             <p className="text-[10px] leading-relaxed">
                                Please ensure the funds have been successfully sent to the user's provided address BEFORE clicking Approve.
                             </p>
                          </div>

                          <div className="flex gap-3 pt-4">
                             <Button 
                               variant="ghost" 
                               className="flex-1 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                               onClick={() => handleAction('rejected')}
                               disabled={processing !== null}
                             >
                               {processing === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deny Request"}
                             </Button>
                             <Button 
                               className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-black uppercase rounded-xl"
                               onClick={() => handleAction('approved')}
                               disabled={processing !== null}
                             >
                               {processing === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve & Mark Paid"}
                             </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <div className="flex items-center justify-end gap-2 text-zinc-600 text-[10px] font-bold uppercase">
                       {request.status === 'approved' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                       Finalized
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {requests.length === 0 && (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center gap-3">
             <Wallet className="h-8 w-8 opacity-20" />
             No withdrawal history found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWithdrawalManagement;
