'use client';

import { createClient } from '@/lib/supabase/client';
import type { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type SupabaseAuthContextValue = {
  supabase: ReturnType<typeof createClient>;
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
};

const SupabaseAuthContext = createContext<SupabaseAuthContextValue | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error loading Supabase session:', error.message);
      }
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    void init();

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ?? null };
  };

  const signUpWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error ?? null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setSession(null);
      setUser(null);
    }
    return { error: error ?? null };
  };

  const value: SupabaseAuthContextValue = {
    supabase,
    session,
    user,
    loading,
    signInWithPassword,
    signUpWithPassword,
    signOut,
  };

  // Prevent flash by not rendering children until initial auth check completes
  if (loading) {
    return null;
  }

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}