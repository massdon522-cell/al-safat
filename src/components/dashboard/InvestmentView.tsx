import React, { useState, useEffect } from "react";
import DashboardCard from "./DashboardCard";
import { 
  CheckCircle, 
  Hourglass, 
  Search,
  PlusCircle,
  Loader2,
  CheckCircle2,
  X,
  CreditCard,
  TrendingUp,
  History
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import InvestmentModal from "./InvestmentModal.tsx";

interface Investment {
  id: string;
  amount: number;
  return_amount: number;
  status: string;
  start_date: string;
  end_date: string;
  investment_plans: {
    name: string;
  };
}

interface InvestmentViewProps {
  fullName: string;
  availableBalance: number;
  currency: string;
  symbol: string;
}

const InvestmentView: React.FC<InvestmentViewProps> = ({ fullName, availableBalance, currency, symbol }) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, completed: 0 });

  const fetchInvestmentData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          investment_plans (name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedData = data as unknown as Investment[];
      setInvestments(typedData || []);

      // Calculate stats
      const active = typedData
        .filter(i => i.status === 'active')
        .reduce((sum, i) => sum + Number(i.amount), 0);
      
      const completed = typedData
        .filter(i => i.status === 'completed')
        .reduce((sum, i) => sum + Number(i.amount), 0);

      setStats({ active, completed });
    } catch (err) {
      console.error("Error fetching investment data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestmentData();
  }, [user]);

  return (
    <main className="p-8 md:p-12 max-w-7xl animate-in fade-in duration-700">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <DashboardCard
          title="Completed Investment"
          value={`${symbol}${stats.completed.toLocaleString()} ${currency}`}
          desc="This is the total investment completed"
          icon={<CheckCircle className="h-6 w-6 text-green-500" />}
          color="bg-[#00e676]"
        />
        <DashboardCard
          title="Active Investment"
          value={`${symbol}${stats.active.toLocaleString()} ${currency}`}
          desc="This is the total active investment"
          icon={<Hourglass className="h-6 w-6 text-amber-500" />}
          color="bg-[#A6760E]"
        >
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#ff5d01] hover:bg-[#e55301] text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold transition-all transform active:scale-95 shadow-lg"
          >
            Add Investment <PlusCircle className="h-4 w-4" />
          </button>
        </DashboardCard>
      </div>

      {/* Investment Modal */}
      <InvestmentModal 
        isOpen={isModalOpen} 
        symbol={symbol}
        onClose={() => {
          setIsModalOpen(false);
          fetchInvestmentData();
        }}
        availableBalance={availableBalance}
      />

      {/* Investment History Table */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-center text-[#1a1a1a] mb-8">Investment History</h2>
        
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
                      Investment Plan <div className="p-1 border border-black/20 rounded">📋</div> ↕
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black">
                    <div className="flex items-center gap-2">
                       Investment Amount <div className="p-1 border border-black/20 rounded">💰</div> ↕
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black">
                    <div className="flex items-center gap-2">
                      Investment Date <div className="p-1 border border-black/20 rounded">📅</div> ↕
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black">
                    <div className="flex items-center gap-2">
                      Investment Return <div className="p-1 border border-black/20 rounded">💹</div> ↕
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black">
                    <div className="flex items-center gap-2">
                      Investment Due Date <div className="p-1 border border-black/20 rounded">📅</div> ↕
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black">
                    <div className="flex items-center gap-2">
                      Status <div className="p-1 border border-black/20 rounded">💬</div> ↕
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                       <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto mb-2" />
                       <p className="font-medium">Loading history...</p>
                    </td>
                  </tr>
                ) : investments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center text-zinc-500 italic">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  investments.map((inv, idx) => (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-zinc-900">{idx + 1}</td>
                      <td className="px-6 py-4 text-sm font-bold text-zinc-900 uppercase">
                        {inv.investment_plans?.name}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-black">
                        {symbol}{Number(inv.amount).toLocaleString()} {currency}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-900">
                        {new Date(inv.start_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600">
                        +{symbol}{Number(inv.return_amount).toLocaleString()} {currency}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-900">
                        {new Date(inv.end_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`flex items-center gap-1.5 font-bold capitalize ${
                          inv.status === 'completed' ? 'text-green-600' : 'text-amber-500'
                        }`}>
                          {inv.status} 
                          {inv.status === 'active' && <Hourglass className="h-4 w-4" />}
                          {inv.status === 'completed' && <CheckCircle2 className="h-4 w-4" />}
                        </span>
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
              Showing {investments.length > 0 ? 1 : 0} to {investments.length} of {investments.length} entries
            </div>
            <div className="flex rounded-md overflow-hidden border border-black/10">
              <button className="px-4 py-2 text-sm bg-white hover:bg-gray-50 text-zinc-400 disabled:opacity-50">Previous</button>
              <button className="px-4 py-2 bg-blue-600 text-white font-bold">1</button>
              <button className="px-4 py-2 text-sm bg-white hover:bg-gray-50 text-zinc-400 disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default InvestmentView;
