import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { User, Shield, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface ProfileData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  address: string;
  country: string;
  city: string;
  state: string;
  zip: string;
  currency: string;
  two_factor_enabled: boolean;
}

const SettingsView = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  
  const [profile, setProfile] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    address: "",
    country: "",
    city: "",
    state: "",
    zip: "",
    currency: "USD",
    two_factor_enabled: false,
  });

  const [passwords, setPasswords] = useState({
    old: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const { data, error } = await supabase
          .from('currencies')
          .select('code, name, symbol')
          .eq('is_active', true)
          .order('code', { ascending: true });
        
        if (error) throw error;
        setCurrencies(data || []);
      } catch (error) {
        console.error('Error fetching currencies:', error);
      }
    };

    const fetchProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        if (data) {
          setProfile({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            username: data.username || "",
            email: data.email || user.email || "",
            address: data.address || "",
            country: data.country || "",
            city: data.city || "",
            state: data.state || "",
            zip: data.zip || "",
            currency: data.currency || "USD",
            two_factor_enabled: data.two_factor_enabled || false,
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
    fetchProfile();
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUpdatingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          username: profile.username,
          address: profile.address,
          country: profile.country,
          city: profile.city,
          state: profile.state,
          zip: profile.zip,
          currency: profile.currency,
          two_factor_enabled: profile.two_factor_enabled,
        })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match");
      return;
    }

    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new,
      });

      if (error) throw error;
      toast.success("Password updated successfully");
      setPasswords({ old: "", new: "", confirm: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Personal Information Section */}
      <section className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden text-black">
        <div className="p-6 border-b border-zinc-50 flex items-center gap-2">
          <h2 className="text-xl font-bold text-black flex items-center gap-2">
            Personal Information <User className="h-5 w-5 text-amber-600" />
          </h2>
        </div>
        
        <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-black font-medium">Email</Label>
              <Input 
                value={profile.email} 
                disabled 
                className="bg-white border-amber-200 text-black font-semibold opacity-70"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username" className="text-black font-medium">Username</Label>
              <Input 
                className="bg-white border-amber-200 focus:border-amber-500 focus:ring-amber-500 text-black"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-black font-medium">Account Currency</Label>
              <Select 
                value={profile.currency} 
                onValueChange={(val) => setProfile(prev => ({ ...prev, currency: val }))}
              >
                <SelectTrigger className="bg-white border-amber-200 text-black h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-zinc-100 text-black border-zinc-200">
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name} ({currency.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-black font-medium">First Name</Label>
              <Input 
                id="first_name"
                name="first_name"
                value={profile.first_name}
                onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                className="bg-white border-amber-200 focus:border-amber-500 focus:ring-amber-500 text-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-black font-medium">Last Name</Label>
              <Input 
                id="last_name"
                name="last_name"
                value={profile.last_name}
                onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                className="bg-white border-amber-200 focus:border-amber-500 focus:ring-amber-500 text-black"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-black font-medium">Address</Label>
            <Input 
              id="address"
              name="address"
              value={profile.address}
              onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Enter your street address"
              className="bg-white border-amber-200 focus:border-amber-500 focus:ring-amber-500 text-black"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country" className="text-black font-medium">Country</Label>
            <Input 
              id="country"
              name="country"
              value={profile.country}
              onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
              placeholder="ENTER COUNTRY NAME"
              className="bg-white border-amber-200 focus:border-amber-500 focus:ring-amber-500 text-black placeholder:text-zinc-300"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="city" className="text-black font-medium">City</Label>
              <Input 
                id="city"
                name="city"
                value={profile.city}
                onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                className="bg-white border-amber-200 focus:border-amber-500 focus:ring-amber-500 text-black"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="state" className="text-black font-medium">State</Label>
              <Input 
                id="state"
                name="state"
                value={profile.state}
                onChange={(e) => setProfile(prev => ({ ...prev, state: e.target.value }))}
                className="bg-white border-amber-200 focus:border-amber-500 focus:ring-amber-500 text-black"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip" className="text-black font-medium">Zip</Label>
              <Input 
                id="zip"
                name="zip"
                value={profile.zip}
                onChange={(e) => setProfile(prev => ({ ...prev, zip: e.target.value }))}
                className="bg-white border-amber-200 focus:border-amber-500 focus:ring-amber-500 text-black"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 py-2">
            <Switch 
              id="2fa"
              checked={profile.two_factor_enabled}
              onCheckedChange={(checked) => setProfile(prev => ({ ...prev, two_factor_enabled: checked }))}
              className="data-[state=checked]:bg-amber-600"
            />
            <Label htmlFor="2fa" className="text-sm font-medium text-black cursor-pointer">
              Check to enable 2factor authentication for security
            </Label>
          </div>

          <Button 
            type="submit" 
            disabled={updatingProfile}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8"
          >
            {updatingProfile ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Save details"
            )}
          </Button>
        </form>
      </section>

      {/* Security Settings Section */}
      <section className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden text-black">
        <div className="p-6 border-b border-zinc-50 flex items-center gap-2">
          <h2 className="text-xl font-bold text-black flex items-center gap-2">
            Security Settings <Shield className="h-5 w-5 text-amber-600" />
          </h2>
        </div>

        <form onSubmit={handlePasswordUpdate} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="old_password" className="text-black font-medium">Old password</Label>
              <Input 
                id="old_password"
                name="old_password"
                type="password"
                value={passwords.old}
                onChange={(e) => setPasswords(prev => ({ ...prev, old: e.target.value }))}
                className="bg-white border-amber-200 focus:border-amber-500 focus:ring-amber-500 text-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password" className="text-black font-medium">New password</Label>
              <Input 
                id="new_password"
                name="new_password"
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                className="bg-white border-amber-200 focus:border-amber-500 focus:ring-amber-500 text-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password" className="text-black font-medium">Confirm password</Label>
              <Input 
                id="confirm_password"
                name="confirm_password"
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                className="bg-white border-amber-200 focus:border-amber-500 focus:ring-amber-500 text-black"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={updatingPassword}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8"
          >
            {updatingPassword ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Save details"
            )}
          </Button>
        </form>
      </section>
    </div>
  );
};

export default SettingsView;
