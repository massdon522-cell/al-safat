import React, { useState, useEffect } from "react";
import DashboardCard from "./DashboardCard";
import { 
  ArrowUpRight, 
  Hourglass, 
  Search,
  ExternalLink,
  Loader2,
  CheckCircle2,
  X,
  TrendingUp
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import WithdrawalRequestModal from "./WithdrawalRequestModal";

interface WithdrawalRequest {
  id: string;
  amount: number;
  method: string;
  details: string;
  status: string;
  created_at: string;
}

interface WithdrawalViewProps {
  fullName: string;
  availableProfit: number;
  currency: string;
  symbol: string;
}

const WithdrawalView: React.FC<WithdrawalViewProps> = ({ fullName, availableProfit, currency, symbol }) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0 });
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);

  const fetchWithdrawalData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);

      // Calculate stats
      const total = data
        ? data.filter(r => r.status === 'approved').reduce((sum, r) => sum + Number(r.amount), 0)
        : 0;
      const pending = data
        ? data.filter(r => ['pending', 'awaiting_payment'].includes(r.status)).reduce((sum, r) => sum + Number(r.amount), 0)
        : 0;

      setStats({ total, pending });
    } catch (err) {
      console.error("Error fetching withdrawal data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawalData();
  }, [user]);

  return (
    <main className="p-8 md:p-12 max-w-7xl animate-in fade-in duration-700">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <DashboardCard
          title="Total Withdrawal"
          value={`${symbol}${stats.total.toLocaleString()} ${currency}`}
          desc="This is the total amount withdrawn from your account"
          icon={<ArrowUpRight className="h-6 w-6" />}
          color="bg-[#00e676]"
        />
        <DashboardCard
          title="Pending Withdrawal"
          value={`${symbol}${stats.pending.toLocaleString()} ${currency}`}
          desc="This is the total Withdrawal Request Unprocessed"
          icon={<Hourglass className="h-6 w-6" />}
          color="bg-[#A6760E]"
        >
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#ff5d01] hover:bg-[#e55301] text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold transition-all transform active:scale-95 shadow-lg"
          >
            Profit <TrendingUp className="h-4 w-4" />
          </button>
        </DashboardCard>
      </div>

      {/* Withdrawal Request Modal */}
      <WithdrawalRequestModal 
        isOpen={isModalOpen} 
        symbol={symbol}
        initialWithdrawal={selectedWithdrawal}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedWithdrawal(null);
          fetchWithdrawalData();
        }}
        availableProfit={availableProfit}
      />

      {/* Withdrawal History Section (Special Styled Box) */}
      <div className="rounded-xl overflow-hidden shadow-2xl border border-amber-500/20">
        <div className="bg-gradient-to-r from-[#1a1a1a] to-[#A6760E] p-8 text-center">
          <h2 className="text-2xl font-bold text-white italic uppercase tracking-widest">
            Withdrawal History
          </h2>
          <div className="mt-2 text-amber-500 font-bold">
            Available Profit: {symbol}{availableProfit.toLocaleString()}
          </div>
        </div>
        
        <div className="bg-[#0a0a0a] p-6 text-white">
          {/* Table Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm font-serif text-amber-500">
              Show 
              <select className="bg-transparent border border-amber-500/30 rounded px-2 py-1 focus:outline-none focus:border-amber-500">
                <option className="bg-[#0a0a0a]">10</option>
                <option className="bg-[#0a0a0a]">25</option>
                <option className="bg-[#0a0a0a]">50</option>
              </select>
              entries
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-serif text-amber-500">Search:</span>
              <input 
                type="text" 
                className="bg-transparent border border-amber-500/30 rounded px-3 py-1 text-sm focus:outline-none focus:border-amber-500 w-full sm:w-48"
              />
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 uppercase text-[12px] font-bold tracking-tighter">
                  <th className="px-4 py-4 text-white">S/N ↕</th>
                  <th className="px-4 py-4 text-white">
                    <div className="flex items-center gap-2">
                      Payment Method <div className="p-1 bg-white/5 rounded">📋</div> ↕
                    </div>
                  </th>
                  <th className="px-4 py-4 text-white">
                    <div className="flex items-center gap-2">
                      Payment Details <div className="p-1 bg-white/5 rounded">🏛</div> ↕
                    </div>
                  </th>
                  <th className="px-4 py-4 text-white">
                    <div className="flex items-center gap-2">
                      Payment Amount <div className="p-1 bg-white/5 rounded">💰</div> ↕
                    </div>
                  </th>
                  <th className="px-4 py-4 text-white">
                    <div className="flex items-center gap-2">
                      Payment Date <div className="p-1 bg-white/5 rounded">📅</div> ↕
                    </div>
                  </th>
                  <th className="px-4 py-4 text-white">
                    <div className="flex items-center gap-2">
                      Payment Status <div className="p-1 bg-white/5 rounded">✔️</div> ↕
                    </div>
                  </th>
                  <th className="px-4 py-4 text-white">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto mb-2" />
                      <p className="text-amber-500/50 font-serif italic">Fetching history...</p>
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-white/40 font-serif italic text-lg">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  requests.map((req, idx) => (
                    <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-4 text-sm text-white/80">{idx + 1}</td>
                      <td className="px-4 py-4 text-sm font-bold text-amber-500">{req.method}</td>
                      <td className="px-4 py-4 text-sm text-white/60 font-mono truncate max-w-[150px]" title={req.details}>
                        {req.details}
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-white">{symbol}{Number(req.amount).toLocaleString()} {currency}</td>
                      <td className="px-4 py-4 text-sm text-white/80">
                         {new Date(req.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className={`flex items-center gap-1.5 font-bold capitalize ${
                          req.status === 'approved' ? 'text-green-500' : 
                          req.status === 'rejected' ? 'text-red-500' : 
                          req.status === 'awaiting_payment' ? 'text-amber-400' : 'text-amber-500'
                        }`}>
                          {req.status === 'awaiting_payment' ? 'Awaiting Fee' : req.status} 
                          {(req.status === 'pending' || req.status === 'awaiting_payment') && <Hourglass className="h-4 w-4 shrink-0" />}
                          {req.status === 'approved' && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                          {req.status === 'rejected' && <X className="h-4 w-4 shrink-0" />}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <Button 
                          onClick={() => {
                            setSelectedWithdrawal(req);
                            setIsModalOpen(true);
                          }}
                          variant="ghost" 
                          size="sm" 
                          className="text-amber-500 hover:text-white hover:bg-amber-600/20 border border-amber-500/20 h-8 font-bold"
                        >
                          View Receipt
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-white/60 text-sm">
            <p>Showing {requests.length > 0 ? 1 : 0} to {requests.length} of {requests.length} entries</p>
            <div className="flex bg-white/5 rounded overflow-hidden">
              <button className="px-4 py-2 hover:bg-white/10 border-r border-white/5 disabled:opacity-30" disabled>Previous</button>
              <button className="px-4 py-2 bg-blue-600 text-white font-bold">1</button>
              <button className="px-4 py-2 hover:bg-white/10 disabled:opacity-30" disabled>Next</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default WithdrawalView;
