import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, 
  Search, 
  Edit, 
  Shield, 
  TrendingUp,
  Wallet,
  Loader2,
  User as UserIcon,
  Plus,
  Coins
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

interface UserWithWallet {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  country: string;
  status: string;
  kyc_status: string;
  currency: string;
  role: string;
  wallets: {
    balance: number;
    profit: number;
    total_deposits: number;
    total_withdrawals: number;
    total_investments: number;
  };
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

const AdminUserManagement = () => {
  const [users, setUsers] = useState<UserWithWallet[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<UserWithWallet | null>(null);
  const [initialWallets, setInitialWallets] = useState<UserWithWallet['wallets'] | null>(null);
  const [adjustments, setAdjustments] = useState({
    balance: 0,
    profit: 0,
    total_deposits: 0,
    total_withdrawals: 0,
    total_investments: 0
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { user: adminUser } = useAuth();

  const getSymbol = (code: string) => {
    return currencies.find(c => c.code === code)?.symbol || "$";
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([
      fetchUsers(),
      fetchCurrencies()
    ]);
    setLoading(false);
  };

  const fetchCurrencies = async () => {
    try {
      const { data, error } = await supabase
        .from('currencies')
        .select('code, name, symbol')
        .eq('is_active', true)
        .order('code', { ascending: true });
      
      if (error) throw error;
      setCurrencies(data || []);
    } catch (error) {
      console.error('Error fetching currencies:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          first_name, 
          last_name, 
          username, 
          email, 
          phone,
          country,
          status,
          kyc_status,
          currency,
          user_roles!user_id (role),
          wallets!user_id (balance, profit, total_deposits, total_withdrawals, total_investments)
        `);
      
      if (error) throw error;
      
      const formattedData = data?.map((u: any) => {
        // Handle cases where joins might return an array or a single object
        const roleData = Array.isArray(u.user_roles) ? u.user_roles[0] : u.user_roles;
        const walletData = Array.isArray(u.wallets) ? u.wallets[0] : u.wallets;

        return {
          ...u,
          role: roleData?.role || 'user',
          wallets: walletData || {
            balance: 0,
            profit: 0,
            total_deposits: 0,
            total_withdrawals: 0,
            total_investments: 0
          }
        };
      });
      
      setUsers(formattedData as any || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !initialWallets || !adminUser) return;

    setUpdating(true);
    try {
      // 1. Update Profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: editingUser.first_name,
          last_name: editingUser.last_name,
          phone: editingUser.phone,
          country: editingUser.country,
          status: editingUser.status,
          currency: editingUser.currency
        })
        .eq('id', editingUser.id);

      if (profileError) throw profileError;

      // 2. Update Role
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: editingUser.role })
        .eq('user_id', editingUser.id);

      if (roleError) throw roleError;

      // 3. Calculate Final Wallet Totals
      const finalBalance = Number(initialWallets.balance) + Number(adjustments.balance);
      const finalProfit = Number(initialWallets.profit) + Number(adjustments.profit);

      // 4. Update Wallet (Upsert)
      const { error: walletError } = await supabase
        .from('wallets')
        .upsert({
          user_id: editingUser.id,
          balance: finalBalance,
          profit: finalProfit,
          total_deposits: Number(editingUser.wallets.total_deposits),
          total_withdrawals: Number(editingUser.wallets.total_withdrawals),
          total_investments: Number(editingUser.wallets.total_investments),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (walletError) throw walletError;

      // 5. Create Audit Log Entry for Financial Adjustments
      if (adjustments.balance !== 0 || adjustments.profit !== 0) {
        await supabase
          .from('audit_logs')
          .insert({
            admin_id: adminUser.id,
            action: 'wallet_adjustment',
            target_user_id: editingUser.id,
            details: {
              balance_adjustment: adjustments.balance,
              profit_adjustment: adjustments.profit,
              new_balance: finalBalance,
              new_profit: finalProfit,
              reason: 'Admin Manual Adjustment'
            }
          });
      }

      toast.success('User updated successfully');
      setIsEditDialogOpen(false);
      setEditingUser(null);
      setInitialWallets(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
            User Management <Users className="h-6 w-6 text-amber-500" />
          </h2>
          <p className="text-zinc-500 text-sm italic">Edit balances and account status for {users.length} members</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input 
            placeholder="Search users..."
            className="pl-10 bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus:outline-none h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-zinc-950 rounded-2xl border border-white/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-zinc-400">User</TableHead>
              <TableHead className="text-zinc-400">Role</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Balance</TableHead>
              <TableHead className="text-right text-zinc-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center font-bold text-amber-500 uppercase tracking-tighter text-xs">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-white leading-none">{user.first_name} {user.last_name}</p>
                      <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">{user.currency} • {user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    user.role === 'admin' 
                      ? "bg-purple-500/20 text-purple-500 border border-purple-500/30" 
                      : "bg-blue-500/20 text-blue-500 border border-blue-500/30"
                  }`}>
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    user.status === 'active' 
                      ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" 
                      : user.status === 'suspended'
                      ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                      : "bg-red-500/20 text-red-500 border border-red-500/30"
                  }`}>
                    {user.status}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-emerald-500 font-bold">
                  {getSymbol(user.currency)}{user.wallets?.balance?.toLocaleString() || '0'} 
                  <span className="text-[10px] ml-1 opacity-50">{user.currency}</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setEditingUser(user);
                      setInitialWallets({ ...user.wallets });
                      setAdjustments({
                        balance: 0,
                        profit: 0,
                        total_deposits: 0,
                        total_withdrawals: 0,
                        total_investments: 0
                      });
                      setIsEditDialogOpen(true);
                      toast.info(`Editing ${user.first_name}...`);
                    }}
                    className="bg-zinc-900/50 hover:bg-amber-500 hover:text-black transition-all rounded-xl border border-white/5 group"
                  >
                    <Edit className="h-3.5 w-3.5 mr-2" /> Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredUsers.length === 0 && (
          <div className="p-12 text-center text-zinc-500 italic">
            No users found matching your search.
          </div>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) setEditingUser(null);
      }}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-2xl p-0 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-y-auto max-h-[85vh]">
            <DialogHeader className="p-8 bg-gradient-to-r from-zinc-900 to-amber-900/20 border-b border-white/5">
              <DialogTitle className="text-xl font-bold text-amber-500 italic uppercase tracking-tighter flex items-center gap-3">
                <Edit className="h-8 w-8" /> Edit Account
              </DialogTitle>
              <p className="text-zinc-500 text-sm mt-1">Manage core profile, governance settings, and live balances.</p>
            </DialogHeader>

            {editingUser && (
              <form onSubmit={handleUpdateUser} className="p-8 space-y-8">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <UserIcon className="h-3 w-3" /> Identity & Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">First Name</Label>
                      <Input 
                        value={editingUser.first_name || ""} 
                        onChange={(e) => setEditingUser({...editingUser, first_name: e.target.value})}
                        className="bg-zinc-900 border-white/5 focus:border-amber-500/50 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Last Name</Label>
                      <Input 
                        value={editingUser.last_name || ""} 
                        onChange={(e) => setEditingUser({...editingUser, last_name: e.target.value})}
                        className="bg-zinc-900 border-white/5 focus:border-amber-500/50 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Phone Number</Label>
                      <Input 
                        value={editingUser.phone || ""} 
                        placeholder="+1 234 567 890"
                        onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                        className="bg-zinc-900 border-white/5 focus:border-amber-500/50 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Country</Label>
                      <Input 
                        value={editingUser.country || ""} 
                        placeholder="United States"
                        onChange={(e) => setEditingUser({...editingUser, country: e.target.value})}
                        className="bg-zinc-900 border-white/5 focus:border-amber-500/50 h-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Shield className="h-3 w-3" /> Access & Trust
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Management Role</Label>
                      <Select 
                        value={editingUser.role} 
                        onValueChange={(val) => setEditingUser({...editingUser, role: val})}
                      >
                        <SelectTrigger className="bg-zinc-900 border-white/5 font-bold h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-white/10 text-white">
                          <SelectItem value="user">USER ACCOUNT</SelectItem>
                          <SelectItem value="admin">ADMIN PRIVILEGES</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Security Status</Label>
                      <Select 
                        value={editingUser.status} 
                        onValueChange={(val) => setEditingUser({...editingUser, status: val})}
                      >
                        <SelectTrigger className="bg-zinc-900 border-white/5 font-bold h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-white/10 text-white">
                          <SelectItem value="active" className="text-emerald-500">ACTIVE</SelectItem>
                          <SelectItem value="suspended" className="text-amber-500">SUSPENDED</SelectItem>
                          <SelectItem value="banned" className="text-red-500">BANNED</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Coins className="h-3 w-3" /> Preferences & Currency
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Base Currency</Label>
                      <Select 
                        value={editingUser.currency} 
                        onValueChange={(val) => setEditingUser({...editingUser, currency: val})}
                      >
                        <SelectTrigger className="bg-zinc-900 border-white/5 font-bold h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-white/10 text-white">
                          {currencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.code} - {currency.name} ({currency.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Wallet className="h-3 w-3" /> Financial Accounting
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Balance Adjustment */}
                    <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-emerald-500 text-[10px] uppercase font-black tracking-widest">Active Balance</Label>
                        <Wallet className="h-3 w-3 text-emerald-500" />
                      </div>
                      <div className="flex items-end justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-[9px] text-zinc-500 uppercase font-bold">Current</p>
                          <p className="text-lg font-bold font-mono text-white leading-none">
                            {getSymbol(editingUser.currency)}{initialWallets?.balance?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <div className="flex-1 space-y-1 text-right">
                          <p className="text-[9px] text-zinc-500 uppercase font-bold">Adjustment (+/-)</p>
                          <Input 
                            type="number"
                            placeholder="+500 or -200"
                            value={adjustments.balance || ""} 
                            onChange={(e) => setAdjustments({ ...adjustments, balance: Number(e.target.value) })}
                            className="bg-zinc-800 border-white/5 text-xs h-9 font-mono text-right focus:border-emerald-500/50"
                          />
                        </div>
                      </div>
                      <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                        <p className="text-[9px] text-zinc-500 uppercase font-bold">Final Result</p>
                        <p className="text-sm font-bold text-emerald-500 font-mono">
                          {getSymbol(editingUser.currency)}{((initialWallets?.balance || 0) + (adjustments.balance || 0)).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Profit Adjustment */}
                    <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-amber-500 text-[10px] uppercase font-black tracking-widest">Growth Profit</Label>
                        <TrendingUp className="h-3 w-3 text-amber-500" />
                      </div>
                      <div className="flex items-end justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-[9px] text-zinc-500 uppercase font-bold">Current</p>
                          <p className="text-lg font-bold font-mono text-white leading-none">
                            {getSymbol(editingUser.currency)}{initialWallets?.profit?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <div className="flex-1 space-y-1 text-right">
                          <p className="text-[9px] text-zinc-500 uppercase font-bold">Adjustment (+/-)</p>
                          <Input 
                            type="number"
                            placeholder="+500 or -200"
                            value={adjustments.profit || ""} 
                            onChange={(e) => setAdjustments({ ...adjustments, profit: Number(e.target.value) })}
                            className="bg-zinc-800 border-white/5 text-xs h-9 font-mono text-right focus:border-amber-500/50"
                          />
                        </div>
                      </div>
                      <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                        <p className="text-[9px] text-zinc-500 uppercase font-bold">Final Result</p>
                        <p className="text-sm font-bold text-amber-500 font-mono">
                          {getSymbol(editingUser.currency)}{((initialWallets?.profit || 0) + (adjustments.profit || 0)).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Secondary Metrics (Simple edit for now) */}
                    <div className="md:col-span-2 bg-zinc-900/30 p-4 rounded-2xl border border-white/5 grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-zinc-500 text-[8px] uppercase font-black">Total Deposits</Label>
                        <Input 
                          type="number"
                          value={editingUser.wallets.total_deposits} 
                          onChange={(e) => setEditingUser({
                            ...editingUser, 
                            wallets: {...editingUser.wallets, total_deposits: Number(e.target.value)}
                          })}
                          className="bg-zinc-950 border-white/5 text-[10px] h-8 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-zinc-500 text-[8px] uppercase font-black">Total Withdrawals</Label>
                        <Input 
                          type="number"
                          value={editingUser.wallets.total_withdrawals} 
                          onChange={(e) => setEditingUser({
                            ...editingUser, 
                            wallets: {...editingUser.wallets, total_withdrawals: Number(e.target.value)}
                          })}
                          className="bg-zinc-950 border-white/5 text-[10px] h-8 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-zinc-500 text-[8px] uppercase font-black">Total Investments</Label>
                        <Input 
                          type="number"
                          value={editingUser.wallets.total_investments} 
                          onChange={(e) => setEditingUser({
                            ...editingUser, 
                            wallets: {...editingUser.wallets, total_investments: Number(e.target.value)}
                          })}
                          className="bg-zinc-950 border-white/5 text-[10px] h-8 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-10 border-t border-white/5">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="flex-1 rounded-2xl h-12 uppercase font-bold text-xs tracking-widest hover:bg-white/5 border border-white/5 text-zinc-400"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updating}
                    className="flex-[2] bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-widest rounded-2xl h-12 shadow-xl shadow-amber-500/20 transition-all border-none"
                  >
                    {updating ? <Loader2 className="h-5 w-5 animate-spin" /> : "Commit Changes"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserManagement;
