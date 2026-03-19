import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  ClipboardList,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  Loader2,
  Coins,
  CreditCard
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";

// Import Admin View Components
import AdminOverview from "@/components/admin/AdminOverview";
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import AdminDepositManagement from "@/components/admin/AdminDepositManagement";
import AdminWithdrawalManagement from "@/components/admin/AdminWithdrawalManagement";
import AdminInvestmentManagement from "@/components/admin/AdminInvestmentManagement";
import AdminAuditLogs from "@/components/admin/AdminAuditLogs";
import AdminCurrencyManagement from "@/components/admin/AdminCurrencyManagement";
import AdminDepositMethodManagement from "@/components/admin/AdminDepositMethodManagement";
import AdminKYCManagement from "../components/admin/AdminKYCManagement";
import AdminWithdrawalCodeManagement from "@/components/admin/AdminWithdrawalCodeManagement";

type AdminTab = 'overview' | 'users' | 'deposits' | 'withdrawals' | 'investments' | 'currencies' | 'deposit_methods' | 'logs' | 'kyc' | 'withdrawal_codes';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, role, isUser, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isUser && !isAdmin) {
      navigate('/login');
    }

    // Force close mobile menu on screen resize to desktop
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // 1024 is the 'lg' breakpoint
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isUser, isAdmin, authLoading, navigate]);

  const navItems = [
    { id: 'overview' as AdminTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'users' as AdminTab, label: 'User Management', icon: Users },
    { id: 'deposits' as AdminTab, label: 'Deposits', icon: ArrowDownLeft },
    { id: 'withdrawals' as AdminTab, label: 'Withdrawals', icon: ArrowUpRight },
    { id: 'withdrawal_codes' as AdminTab, label: 'Withdrawal Codes', icon: CreditCard },
    { id: 'investments' as AdminTab, label: 'Investments', icon: TrendingUp },
    { id: 'currencies' as AdminTab, label: 'Platform Currencies', icon: Coins },
    { id: 'deposit_methods' as AdminTab, label: 'Deposit Methods', icon: ClipboardList },
    { id: 'kyc' as AdminTab, label: 'KYC Verification', icon: ShieldCheck },
    { id: 'logs' as AdminTab, label: 'Audit Logs', icon: ClipboardList },
  ];

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview': return <AdminOverview />;
      case 'users': return <AdminUserManagement />;
      case 'deposits': return <AdminDepositManagement />;
      case 'withdrawals': return <AdminWithdrawalManagement />;
      case 'withdrawal_codes': return <AdminWithdrawalCodeManagement />;
      case 'investments': return <AdminInvestmentManagement />;
      case 'currencies': return <AdminCurrencyManagement />;
      case 'deposit_methods': return <AdminDepositMethodManagement />;
      case 'kyc': return <AdminKYCManagement />;
      case 'logs': return <AdminAuditLogs />;
      default: return <AdminOverview />;
    }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
    </div>
  );
  if (!authLoading && !isAdmin) {
    navigate('/login');
    return null;
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-8 px-6">
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
          <ShieldCheck className="h-6 w-6 text-black" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">
            Al Safat
          </h1>
          <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Admin Control</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all group ${isActive
                  ? "bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/10"
                  : "text-zinc-500 hover:bg-white/5 hover:text-white"
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${isActive ? "text-black" : "text-zinc-500 group-hover:text-amber-500"}`} />
                <span className="text-sm">{item.label}</span>
              </div>
              {isActive && <ChevronRight className="h-4 w-4" />}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 mb-4">
          <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Authenticated As</p>
          <p className="text-xs font-bold text-white truncate">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          className="w-full flex items-center justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
          onClick={async () => {
            await signOut();
            navigate("/admin/login");
          }}
        >
          <LogOut className="h-5 w-5" /> Logout
        </Button>
      </div>
    </div>
  );

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-zinc-950 border-r border-white/5 flex-col sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between p-6 bg-zinc-950 border-b border-white/5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-amber-500" />
            <h1 className="text-lg font-black italic uppercase tracking-tighter">Al Safat</h1>
          </div>
          {/* Mobile Menu Trigger & Content - ONLY MOURNED ON MOBILE */}
          {!isDesktop && (
            <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/5">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 bg-zinc-950 border-white/5 w-72">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            </div>
          )}
        </header>

        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
          <div className="mb-10">
            <h2 className="text-3xl lg:text-4xl font-black text-white italic uppercase tracking-tighter mb-2">
              {navItems.find(i => i.id === activeTab)?.label}
            </h2>
            <p className="text-zinc-500 text-sm italic">
              Platform Administration & System Control Center
            </p>
          </div>

          <div className="bg-transparent">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
