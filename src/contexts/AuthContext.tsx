import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  role: 'admin' | 'operator' | 'service_center' | null;
  serviceCenterId: string | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  serviceCenterId: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'operator' | 'service_center' | null>(null);
  const [serviceCenterId, setServiceCenterId] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If using placeholder, don't try to fetch session
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co') {
      setLoading(false);
      return;
    }

    const fetchProfile = async (userId: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('role, service_center_id')
        .eq('id', userId)
        .single();
      return data || { role: 'operator', service_center_id: null };
    };

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setRole(profile.role);
        setServiceCenterId(profile.service_center_id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setRole(profile.role);
        setServiceCenterId(profile.service_center_id);
      } else {
        setRole(null);
        setServiceCenterId(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Demo mode bypass
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co') {
      if (email === 'kappalumackalcables@gmail.com' && password === 'Cables@123') {
        const demoSession = {
          access_token: 'demo-token',
          user: { id: 'demo-user', email: 'kappalumackalcables@gmail.com' } as User
        } as Session;
        setSession(demoSession);
        setUser(demoSession.user);
        setRole('admin');
        return { error: null };
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.session) {
      setSession(data.session);
      setUser(data.user);
    }
    return { error };
  };

  const signOut = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co') {
      setSession(null);
      setUser(null);
      setRole(null);
      setServiceCenterId(null);
      return;
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, role, serviceCenterId, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
