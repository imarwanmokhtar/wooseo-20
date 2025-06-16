
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface UserDetails {
  email: string;
  id: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  credits: number;
  userDetails: UserDetails | null;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateCredits: (newCredits: number) => void;
  refreshCredits: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setUserDetails({
          email: session.user.email || '',
          id: session.user.id
        });
        fetchUserCredits(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        setUserDetails({
          email: session.user.email || '',
          id: session.user.id
        });
        
        // For new signups, we might need to wait a moment for the trigger to complete
        if (event === 'SIGNED_IN' && session.user.email_confirmed_at) {
          console.log('New user signed up, waiting for user record creation...');
          setTimeout(() => {
            fetchUserCredits(session.user.id);
          }, 1000);
        } else {
          fetchUserCredits(session.user.id);
        }
      } else {
        setUserDetails(null);
        setCredits(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserCredits = async (userId: string, retryCount = 0) => {
    try {
      console.log('Fetching credits for user:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching credits:', error);
        
        // If user record doesn't exist yet and we haven't retried much, try again
        if (error.code === 'PGRST116' && retryCount < 3) {
          console.log(`User record not found, retrying in 2 seconds... (attempt ${retryCount + 1})`);
          setTimeout(() => {
            fetchUserCredits(userId, retryCount + 1);
          }, 2000);
          return;
        }
        
        // If still no user record after retries, set default credits
        if (error.code === 'PGRST116') {
          console.log('User record still not found after retries, setting default credits');
          setCredits(10);
        }
        return;
      }

      console.log('Credits fetched successfully:', data?.credits);
      setCredits(data?.credits || 0);
    } catch (error) {
      console.error('Error in fetchUserCredits:', error);
      setCredits(0);
    }
  };

  const refreshCredits = async () => {
    if (user?.id) {
      await fetchUserCredits(user.id);
    }
  };

  const signUp = async (email: string, password: string, metadata: any = {}) => {
    const redirectUrl = `${window.location.origin}/`;
    
    console.log('Signing up user:', email);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata
      }
    });

    if (error) {
      console.error('Signup error:', error);
      throw error;
    }

    toast.success('Check your email for the confirmation link!');
  };

  const signIn = async (email: string, password: string) => {
    console.log('Signing in user:', email);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Signin error:', error);
      throw error;
    }

    toast.success('Successfully signed in!');
    navigate('/dashboard');
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error signing out');
      return;
    }
    
    toast.success('Successfully signed out!');
    navigate('/');
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      throw error;
    }

    toast.success('Check your email for the password reset link!');
  };

  // Alias for resetPassword to maintain compatibility
  const forgotPassword = resetPassword;

  const updateCredits = (newCredits: number) => {
    setCredits(newCredits);
  };

  const value = {
    user,
    session,
    loading,
    credits,
    userDetails,
    signUp,
    signIn,
    signOut,
    resetPassword,
    forgotPassword,
    updateCredits,
    refreshCredits,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
