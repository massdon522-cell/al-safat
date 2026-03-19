import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { 
  TrendingUp, 
  AlertTriangle, 
  X,
  Loader2,
  Wallet,
  CreditCard,
  Copy,
  Check
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface WithdrawalRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableProfit: number;
  symbol: string;
}

const WithdrawalRequestModal: React.FC<WithdrawalRequestModalProps> = ({ isOpen, onClose, availableProfit, symbol }) => {
  const { user } = useAuth();
  const [method, setMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Withdrawal Code State
  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [withdrawalId, setWithdrawalId] = useState<string | null>(null);
  const [paymentInstructions, setPaymentInstructions] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [copiedLine, setCopiedLine] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchPaymentSettings();
    }
  }, [isOpen, user]);

  const fetchPaymentSettings = async () => {
    try {
      const { data: settsData } = await supabase
        .from('withdrawal_code_settings')
        .select('payment_details')
        .eq('id', 'fixed_settings')
        .maybeSingle();
      
      if (settsData) {
        setPaymentInstructions(settsData.payment_details);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  const checkWithdrawalCodeStatus = async () => {
    setLoading(true);
    try {
      const { data: subData } = await supabase
        .from('withdrawal_code_submissions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subData) {
        setSubmissionStatus(subData.status);
        setRejectionReason(subData.admin_notes);
      }
    } catch (err) {
      console.error("Error checking status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadReceipt = async () => {
    if (!user || !receiptFile) return;
    setLoading(true);
    try {
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${user.id}/withdrawal_receipt_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, receiptFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(fileName);

      const { error: insError } = await supabase
        .from('withdrawal_code_submissions')
        .upsert({
          user_id: user.id,
          receipt_url: publicUrl,
          status: 'pending',
          admin_notes: null
        }, { onConflict: 'user_id' }); // Only one active request per user for simplicity

      if (insError) throw insError;

      toast.success("Receipt uploaded! Waiting for admin review.");
      checkWithdrawalCodeStatus();
    } catch (err: any) {
      toast.error(err.message || "Failed to upload receipt");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    // Try to take the part after the colon if it exists
    const valueToCopy = text.includes(':') ? text.split(':')[1].trim() : text.trim();
    navigator.clipboard.writeText(valueToCopy);
    setCopiedLine(index);
    setTimeout(() => setCopiedLine(null), 2000);
    toast.success("Value copied to clipboard!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user || !method || !amount || !details) {
      setError("Please fill in all fields");
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    if (withdrawalAmount > availableProfit) {
      setError(`Insufficient profit! Your current accumulated profit is ${symbol}${availableProfit.toLocaleString()}`);
      return;
    }

    setLoading(true);
    try {
      const { data: withdrawalData, error: submitError } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          amount: withdrawalAmount,
          method: method,
          details: details,
          status: 'awaiting_payment' // New initial status
        })
        .select()
        .single();

      if (submitError) throw submitError;
      setWithdrawalId(withdrawalData.id);

      // Check if user already has an approved withdrawal code
      const { data: subData } = await supabase
        .from('withdrawal_code_submissions')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .maybeSingle();

      if (subData) {
        // If already approved, update withdrawal to pending immediately
        await supabase
          .from('withdrawals')
          .update({ status: 'pending' })
          .eq('id', withdrawalData.id);
        
        toast.success("Withdrawal request submitted successfully!");
        onClose();
      } else {
        // Otherwise, move to payment step
        setStep('payment');
        checkWithdrawalCodeStatus();
      }
    } catch (err) {
      console.error("Error submitting withdrawal:", err);
      setError("Failed to submit withdrawal request.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && step === 'form') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[450px] p-12 bg-white rounded-xl flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-y-auto max-h-[95vh] border-none bg-white rounded-xl">
        <DialogHeader className="bg-[#A6760E] text-white p-6 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold italic uppercase tracking-tighter">
            {step === 'payment' ? "Unlock Payouts" : "Withdrawal Request"}
          </DialogTitle>
          <DialogClose className="opacity-70 hover:opacity-100 transition-opacity">
            <X className="h-6 w-6" />
          </DialogClose>
        </DialogHeader>

        {step === 'payment' ? (
          <div className="p-8 space-y-6 animate-in fade-in duration-500">
            {submissionStatus === 'rejected' && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex gap-3 text-red-600">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div>
                   <p className="font-bold uppercase text-xs">Payment Rejected</p>
                   <p className="text-[10px] font-medium">{rejectionReason}</p>
                </div>
              </div>
            )}

            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 space-y-4">
              <h3 className="text-[#A6760E] font-black uppercase text-xs tracking-widest flex items-center gap-2">
                 <Wallet className="h-4 w-4" /> Payment Instructions
              </h3>
              <div className="space-y-3">
                {paymentInstructions ? paymentInstructions.split('\n').map((line, idx) => {
                  if (!line.trim()) return null;
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-amber-200/50 group">
                      <p className="text-zinc-700 text-sm font-bold flex-1 break-all">
                        {line}
                      </p>
                      <button 
                         onClick={() => handleCopy(line, idx)}
                         className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-all"
                         title="Copy value"
                      >
                        {copiedLine === idx ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  );
                }) : (
                  <p className="text-zinc-500 text-xs italic">Please wait for instructions from admin...</p>
                )}
              </div>
            </div>

            {submissionStatus === 'pending' ? (
              <div className="bg-zinc-100 p-8 rounded-2xl text-center space-y-3">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin mx-auto" />
                <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest">Awaiting Admin Confirmation</p>
                <p className="text-[10px] text-zinc-400">Our team is verifying your payment. This usually takes 1-2 hours.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                   <Label className="text-zinc-400 text-xs font-black uppercase">Upload Payment Receipt</Label>
                   <div className="relative group p-6 border-2 border-dashed border-amber-200 rounded-2xl bg-amber-50/30 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-amber-500 transition-all">
                      <input 
                         type="file" 
                         className="absolute inset-0 opacity-0 cursor-pointer z-10"
                         accept="image/*"
                         onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                      />
                      <CreditCard className="h-8 w-8 text-amber-500" />
                      <span className="text-xs text-amber-700 font-bold">{receiptFile ? receiptFile.name : "Click to select receipt image"}</span>
                   </div>
                </div>
                <Button 
                   onClick={handleUploadReceipt}
                   disabled={loading || !receiptFile}
                   className="w-full bg-[#A6760E] hover:bg-[#8e650c] text-white font-black uppercase h-12 rounded-xl"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Proof of Payment"}
                </Button>
              </div>
            )}
            
            <Button variant="ghost" onClick={onClose} className="w-full text-zinc-400 font-bold uppercase text-xs">
               Cancel
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="bg-amber-50 p-4 border rounded-2xl border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#A6760E]">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-bold uppercase">Available Profit</span>
              </div>
              <span className="text-xl font-black text-[#A6760E]">{symbol}{availableProfit.toLocaleString()}</span>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Withdrawal Method</label>
                <Select onValueChange={setMethod} value={method}>
                  <SelectTrigger className="bg-zinc-50 border-zinc-200 h-12 rounded-xl text-zinc-900 font-bold">
                    <SelectValue placeholder="Select Method" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-zinc-200">
                    <SelectItem value="Bank Account" className="text-zinc-900 font-bold hover:bg-zinc-100 focus:bg-zinc-100">Bank Account</SelectItem>
                    <SelectItem value="USDT (TRC20)" className="text-zinc-900 font-bold hover:bg-zinc-100 focus:bg-zinc-100">USDT (TRC20)</SelectItem>
                    <SelectItem value="Bitcoin (BTC)" className="text-zinc-900 font-bold hover:bg-zinc-100 focus:bg-zinc-100">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="Ethereum (ETH)" className="text-zinc-900 font-bold hover:bg-zinc-100 focus:bg-zinc-100">Ethereum (ETH)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Amount</label>
                <Input 
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-zinc-50 border-zinc-200 h-12 rounded-xl text-zinc-900 font-bold placeholder:text-zinc-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Receive to Details</label>
                <Input 
                  placeholder="Wallet address or Bank info"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="bg-zinc-50 border-zinc-200 h-12 rounded-xl text-zinc-900 font-bold placeholder:text-zinc-400"
                />
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading || !method || !amount || !details}
              className="w-full bg-[#A6760E] hover:bg-[#8e650c] text-white h-12 font-black uppercase rounded-xl shadow-lg shadow-amber-500/20"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Withdrawal"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalRequestModal;
