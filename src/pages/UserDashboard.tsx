import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import MarketTicker from "../components/dashboard/MarketTicker";
import DashboardCard from "../components/dashboard/DashboardCard";
import DepositView from "../components/dashboard/DepositView";
import WithdrawalView from "../components/dashboard/WithdrawalView";
import InvestmentView from "../components/dashboard/InvestmentView";
import ReferralView from "../components/dashboard/ReferralView";
import SettingsView from "../components/dashboard/SettingsView";
import KYCModal from "../components/dashboard/KYCModal";
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock,
  TrendingUp,
  Loader2,
  Users,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  AlertTriangle
} from "lucide-react";

interface Profile {
  first_name: string;
  last_name: string;
  username: string;
  currency: string;
  currency_symbol: string;
}

interface WalletData {
  balance: number;
  profit: number;
  total_deposits: number;
  total_withdrawals: number;
  total_investments: number;
}

import { 
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, isUser, kycStatus, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isUser) {
      navigate("/login");
    }
  }, [isUser, authLoading, navigate]);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch Profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, username, currency')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;
        
        // Fetch Currency Symbol
        const { data: currencyData } = await supabase
          .from('currencies')
          .select('symbol')
          .eq('code', profileData.currency)
          .maybeSingle();

        setProfile({
          ...profileData,
          currency_symbol: currencyData?.symbol || "$"
        });

        // Fetch Wallet
        const { data: walletData, error: walletError } = await supabase
          .from('wallets')
          .select('balance, profit, total_deposits, total_withdrawals, total_investments')
          .eq('user_id', user.id)
          .single();
        
        if (walletError) throw walletError;
        setWallet(walletData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : user?.email?.split('@')[0] || "User";
  const currency = profile?.currency || "USD";
  const symbol = profile?.currency_symbol || "$";

  const cards = [
    { 
      title: "Account Balance", 
      value: wallet ? `${symbol}${wallet.balance.toLocaleString()} ${currency}` : `${symbol}0 ${currency}`, 
      desc: "This is the total useable amount in your acccount", 
      icon: <Wallet className="h-6 w-6" />, 
      color: "bg-[#00e676]" 
    },
    { 
      title: "Total Deposit", 
      value: wallet ? `${symbol}${(wallet.total_deposits || 0).toLocaleString()} ${currency}` : `${symbol}0 ${currency}`, 
      desc: "This is the total amount deposited", 
      icon: <ArrowDownLeft className="h-6 w-6" />, 
      color: "bg-[#ffee58]" 
    },
    { 
      title: "Total Withdrawal", 
      value: wallet ? `${symbol}${(wallet.total_withdrawals || 0).toLocaleString()} ${currency}` : `${symbol}0 ${currency}`, 
      desc: "This is the total amount withdrawn", 
      icon: <ArrowUpRight className="h-6 w-6" />, 
      color: "bg-[#ff5252]" 
    },
    { 
      title: "Invested Capital", 
      value: wallet ? `${symbol}${(wallet.total_investments || 0).toLocaleString()} ${currency}` : `${symbol}0 ${currency}`, 
      desc: "Total funds currently in active investments", 
      icon: <Clock className="h-6 w-6" />, 
      color: "bg-[#00ffcc]" 
    },
    { 
      title: "Referals", 
      value: "0", 
      desc: "Total referals visit referal page for more info", 
      icon: <Users className="h-6 w-6" />, 
      color: "bg-[#29b6f6]" 
    },
    { 
      title: "Referals Earnings", 
      value: wallet ? `${symbol}${wallet.profit.toLocaleString()} ${currency}` : `${symbol}0 ${currency}`, 
      desc: "This is the total amount earning from referal", 
      icon: <TrendingUp className="h-6 w-6" />, 
      color: "bg-[#ab47bc]" 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-amber-600 animate-spin" />
          <p className="text-zinc-500 font-bold animate-pulse">Loading Platform Data...</p>
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    // KYC Guard: Block everything except Dashboard and Settings if not verified
    const isRestricted = kycStatus !== 'verified';
    
    if (isRestricted && activeTab !== "dashboard" && activeTab !== "settings") {
      return (
        <main className="p-8 md:p-12 max-w-7xl animate-in fade-in zoom-in duration-500">
          <div className="bg-white rounded-3xl p-12 shadow-2xl shadow-black/5 border border-black/5 text-center space-y-6">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="h-10 w-10 text-amber-500" />
            </div>
            <h2 className="text-3xl font-black text-black italic uppercase tracking-tighter">Verification Required</h2>
            <p className="text-zinc-500 max-w-md mx-auto font-medium">
              To ensure the security of your account and comply with global financial regulations, you must complete your Identity Verification (KYC) before accessing this feature.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setIsKYCModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-black font-black uppercase rounded-2xl h-12 px-8 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              >
                Start Verification
              </Button>
              <Button 
                variant="outline"
                onClick={() => setActiveTab("dashboard")}
                className="border-black/10 hover:bg-black/5 font-black uppercase rounded-2xl h-12 px-8"
              >
                Back to Overview
              </Button>
            </div>
          </div>
        </main>
      );
    }

    switch (activeTab) {
      case "deposit":
        return <DepositView fullName={fullName} currency={currency} symbol={symbol} />;
      case "withdrawal":
        return <WithdrawalView fullName={fullName} availableProfit={wallet?.profit || 0} currency={currency} symbol={symbol} />;
      case "investment":
        return <InvestmentView fullName={fullName} availableBalance={wallet?.balance || 0} currency={currency} symbol={symbol} />;
      case "referals":
        return <ReferralView username={profile?.username || ""} currency={currency} symbol={symbol} />;
      case "settings":
        return <SettingsView />;
      case "dashboard":
      default:
        return (
          <main className="p-8 md:p-12 max-w-7xl animate-in fade-in duration-700 space-y-8">
             {/* KYC Status Banner */}
             {kycStatus === 'pending' && (
               <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center justify-between gap-4 animate-pulse">
                 <div className="flex items-center gap-3">
                   <ShieldQuestion className="h-6 w-6 text-amber-500" />
                   <div>
                     <p className="text-amber-900 font-black uppercase text-xs tracking-widest">Verification Pending</p>
                     <p className="text-amber-700 text-[10px] font-bold">Your documents are currently being reviewed by our compliance team.</p>
                   </div>
                 </div>
                 <div className="bg-amber-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase">Reviewing</div>
               </div>
             )}

             {kycStatus === 'unverified' && (
               <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-amber-500/10">
                 <div className="flex items-center gap-4">
                   <div className="h-12 w-12 bg-amber-500 rounded-2xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
                     <ShieldAlert className="h-6 w-6 text-black" />
                   </div>
                   <div>
                     <h3 className="text-white font-black italic uppercase tracking-tighter">Complete Your KYC</h3>
                     <p className="text-zinc-500 text-xs font-bold">Unlock deposits, withdrawals, and premium investments.</p>
                   </div>
                 </div>
                 <Button 
                   onClick={() => setIsKYCModalOpen(true)}
                   className="bg-amber-500 hover:bg-amber-600 text-black font-black uppercase rounded-xl h-10 px-6"
                 >
                   Verify Now
                 </Button>
               </div>
             )}

             {kycStatus === 'rejected' && (
               <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-4">
                   <div className="h-12 w-12 bg-red-500 rounded-2xl flex items-center justify-center">
                     <AlertTriangle className="h-6 w-6 text-white" />
                   </div>
                   <div>
                     <h3 className="text-red-900 font-black italic uppercase tracking-tighter text-lg">Verification Rejected</h3>
                     <p className="text-red-700 text-xs font-bold">Please check your email or contact support for more details.</p>
                   </div>
                 </div>
                 <Button 
                   onClick={() => setIsKYCModalOpen(true)}
                   className="bg-red-500 hover:bg-red-600 text-white font-black uppercase rounded-xl h-10 px-6"
                 >
                   Try Again
                 </Button>
               </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card, idx) => (
                  <DashboardCard key={idx} {...card} />
                ))}
             </div>
          </main>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      <div className="hidden md:block">
        <Sidebar 
          fullName={fullName} 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSignOut={signOut} 
        />
      </div>

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 bg-[#0a0a0a] border-r-white/5 w-64">
          <Sidebar 
            fullName={fullName} 
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setIsMobileMenuOpen(false);
            }}
            onSignOut={() => {
              setIsMobileMenuOpen(false);
              signOut();
            }} 
          />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col bg-[#f0f2f5] min-h-screen border-l border-black/5">
        <div className="sticky top-0 z-[15] shadow-sm">
          <DashboardHeader 
            fullName={fullName} 
            onMenuClick={() => setIsMobileMenuOpen(true)}
          />
          <MarketTicker />
        </div>

        {renderActiveView()}
        
        <KYCModal 
          isOpen={isKYCModalOpen} 
          onClose={() => setIsKYCModalOpen(false)} 
        />
      </div>
    </div>
  );
};

export default UserDashboard;
