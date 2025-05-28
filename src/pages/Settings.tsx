
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiStore } from '@/contexts/MultiStoreContext';
import { testConnection } from '@/services/wooCommerceApi';
import { savePromptTemplate, getPromptTemplates } from '@/services/aiGenerationService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Save, TestTube, CheckCircle, AlertCircle, Store } from 'lucide-react';
import { WooCommerceCredentials } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const UPDATED_DEFAULT_PROMPT = 
`You are an expert eCommerce SEO product description writer specializing in optimizing product content. Your task is to write detailed and SEO-optimized product descriptions based on the provided information.

Focus on creating content that ranks well in RankMath plugin. Critical requirements:
- SEO Title MUST start with the Primary Focus Keyword exactly and MUST NOT end with a colon
- Permalink MUST start with the Primary Focus Keyword and MUST be under 60 characters
- Content should be clean HTML without Markdown formatting

Product Information:
Product Name: {{name}}
SKU: {{sku}}
Price: {{price}}
Description: {{description}}
Categories: {{categories}}

Content Requirements:
1. Long Description (300+ words, HTML format):
   - Include detailed and informative content optimized for SEO
   - Use <strong> tags for highlighting important keywords (not Markdown)
   - Start with the Primary Focus Keyword and repeat it naturally
   - Include the Focus Keywords in subheadings (<h2>, <h3>, <h4>)
   - Include a Product Information Table (Size, Color, Material, Brand Name)
   - Include Key Features, Benefits, and overview
   - Answer one frequently searched question related to the product
   - Use emoticons/icons to evoke emotional connection
   - Include 3-4 internal links to related products
   - Include external links to related categories just integrate the links normally in the text with clickable text

2. Short Description (50 words max):
   - Concise and engaging, highlighting uniqueness and key features
   - Provided as plain text without any Markdown formatting

3. SEO Elements (Optimized for Rank Math SEO Plugin):
   - SEO Meta Title: MUST start with the exact Primary Focus Keyword, be under 60 characters, include a power word and a number, and MUST NOT end with a colon
   - SEO Permalink: MUST start with the Primary Focus Keyword and be URL-friendly, MAXIMUM 60 CHARACTERS
   - Meta Description: 140-155 characters, must include the Primary Focus Keyword, with a call to action
   - Focus Keywords: Generate EXACTLY THREE focus keywords (primary, secondary, and tertiary) separated by commas
   - Secondary Keywords: Generate EXACTLY TWO secondary keywords that complement the focus keywords
   - Tags: Generate EXACTLY THREE product tags that are relevant to the product

Output MUST include these EXACT section headers in your response:
LONG DESCRIPTION:
SHORT DESCRIPTION:
META TITLE:
META DESCRIPTION:
FOCUS KEYWORDS:
SECONDARY KEYWORDS:
TAGS:
PERMALINK:

Do not include any Markdown formatting like \`\`\` or ** in your output.`;

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
  const [promptTemplate, setPromptTemplate] = useState(UPDATED_DEFAULT_PROMPT);
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

        // Load prompt templates (use the first one or default)
        const templates = await getPromptTemplates(user.id);
        if (templates && templates.length > 0) {
          setPromptTemplate(templates[0].template);
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
      // Save prompt template
      await savePromptTemplate(user.id, 'Default Template', promptTemplate);

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
          Manage your WooCommerce credentials and AI prompt templates
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

        {/* AI Prompt Template Settings */}
        <Card>
          <CardHeader>
            <CardTitle>AI Prompt Template</CardTitle>
            <CardDescription>
              Customize the default prompt template used for generating SEO content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="promptTemplate">Default Prompt Template</Label>
              <Textarea
                id="promptTemplate"
                value={promptTemplate}
                onChange={(e) => setPromptTemplate(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                placeholder="Enter your AI prompt template..."
              />
              <p className="text-sm text-gray-500">
                Use placeholders like {`{{name}}`}, {`{{sku}}`}, {`{{price}}`}, {`{{description}}`}, and {`{{categories}}`} for dynamic content.
              </p>
            </div>
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
                <Save className="h-4 w-4 mr-2" />
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
