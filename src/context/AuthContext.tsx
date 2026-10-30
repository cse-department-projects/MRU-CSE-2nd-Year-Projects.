import React, { createContext, useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { IUser } from '../models';

export interface AuthContextType {
  isAuthenticated: boolean;
  user: IUser | null;
  session: Session | null;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  signIn: (data: any) => Promise<any>;
  signUp: (data: any) => Promise<any>;
  isLoading: boolean;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<IUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial session fetch
    const fetchSession = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, avatar_url')
          .eq('id', session.user.id)
          .single();
          
        setUser({
          id: session.user.id,
          name: profile?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          avatar_url: profile?.avatar_url || ''
        });
        setSession(session);
        setIsAuthenticated(true);
      } else {
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    fetchSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (newSession) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, avatar_url')
          .eq('id', newSession.user.id)
          .single();
          
        setUser({
          id: newSession.user.id,
          name: profile?.full_name || newSession.user.email?.split('@')[0] || 'User',
          email: newSession.user.email || '',
          avatar_url: profile?.avatar_url || ''
        });
        setSession(newSession);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setSession(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshUser = async () => {
    const { data: { session: newSession } } = await supabase.auth.getSession();
    setSession(newSession);
    if (newSession) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, avatar_url')
        .eq('id', newSession.user.id)
        .single();
        
      setUser({
        id: newSession.user.id,
        name: profile?.full_name || newSession.user.email?.split('@')[0] || 'User',
        email: newSession.user.email || '',
        avatar_url: profile?.avatar_url || ''
      });
    }
  };

  const signIn = async (credentials: any) => {
    return supabase.auth.signInWithPassword(credentials);
  };

  const signUp = async (credentials: any) => {
    return supabase.auth.signUp(credentials);
  };

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      session,
      logout: signOut, 
      signOut, 
      signIn,
      signUp,
      isLoading, 
      loading: isLoading,
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
