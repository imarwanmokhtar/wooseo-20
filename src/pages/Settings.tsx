
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiStore } from '@/contexts/MultiStoreContext';
import { testConnection } from '@/services/wooCommerceApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Settings as SettingsIcon, TestTube, CheckCircle, AlertCircle, Store } from 'lucide-react';
import { WooCommerceCredentials } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const Settings = () => {
  const { user } = useAuth();
  const { activeStore, stores, refreshStores } = useMultiStore();
  const [credentials, setCredentials] = useState<WooCommerceCredentials>({
    store_name: '',
    url: '',
    consumer_key: '',
    consumer_secret: '',
    version: 'wc/v3',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;

      try {
        // Load credentials from active store
        if (activeStore) {
          console.log('Loading settings for active store:', activeStore);
          setCredentials({
            id: activeStore.id,
            store_name: activeStore.store_name,
            url: activeStore.url,
            consumer_key: activeStore.consumer_key,
            consumer_secret: activeStore.consumer_secret,
            version: activeStore.version || 'wc/v3',
            user_id: activeStore.user_id,
            is_active: activeStore.is_active,
            created_at: activeStore.created_at,
            updated_at: activeStore.updated_at,
          });
          setConnectionStatus('success');
        } else {
          console.log('No active store found');
          setCredentials({
            store_name: '',
            url: '',
            consumer_key: '',
            consumer_secret: '',
            version: 'wc/v3',
          });
          setConnectionStatus('unknown');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user?.id, activeStore]);

  const handleTestConnection = async () => {
    if (!credentials.url || !credentials.consumer_key || !credentials.consumer_secret) {
      toast.error('Please fill in all WooCommerce credentials');
      return;
    }

    setTesting(true);
    setError(null);

    try {
      const isConnected = await testConnection(credentials);
      if (isConnected) {
        setConnectionStatus('success');
        toast.success('Connection successful!');
      } else {
        setConnectionStatus('error');
        setError('Failed to connect to WooCommerce store. Please check your credentials.');
        toast.error('Connection failed');
      }
    } catch (error) {
      setConnectionStatus('error');
      setError('Connection test failed. Please verify your credentials.');
      toast.error('Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Update store credentials if we have an active store
      if (activeStore?.id && credentials.store_name && credentials.url && credentials.consumer_key && credentials.consumer_secret) {
        const { error } = await supabase
          .from('woocommerce_credentials')
          .update({
            store_name: credentials.store_name,
            store_url: credentials.url,
            consumer_key: credentials.consumer_key,
            consumer_secret: credentials.consumer_secret,
          })
          .eq('id', activeStore.id)
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }

        // Refresh stores to get the updated data
        await refreshStores();
      }

      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings. Please try again.');
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-seo-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <SettingsIcon className="h-8 w-8 mr-3 text-seo-primary" />
          Settings
        </h1>
        <p className="text-gray-600">
          Manage your WooCommerce store connections
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* All Stores Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Store className="h-5 w-5 mr-2 text-seo-primary" />
              Connected Stores ({stores.length})
            </CardTitle>
            <CardDescription>
              All your connected WooCommerce stores. Switch stores using the store selector on the Dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stores.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No stores connected. Please add a store from the Dashboard.
              </div>
            ) : (
              <div className="space-y-3">
                {stores.map((store) => (
                  <div key={store.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{store.store_name}</span>
                        {activeStore?.id === store.id && (
                          <Badge variant="default">Active</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{store.url}</div>
                      <div className="text-xs text-gray-400">
                        Created: {new Date(store.created_at || '').toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Store Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              WooCommerce Connection - Active Store
              {connectionStatus === 'success' && (
                <CheckCircle className="h-5 w-5 ml-2 text-green-600" />
              )}
              {connectionStatus === 'error' && (
                <AlertCircle className="h-5 w-5 ml-2 text-red-600" />
              )}
            </CardTitle>
            <CardDescription>
              {activeStore ? (
                <>
                  <div>Currently editing: <strong>{activeStore.store_name}</strong></div>
                  <div className="text-sm text-gray-500 mt-1">
                    Switch to a different store using the store selector on the Dashboard to edit its settings.
                  </div>
                </>
              ) : (
                'No active store selected. Please go to Dashboard to add or select a store.'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                placeholder="My Store"
                value={credentials.store_name}
                onChange={(e) => setCredentials(prev => ({ ...prev, store_name: e.target.value }))}
                disabled={!activeStore}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeUrl">Store URL</Label>
              <Input
                id="storeUrl"
                placeholder="https://yourstore.com"
                value={credentials.url}
                onChange={(e) => setCredentials(prev => ({ ...prev, url: e.target.value }))}
                disabled={!activeStore}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consumerKey">Consumer Key</Label>
              <Input
                id="consumerKey"
                placeholder="ck_xxxxxxxxxxxxxxxxxxxxx"
                value={credentials.consumer_key}
                onChange={(e) => setCredentials(prev => ({ ...prev, consumer_key: e.target.value }))}
                disabled={!activeStore}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consumerSecret">Consumer Secret</Label>
              <Input
                id="consumerSecret"
                placeholder="cs_xxxxxxxxxxxxxxxxxxxxx"
                value={credentials.consumer_secret}
                onChange={(e) => setCredentials(prev => ({ ...prev, consumer_secret: e.target.value }))}
                type="password"
                disabled={!activeStore}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleTestConnection} 
                disabled={testing || !activeStore}
                variant="outline"
              >
                {testing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
            </div>

            {!activeStore && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please go to the Dashboard to add or select a store before configuring settings.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveSettings} 
            disabled={saving}
            className="min-w-[120px]"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <SettingsIcon className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
