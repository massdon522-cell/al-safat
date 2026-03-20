import React, { useState, useEffect } from "react";
import DashboardCard from "./DashboardCard";
import { 
  ArrowDownLeft, 
  Hourglass, 
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  ExternalLink,
  Loader2,
  CheckCircle2,
  X
} from "lucide-react";
import DepositRequestModal from "./DepositRequestModal";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface DepositRequest {
  id: string;
  amount: number;
  payer_address: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  deposit_methods: {
    name: string;
  } | null;
}

interface DepositViewProps {
  fullName: string;
  currency: string;
  symbol: string;
}

const DepositView: React.FC<DepositViewProps> = ({ fullName, currency, symbol }) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requests, setRequests] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0 });

  const fetchDepositData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deposits')
        .select(`
          id,
          amount,
          payer_address,
          status,
          admin_notes,
          created_at,
          deposit_methods(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedData = data as unknown as DepositRequest[];
      setRequests(typedData || []);

      // Calculate stats
      const total = typedData
        .filter(r => r.status === 'approved' || r.status === 'completed')
        .reduce((sum, r) => sum + Number(r.amount), 0);
      
      const pending = typedData
        .filter(r => r.status === 'pending')
        .reduce((sum, r) => sum + Number(r.amount), 0);

      setStats({ total, pending });
    } catch (err) {
      console.error("Error fetching deposit data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepositData();
  }, [user]);

  return (
    <main className="p-8 md:p-12 max-w-7xl animate-in fade-in duration-700">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <DashboardCard
          title="Total Deposit"
          value={`${symbol}${stats.total.toLocaleString()} ${currency}`}
          desc="This is the total amount deposited in your account"
          icon={<ArrowDownLeft className="h-6 w-6" />}
          color="bg-[#00e676]"
        />
        <DashboardCard
          title="Pending Deposit"
          value={`${symbol}${stats.pending.toLocaleString()} ${currency}`}
          desc="This is the total deposit pending"
          icon={<Hourglass className="h-6 w-6" />}
          color="bg-[#ffee58]"
        >
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#ff5d01] hover:bg-[#e55301] text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold transition-all transform active:scale-95 shadow-lg"
          >
            Request Funds <ExternalLink className="h-4 w-4" />
          </button>
        </DashboardCard>
      </div>

      {/* Deposit Request Modal */}
      <DepositRequestModal 
        isOpen={isModalOpen} 
        currency={currency}
        symbol={symbol}
        onClose={() => {
          setIsModalOpen(false);
          fetchDepositData(); // Refresh data after request
        }} 
      />

      {/* Deposit History Table */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-center text-[#1a1a1a] mb-8">Deposit History</h2>
        
        <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
          {/* Table Controls */}
          <div className="p-4 border-b border-black/5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-amber-600 font-medium font-serif">
              Show 
              <select className="border border-amber-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              entries
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-amber-600 font-medium font-serif">Search:</span>
              <input 
                type="text" 
                className="border border-amber-200 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 w-full sm:w-48"
              />
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-black/5">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black">S/N ↕</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black">
                    <div className="flex items-center gap-2">
                      Payment Method <div className="p-1 border border-black/20 rounded">📄</div> ↕
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black">
                    <div className="flex items-center gap-2">
                      Payment Details <div className="p-1 border border-black/20 rounded">🏛</div> ↕
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black">
                    <div className="flex items-center gap-2">
                      Payment Amount <div className="p-1 border border-black/20 rounded">💰</div> ↕
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black">
                    <div className="flex items-center gap-2">
                      Payment Date <div className="p-1 border border-black/20 rounded">📅</div> ↕
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black">
                    <div className="flex items-center gap-2">
                      Payment Status <div className="p-1 border border-black/20 rounded">✔️</div> ↕
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black">
                    <div className="flex items-center gap-2">
                      Message/Reason <div className="p-1 border border-black/20 rounded">💬</div> ↕
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                        <p className="font-medium">Loading history...</p>
                      </div>
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                      No deposit requests found.
                    </td>
                  </tr>
                ) : (
                  requests.map((req, idx) => (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-zinc-900">{idx + 1}</td>
                      <td className="px-6 py-4 text-sm font-bold uppercase text-zinc-900">
                        {req.deposit_methods?.name || 'Manual Deposit'}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-zinc-600 truncate max-w-[200px]" title={req.payer_address}>
                        {req.payer_address}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-black">
                        {symbol}{Number(req.amount).toLocaleString()} {currency}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-900">
                        {new Date(req.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`flex items-center gap-1.5 font-bold capitalize ${
                          req.status === 'completed' || req.status === 'approved' ? 'text-green-600' : 
                          req.status === 'rejected' ? 'text-red-600' : 'text-zinc-900'
                        }`}>
                          {req.status} 
                          {req.status === 'pending' && <Hourglass className="h-4 w-4 text-amber-500" />}
                          {(req.status === 'completed' || req.status === 'approved') && <CheckCircle2 className="h-4 w-4" />}
                          {req.status === 'rejected' && <X className="h-4 w-4" />}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-zinc-600 truncate max-w-[200px]" title={req.admin_notes || ""}>
                        {req.admin_notes || "---"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 border-t border-black/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/30">
            <div className="text-sm text-zinc-500">
              Showing {requests.length > 0 ? 1 : 0} to {requests.length} of {requests.length} entries
            </div>
            <div className="flex rounded-md overflow-hidden border border-black/10">
              <button className="px-4 py-2 text-sm bg-white hover:bg-gray-50 text-zinc-400 disabled:opacity-50">Previous</button>
              <button className="px-4 py-2 text-sm bg-blue-600 text-white font-bold">1</button>
              <button className="px-4 py-2 text-sm bg-white hover:bg-gray-50 text-zinc-400 disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DepositView;
