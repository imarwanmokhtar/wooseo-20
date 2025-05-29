
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiStore } from '@/contexts/MultiStoreContext';
import WooCommerceSetup from '@/components/WooCommerceSetup';
import ProductSelector from '@/components/ProductSelector';
import StoreSelector from '@/components/StoreSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PromptTemplates from '@/components/PromptTemplates';
import CreditPurchase from '@/components/CreditPurchase';
import { Sparkles, ShoppingBag, FileText, PenTool, Coins, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user, session, userDetails, credits, refreshCredits, loading: authLoading } = useAuth();
  const { stores, activeStore, storeUsage, loading: storeLoading } = useMultiStore();
  const [showStoreSetup, setShowStoreSetup] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      if (authLoading) return;

      if (!session && !user) {
        navigate('/login');
        return;
      }

      if (user?.id) {
        refreshCredits();
      }
    };

    checkAuth();
  }, [user, session, authLoading, navigate, refreshCredits]);

  if (authLoading || storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-seo-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const hasStores = stores.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Welcome back{userDetails?.email ? `, ${userDetails.email.split('@')[0]}` : ''}!</h1>
            <p className="text-gray-600">Optimize your WooCommerce products with AI-powered SEO</p>
          </div>
          <div className="flex items-center bg-white rounded-lg px-4 py-2 border">
            <Coins className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-sm mr-2">Credits:</span>
            <span className="font-bold">{credits}</span>
            <Button variant="link" size="sm" className="ml-2 text-seo-primary" onClick={() => refreshCredits()}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Store Management */}
        {hasStores && (
          <div className="mb-8 p-4 bg-white rounded-lg border">
            <StoreSelector onAddStore={() => setShowStoreSetup(true)} />
          </div>
        )}

        {/* Store Usage Stats */}
        {hasStores && storeUsage.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {storeUsage.slice(0, 3).map((usage) => (
              <Card key={usage.store_id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{usage.store_name}</p>
                      <p className="text-2xl font-bold">{usage.credits_used}</p>
                      <p className="text-xs text-gray-500">Credits Used</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-seo-primary" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!hasStores || showStoreSetup ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* WooCommerce Setup Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2 text-seo-primary" />
                  {hasStores ? 'Add Another Store' : 'Connect Your Store'}
                </CardTitle>
                <CardDescription>
                  {hasStores ? 'Connect additional WooCommerce stores' : 'Connect your WooCommerce store to start optimizing your products'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WooCommerceSetup
                  onConnected={() => {
                    setShowStoreSetup(false);
                    toast({
                      title: "Store Connected",
                      description: "Your WooCommerce store has been successfully connected!",
                    });
                  }}
                />
                {hasStores && (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowStoreSetup(false)}
                    className="w-full mt-4"
                  >
                    Cancel
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Credit Purchase Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Coins className="h-5 w-5 mr-2 text-yellow-500" />
                  Purchase Credits
                </CardTitle>
                <CardDescription>
                  Buy credits to generate optimized content for your products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreditPurchase 
                  onPurchaseComplete={() => {
                    refreshCredits();
                    toast({
                      title: "Credits Updated",
                      description: "Your credits have been successfully updated!",
                    });
                  }} 
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          <Tabs defaultValue="products">
            <TabsList className="mb-8">
              <TabsTrigger value="products" className="flex items-center">
                <ShoppingBag className="h-4 w-4 mr-2" /> Products
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" /> Prompt Templates
              </TabsTrigger>
              <TabsTrigger value="credits" className="flex items-center">
                <Coins className="h-4 w-4 mr-2" /> Buy Credits
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <ProductSelector />
            </TabsContent>

            <TabsContent value="templates">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PenTool className="h-5 w-5 mr-2 text-seo-primary" />
                    Customize AI Prompt Templates
                  </CardTitle>
                  <CardDescription>
                    Create and manage custom prompts to guide the AI content generation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PromptTemplates />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="credits">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Coins className="h-5 w-5 mr-2 text-yellow-500" />
                    Purchase Credits
                  </CardTitle>
                  <CardDescription>
                    Buy credits to generate optimized content for your products
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CreditPurchase 
                    onPurchaseComplete={() => {
                      refreshCredits();
                      toast({
                        title: "Credits Updated",
                        description: "Your credits have been successfully updated!",
                      });
                    }} 
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

// No explicit credit plan values found in the visible context, but ensure any hardcoded references or props to CreditPurchase use the new tiers if present.
