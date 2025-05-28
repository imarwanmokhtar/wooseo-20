
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  userDetails: any;
  loading: boolean;
  credits: number;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
  refreshCredits: () => Promise<void>;
  updateCredits: (newCredits: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST to prevent missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Use setTimeout to prevent potential deadlocks
          setTimeout(() => {
            fetchUserDetails(currentSession.user.id);
          }, 0);
        } else {
          setUserDetails(null);
          setCredits(0);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Initial session check:', currentSession?.user?.id);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserDetails(currentSession.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserDetails = async (userId: string) => {
    try {
      console.log('Fetching user details for:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user details:', error);
        // Continue with the flow even if there's an error
        setLoading(false);
        return;
      }
      
      if (!data) {
        // User record doesn't exist, create it
        console.log('User record not found, creating new record for:', userId);
        await createUserRecord(userId);
        return;
      }
      
      console.log('User details fetched:', data);
      setUserDetails(data);
      setCredits(data.credits || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchUserDetails:', error);
      setLoading(false);
    }
  };

  const createUserRecord = async (userId: string) => {
    try {
      console.log('Creating user record for:', userId);
      
      // Get user email from the current session
      const userEmail = user?.email || session?.user?.email;
      
      if (!userEmail) {
        console.error('No email available for user record creation');
        setLoading(false);
        return;
      }
      
      // Check if a record already exists to prevent RLS errors
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
        
      if (existingUser) {
        console.log('User record already exists, fetching details');
        fetchUserDetails(userId);
        return;
      }
      
      const { data, error } = await supabase
        .from('users')
        .insert([
          { 
            id: userId, 
            email: userEmail,
            credits: 10 // Give new users 10 free credits
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating user record:', error);
        // Even if creation fails, allow the user to continue
        setLoading(false);
        return;
      }
      
      console.log('User record created:', data);
      setUserDetails(data);
      setCredits(data.credits || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error creating user record:', error);
      setLoading(false);
    }
  };

  const refreshCredits = async () => {
    if (user) {
      try {
        console.log('Refreshing credits for user:', user.id);
        const { data, error } = await supabase
          .from('users')
          .select('credits')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error refreshing credits:', error);
          return;
        }
        
        if (data) {
          console.log('Credits refreshed:', data.credits);
          setCredits(data.credits || 0);
        } else {
          // If data is null, create user record
          await createUserRecord(user.id);
        }
      } catch (error) {
        console.error('Error refreshing credits:', error);
      }
    }
  };

  const updateCredits = async (newCredits: number) => {
    if (user) {
      try {
        console.log('Updating credits for user:', user.id, 'New credits:', newCredits);
        
        // Check if user record exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, credits')
          .eq('id', user.id)
          .maybeSingle();
          
        if (!existingUser) {
          // Create the user record if it doesn't exist
          await createUserRecord(user.id);
          
          // Then update with new credits
          const { data, error } = await supabase
            .from('users')
            .update({ credits: newCredits })
            .eq('id', user.id)
            .select()
            .single();
            
          if (error) throw error;
          
          console.log('Credits updated successfully:', data);
          setCredits(newCredits);
          setUserDetails(prev => ({ ...prev, credits: newCredits }));
          return;
        }
        
        const { data, error } = await supabase
          .from('users')
          .update({ credits: newCredits })
          .eq('id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        
        console.log('Credits updated successfully:', data);
        setCredits(newCredits);
        setUserDetails(prev => ({ ...prev, credits: newCredits }));
      } catch (error) {
        console.error('Error updating credits:', error);
        throw error;
      }
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success('Registration successful! Please check your email for verification.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Error signing up');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Error signing in');
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error.message || 'Error sending password reset email');
    }
  };

  const resetPassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) throw error;
      
      toast.success('Password updated successfully!');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Error resetting password');
    }
  };

  const value = {
    session,
    user,
    userDetails,
    loading,
    credits,
    signUp,
    signIn,
    signOut,
    forgotPassword,
    resetPassword,
    refreshCredits,
    updateCredits
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
