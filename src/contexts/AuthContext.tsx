
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
  bulkEditorAccess: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateCredits: (newCredits: number) => void;
  refreshCredits: () => Promise<void>;
  checkSubscriptionStatus: () => Promise<void>;
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
  const [bulkEditorAccess, setBulkEditorAccess] = useState(false);
  const navigate = useNavigate();

  // Check if subscription is expired locally and handle lifetime access
  const checkLocalExpiration = (subscriptionEnd: string | null, hasSubscription: boolean, hasLifetimeAccess: boolean) => {
    // If user has lifetime access, they always have access
    if (hasLifetimeAccess) {
      return true;
    }
    
    // If no subscription, no access
    if (!hasSubscription) {
      return false;
    }
    
    // If subscription end is null and has subscription, it means unlimited access (for backward compatibility)
    if (!subscriptionEnd) {
      return true;
    }
    
    // Check if subscription is still valid
    const endDate = new Date(subscriptionEnd);
    const now = new Date();
    return now <= endDate;
  };

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
        setBulkEditorAccess(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserCredits = async (userId: string, retryCount = 0) => {
    try {
      console.log('Fetching credits and subscription status for user:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('credits, bulk_editor_subscription, bulk_editor_subscription_end, bulk_editor_lifetime_access')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        
        // If user record doesn't exist yet and we haven't retried much, try again
        if (error.code === 'PGRST116' && retryCount < 3) {
          console.log(`User record not found, retrying in 2 seconds... (attempt ${retryCount + 1})`);
          setTimeout(() => {
            fetchUserCredits(userId, retryCount + 1);
          }, 2000);
          return;
        }
        
        // If still no user record after retries, set defaults
        if (error.code === 'PGRST116') {
          console.log('User record still not found after retries, setting defaults');
          setCredits(10);
          setBulkEditorAccess(false);
        }
        return;
      }

      console.log('User data fetched successfully:', data);
      setCredits(data?.credits || 0);
      
      // Check if subscription is still valid (including lifetime access)
      const hasValidSubscription = checkLocalExpiration(
        data?.bulk_editor_subscription_end, 
        data?.bulk_editor_subscription || false,
        data?.bulk_editor_lifetime_access || false
      );
      
      setBulkEditorAccess(hasValidSubscription);
      
      console.log('Bulk editor access determined:', {
        hasSubscription: data?.bulk_editor_subscription,
        subscriptionEnd: data?.bulk_editor_subscription_end,
        hasLifetimeAccess: data?.bulk_editor_lifetime_access,
        finalAccess: hasValidSubscription
      });
      
      // If subscription appears expired locally (but not lifetime), trigger server-side check
      if (data?.bulk_editor_subscription && !data?.bulk_editor_lifetime_access && !hasValidSubscription) {
        console.log('Subscription appears expired, triggering server-side expiration check');
        await checkSubscriptionStatus();
      }
      
    } catch (error) {
      console.error('Error in fetchUserCredits:', error);
      setCredits(0);
      setBulkEditorAccess(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      console.log('Checking subscription status with server...');
      const { data, error } = await supabase.functions.invoke('expire-subscriptions');
      
      if (error) {
        console.error('Error checking subscription status:', error);
        return;
      }
      
      console.log('Subscription check result:', data);
      
      // Refresh user data after expiration check
      if (user?.id) {
        await fetchUserCredits(user.id);
      }
    } catch (error) {
      console.error('Error in checkSubscriptionStatus:', error);
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
    bulkEditorAccess,
    signUp,
    signIn,
    signOut,
    resetPassword,
    forgotPassword,
    updateCredits,
    refreshCredits,
    checkSubscriptionStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
