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
import KYCView from "../components/dashboard/KYCView";

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
    // KYC Guard: Block everything except Dashboard, Settings, and Verification if not verified
    const isRestricted = kycStatus !== "verified";

    if (isRestricted && ["deposit", "withdrawal", "investment"].includes(activeTab)) {
      return (
        <div className="p-8 md:p-12 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
          <div className="bg-amber-50 border border-amber-100 p-8 md:p-12 rounded-[40px] flex flex-col items-center text-center gap-6 shadow-xl shadow-amber-900/5">
            <div className="h-20 w-20 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-200">
              <ShieldAlert className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-amber-900 uppercase italic tracking-tighter">Verification Required</h2>
              <p className="text-amber-800 font-medium max-w-md mx-auto">
                To access {activeTab} features, you must first verify your identity. This is required for security and regulatory compliance.
              </p>
            </div>
            <Button 
              onClick={() => setActiveTab("verification")}
              className="bg-amber-600 hover:bg-amber-700 text-white font-black px-10 py-6 rounded-2xl text-lg uppercase tracking-widest transition-all hover:scale-[1.05]"
            >
              Verify Now
            </Button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "verification":
        return <KYCView />;
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
            {isRestricted && (
              <div 
                onClick={() => setActiveTab("verification")}
                className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 cursor-pointer hover:scale-[1.01] transition-transform shadow-lg shadow-amber-600/20 group"
              >
                <div className="flex items-center gap-4 text-white">
                  <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <ShieldQuestion className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase italic tracking-tighter text-xl">Complete Your Verification</h3>
                    <p className="text-white/80 text-sm font-medium">Unlock withdrawals and investment plans today.</p>
                  </div>
                </div>
                <div className="bg-white/20 h-10 w-10 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">→</span>
                </div>
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
        

      </div>
    </div>
  );
};

export default UserDashboard;
