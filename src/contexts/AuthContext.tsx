import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

export type UserRole = "admin" | "user";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  isAdmin: boolean;
  isUser: boolean;
  kycStatus: string | null;
  kycRejectionReason: string | null;
  loading: boolean;
  roleLoading: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [kycRejectionReason, setKycRejectionReason] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);        // auth loading
  const [roleLoading, setRoleLoading] = useState(true); // role loading

  const isAdmin = role === "admin";
  const isUser = role === "user";

  // // 🔥 Fetch role (clean, no caching nonsense)
  // const fetchRole = async (userId: string) => {
  //   setRoleLoading(true);

  //   try {
  //     const { data, error } = await supabase
  //       .from("user_roles")
  //       .select("role")
  //       .eq("user_id", userId)
  //       .single();

  //     if (error) throw error;

  //     if (data?.role === "admin" || data?.role === "user") {
  //       setRole(data.role);
  //     } else {
  //       setRole(null);
  //     }
  //   } catch (err) {
  //     console.error("Error fetching role:", err);
  //     setRole(null); // don’t fake role
  //   } finally {
  //     setRoleLoading(false);
  //   }
  // };

  const fetchRole = async (userId: string) => {
    setRoleLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle(); // Use maybeSingle to avoid 406 errors on empty rows

      if (error) throw error;

      if (data?.role) {
        setRole(data.role as UserRole);
      } else {
        setRole("user"); // Default to user if no role found
      }
    } catch (err) {
      console.error("Error fetching role:", err);
      setRole("user"); // Fail safe to 'user'
    } finally {
      setRoleLoading(false);
    }
  };

  const fetchKycStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("kyc_status, kyc_rejection_reason")
        .eq("id", userId)
        .maybeSingle();
      
      if (error) throw error;
      setKycStatus(data?.kyc_status || "unverified");
      setKycRejectionReason(data?.kyc_rejection_reason || null);
    } catch (err) {
      console.error("Error fetching KYC status:", err);
      setKycStatus("unverified");
    }
  };

  const refreshRole = async () => {
    if (user?.id) {
      await Promise.all([
        fetchRole(user.id),
        fetchKycStatus(user.id)
      ]);
    }
  };

  useEffect(() => {
    // ✅ Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth event:", event);

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          fetchRole(session.user.id);
          fetchKycStatus(session.user.id);
        } else {
          setRole(null);
          setKycStatus(null);
          setRoleLoading(false);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);

    await supabase.auth.signOut();

    setUser(null);
    setSession(null);
    setRole(null);
    setKycStatus(null);
    setKycRejectionReason(null);

    setLoading(false);
    setRoleLoading(false);
  };

  const value: AuthContextType = {
    user,
    session,
    role,
    isAdmin,
    isUser,
    kycStatus,
    kycRejectionReason,
    loading,
    roleLoading,
    signOut,
    refreshRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};