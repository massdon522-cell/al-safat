import { Menu } from "lucide-react";
import TranslationSwitcher from "../TranslationSwitcher";

interface DashboardHeaderProps {
  fullName: string;
  onMenuClick?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ fullName, onMenuClick }) => {
  return (
    <header className="h-14 bg-black text-white flex items-center px-4 md:px-8 text-xs md:text-sm font-medium shadow-sm">
      <button 
        onClick={onMenuClick}
        className="md:hidden mr-4 p-1 hover:bg-white/10 rounded-md transition-colors"
      >
        <Menu className="h-6 w-6" />
      </button>
      <span className="flex-1 truncate">
        Hello Investor {fullName}! AL SAFAT Platform investment is here for you
      </span>
      <div className="ml-4 flex items-center gap-2 border-l border-white/10 pl-4">
        <TranslationSwitcher />
      </div>
    </header>
  );
};

export default DashboardHeader;
