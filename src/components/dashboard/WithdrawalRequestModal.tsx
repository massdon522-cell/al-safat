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
  Check,
  ShieldCheck,
  Clock
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
  const [step, setStep] = useState<'form' | 'receipt' | 'payment' | 'pending'>('form');
  const [withdrawalId, setWithdrawalId] = useState<string | null>(null);
  const [lastWithdrawalData, setLastWithdrawalData] = useState<any>(null);
  const [paymentInstructions, setPaymentInstructions] = useState("");
  const [withdrawalCode, setWithdrawalCode] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [copiedLine, setCopiedLine] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchPaymentSettings();
      restoreState();
    }
  }, [isOpen, user]);

  const restoreState = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Check for pending/rejected code submission
      const { data: subData } = await supabase
        .from('withdrawal_code_submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subData) {
        setSubmissionStatus(subData.status);
        setRejectionReason(subData.admin_notes);
        
        if (subData.status === 'pending' || subData.status === 'rejected') {
          setStep('pending');
          setLoading(false);
          return;
        }
      }

      // 2. Check for active withdrawal
      const { data: withdrawalData } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['awaiting_payment', 'pending'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (withdrawalData) {
        setWithdrawalId(withdrawalData.id);
        setLastWithdrawalData(withdrawalData);
        
        if (withdrawalData.status === 'pending') {
          setStep('pending');
          setSubmissionStatus('approved'); // Visual cue that code part is done
        } else {
          setStep('payment');
        }
      } else {
        setStep('form');
      }
    } catch (err) {
      console.error("Error restoring state:", err);
    } finally {
      setLoading(false);
    }
  };

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


  const handleCopy = (text: string, index: number) => {
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
          status: 'awaiting_payment'
        })
        .select()
        .single();

      if (submitError) throw submitError;
      
      setWithdrawalId(withdrawalData.id);
      setLastWithdrawalData(withdrawalData);
      setStep('receipt'); // Go to receipt step first
      
    } catch (err: any) {
      console.error("Error submitting withdrawal:", err);
      const isNetworkError = err.message?.includes('fetch') || err.message?.includes('NetworkError');
      setError(isNetworkError 
        ? "Network connection error! Please check your internet and try again." 
        : "Failed to submit withdrawal request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadReceipt = async () => {
    if (!user || !withdrawalId || !withdrawalCode) return;
    setLoading(true);
    try {
      const { error: subError } = await supabase
        .from('withdrawal_code_submissions')
        .upsert({
          user_id: user.id,
          code: withdrawalCode,
          receipt_url: "",
          status: 'pending',
          admin_notes: null // Reset rejection notes if any
        }, { onConflict: 'user_id' });

      if (subError) throw subError;

      setSubmissionStatus('pending');
      setStep('pending');
      toast.success("Withdrawal code submitted for review!");
    } catch (err: any) {
      console.error("Error submitting code:", err);
      toast.error(err.message || "Failed to submit code.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextFromReceipt = () => {
    setStep('payment');
  };

  const handleDownloadReceipt = () => {
    window.print();
    toast.info("Preparing receipt for download/print...");
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

  const renderStep = () => {
    switch (step) {
      case 'receipt':
        return (
          <div className="p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Premium Receipt UI */}
            <div id="withdrawal-receipt" className="relative overflow-hidden bg-white border-2 border-zinc-100 rounded-3xl p-8 shadow-2xl">
              {/* Watermark Logo */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none">
                <ShieldCheck className="w-64 h-64 text-black" />
              </div>

              {/* Header */}
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-amber-500 rounded-lg flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5 text-black" />
                    </div>
                    <h1 className="text-xl font-black italic uppercase tracking-tighter text-black">
                      AL SAFAT
                    </h1>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Withdrawal Receipt</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Transaction ID</p>
                  <p className="text-xs font-mono font-bold text-zinc-900">#{withdrawalId?.slice(-8).toUpperCase()}</p>
                </div>
              </div>

              {/* Receipt Content */}
              <div className="space-y-6 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Amount</p>
                    <p className="text-lg font-black text-amber-600">{symbol}{lastWithdrawalData?.amount?.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Method</p>
                    <p className="text-sm font-bold text-zinc-900">{lastWithdrawalData?.method}</p>
                  </div>
                </div>

                <div className="space-y-1 border-t border-zinc-100 pt-4">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Recipient Details</p>
                  <p className="text-xs font-medium text-zinc-900 break-all bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    {lastWithdrawalData?.details}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Date</p>
                    <p className="text-xs font-bold text-zinc-900">
                      {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Time</p>
                    <p className="text-xs font-bold text-zinc-900">
                      {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-700 tracking-widest">Status</span>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 rounded-full">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-black tracking-widest">Awaiting Verification</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-dashed border-zinc-200 text-center relative z-10">
                <p className="text-[10px] text-zinc-400 font-medium italic">
                  This is an electronically generated receipt for your investment withdrawal on Al Safat Platform.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleDownloadReceipt}
                variant="outline"
                className="w-full border-zinc-200 text-zinc-600 font-bold h-12 rounded-xl flex items-center justify-center gap-2 mb-2"
              >
                <TrendingUp className="h-4 w-4 rotate-180" /> Download Receipt
              </Button>
              <Button 
                onClick={handleNextFromReceipt}
                disabled={loading}
                className="w-full bg-[#A6760E] hover:bg-[#8e650c] text-white h-12 font-black uppercase rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue Payment"}
              </Button>
            </div>
          </div>
        );
      case 'payment':
        return (
          <div className="p-8 space-y-6 animate-in fade-in duration-500">
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

            <div className="space-y-4 border-t border-zinc-100 pt-6">
              <div className="space-y-2">
                 <Label className="text-zinc-400 text-xs font-black uppercase tracking-widest">Withdrawal Code</Label>
                 <Input 
                   placeholder="Enter required code"
                   value={withdrawalCode}
                   onChange={(e) => setWithdrawalCode(e.target.value)}
                   className="h-12 border-amber-200 focus:border-amber-500 rounded-xl font-bold text-center tracking-[0.2em]"
                 />
              </div>

              <Button 
                 onClick={handleUploadReceipt}
                 disabled={loading || !withdrawalCode}
                 className="w-full bg-[#A6760E] hover:bg-[#8e650c] text-white font-black uppercase h-12 rounded-xl shadow-lg"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Code"}
              </Button>
            </div>
          </div>
        );
      case 'pending':
        return (
          <div className="p-8 text-center space-y-6 animate-in fade-in duration-500">
             {submissionStatus === 'approved' ? (
                <>
                  <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck className="h-10 w-10 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase text-emerald-600">Withdrawal Approved</h3>
                    <p className="text-sm text-zinc-500 font-medium pt-2 italic">Your withdrawal is being processed by the finance team. Funds will arrive shortly.</p>
                  </div>
                  <Button onClick={onClose} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl mt-4">
                    Done
                  </Button>
                </>
             ) : submissionStatus === 'rejected' ? (
                <>
                  <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle className="h-10 w-10 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase text-red-600">Code Rejected</h3>
                    <p className="text-sm text-zinc-500 font-medium pt-2">{rejectionReason}</p>
                  </div>
                  <Button onClick={() => setStep('payment')} className="w-full bg-zinc-900 hover:bg-black text-white font-bold h-12 rounded-xl mt-4">
                    Try Again
                  </Button>
                </>
             ) : (
                <>
                  <div className="h-20 w-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="h-10 w-10 text-amber-600 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase text-zinc-900">Pending Approval</h3>
                    <p className="text-sm text-zinc-500 font-medium pt-2 italic">Our team is verifying your withdrawal code. This usually takes 1-2 hours.</p>
                  </div>
                  <Button onClick={onClose} variant="outline" className="w-full border-zinc-200 text-zinc-500 font-bold h-12 rounded-xl mt-4">
                    Close Window
                  </Button>
                </>
             )}
          </div>
        );
      case 'form':
      default:
        return (
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
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        // Delay resetting step to avoid jumpy UI during close animation
        setTimeout(() => setStep('form'), 300);
      }
    }}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-y-auto max-h-[95vh] border-none bg-white rounded-xl shadow-2xl">
        <DialogHeader className="bg-[#A6760E] text-white p-6 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold italic uppercase tracking-tighter flex items-center gap-2">
            {step === 'receipt' ? "Withdrawal Receipt" : step === 'payment' ? "Withdrawal Code Payment" : step === 'pending' ? "Status" : "Withdrawal Request"}
            {(step === 'payment' || step === 'pending') && <ShieldCheck className="h-5 w-5" />}
          </DialogTitle>
          <DialogClose className="opacity-70 hover:opacity-100 transition-opacity">
            <X className="h-6 w-6" />
          </DialogClose>
        </DialogHeader>

        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalRequestModal;
