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
  PlusCircle, 
  X,
  Loader2,
  Wallet,
  TrendingUp,
  AlertTriangle,
  Info
} from "lucide-react";
import { toast } from "sonner";

interface InvestmentPlan {
  id: string;
  name: string;
  min_amount: number;
  max_amount: number;
  duration_days: number;
  return_percentage: number;
}

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  symbol: string;
}

const InvestmentModal: React.FC<InvestmentModalProps> = ({ isOpen, onClose, availableBalance, symbol }) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingPlans, setFetchingPlans] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('investment_plans')
          .select('*')
          .eq('active', true);
        if (error) throw error;
        setPlans(data || []);
      } catch (err) {
        console.error("Error fetching plans:", err);
      } finally {
        setFetchingPlans(false);
      }
    };
    if (isOpen) fetchPlans();
  }, [isOpen]);

  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  const projectedReturn = selectedPlan && amount ? (parseFloat(amount) * (1 + selectedPlan.return_percentage / 100)).toFixed(2) : "0.00";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user || !selectedPlanId || !amount) {
      setError("Please select a plan and enter an amount");
      return;
    }

    const investAmount = parseFloat(amount);
    if (investAmount > availableBalance) {
      setError(`Insufficient balance! Your current balance is ${symbol}${availableBalance.toLocaleString()}`);
      return;
    }

    if (investAmount < selectedPlan.min_amount || investAmount > selectedPlan.max_amount) {
      setError(`Amount must be between ${symbol}${selectedPlan.min_amount} and ${symbol}${selectedPlan.max_amount} for this plan`);
      return;
    }

    setLoading(true);
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + selectedPlan.duration_days);

      const { error: submitError } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          plan_id: selectedPlanId,
          plan_name: selectedPlan?.name,
          amount: investAmount,
          return_amount: parseFloat(projectedReturn),
          end_date: endDate.toISOString(),
          status: 'active'
        });

      if (submitError) throw submitError;

      // 2. Fetch current wallet stats
      const { data: wallet, error: walletFetchError } = await supabase
        .from('wallets')
        .select('balance, total_investments')
        .eq('user_id', user.id)
        .single();

      if (walletFetchError) throw walletFetchError;

      // 3. Deduct from balance and increment total_investments
      const { error: walletUpdateError } = await supabase
        .from('wallets')
        .update({ 
          balance: Number(wallet.balance) - investAmount,
          total_investments: Number(wallet.total_investments || 0) + investAmount
        })
        .eq('user_id', user.id);

      if (walletUpdateError) throw walletUpdateError;

      // 4. Log a transaction
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'investment',
        amount: investAmount,
        status: 'completed',
        description: `Investment in ${selectedPlan.name} plan`
      });

      toast.success("Investment successful!");
      onClose();
      setAmount("");
      setSelectedPlanId("");
    } catch (err) {
      console.error("Error investing:", err);
      setError("Failed to create investment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-y-auto max-h-[95vh] border-none bg-white rounded-xl">
        <DialogHeader className="bg-[#D48806] text-white p-6 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">Investment Request</DialogTitle>
          <DialogClose className="opacity-70 hover:opacity-100 transition-opacity">
            <X className="h-6 w-6" />
          </DialogClose>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {/* Plan Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#D48806]">Investment Plan</label>
              <Select onValueChange={(val) => { setSelectedPlanId(val); setError(null); }} value={selectedPlanId}>
                <SelectTrigger className="bg-white border-amber-500 focus:ring-amber-500 text-black">
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent className="bg-white border-amber-100">
                  {fetchingPlans ? (
                    <div className="p-2 flex justify-center"><Loader2 className="h-4 w-4 animate-spin text-amber-500" /></div>
                  ) : (
                    plans.map(p => (
                      <SelectItem key={p.id} value={p.id} className="text-zinc-900 font-medium">
                        {p.name.toUpperCase()}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedPlan && (
              <div className="space-y-6 text-base text-zinc-800 font-bold py-2">
                <p>Percentage Returns: {selectedPlan.return_percentage}%</p>
                
                <p>Investment Duration: {selectedPlan.duration_days >= 7 
                  ? `${Math.floor(selectedPlan.duration_days / 7)} ${Math.floor(selectedPlan.duration_days / 7) === 1 ? 'week' : 'weeks'}` 
                  : `${selectedPlan.duration_days} days`}
                </p>
                
                <p>Investment Amounts: {symbol}{selectedPlan.min_amount.toLocaleString()}-{selectedPlan.max_amount >= 9999999 ? 'Unlimited' : `${symbol}${selectedPlan.max_amount.toLocaleString()}`}</p>
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#D48806]">Investment Amount</label>
            <Input 
              type="number"
              placeholder="Enter amount to invest"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(null); }}
              className="bg-white border-amber-500 focus:ring-amber-500 text-black"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6">
            <Button 
              type="button" 
              onClick={onClose}
              className="bg-[#D48806] hover:bg-[#b87605] text-white px-8 py-2 font-bold rounded"
            >
              Close
            </Button>
            <Button 
              type="submit"
              disabled={loading || !selectedPlanId || !amount}
              className="bg-[#D48806] hover:bg-[#b87605] text-white px-8 py-2 font-bold rounded"
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

export default InvestmentModal;
