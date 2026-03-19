import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { 
  X,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface ReferralTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableProfit: number;
  currency: string;
  symbol: string;
}

const ReferralTransferModal: React.FC<ReferralTransferModalProps> = ({ isOpen, onClose, availableProfit, currency, symbol }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const transferAmount = parseFloat(amount);
    if (!amount || transferAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (transferAmount > availableProfit) {
      setError("You dont have up to such amount to transfer");
      return;
    }

    setLoading(true);
    try {
      // In a real app, this should be a transaction/RPC to be atomic
      // But for this exercise, we'll do sequential updates as the user asked for simple logic
      
      const { data: wallet, error: fetchError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from('wallets')
        .update({
          profit: Number(wallet.profit) - transferAmount,
          balance: Number(wallet.balance) + transferAmount
        })
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      toast.success("Earnings transferred to balance successfully!");
      onClose();
      setAmount("");
    } catch (err) {
      console.error("Error transferring earnings:", err);
      setError("Failed to transfer earnings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none bg-white rounded-xl">
        <DialogHeader className="bg-[#D48806] text-white p-6 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">Referal Earnings Transfer to Balance</DialogTitle>
          <DialogClose className="opacity-70 hover:opacity-100 transition-opacity">
            <X className="h-6 w-6" />
          </DialogClose>
        </DialogHeader>

        <form onSubmit={handleTransfer} className="p-0 space-y-0">
          {error && (
            <div className="bg-[#fee2e2] p-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="w-6 h-6 rounded-full bg-[#991b1b] flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <p className="text-[#991b1b] text-base font-medium">{error}</p>
            </div>
          )}

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <label className="text-lg font-bold text-[#D48806]">Transfer Amount ({currency})</label>
              <Input 
                type="number"
                placeholder={`${symbol}${availableProfit.toLocaleString()}`}
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(null); }}
                className="bg-white border-amber-500 focus:ring-amber-500 text-zinc-900 text-xl py-6"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
              <Button 
                type="button" 
                onClick={onClose}
                className="bg-[#D48806] hover:bg-[#b87605] text-white px-8 py-2 font-bold rounded text-lg h-auto"
              >
                Close
              </Button>
              <Button 
                type="submit"
                disabled={loading || !amount}
                className="bg-[#D48806] hover:bg-[#b87605] text-white px-8 py-2 font-bold rounded text-lg h-auto"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Transfer Now
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReferralTransferModal;
