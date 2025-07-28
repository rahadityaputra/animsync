"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import createClient from "../../../../utils/supabase/client";

type UserContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
};

const UserContext = createContext<UserContextType>({
  user: null,
  session: null,
  loading: true,
  error: null,
});

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        console.log(error);


        if (error) throw error;

        setSession(session);
        setUser(session?.user ?? null);

        if (!session && !window.location.pathname.includes('/login')) {
          setTimeout(() => router.push('/signin'), 100);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to get session');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const handleAuthChange = async (_: string, session: Session | null) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (!session && !window.location.pathname.includes('/signin')) {
        setTimeout(() => router.push('/signin'), 100);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      mounted = false
      subscription?.unsubscribe();
    };
  }, [router, supabase.auth]);

  return (
    <UserContext.Provider value={{ user, session, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};

const useUser = () => useContext(UserContext);
export { UserProvider, useUser };
