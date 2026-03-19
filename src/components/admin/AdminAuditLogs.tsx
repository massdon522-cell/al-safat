import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Eye, 
  Loader2,
  ChevronDown,
  ArrowRight,
  ImageIcon
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_name: string;
  entity_id: string;
  old_data: any;
  new_data: any;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          profiles!user_id (first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setLogs(data as any || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.entity_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatData = (data: any) => {
    if (!data) return "N/A";
    if (typeof data === 'string' && (data.startsWith('http') || data.includes('.png') || data.includes('.jpg'))) {
       return (
         <div className="mt-2">
            <img src={data} alt="Evidence" className="max-w-xs rounded-lg border border-white/10 shadow-lg" />
         </div>
       );
    }
    return JSON.stringify(data, null, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950 p-6 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white italic uppercase tracking-tighter">
            Platform Audit Logs <ClipboardList className="h-6 w-6 text-amber-500" />
          </h2>
          <p className="text-zinc-500 text-sm italic">Track system activity and user interactions</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input 
            placeholder="Search logs by action, entity, or user..."
            className="pl-10 bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-zinc-950 rounded-2xl border border-white/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-zinc-400">Timestamp</TableHead>
              <TableHead className="text-zinc-400">Admin/User</TableHead>
              <TableHead className="text-zinc-400">Action</TableHead>
              <TableHead className="text-zinc-400">Entity</TableHead>
              <TableHead className="text-right text-zinc-400">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                <TableCell className="text-zinc-500 text-xs">
                  {new Date(log.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-amber-500" />
                    <span className="font-bold text-white text-xs">{log.profiles?.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    {log.action}
                  </span>
                </TableCell>
                <TableCell className="text-zinc-400 text-xs uppercase font-bold">
                  {log.entity_name}
                </TableCell>
                <TableCell className="text-right">
                  <Dialog open={selectedLog?.id === log.id} onOpenChange={(open) => {
                    if (open) setSelectedLog(log);
                    else setSelectedLog(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 bg-white/5 hover:bg-amber-500 hover:text-black transition-all rounded-lg text-[10px] font-bold uppercase">
                        <Eye className="h-3 w-3 mr-1" /> View Diff
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-2xl p-8 rounded-3xl overflow-y-auto max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-amber-500 italic uppercase flex items-center gap-2">
                           Log Investigation <ClipboardList className="h-6 w-6" />
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                         <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="bg-zinc-900 p-3 rounded-xl border border-white/5">
                               <p className="text-zinc-500 uppercase font-bold tracking-widest mb-1">Action</p>
                               <p className="text-white font-bold">{log.action}</p>
                            </div>
                            <div className="bg-zinc-900 p-3 rounded-xl border border-white/5">
                               <p className="text-zinc-500 uppercase font-bold tracking-widest mb-1">Entity</p>
                               <p className="text-white font-bold">{log.entity_name} ({log.entity_id})</p>
                            </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <p className="text-red-500/70 font-black uppercase text-[10px] tracking-widest">
                                  Original State
                               </p>
                               <pre className="bg-black/50 p-4 rounded-xl border border-red-500/10 text-[10px] font-mono whitespace-pre-wrap text-red-100 overflow-x-auto">
                                  {formatData(log.old_data)}
                               </pre>
                            </div>
                            <div className="space-y-2">
                               <p className="text-emerald-500/70 font-black uppercase text-[10px] tracking-widest">
                                  New State <ArrowRight className="inline h-3 w-3" />
                               </p>
                               <pre className="bg-black/50 p-4 rounded-xl border border-emerald-500/10 text-[10px] font-mono whitespace-pre-wrap text-emerald-100 overflow-x-auto">
                                  {formatData(log.new_data)}
                               </pre>
                            </div>
                         </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {logs.length === 0 && (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center gap-3">
             <ClipboardList className="h-8 w-8 opacity-20" />
             No audit logs found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogs;
