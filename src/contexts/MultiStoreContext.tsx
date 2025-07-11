
import React, { createContext, useContext, useState, useEffect } from 'react';
import { WooCommerceCredentials, StoreUsage } from '@/types';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface MultiStoreContextType {
  stores: WooCommerceCredentials[];
  activeStore: WooCommerceCredentials | null;
  storeUsage: StoreUsage[];
  loading: boolean;
  setActiveStore: (store: WooCommerceCredentials) => void;
  refreshStores: () => Promise<void>;
  refreshUsage: () => Promise<void>;
}

const MultiStoreContext = createContext<MultiStoreContextType | undefined>(undefined);

export const useMultiStore = () => {
  const context = useContext(MultiStoreContext);
  if (!context) {
    throw new Error('useMultiStore must be used within a MultiStoreProvider');
  }
  return context;
};

export const MultiStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [stores, setStores] = useState<WooCommerceCredentials[]>([]);
  const [activeStore, setActiveStoreState] = useState<WooCommerceCredentials | null>(null);
  const [storeUsage, setStoreUsage] = useState<StoreUsage[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshStores = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching stores for user:', user.id);
      const { data, error } = await supabase
        .from('woocommerce_credentials')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching stores:', error);
        setStores([]);
        setActiveStoreState(null);
        setLoading(false);
        return;
      }

      console.log('Fetched stores data:', data);

      const formattedStores = (data || []).map(store => ({
        id: store.id,
        user_id: store.user_id,
        store_name: store.store_name || 'My Store',
        url: store.store_url,
        consumer_key: store.consumer_key,
        consumer_secret: store.consumer_secret,
        version: 'wc/v3',
        is_active: store.is_active || false,
        created_at: store.created_at,
        updated_at: store.updated_at,
      }));

      console.log('Formatted stores:', formattedStores);
      setStores(formattedStores);

      // Set active store if none selected or if current active store is not in the list
      const savedActiveStoreId = localStorage.getItem('activeStoreId');
      let newActiveStore = null;

      if (savedActiveStoreId) {
        newActiveStore = formattedStores.find(s => s.id === savedActiveStoreId);
      }

      if (!newActiveStore && formattedStores.length > 0) {
        newActiveStore = formattedStores.find(s => s.is_active) || formattedStores[0];
      }

      console.log('Setting active store:', newActiveStore);
      setActiveStoreState(newActiveStore);

    } catch (error) {
      console.error('Error in refreshStores:', error);
      setStores([]);
      setActiveStoreState(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUsage = async () => {
    if (!user?.id || stores.length === 0) {
      console.log('Skipping refreshUsage: no user or stores', { userId: user?.id, storesLength: stores.length });
      return;
    }

    try {
      console.log('Refreshing store usage for user:', user.id);
      
      // Fetch the actual used_credits from the woocommerce_credentials table
      const { data: storeCreditsData, error } = await supabase
        .from('woocommerce_credentials')
        .select('id, store_name, used_credits')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching store credits:', error);
        return;
      }

      console.log('Fetched store credits data:', storeCreditsData);

      const usage = (storeCreditsData || []).map(store => ({
        store_id: store.id,
        store_name: store.store_name,
        credits_used: store.used_credits || 0,
        products_generated: 0, // We could track this separately if needed
      }));

      console.log('Calculated store usage:', usage);
      setStoreUsage(usage);
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  };

  const setActiveStore = (store: WooCommerceCredentials) => {
    console.log('Setting active store to:', store);
    setActiveStoreState(store);
    if (store.id) {
      localStorage.setItem('activeStoreId', store.id);
    }
  };

  useEffect(() => {
    if (user?.id) {
      refreshStores();
    } else {
      setStores([]);
      setActiveStoreState(null);
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (stores.length > 0 && user?.id) {
      console.log('Stores updated, refreshing usage...');
      refreshUsage();
    }
  }, [stores, user?.id]);

  return (
    <MultiStoreContext.Provider
      value={{
        stores,
        activeStore,
        storeUsage,
        loading,
        setActiveStore,
        refreshStores,
        refreshUsage,
      }}
    >
      {children}
    </MultiStoreContext.Provider>
  );
};
