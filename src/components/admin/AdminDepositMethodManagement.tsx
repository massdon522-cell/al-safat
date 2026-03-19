import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Wallet,
  Link,
  Image as ImageIcon
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface DepositMethod {
  id: string;
  name: string;
  deposit_address: string;
  qr_code_url: string;
  is_active: boolean;
  created_at: string;
}

const AdminDepositMethodManagement = () => {
  const [methods, setMethods] = useState<DepositMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<DepositMethod | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    deposit_address: "",
    qr_code_url: "",
    is_active: true
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('deposit_methods')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMethods(data || []);
    } catch (error) {
      console.error('Error fetching deposit methods:', error);
      toast.error('Failed to load deposit methods');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      if (editingMethod) {
        const { error } = await supabase
          .from('deposit_methods')
          .update(formData)
          .eq('id', editingMethod.id);
        if (error) throw error;
        toast.success('Deposit method updated successfully');
      } else {
        const { error } = await supabase
          .from('deposit_methods')
          .insert([formData]);
        if (error) throw error;
        toast.success('Deposit method added successfully');
      }
      setIsModalOpen(false);
      setEditingMethod(null);
      setFormData({ name: "", deposit_address: "", qr_code_url: "", is_active: true });
      fetchMethods();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save deposit method');
    } finally {
      setProcessing(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('deposit_methods')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      fetchMethods();
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const deleteMethod = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deposit method?')) return;
    try {
      const { error } = await supabase
        .from('deposit_methods')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchMethods();
      toast.success('Deposit method deleted');
    } catch (error) {
      toast.error('Failed to delete deposit method');
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
            Platform Deposit Methods <Wallet className="h-6 w-6 text-emerald-500" />
          </h2>
          <p className="text-zinc-500 text-sm">Manage payment addresses and account numbers for users</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase rounded-xl gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all relative z-10"
        >
          <Plus className="h-4 w-4" /> Add New Method
        </Button>
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setEditingMethod(null);
            setFormData({ name: "", deposit_address: "", qr_code_url: "", is_active: true });
          }
        }}>
          <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-amber-500 italic uppercase">
                {editingMethod ? "Edit Method" : "New Deposit Method"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Method Name</Label>
                <Input
                  placeholder="e.g. Bitcoin (BTC), Bank Transfer"
                  className="bg-zinc-900 border-white/10"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Deposit Address / Account No.</Label>
                <Input
                  placeholder="The address or account number users should pay to"
                  className="bg-zinc-900 border-white/10"
                  value={formData.deposit_address}
                  onChange={(e) => setFormData({ ...formData, deposit_address: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                  <ImageIcon className="h-3 w-3" /> QR Code URL (Optional)
                </Label>
                <Input
                  placeholder="URL to the QR code image"
                  className="bg-zinc-900 border-white/10 font-mono text-xs"
                  value={formData.qr_code_url}
                  onChange={(e) => setFormData({ ...formData, qr_code_url: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-2xl border border-white/5">
                <div className="space-y-0.5">
                  <Label className="text-white font-bold uppercase text-[10px] tracking-widest">Active Status</Label>
                  <p className="text-xs text-zinc-500 text-nowrap">Visible to users in deposit dropdown</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black uppercase rounded-xl h-12"
                disabled={processing}
              >
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : editingMethod ? "Update Method" : "Add Method"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-zinc-950 rounded-2xl border border-white/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-zinc-400">Method Name</TableHead>
              <TableHead className="text-zinc-400">Payment Details</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-right text-zinc-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {methods.map((method) => (
              <TableRow key={method.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                <TableCell className="font-bold text-white uppercase tracking-tight italic">
                  {method.name}
                </TableCell>
                <TableCell className="max-w-[300px]">
                  <p className="text-xs text-zinc-400 font-mono truncate bg-black/30 p-2 rounded border border-white/5 flex items-center gap-2">
                    <Link className="h-3 w-3 shrink-0" /> {method.deposit_address}
                  </p>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => toggleStatus(method.id, method.is_active)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                      method.is_active 
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                        : "bg-red-500/10 text-red-500 border border-red-500/20"
                    }`}
                  >
                    {method.is_active ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {method.is_active ? "Active" : "Inactive"}
                  </button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg hover:bg-amber-500 hover:text-black text-zinc-500 transition-all border border-transparent hover:border-amber-500"
                      onClick={() => {
                        setEditingMethod(method);
                        setFormData({
                          name: method.name,
                          deposit_address: method.deposit_address,
                          qr_code_url: method.qr_code_url || "",
                          is_active: method.is_active
                        });
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg hover:bg-red-500 hover:text-white text-zinc-500 transition-all border border-transparent hover:border-red-500"
                      onClick={() => deleteMethod(method.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {methods.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-zinc-500 font-medium">
                  No deposit methods registered. Click "Add New Method" to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminDepositMethodManagement;
