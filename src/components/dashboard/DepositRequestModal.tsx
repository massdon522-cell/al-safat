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
  Copy, 
  Check, 
  AlertTriangle, 
  X,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface DepositMethod {
  id: string;
  name: string;
  deposit_address: string;
  qr_code_url?: string;
}

interface DepositRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  symbol: string;
}

const DepositRequestModal: React.FC<DepositRequestModalProps> = ({ isOpen, onClose, currency, symbol }) => {
  const { user } = useAuth();
  const [methods, setMethods] = useState<DepositMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [payerAddress, setPayerAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingMethods, setFetchingMethods] = useState(true);
  const [copied, setCopied] = useState(false);

  const selectedMethod = methods.find(m => m.id === selectedMethodId);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const { data, error } = await supabase
          .from('deposit_methods')
          .select('*')
          .eq('is_active', true);
        
        if (error) throw error;
        setMethods(data || []);
      } catch (err) {
        console.error("Error fetching methods:", err);
      } finally {
        setFetchingMethods(false);
      }
    };

    if (isOpen) {
      fetchMethods();
    }
  }, [isOpen]);

  const handleCopy = () => {
    if (!selectedMethod) return;
    navigator.clipboard.writeText(selectedMethod.deposit_address);
    setCopied(true);
    toast.success("Address copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedMethodId || !amount || !payerAddress) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          method_id: selectedMethodId,
          amount: parseFloat(amount),
          payer_address: payerAddress,
          status: 'pending'
        });

      if (error) throw error;

      toast.success("Deposit request submitted successfully!");
      onClose();
      // Reset form
      setSelectedMethodId("");
      setAmount("");
      setPayerAddress("");
    } catch (err) {
      console.error("Error submitting request:", err);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-y-auto max-h-[95vh] border-none bg-white rounded-xl">
        <DialogHeader className="bg-[#A6760E] text-white p-6 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">Deposit Request</DialogTitle>
          <DialogClose className="opacity-70 hover:opacity-100 transition-opacity">
            <X className="h-6 w-6" />
          </DialogClose>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Deposit Method */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#A6760E] uppercase">Deposit Method</label>
            <Select onValueChange={setSelectedMethodId} value={selectedMethodId}>
              <SelectTrigger className="bg-white border-amber-200 focus:ring-amber-500 text-black font-bold">
                <SelectValue placeholder="Select Method" />
              </SelectTrigger>
              <SelectContent>
                {fetchingMethods ? (
                  <div className="p-2 flex justify-center"><Loader2 className="h-4 w-4 animate-spin" /></div>
                ) : (
                  methods.map(m => (
                    <SelectItem key={m.id} value={m.id} className="text-zinc-900 font-medium">{m.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Deposit Amount */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#A6760E] uppercase">Deposit Amount ({currency})</label>
            <Input 
              type="number"
              placeholder={`Enter amount to deposit in ${currency}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-white border-amber-200 focus:ring-amber-500 text-black font-bold"
            />
          </div>

          {/* Payer Address */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#A6760E] uppercase">Payers Deposit Address</label>
            <Input 
              placeholder="Paste Your Wallet Address"
              value={payerAddress}
              onChange={(e) => setPayerAddress(e.target.value)}
              className="bg-white border-amber-200 focus:ring-amber-500 text-black font-bold"
            />
          </div>

          {/* Company Address & QR Code */}
          {selectedMethod && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex flex-col items-center gap-4 text-center">
                <label className="text-xs font-black text-[#A6760E] uppercase tracking-widest">
                  Payment Instructions
                </label>
                
                {selectedMethod.qr_code_url && (
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-amber-100">
                    <img 
                      src={selectedMethod.qr_code_url} 
                      alt="Deposit QR" 
                      className="h-32 w-32 object-contain"
                    />
                  </div>
                )}

                <div className="space-y-2 w-full">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                    Pay To This {selectedMethod.name} Address
                  </p>
                  <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-amber-100 group">
                    <span className="text-xs font-mono font-bold text-zinc-900 truncate flex-1">
                      {selectedMethod.deposit_address}
                    </span>
                    <button 
                      type="button"
                      onClick={handleCopy}
                      className="p-2 hover:bg-amber-50 rounded-lg transition-all text-[#A6760E]"
                      title="Copy Address"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warning Message */}
          <div className="flex gap-2 text-[12px] leading-snug text-red-500 font-medium bg-red-50 p-3 rounded-lg border border-red-100">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p>
              Please select a deposit method before copying address and make sure payment is made before clicking submit request button
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-amber-500 text-amber-600 hover:bg-amber-50 px-8 py-2 font-bold"
            >
              Close
            </Button>
            <Button 
              type="submit"
              disabled={loading || !selectedMethodId || !amount || !payerAddress}
              className="bg-[#A6760E] hover:bg-[#8e650c] text-white px-8 py-2 font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DepositRequestModal;
