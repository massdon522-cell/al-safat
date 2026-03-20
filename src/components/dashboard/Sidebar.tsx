import React from "react";
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  Settings,
  LogOut,
  Star,
  CheckCircle2,
  CreditCard
} from "lucide-react";

interface SidebarProps {
  fullName: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ fullName, activeTab, onTabChange, onSignOut }) => {
  return (
    <aside className="w-full md:w-64 bg-[#0a0a0a] text-white flex flex-col border-r border-white/5 z-20 md:sticky md:top-0 md:h-screen overflow-y-auto custom-scrollbar">
      <div className="p-6">
        <div className="flex flex-col gap-4 mb-8">
          <h1 className="text-base font-bold text-amber-500 uppercase leading-none">
            AL SAFAT PLATFORM
          </h1>

          <div className="flex flex-col items-center text-center space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-xs">👤</span>
              </div>
              <h2 className="text-lg font-bold">Welcome {fullName}!</h2>
            </div>
            <div className="flex justify-center gap-0.5 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-current" />
              ))}
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="text-xs font-medium text-white/80">Account is active</span>
              <CheckCircle2 className="h-4 w-4 text-green-500 fill-green-500/20" />
            </div>
          </div>
        </div>
        <nav className="space-y-1">
          {[
            { id: "dashboard", icon: <LayoutDashboard className="h-5 w-5" />, label: "My Dashboard" },
            { id: "deposit", icon: <ArrowDownLeft className="h-5 w-5" />, label: "Deposit" },
            { id: "withdrawal", icon: <ArrowUpRight className="h-5 w-5" />, label: "Withdrawal" },
            { id: "investment", icon: <CreditCard className="h-5 w-5" />, label: "Investment" },
            { id: "referals", icon: <Users className="h-5 w-5" />, label: "Referals" },
            { id: "settings", icon: <Settings className="h-5 w-5" />, label: "Settings" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-all ${
                activeTab === item.id 
                  ? "text-white bg-white/10 rounded-md border-l-2 border-amber-500" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      </div>

      <button
        onClick={onSignOut}
        className="mt-auto flex items-center gap-3 w-full px-8 py-6 text-sm font-bold text-red-500 hover:bg-red-500/5 transition-all border-t border-white/5"
      >
        <LogOut className="h-5 w-5" /> Logout
      </button>
    </aside>
  );
};

export default Sidebar;
