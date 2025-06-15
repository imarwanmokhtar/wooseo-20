
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Affiliate {
  id: string;
  user_id: string;
  affiliate_code: string;
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  commission_rate: number;
  total_earnings: number;
  total_referrals: number;
  created_at: string;
  updated_at: string;
}

export const useAffiliateStatus = () => {
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAffiliate = async () => {
    if (!user) {
      setLoading(false);
      setAffiliate(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching affiliate data for user:', user.id);
      
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching affiliate:', error);
        setError('Failed to load affiliate data');
        setAffiliate(null);
      } else {
        console.log('Affiliate data:', data);
        setAffiliate(data);
      }
    } catch (error) {
      console.error('Error in fetchAffiliate:', error);
      setError('An unexpected error occurred');
      setAffiliate(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliate();
  }, [user]);

  return {
    affiliate,
    loading,
    error,
    refetch: fetchAffiliate
  };
};
