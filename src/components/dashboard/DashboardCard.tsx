import React from "react";

interface DashboardCardProps {
  title: string;
  value: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  children?: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, desc, icon, color, children }) => {
  return (
    <div className="bg-gradient-to-br from-[#A6760E] to-black rounded-lg shadow-2xl relative overflow-hidden flex flex-col h-64 border border-white/10 group hover:shadow-[#A6760E]/20 transition-all duration-500">
       <div className="p-8 flex-1">
          <div className="flex items-center gap-3 text-white mb-6">
             {icon}
             <h3 className="text-lg font-bold tracking-tight">{title}</h3>
          </div>
          <div className="space-y-4">
             <div>
               <p className="text-white text-xl font-bold">{value}</p>
               <p className="text-white/60 text-sm leading-relaxed max-w-[200px]">
                  {desc}
               </p>
             </div>
             {children && <div className="pt-2">{children}</div>}
          </div>
       </div>
       
       <div className="px-8 pb-8">
          <div className="h-5 w-full bg-black/40 rounded-sm relative overflow-hidden">
             <div className={`absolute inset-0 ${color} opacity-90 transition-all duration-1000`}>
                <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,white_10px,white_20px)]"></div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default DashboardCard;
