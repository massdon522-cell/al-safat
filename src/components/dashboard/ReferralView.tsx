import React, { useState, useEffect } from "react";
import DashboardCard from "./DashboardCard";
import { 
  Users, 
  DollarSign, 
  Copy, 
  Check,
  Search,
  Loader2,
  Calendar,
  Globe,
  MapPin,
  User,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

import ReferralTransferModal from "./ReferralTransferModal";

interface Referee {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  created_at: string;
}

interface ReferralViewProps {
  username: string;
  currency: string;
  symbol: string;
}

const ReferralView: React.FC<ReferralViewProps> = ({ username, currency, symbol }) => {
  const { user } = useAuth();
  const [referees, setReferees] = useState<Referee[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const referralLink = `${window.location.origin}/register?ref=${username}`;
  const totalEarnings = referees.length * 10;

  const fetchReferees = async () => {
    if (!username) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, username, created_at')
        .eq('referral', username)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferees(data || []);
    } catch (err) {
      console.error("Error fetching referees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferees();
  }, [username]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="p-8 md:p-12 max-w-7xl animate-in fade-in duration-700">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <DashboardCard
          title="Referals"
          value={referees.length.toString()}
          desc=""
          icon={<Users className="h-6 w-6 text-amber-500" />}
          color="bg-[#00e676]"
        >
          <div className="flex flex-col gap-2 mt-2">
            <p className="text-[10px] md:text-sm font-medium text-white/80 break-all bg-black/20 p-2 rounded flex items-center justify-between gap-2 border border-white/5 group">
              {referralLink}
              <button 
                onClick={copyToClipboard}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-amber-500 flex items-center gap-1 shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="text-[10px] uppercase font-bold">Copy</span>
              </button>
            </p>
          </div>
        </DashboardCard>
        
        <DashboardCard
          title="Referal Earnings"
          value={`${symbol}${totalEarnings.toLocaleString()} ${currency}`}
          desc="This is the amount earned from referals"
          icon={<DollarSign className="h-6 w-6 text-amber-500" />}
          color="bg-[#ffeb3b]"
        >
          <button 
            onClick={() => setIsTransferModalOpen(true)}
            className="bg-[#ff5d01] hover:bg-[#e55301] text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold transition-all transform active:scale-95 shadow-lg mt-2"
          >
            Collect Earnings <div className="p-0.5 border border-white/20 rounded-full"><DollarSign className="h-3 w-3" /></div>
          </button>
        </DashboardCard>
      </div>

      {/* Referral Transfer Modal */}
      <ReferralTransferModal 
        isOpen={isTransferModalOpen}
        currency={currency}
        symbol={symbol}
        onClose={() => {
          setIsTransferModalOpen(false);
          fetchReferees(); // Refresh to update earnings if needed
        }}
        availableProfit={totalEarnings}
      />

      {/* Referral List Table */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-center text-[#1a1a1a] mb-8">Referal List</h2>
        
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
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black italic">S/N ↕</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black italic">
                    <div className="flex items-center gap-2">
                      Referee Name <User className="h-3 w-3 rounded-full border border-black/20 p-0.5 bg-black text-white" /> ↕
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black italic">
                    <div className="flex items-center gap-2">
                       Referee Username <User className="h-3 w-3 rounded-full border border-black/20 p-0.5 bg-black text-white" /> ↕
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black italic">
                    <div className="flex items-center gap-2">
                      Registered Date <Calendar className="h-3 w-3 rounded-sm border border-black/20 p-0.5 bg-black text-white" /> ↕
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black italic">
                    <div className="flex items-center gap-2">
                      Referee Country <MapPin className="h-3 w-3 rounded-sm border border-black/20 p-0.5 bg-black text-white" /> ↕
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black italic">
                    <div className="flex items-center gap-2">
                      Referee Address <MapPin className="h-3 w-3 rounded-full border border-black/20 p-0.5 text-black" /> ↕
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                       <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto mb-2" />
                       <p className="font-medium">Loading referals...</p>
                    </td>
                  </tr>
                ) : referees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-zinc-500 italic font-medium">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  referees.map((ref, idx) => (
                    <tr key={ref.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-zinc-900">{idx + 1}</td>
                      <td className="px-6 py-4 text-sm font-bold text-zinc-900 uppercase">
                        {ref.first_name} {ref.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-black">
                        {ref.username}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-900">
                        {new Date(ref.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-900">—</td>
                      <td className="px-6 py-4 text-sm text-zinc-900">—</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 border-t border-black/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/30">
            <div className="text-sm text-zinc-500">
              Showing {referees.length > 0 ? 1 : 0} to {referees.length} of {referees.length} entries
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

export default ReferralView;
