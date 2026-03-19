import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { role, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // ✅ Only redirect AFTER auth fully resolved
  useEffect(() => {
    if (!authLoading && role === 'admin') {
      navigate('/admin');
    }
  }, [role, authLoading, navigate]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      toast.success('Login successful. Verifying admin privileges...');
      // The role check/redirect is handled by the useEffect above
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      console.error('Admin Login Error:', error);
      setLoading(false);
    }
  };

  // ✅ Prevent UI flicker / hanging confusion
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="h-16 w-16 bg-amber-500 rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck className="h-10 w-10 text-black" />
          </div>

          <h1 className="text-3xl font-black text-white uppercase">
            Al Safat Admin
          </h1>

          <p className="text-zinc-500 text-sm text-center">
            Restricted Access Portal
          </p>
        </div>

        <Card className="bg-zinc-900/50 border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Secure Login</CardTitle>
            <CardDescription>
              Enter your credentials
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-6">

              <div>
                <Label>Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="bg-amber-500/10 p-3 rounded text-xs text-amber-400 flex gap-2">
                <AlertCircle className="h-4 w-4" />
                Unauthorized access is monitored
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    Login <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <button onClick={() => navigate('/')} className="text-sm text-zinc-500">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;