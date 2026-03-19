import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Users,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminStats {
  totalUsers: number;
  totalBalance: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  activeInvestments: number;
  systemStatus: "stable" | "maintenance" | "error";
}

const AdminOverview = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1. Total Users
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (userError) throw userError;

        // 2. Total Balance & Profit
        const { data: walletData, error: walletError } = await supabase
          .from('wallets')
          .select('balance');

        if (walletError) throw walletError;
        const totalBalance = walletData.reduce((acc, w) => acc + Number(w.balance), 0);

        // 3. Pending Deposits
        const { count: depositCount, error: depositError } = await supabase
          .from('deposits')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        if (depositError) throw depositError;

        // 4. Pending Withdrawals
        const { count: withdrawalCount, error: withdrawalError } = await supabase
          .from('withdrawals')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        if (withdrawalError) throw withdrawalError;

        // 5. Active Investments
        const { count: investmentCount, error: investmentError } = await supabase
          .from('investments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        if (investmentError) throw investmentError;

        setStats({
          totalUsers: userCount || 0,
          totalBalance,
          pendingDeposits: depositCount || 0,
          pendingWithdrawals: withdrawalCount || 0,
          activeInvestments: investmentCount || 0,
          systemStatus: "stable"
        });

      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers.toLocaleString(),
      icon: <Users className="h-5 w-5 text-blue-500" />,
      description: "Registered platform members"
    },
    {
      title: "Platform Liquidity",
      value: `$${stats?.totalBalance.toLocaleString()}`,
      icon: <Wallet className="h-5 w-5 text-green-500" />,
      description: "Combined wallet balances"
    },
    {
      title: "Pending Deposits",
      value: stats?.pendingDeposits,
      icon: <ArrowDownLeft className="h-5 w-5 text-amber-500" />,
      description: "Awaiting admin verification",
      alert: (stats?.pendingDeposits || 0) > 0
    },
    {
      title: "Pending Withdrawals",
      value: stats?.pendingWithdrawals,
      icon: <ArrowUpRight className="h-5 w-5 text-red-500" />,
      description: "Awaiting fund release",
      alert: (stats?.pendingWithdrawals || 0) > 0
    },
    {
      title: "Active Investments",
      value: stats?.activeInvestments,
      icon: <TrendingUp className="h-5 w-5 text-purple-500" />,
      description: "Running ROI cycles"
    },

  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => (
          <Card key={idx} className="bg-zinc-900 border-white/10 overflow-hidden relative">
            {card.alert && (
              <div className="absolute top-0 right-0 p-2">
                <div className="h-2 w-2 bg-amber-500 rounded-full animate-ping" />
              </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-zinc-400">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{card.value}</div>
              <p className="text-xs text-zinc-500 mt-1 uppercase tracking-tighter">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(stats?.pendingDeposits || 0) > 0 && (
              <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="font-bold text-amber-500">{stats?.pendingDeposits} Pending Deposits</p>
                    <p className="text-xs text-amber-500/70">Users are waiting for balance credits.</p>
                  </div>
                </div>
              </div>
            )}
            {(stats?.pendingWithdrawals || 0) > 0 && (
              <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-bold text-red-500">{stats?.pendingWithdrawals} Pending Withdrawals</p>
                    <p className="text-xs text-red-500/70">Users are waiting for fund releases.</p>
                  </div>
                </div>
              </div>
            )}
            {(stats?.pendingDeposits === 0 && stats?.pendingWithdrawals === 0) && (
              <div className="flex flex-col items-center justify-center py-8 text-center opacity-50">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-2" />
                <p className="text-zinc-400">Queue is empty. Everything is up to date.</p>
              </div>
            )}
          </CardContent>
        </Card>


      </div>
    </div>
  );
};

export default AdminOverview;
