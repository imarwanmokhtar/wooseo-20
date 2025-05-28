import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiStore } from '@/contexts/MultiStoreContext';
import { testConnection } from '@/services/wooCommerceApi';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WooCommerceCredentials } from '@/types';
import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WooCommerceSetupProps {
  onConnected: () => void;
}

const WooCommerceSetup: React.FC<WooCommerceSetupProps> = ({ onConnected }) => {
  const [storeName, setStoreName] = useState('');
  const [url, setUrl] = useState('');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { user } = useAuth();
  const { refreshStores } = useMultiStore();

  const validateInputs = () => {
    if (!storeName.trim()) {
      setConnectionError("Please enter a store name");
      return false;
    }
    if (!url.trim()) {
      setConnectionError("Please enter your store URL");
      return false;
    }
    if (!consumerKey.trim()) {
      setConnectionError("Please enter your Consumer Key");
      return false;
    }
    if (!consumerSecret.trim()) {
      setConnectionError("Please enter your Consumer Secret");
      return false;
    }
    return true;
  };

  const normalizeUrl = (inputUrl: string) => {
    let normalizedUrl = inputUrl.trim();
    
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    
    normalizedUrl = normalizedUrl.replace(/\/$/, '');
    
    return normalizedUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("User authentication required");
      return;
    }

    if (!validateInputs()) {
      return;
    }

    setConnectionError(null);
    setIsConnecting(true);

    try {
      const normalizedUrl = normalizeUrl(url);

      const credentials: WooCommerceCredentials = {
        store_name: storeName.trim(),
        url: normalizedUrl,
        consumer_key: consumerKey.trim(),
        consumer_secret: consumerSecret.trim(),
        version: 'wc/v3',
      };

      console.log('Testing connection with credentials...');
      const isConnected = await testConnection(credentials);
      
      if (!isConnected) {
        setConnectionError(
          "Could not connect to your WooCommerce store. Please verify:\n" +
          "• Your store URL is correct and accessible\n" +
          "• Your Consumer Key and Secret are valid\n" +
          "• WooCommerce REST API is enabled\n" +
          "• Your API keys have Read/Write permissions\n" +
          "• Your site supports HTTPS (required for API access)"
        );
        setIsConnecting(false);
        return;
      }

      console.log('Connection successful, saving credentials...');
      
      // Save to database
      const { error } = await supabase
        .from('woocommerce_credentials')
        .insert({
          user_id: user.id,
          store_name: credentials.store_name,
          store_url: credentials.url,
          consumer_key: credentials.consumer_key,
          consumer_secret: credentials.consumer_secret,
        });

      if (error) {
        console.error('Error saving credentials:', error);
        throw error;
      }
      
      console.log('Credentials saved successfully, refreshing stores...');
      
      // Refresh stores to get the updated list
      await refreshStores();
      
      toast.success("Successfully connected to your WooCommerce store!");
      onConnected();
      
      // Clear form
      setStoreName('');
      setUrl('');
      setConsumerKey('');
      setConsumerSecret('');
      
    } catch (error) {
      console.error('Error connecting to WooCommerce:', error);
      setConnectionError(
        `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
        "Please check your credentials and try again."
      );
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {connectionError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="whitespace-pre-line">{connectionError}</AlertDescription>
          </Alert>
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Make sure your WooCommerce store has SSL enabled (HTTPS) and the REST API is accessible.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="storeName">Store Name</Label>
          <Input
            id="storeName"
            placeholder="My Store"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
            disabled={isConnecting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="storeUrl">Store URL</Label>
          <Input
            id="storeUrl"
            placeholder="https://yourstore.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            disabled={isConnecting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="consumerKey">Consumer Key</Label>
          <Input
            id="consumerKey"
            placeholder="ck_xxxxxxxxxxxxxxxxxxxxx"
            value={consumerKey}
            onChange={(e) => setConsumerKey(e.target.value)}
            required
            disabled={isConnecting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="consumerSecret">Consumer Secret</Label>
          <Input
            id="consumerSecret"
            placeholder="cs_xxxxxxxxxxxxxxxxxxxxx"
            value={consumerSecret}
            onChange={(e) => setConsumerSecret(e.target.value)}
            required
            disabled={isConnecting}
            type="password"
          />
        </div>

        <div className="pt-2">
          <Button type="submit" className="w-full" disabled={isConnecting}>
            {isConnecting ? "Connecting..." : "Connect Store"}
          </Button>
        </div>

        <div className="text-xs text-gray-500 mt-4">
          <p className="font-medium mb-1">How to get your WooCommerce API keys:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Go to your WordPress admin dashboard</li>
            <li>Navigate to WooCommerce &gt; Settings &gt; Advanced &gt; REST API</li>
            <li>Click "Add key" and create a key with Read/Write permissions</li>
            <li>Copy the Consumer Key and Consumer Secret and paste them here</li>
          </ol>
        </div>
      </div>
    </form>
  );
};

export default WooCommerceSetup;
