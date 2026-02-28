"use client";
import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  university: string | null;
  course: string | null;
  year_of_study: string | null;
  access_expires_at: string | null;
  stripe_customer_id: string | null;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  hasAccess: boolean;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  hasAccess: false,
  signOut: () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const PUBLIC_PAGES = ["/", "/login", "/pricing", "/terms", "/privacy", "/about"];
const PROFILE_CACHE_KEY = "ergo_profile";

function getCachedProfile(): Profile | null {
  try {
    const raw = sessionStorage.getItem(PROFILE_CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function setCachedProfile(p: Profile | null) {
  try {
    if (p) sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(p));
    else sessionStorage.removeItem(PROFILE_CACHE_KEY);
  } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const redirecting = useRef(false);
  const fetchingProfile = useRef(false);
  const initDone = useRef(false);

  const updateProfile = useCallback((p: Profile | null) => {
    setProfile(p);
    setCachedProfile(p);
  }, []);

  const fetchProfile = useCallback(async (_userId: string): Promise<Profile | null> => {
    if (fetchingProfile.current) return null;
    fetchingProfile.current = true;

    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const { profile } = await res.json();
        fetchingProfile.current = false;
        return profile as Profile;
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    }

    fetchingProfile.current = false;
    return null;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const p = await fetchProfile(user.id);
      if (p) updateProfile(p);
    }
  }, [user, fetchProfile, updateProfile]);

  const hasAccess = !!profile?.access_expires_at &&
    new Date(profile.access_expires_at) > new Date();

  // Step 1: Immediately load cache on mount (client-side only)
  useEffect(() => {
    const cached = getCachedProfile();
    if (cached) {
      setProfile(cached);
      setLoading(false); // Unblock UI immediately with cached data
    }
  }, []);

  // Step 2: Init auth session + background refresh
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    let mounted = true;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);

          // Fetch fresh profile
          const fresh = await fetchProfile(session.user.id);
          if (mounted && fresh) {
            updateProfile(fresh);
          }
        } else {
          // No session — clear everything
          setUser(null);
          updateProfile(null);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      }
      // Always unblock UI after init, even if it failed
      if (mounted) setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
          const p = await fetchProfile(session.user.id);
          if (mounted && p) updateProfile(p);
          if (mounted) setLoading(false);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          updateProfile(null);
          setLoading(false);
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          setUser(session.user);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, updateProfile]);

  // Handle redirects
  useEffect(() => {
    if (loading || redirecting.current) return;

    const isPublic = PUBLIC_PAGES.includes(pathname);
    const hasProfile = !!profile;

    // Not logged in, no cached profile, trying to access protected page
    if (!user && !hasProfile && !isPublic) {
      redirecting.current = true;
      router.push("/login");
      setTimeout(() => { redirecting.current = false; }, 1500);
      return;
    }

    // Logged in + needs onboarding
    if (user && profile && !profile.university && pathname !== "/onboarding") {
      redirecting.current = true;
      router.push("/onboarding");
      setTimeout(() => { redirecting.current = false; }, 1500);
      return;
    }

    // Logged in + completed onboarding + on login or onboarding page
    if (user && profile?.university && (pathname === "/login" || pathname === "/onboarding")) {
      redirecting.current = true;
      router.push("/dashboard");
      setTimeout(() => { redirecting.current = false; }, 1500);
      return;
    }
  }, [user, profile, loading, pathname, router]);

  const signOut = useCallback(() => {
    supabase.auth.signOut().then(() => {
      setUser(null);
      updateProfile(null);
      router.push("/");
    });
  }, [router, updateProfile]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, hasAccess, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}