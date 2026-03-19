import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ArrowDownLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ExternalLink,
  MessageSquare,
  Wallet
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
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";


interface DepositRequest {
  id: string;
  user_id: string;
  amount: number;
  payer_address: string;
  status: string;
  created_at: string;
  admin_notes: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
  deposit_methods: {
    name: string;
  };
}

const AdminDepositManagement = () => {
  const [requests, setRequests] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<DepositRequest | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('deposits')
        .select(`
          *,
          profiles!user_id (first_name, last_name, email),
          deposit_methods!method_id (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data as any || []);
    } catch (error) {
      console.error('Error fetching deposits:', error);
      toast.error('Failed to load deposit requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;

    setProcessing(selectedRequest.id);
    try {
      // 1. Start a transaction-like flow (manual sequence)

      // Update the request status
      const { error: requestError } = await supabase
        .from('deposits')
        .update({
          status,
          admin_notes: adminNotes
        })
        .eq('id', selectedRequest.id);

      if (requestError) throw requestError;

      // 2. Credit the user's wallet if approved
      if (status === 'approved') {
        const { data: wallet, error: walletFetchError } = await supabase
          .from('wallets')
          .select('balance, total_deposits')
          .eq('user_id', selectedRequest.user_id)
          .single();

        if (walletFetchError) throw walletFetchError;

        const { error: walletUpdateError } = await supabase
          .from('wallets')
          .update({ 
            balance: Number(wallet.balance) + Number(selectedRequest.amount),
            total_deposits: Number(wallet.total_deposits || 0) + Number(selectedRequest.amount)
          })
          .eq('user_id', selectedRequest.user_id);

        if (walletUpdateError) throw walletUpdateError;
      }

      // 3. Log a transaction entry for the user
      await supabase.from('transactions').insert({
        user_id: selectedRequest.user_id,
        type: 'deposit',
        amount: selectedRequest.amount,
        status: status === 'approved' ? 'completed' : 'failed',
        description: status === 'approved' 
          ? `Deposit approved via ${selectedRequest.deposit_methods?.name || 'Manual'}. ${adminNotes}`
          : `Deposit rejected: ${adminNotes}`
      });

      toast.success(`Request ${status} successfully`);
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-zinc-950 p-6 rounded-2xl border border-white/5 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white italic uppercase tracking-tighter">
            Deposit Requests <ArrowDownLeft className="h-6 w-6 text-emerald-500" />
          </h2>
          <p className="text-zinc-500 text-sm">Review and approve cryptocurrency deposits</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
          <p className="text-xs text-emerald-500 font-bold uppercase tracking-widest leading-none">Status</p>
          <p className="text-xl font-black text-emerald-500">{requests.filter(r => r.status === 'pending').length} Pending</p>
        </div>
      </div>

      <div className="bg-zinc-950 rounded-2xl border border-white/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-zinc-400">User & Method</TableHead>
              <TableHead className="text-zinc-400">Amount</TableHead>
              <TableHead className="text-zinc-400">Payer Address</TableHead>
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
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      via <span className="text-amber-500 font-bold">{request.deposit_methods?.name}</span>
                    </p>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-emerald-500 font-bold">
                  ${request.amount.toLocaleString()}
                </TableCell>
                <TableCell className="max-w-[200px]">
                  <p className="text-xs text-zinc-400 font-mono truncate">{request.payer_address}</p>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${request.status === 'pending' ? "bg-amber-500/20 text-amber-500" :
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
                        <Button variant="ghost" size="sm" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all rounded-xl border border-emerald-500/20">
                          Verify Deposit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-md p-8 rounded-3xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-black text-amber-500 italic uppercase">
                            Process Deposit
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                          <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 space-y-3">
                            <div className="flex justify-between">
                              <span className="text-zinc-500 text-sm">User</span>
                              <span className="font-bold">{request.profiles?.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500 text-sm">Amount</span>
                              <span className="font-bold text-emerald-500">${request.amount}</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-zinc-500 text-sm">Payer Address</span>
                              <p className="text-xs font-mono break-all text-white/70">{request.payer_address}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                              <MessageSquare className="h-3 w-3" /> Admin Notes
                            </Label>
                            <Textarea
                              placeholder="Enter transaction details, TXID link, or rejection reason..."
                              className="bg-zinc-900 border-white/10 min-h-[100px]"
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                            />
                          </div>

                          <div className="flex gap-3 pt-4">
                            <Button
                              variant="ghost"
                              className="flex-1 rounded-xl text-red-500 hover:bg-red-500/10 hover:text-red-400"
                              onClick={() => handleAction('rejected')}
                              disabled={processing !== null}
                            >
                              {processing === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject"}
                            </Button>
                            <Button
                              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase rounded-xl"
                              onClick={() => handleAction('approved')}
                              disabled={processing !== null}
                            >
                              {processing === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <div className="flex items-center justify-end gap-2 text-zinc-600 text-[10px] font-bold uppercase">
                      {request.status === 'approved' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      Processed
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {requests.length === 0 && (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center gap-3">
            <Clock className="h-8 w-8 opacity-20" />
            No deposit requests found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDepositManagement;
