import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Coins, 
  Plus, 
  Trash2, 
  Edit, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Hash,
  Type
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  is_active: boolean;
}

const AdminCurrencyManagement = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    symbol: "",
    is_active: true
  });

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const { data, error } = await supabase
        .from('currencies')
        .select('*')
        .order('code', { ascending: true });
      
      if (error) throw error;
      setCurrencies(data || []);
    } catch (error) {
      console.error('Error fetching currencies:', error);
      toast.error('Failed to load currencies');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCurrency = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('currencies')
        .insert([formData]);

      if (error) throw error;
      
      toast.success('Currency added successfully');
      setIsAddModalOpen(false);
      setFormData({ code: "", name: "", symbol: "", is_active: true });
      fetchCurrencies();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add currency');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCurrency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCurrency) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('currencies')
        .update({
          code: formData.code,
          name: formData.name,
          symbol: formData.symbol,
          is_active: formData.is_active
        })
        .eq('id', editingCurrency.id);

      if (error) throw error;
      
      toast.success('Currency updated successfully');
      setIsEditModalOpen(false);
      setEditingCurrency(null);
      fetchCurrencies();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update currency');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCurrency = async (id: string) => {
    if (!confirm('Are you sure you want to delete this currency? This may affect users using it.')) return;
    
    try {
      const { error } = await supabase
        .from('currencies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Currency deleted');
      fetchCurrencies();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete currency');
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950 p-6 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white uppercase italic tracking-tighter">
            Platform Currencies <Coins className="h-6 w-6 text-amber-500" />
          </h2>
          <p className="text-zinc-500 text-sm italic">Manage the currencies available for user accounts and transactions.</p>
        </div>
        <Button 
          onClick={() => {
            setFormData({ code: "", name: "", symbol: "", is_active: true });
            setIsAddModalOpen(true);
          }}
          className="bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-widest rounded-xl px-6 h-11"
        >
          <Plus className="h-5 w-5 mr-2" /> Add Currency
        </Button>
      </div>

      <div className="bg-zinc-950 rounded-2xl border border-white/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-zinc-400">Code</TableHead>
              <TableHead className="text-zinc-400">Name</TableHead>
              <TableHead className="text-zinc-400">Symbol</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-right text-zinc-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currencies.map((currency) => (
              <TableRow key={currency.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                <TableCell className="font-black text-amber-500 uppercase tracking-widest">{currency.code}</TableCell>
                <TableCell className="text-white font-medium">{currency.name}</TableCell>
                <TableCell className="text-white font-mono">{currency.symbol}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    currency.is_active 
                      ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" 
                      : "bg-zinc-500/20 text-zinc-500 border border-zinc-500/30"
                  }`}>
                    {currency.is_active ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setEditingCurrency(currency);
                      setFormData({
                        code: currency.code,
                        name: currency.name,
                        symbol: currency.symbol,
                        is_active: currency.is_active
                      });
                      setIsEditModalOpen(true);
                    }}
                    className="bg-zinc-900/50 hover:bg-amber-500 hover:text-black transition-all rounded-lg border border-white/5"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteCurrency(currency.id)}
                    className="bg-zinc-900/50 hover:bg-red-500 hover:text-white transition-all rounded-lg border border-white/5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {currencies.length === 0 && (
          <div className="p-12 text-center text-zinc-500 italic">
            No currencies defined yet. Add your first one above.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setEditingCurrency(null);
        }
      }}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white rounded-3xl overflow-hidden shadow-2xl p-0 max-w-md">
          <DialogHeader className="p-8 bg-gradient-to-r from-zinc-900 to-amber-900/20 border-b border-white/5">
            <DialogTitle className="text-2xl font-black text-amber-500 italic uppercase tracking-tighter flex items-center gap-3">
              {isAddModalOpen ? <Plus className="h-6 w-6" /> : <Edit className="h-6 w-6" />}
              {isAddModalOpen ? 'Add Currency' : 'Edit Currency'}
            </DialogTitle>
            <DialogDescription className="text-zinc-500 italic mt-1">
              Define the global currency settings for the platform.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={isAddModalOpen ? handleAddCurrency : handleUpdateCurrency} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                  <Hash className="h-3 w-3" /> Currency Code (e.g. USD)
                </Label>
                <Input 
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="bg-zinc-900 border-white/5 focus:border-amber-500/50 h-11 transition-all uppercase font-black tracking-widest"
                  placeholder="USD"
                  maxLength={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                  <Type className="h-3 w-3" /> Currency Name
                </Label>
                <Input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-zinc-900 border-white/5 focus:border-amber-500/50 h-11 transition-all"
                  placeholder="US Dollar"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                  <Coins className="h-3 w-3" /> Currency Symbol
                </Label>
                <Input 
                  required
                  value={formData.symbol}
                  onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                  className="bg-zinc-900 border-white/5 focus:border-amber-500/50 h-11 transition-all font-mono"
                  placeholder="$"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input 
                  type="checkbox" 
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 rounded border-amber-500/30 bg-zinc-900 text-amber-500 focus:ring-amber-500/50"
                />
                <Label htmlFor="is_active" className="text-sm font-bold text-white uppercase tracking-wider cursor-pointer">
                  Is Active & Visible
                </Label>
              </div>
            </div>

            <DialogFooter className="pt-6 border-t border-white/5 flex gap-3">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="flex-1 rounded-xl h-11 uppercase font-bold text-[10px] tracking-widest hover:bg-white/5 border border-white/5 text-zinc-400"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting}
                className="flex-[2] bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-widest rounded-xl h-11 shadow-xl shadow-amber-500/20 transition-all border-none"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (isAddModalOpen ? "Register Currency" : "Save Changes")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCurrencyManagement;
