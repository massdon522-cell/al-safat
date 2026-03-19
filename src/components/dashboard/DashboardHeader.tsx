import { Menu } from "lucide-react";

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
    </header>
  );
};

export default DashboardHeader;
