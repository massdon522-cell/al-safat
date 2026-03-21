import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ShieldCheck, 
  Search, 
  Check, 
  X, 
  ExternalLink, 
  Loader2, 
  AlertCircle,
  FileText,
  User,
  Clock,
  Filter
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

interface KYCSubmission {
  id: string;
  user_id: string;
  full_name: string;
  id_type: string;
  id_number: string;
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  profiles: {
    email: string;
    username: string;
  };
}

const AdminKYCManagement = () => {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewingSubmission, setViewingSubmission] = useState<KYCSubmission | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('kyc_submissions')
        .select(`
          *,
          profiles:user_id (email, username)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching KYC submissions:', error);
      toast.error('Failed to load KYC submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (submissionId: string, status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !reviewNotes) {
      toast.error("Please provide review notes for rejection");
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('kyc_submissions')
        .update({
          status: status,
          admin_notes: reviewNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast.success(`Submission ${status} successfully`);
      setViewingSubmission(null);
      setReviewNotes("");
      fetchSubmissions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update review');
    } finally {
      setProcessing(false);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = 
      sub.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.profiles.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.id_number.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-amber-500">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950 p-6 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-3 text-white italic uppercase tracking-tighter">
            KYC Management <ShieldCheck className="h-6 w-6 text-amber-500" />
          </h2>
          <p className="text-zinc-500 text-sm italic">Review and verify user identity documents</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Search submissions..."
              className="pl-10 bg-zinc-900 border-white/10 text-white h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-zinc-900 border-white/10 text-white w-full md:w-40 h-11">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-amber-500" />
                <SelectValue placeholder="All Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-white/10 text-white">
              <SelectItem value="all">ALL STATUS</SelectItem>
              <SelectItem value="pending" className="text-amber-500">PENDING</SelectItem>
              <SelectItem value="approved" className="text-emerald-500">APPROVED</SelectItem>
              <SelectItem value="rejected" className="text-red-500">REJECTED</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-zinc-950 rounded-2xl border border-white/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">User / Full Name</TableHead>
              <TableHead className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">ID Type / Number</TableHead>
              <TableHead className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Submitted Date</TableHead>
              <TableHead className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
              <TableHead className="text-right text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubmissions.map((sub) => (
              <TableRow key={sub.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center font-bold text-amber-500 text-xs uppercase tracking-tighter">
                      {sub.full_name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-white leading-none">{sub.full_name}</p>
                      <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">{sub.profiles?.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-white uppercase">{sub.id_type.replace('_', ' ')}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{sub.id_number}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Clock className="h-3.5 w-3.5 text-amber-500/50" />
                    <span className="text-xs">{new Date(sub.created_at).toLocaleDateString()}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                    sub.status === 'approved' 
                      ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" 
                      : sub.status === 'pending'
                      ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                      : "bg-red-500/20 text-red-500 border border-red-500/30"
                  }`}>
                    {sub.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setViewingSubmission(sub);
                      setReviewNotes(sub.admin_notes || "");
                    }}
                    className="bg-zinc-900/50 hover:bg-amber-500 hover:text-black transition-all rounded-xl border border-white/5"
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredSubmissions.length === 0 && (
          <div className="p-16 text-center text-zinc-500 italic flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-zinc-800" />
            <p>No KYC submissions found matching your filters.</p>
          </div>
        )}
      </div>

      <Dialog open={!!viewingSubmission} onOpenChange={(open) => {
        if (!open) setViewingSubmission(null);
      }}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-4xl p-0 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-y-auto max-h-[90vh]">
            <DialogHeader className="p-8 bg-gradient-to-r from-zinc-900 to-amber-900/20 border-b border-white/5">
              <DialogTitle className="text-2xl font-black text-amber-500 italic uppercase tracking-tighter flex items-center gap-3">
                <FileText className="h-8 w-8" /> Identity Review
              </DialogTitle>
              <p className="text-zinc-500 text-sm mt-1 uppercase font-bold tracking-widest">Authenticating documents for {viewingSubmission?.full_name}</p>
            </DialogHeader>

            {viewingSubmission && (
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Details */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <User className="h-3 w-3" /> Account Information
                      </h3>
                      <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 space-y-4">
                        <div className="flex justify-between">
                          <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Full Name</span>
                          <span className="text-white font-bold">{viewingSubmission.full_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Email Address</span>
                          <span className="text-white font-bold">{viewingSubmission.profiles.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">ID Type</span>
                          <span className="text-amber-500 font-black uppercase italic tracking-tighter">
                            {viewingSubmission.id_type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">ID Number</span>
                          <span className="text-white font-mono font-bold tracking-wider">{viewingSubmission.id_number}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <FileText className="h-3 w-3" /> Review Comments
                      </h3>
                      <div className="space-y-2">
                        <Label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Internal Admin Notes</Label>
                        <Textarea 
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          placeholder="Provide reasons for rejection or general notes..."
                          className="bg-zinc-900 border-white/10 focus:border-amber-500/50 min-h-[120px] rounded-2xl p-4 text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Document Preview */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
                      <ExternalLink className="h-3 w-3" /> Identity Document
                    </h3>
                    <div className="relative group aspect-[4/3] bg-zinc-900 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center">
                      {viewingSubmission.document_url.endsWith('.pdf') ? (
                        <div className="flex flex-col items-center gap-4">
                          <FileText className="h-16 w-16 text-zinc-700" />
                          <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest">PDF Document</p>
                          <Button 
                            variant="outline" 
                            className="bg-white/5 border-white/10 hover:bg-amber-500 hover:text-black mt-2"
                            onClick={() => window.open(viewingSubmission.document_url, '_blank')}
                          >
                            Open in New Tab
                          </Button>
                        </div>
                      ) : (
                        <>
                          <img 
                            src={viewingSubmission.document_url} 
                            alt="KYC Document" 
                            className="w-full h-full object-contain p-2"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                             <Button 
                                variant="outline" 
                                className="bg-white/10 border-white/20 hover:bg-amber-500 hover:text-black font-black uppercase text-xs tracking-[0.2em] rounded-xl px-6"
                                onClick={() => window.open(viewingSubmission.document_url, '_blank')}
                              >
                                View Full Size
                              </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-10 border-t border-white/5">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="flex-1 rounded-2xl h-14 uppercase font-black text-xs tracking-widest hover:bg-white/5 border border-white/5 text-zinc-500"
                    onClick={() => setViewingSubmission(null)}
                  >
                    Cancel Review
                  </Button>
                  
                  <div className="flex-[2] flex gap-3">
                    <Button 
                      type="button" 
                      variant="destructive"
                      disabled={processing}
                      onClick={() => handleReview(viewingSubmission.id, 'rejected')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl h-14 shadow-lg shadow-red-600/20"
                    >
                      {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                        <div className="flex items-center gap-2">
                          <X className="h-4 w-4" /> Reject ID
                        </div>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      disabled={processing}
                      onClick={() => handleReview(viewingSubmission.id, 'approved')}
                      className="flex-[1.5] bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl h-14 shadow-xl shadow-emerald-600/20"
                    >
                      {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4" /> Approve Identity
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminKYCManagement;
