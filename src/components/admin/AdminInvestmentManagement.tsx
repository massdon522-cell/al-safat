import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  TrendingUp, 
  Calendar, 
  User, 
  CheckCircle2, 
  Clock, 
  Loader2,
  Plus,
  Settings,
  Trash2,
  Percent,
  DollarSign
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Investment {
  id: string;
  user_id: string;
  amount: number;
  return_amount: number;
  status: string;
  start_date: string;
  end_date: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
  investment_plans: {
    name: string;
  };
}

interface InvestmentPlan {
  id: string;
  name: string;
  min_amount: number;
  max_amount: number;
  duration_days: number;
  return_percentage: number;
  active: boolean;
}

const AdminInvestmentManagement = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  // Plan Management State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<InvestmentPlan> | null>(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: invData, error: invError } = await supabase
        .from('investments')
        .select(`
          *,
          profiles!user_id (first_name, last_name),
          investment_plans!plan_id (name)
        `)
        .order('created_at', { ascending: false });
      
      if (invError) throw invError;
      setInvestments(invData as any || []);

      const { data: planData, error: planError } = await supabase
        .from('investment_plans')
        .select('*')
        .order('min_amount', { ascending: true });
      
      if (planError) throw planError;
      setPlans(planData || []);

    } catch (error) {
      console.error('Error fetching investment data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseProfit = async (investment: Investment) => {
    setProcessing(investment.id);
    try {
      // 1. Update investment status
      const { error: invError } = await supabase
        .from('investments')
        .update({ status: 'completed' })
        .eq('id', investment.id);

      if (invError) throw invError;

      // 2. Credit user's profit balance
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('profit')
        .eq('user_id', investment.user_id)
        .single();

      if (walletError) throw walletError;

      const { error: walletUpdateError } = await supabase
        .from('wallets')
        .update({ profit: Number(wallet.profit) + Number(investment.return_amount) })
        .eq('user_id', investment.user_id);

      if (walletUpdateError) throw walletUpdateError;

      // 3. Log transaction
      await supabase.from('transactions').insert({
        user_id: investment.user_id,
        type: 'profit',
        amount: investment.return_amount,
        status: 'completed',
        description: `Profit release for ${investment.investment_plans?.name} plan`
      });

      toast.success('Profit released successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to release profit');
    } finally {
      setProcessing(null);
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan?.name) return;

    setIsSavingPlan(true);
    try {
      const planData = {
        name: editingPlan.name,
        min_amount: Number(editingPlan.min_amount),
        max_amount: Number(editingPlan.max_amount),
        duration_days: Number(editingPlan.duration_days),
        return_percentage: Number(editingPlan.return_percentage),
        active: editingPlan.active ?? true
      };

      if (editingPlan.id) {
        const { error } = await supabase
          .from('investment_plans')
          .update(planData)
          .eq('id', editingPlan.id);
        if (error) throw error;
        toast.success('Plan updated successfully');
      } else {
        const { error } = await supabase
          .from('investment_plans')
          .insert(planData);
        if (error) throw error;
        toast.success('Plan created successfully');
      }

      setIsPlanModalOpen(false);
      setEditingPlan(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save plan');
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      const { error } = await supabase
        .from('investment_plans')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Plan deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete plan');
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
      <Tabs defaultValue="active" className="w-full">
        <div className="flex justify-between items-center bg-zinc-950 p-6 rounded-t-2xl border-x border-t border-white/5">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white italic uppercase tracking-tighter">
               Investment Hub <TrendingUp className="h-6 w-6 text-purple-500" />
            </h2>
            <p className="text-zinc-500 text-sm italic">Monitor and manage ROI distributions</p>
          </div>
          <TabsList className="bg-zinc-900 border border-white/10 rounded-xl p-1">
            <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-black">
               Live Cycles
            </TabsTrigger>
            <TabsTrigger value="plans" className="rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-black">
               Plan Management
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="active" className="mt-0">
          <div className="bg-zinc-950 rounded-b-2xl border border-white/5 overflow-hidden">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Investor</TableHead>
                  <TableHead className="text-zinc-400">Plan</TableHead>
                  <TableHead className="text-zinc-400">Capital</TableHead>
                  <TableHead className="text-zinc-400">Projected Return</TableHead>
                  <TableHead className="text-zinc-400">Ends At</TableHead>
                  <TableHead className="text-right text-zinc-400">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investments.map((inv) => (
                  <TableRow key={inv.id} className="border-white/5 hover:bg-white/5 text-xs">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-zinc-500" />
                        <span className="font-bold">{inv.profiles?.first_name} {inv.profiles?.last_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                       <span className="font-black text-white/80 uppercase">{inv.investment_plans?.name}</span>
                    </TableCell>
                    <TableCell className="font-mono text-emerald-500 font-bold">
                       ${inv.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-purple-400 font-bold">
                       +${inv.return_amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-zinc-500">
                       {new Date(inv.end_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                       {inv.status === 'active' ? (
                         <Button 
                           size="sm" 
                           onClick={() => handleReleaseProfit(inv)}
                           disabled={processing === inv.id}
                           className="bg-purple-500 hover:bg-purple-600 text-black font-bold h-7 px-3 rounded-lg"
                         >
                           {processing === inv.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Release"}
                         </Button>
                       ) : (
                         <div className="flex items-center justify-end gap-1 text-emerald-500 font-black uppercase text-[10px]">
                            <CheckCircle2 className="h-3 w-3" /> Done
                         </div>
                       )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {investments.length === 0 && (
              <div className="p-12 text-center text-zinc-600 italic">No active investments found.</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="plans" className="mt-0">
          <div className="bg-zinc-950 rounded-b-2xl border border-white/5 p-6 space-y-6">
            <div className="flex justify-end">
               <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => setEditingPlan({ 
                        name: '', 
                        min_amount: 0, 
                        max_amount: 0, 
                        duration_days: 7, 
                        return_percentage: 0, 
                        active: true 
                      })}
                      className="bg-zinc-900 border border-white/10 hover:bg-amber-500 hover:text-black transition-all gap-2 rounded-xl"
                    >
                        <Plus className="h-4 w-4" /> Create New Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-black italic uppercase tracking-tighter">
                        {editingPlan?.id ? 'Modify Plan' : 'Create New Cycle'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSavePlan} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Plan Name</Label>
                        <Input 
                          value={editingPlan?.name || ''} 
                          onChange={e => setEditingPlan(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-zinc-900 border-white/10" 
                          placeholder="e.g. STARTER PLAN"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Min amount ($)</Label>
                          <Input 
                            type="number"
                            value={editingPlan?.min_amount || ''} 
                            onChange={e => setEditingPlan(prev => ({ ...prev, min_amount: Number(e.target.value) }))}
                            className="bg-zinc-900 border-white/10" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Max amount ($)</Label>
                          <Input 
                            type="number"
                            value={editingPlan?.max_amount || ''} 
                            onChange={e => setEditingPlan(prev => ({ ...prev, max_amount: Number(e.target.value) }))}
                            className="bg-zinc-900 border-white/10" 
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Duration (Days)</Label>
                          <Input 
                            type="number"
                            value={editingPlan?.duration_days || ''} 
                            onChange={e => setEditingPlan(prev => ({ ...prev, duration_days: Number(e.target.value) }))}
                            className="bg-zinc-900 border-white/10" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>ROI (%)</Label>
                          <Input 
                            type="number"
                            step="0.1"
                            value={editingPlan?.return_percentage || ''} 
                            onChange={e => setEditingPlan(prev => ({ ...prev, return_percentage: Number(e.target.value) }))}
                            className="bg-zinc-900 border-white/10" 
                          />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isSavingPlan}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black uppercase rounded-xl mt-4"
                      >
                        {isSavingPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingPlan?.id ? 'Update Configuration' : 'Deploy Plan')}
                      </Button>
                    </form>
                  </DialogContent>
               </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {plans.map((plan) => (
                 <div key={plan.id} className="bg-zinc-900 border border-white/10 p-5 rounded-2xl space-y-4 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => {
                           setEditingPlan(plan);
                           setIsPlanModalOpen(true);
                         }}
                         className="h-8 w-8 text-blue-500 hover:bg-blue-500/10"
                       >
                          <Settings className="h-4 w-4" />
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => handleDeletePlan(plan.id)}
                         className="h-8 w-8 text-red-500 hover:bg-red-500/10"
                       >
                          <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                    <div className="space-y-1">
                       <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest">{plan.name}</h4>
                       <div className="flex items-end gap-1">
                          <span className="text-2xl font-black text-white">{plan.return_percentage}%</span>
                          <span className="text-zinc-500 text-[10px] mb-1">ROI / {plan.duration_days}D</span>
                       </div>
                    </div>
                    <div className="space-y-2 text-[10px] uppercase font-bold text-zinc-400">
                       <div className="flex justify-between border-b border-white/5 pb-2">
                          <span>Min Deposit</span>
                          <span className="text-emerald-500">${plan.min_amount}</span>
                       </div>
                       <div className="flex justify-between border-b border-white/5 pb-2">
                          <span>Max Deposit</span>
                          <span className="text-emerald-500">${plan.max_amount}</span>
                       </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditingPlan(plan);
                        setIsPlanModalOpen(true);
                      }}
                      className="w-full border-white/10 hover:bg-white/5 text-xs h-8 rounded-xl"
                    >
                       <Settings className="h-3 w-3 mr-2" /> Modify Configuration
                    </Button>
                 </div>
               ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminInvestmentManagement;
