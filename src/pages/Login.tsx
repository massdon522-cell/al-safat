import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "Login successful.",
      });

      // Role and navigation will be handled by the layout/protected route or on next render
      const role = data.user?.user_metadata?.role || "user";
      navigate(role === "admin" ? "/admin" : "/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-amber-200 to-teal-300 flex flex-col items-center py-12 px-4 relative overflow-hidden">
      {/* Brand Header */}
      <div className="max-w-7xl w-full flex justify-between items-start mb-8 absolute top-8 left-8 right-8 z-10">
        <Link to="/" className="flex items-center gap-2">
          <svg
            className="w-10 h-10 text-amber-600 drop-shadow-sm"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
          <span className="font-black text-amber-600 text-lg uppercase tracking-tight italic">
            AL SAFAT PLATFORM
          </span>
        </Link>
      </div>


      {/* Login Card */}
      <div className="max-w-4xl w-full bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-700 mt-20 p-12 md:p-16 text-center border-b-8 border-amber-600">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <LogIn className="w-10 h-10" />
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Account Login</h2>
          </div>
          <p className="text-zinc-500 font-medium text-xl mb-12">Login into your account here!</p>
        </div>

        <form className="space-y-6 text-left max-w-3xl mx-auto" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="text-amber-600 font-black text-lg ml-2" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-black border-2 border-zinc-200 rounded-xl px-6 py-4 text-xl outline-none focus:border-amber-500 transition-colors font-medium"
              placeholder=""
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-amber-600 font-black text-lg ml-2" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-black bg-transparent border-2 border-zinc-200 rounded-xl px-6 py-4 text-xl outline-none focus:border-amber-500 transition-colors font-medium"
              placeholder=""
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black text-2xl py-8 rounded-xl shadow-lg transition-all hover:scale-[1.01] mt-8 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin h-8 w-8" /> : "Login"}
          </Button>

          <div className="pt-8 space-y-4 text-center">
            <p className="text-blue-500 font-bold text-lg">
              Dont have an account create one <Link to="/signup" className="text-blue-600 underline">Here</Link>
            </p>
            <p className="text-blue-500 font-bold text-lg">
              Forgot password reset <Link to="#" className="text-blue-600 underline">Here</Link>
            </p>
          </div>
        </form>
      </div>

      {/* JivoChat Placeholder Style */}
      <div className="fixed bottom-0 right-0 z-50 p-4">
        <div className="bg-gradient-to-r from-purple-700 to-blue-500 text-white px-6 py-3 rounded-t-2xl font-bold text-sm shadow-2xl flex items-center gap-2">
          Chat with us, we're online! <span className="text-[10px] opacity-70">jivochat</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
