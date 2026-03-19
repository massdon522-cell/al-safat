import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    referral: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            username: formData.username,
            referral: formData.referral,
            role: "user",
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Account created!",
        description: "Your account is ready. Please log in.",
      });

      navigate("/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
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


      {/* Signup Card */}
      <div className="max-w-6xl w-full bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-700 mt-10 p-8 md:p-12 text-center border-b-8 border-amber-600">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <UserPlus className="w-10 h-10" />
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Registration</h2>
          </div>
          <p className="text-zinc-500 font-medium text-lg mb-8">Create an account and get started today!</p>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-5xl mx-auto" onSubmit={handleSignup}>
          <div className="space-y-1">
            <label className="text-amber-600 font-black text-sm ml-2" htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-transparent text-black border border-zinc-300 rounded-lg px-4 py-3 text-lg outline-none focus:border-amber-500 transition-colors font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-amber-600 font-black text-sm ml-2" htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-transparent text-black  border border-zinc-300 rounded-lg px-4 py-3 text-lg outline-none focus:border-amber-500 transition-colors font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-amber-600 font-black text-sm ml-2" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-transparent border text-black  border-zinc-300 rounded-lg px-4 py-3 text-lg outline-none focus:border-amber-500 transition-colors font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-amber-600 font-black text-sm ml-2" htmlFor="username">username</label>
            <input
              id="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-transparent border text-black  border-zinc-300 rounded-lg px-4 py-3 text-lg outline-none focus:border-amber-500 transition-colors font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-amber-600 font-black text-sm ml-2" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-transparent border text-black  border-zinc-300 rounded-lg px-4 py-3 text-lg outline-none focus:border-amber-500 transition-colors font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-amber-600 font-black text-sm ml-2" htmlFor="referral">referral</label>
            <input
              id="referral"
              type="text"
              value={formData.referral}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-transparent border text-black  border-zinc-300 rounded-lg px-4 py-3 text-lg outline-none focus:border-amber-500 transition-colors font-medium"
            />
          </div>

          <div className="md:col-span-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black text-xl py-6 rounded-lg shadow-lg transition-all hover:scale-[1.01] mt-4 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Register"}
            </Button>
          </div>

          <div className="md:col-span-2 pt-4 text-center">
            <p className="text-blue-500 font-bold text-base">
              Already got an account login <Link to="/login" className="text-blue-600 underline">Here</Link>
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

export default Signup;
