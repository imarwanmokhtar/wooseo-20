
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Activity, TrendingUp, AlertCircle, CheckCircle, Zap, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiStore } from '@/contexts/MultiStoreContext';
import { useSeoPlugin } from '@/contexts/SeoPluginContext';
import { fetchProducts, getWooCommerceCredentials, detectSeoPlugin } from '@/services/wooCommerceApi';
import { contentHealthAnalyzer } from '@/services/contentHealthService';
import { ProductContentHealth, ContentHealthSummary } from '@/types/contentHealth';
import ContentHealthTable from './ContentHealthTable';
import SeoPluginSelector from './SeoPluginSelector';
import { toast } from 'sonner';

const ContentHealthDashboard: React.FC = () => {
  const { user, credits, refreshCredits } = useAuth();
  const { activeStore } = useMultiStore();
  const { selectedPlugin, setSelectedPlugin } = useSeoPlugin();
  const [loading, setLoading] = useState(false);
  const [healthResults, setHealthResults] = useState<ProductContentHealth[]>([]);
  const [summary, setSummary] = useState<ContentHealthSummary | null>(null);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  // Auto-detect SEO plugin when active store changes
  useEffect(() => {
    const detectAndSetPlugin = async () => {
      if (!user || !activeStore?.id) return;
      
      try {
        const credentials = await getWooCommerceCredentials(user.id, activeStore.id);
        if (credentials) {
          console.log('Auto-detecting SEO plugin for store:', activeStore.store_name);
          const detectedPlugin = await detectSeoPlugin(credentials);
          
          if (detectedPlugin && !selectedPlugin) {
            console.log('Auto-detected SEO plugin:', detectedPlugin);
            setSelectedPlugin(detectedPlugin as any);
            toast.success(`Auto-detected ${detectedPlugin === 'rankmath' ? 'RankMath' : detectedPlugin === 'yoast' ? 'Yoast SEO' : 'All in One SEO'} plugin`);
          } else if (!detectedPlugin && !selectedPlugin) {
            console.log('No SEO plugin detected, using universal fields');
            setSelectedPlugin('none');
          }
        }
      } catch (error) {
        console.error('Error detecting SEO plugin:', error);
      }
    };

    detectAndSetPlugin();
  }, [activeStore?.id, user?.id, selectedPlugin, setSelectedPlugin]);

  const handleHealthScan = async () => {
    if (!user || !activeStore?.id) {
      toast.error('Please select an active store first');
      return;
    }

    if (!selectedPlugin) {
      toast.error('Please select your SEO plugin first');
      return;
    }

    setLoading(true);
    setError(null);
    setScanProgress({ current: 0, total: 0 });

    try {
      const credentials = await getWooCommerceCredentials(user.id, activeStore.id);
      if (!credentials) {
        throw new Error('Store credentials not found');
      }

      console.log(`Starting content health scan with ${selectedPlugin} SEO plugin`);
      toast.info(`Starting content health scan with ${selectedPlugin === 'rankmath' ? 'RankMath' : selectedPlugin === 'yoast' ? 'Yoast SEO' : selectedPlugin === 'aioseo' ? 'All in One SEO' : 'Universal'} fields...`);

      // Fetch all products in batches
      let allProducts: any[] = [];
      let page = 1;
      const perPage = 100;
      let hasMore = true;

      while (hasMore) {
        const { products, totalPages } = await fetchProducts(credentials, {
          page,
          per_page: perPage
        });

        allProducts = [...allProducts, ...products];
        setScanProgress({ current: allProducts.length, total: allProducts.length });

        console.log(`Fetched page ${page}/${totalPages}, total products: ${allProducts.length}`);

        if (page >= totalPages) {
          hasMore = false;
        } else {
          page++;
        }
      }

      if (allProducts.length === 0) {
        toast.warning('No products found in your store');
        setHealthResults([]);
        setSummary(null);
        return;
      }

      console.log(`Analyzing ${allProducts.length} products for content health with ${selectedPlugin} plugin`);
      
      // Analyze content health with SEO plugin context
      const results = contentHealthAnalyzer.analyzeBatch(allProducts, selectedPlugin);
      const summaryData = contentHealthAnalyzer.generateSummary(results);

      setHealthResults(results);
      setSummary(summaryData);

      // Show results summary
      const completeCount = results.filter(r => r.overall_status === 'complete').length;
      const needsAttentionCount = results.filter(r => r.overall_status === 'needs_attention').length;
      const criticalCount = results.filter(r => r.overall_status === 'critical').length;

      toast.success(
        `Scan complete! ${completeCount} complete, ${needsAttentionCount} need attention, ${criticalCount} critical`
      );

      console.log('Content health scan results:', {
        total: results.length,
        complete: completeCount,
        needsAttention: needsAttentionCount,
        critical: criticalCount,
        plugin: selectedPlugin
      });

    } catch (error) {
      console.error('Error during health scan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to scan content health';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setScanProgress({ current: 0, total: 0 });
    }
  };

  const handleRefresh = () => {
    handleHealthScan();
  };

  const handleCreditsUpdated = async () => {
    await refreshCredits();
  };

  const getSeoPluginName = (plugin: string | null) => {
    switch (plugin) {
      case 'rankmath': return 'RankMath SEO';
      case 'yoast': return 'Yoast SEO';
      case 'aioseo': return 'All in One SEO';
      case 'none': return 'Universal Fields';
      default: return 'Not selected';
    }
  };

  if (!activeStore) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="space-y-4">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto" />
            <h3 className="text-lg font-semibold">No Store Selected</h3>
            <p className="text-gray-600">Please select a WooCommerce store to scan content health.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* SEO Plugin Selection */}
      <SeoPluginSelector 
        selectedPlugin={selectedPlugin}
        onPluginSelect={setSelectedPlugin}
      />

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_products}</div>
              <p className="text-xs text-muted-foreground">
                Scanned with {getSeoPluginName(selectedPlugin)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Complete Content</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.complete_content}</div>
              <p className="text-xs text-muted-foreground">
                {summary.total_products > 0 ? Math.round((summary.complete_content / summary.total_products) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Need Attention</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{summary.missing_one_plus}</div>
              <p className="text-xs text-muted-foreground">
                Products with missing fields
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.critical_products}</div>
              <p className="text-xs text-muted-foreground">
                Require immediate attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scan Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Content Health Scanner</CardTitle>
          <CardDescription>
            Scan your products to identify missing SEO content and optimization opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <div>Active Store: <span className="font-medium">{activeStore.store_name}</span></div>
                <div>SEO Plugin: <span className="font-medium">{getSeoPluginName(selectedPlugin)}</span></div>
                {healthResults.length > 0 && (
                  <div>Last scan: <span className="font-medium">{healthResults.length} products analyzed</span></div>
                )}
              </div>
              <Button 
                onClick={handleHealthScan} 
                disabled={loading || !selectedPlugin}
                className="min-w-[140px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    {healthResults.length > 0 ? 'Re-scan Products' : 'Start Health Scan'}
                  </>
                )}
              </Button>
            </div>

            {loading && scanProgress.total > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Scanning products...</span>
                  <span>{scanProgress.current} / {scanProgress.total}</span>
                </div>
                <Progress 
                  value={scanProgress.total > 0 ? (scanProgress.current / scanProgress.total) * 100 : 0} 
                  className="w-full" 
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Common Missing Fields */}
      {summary && summary.common_missing_fields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Common Missing Fields</CardTitle>
            <CardDescription>
              Most frequently missing content across your products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {summary.common_missing_fields.map((field, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium capitalize">{field.field}</span>
                  <Badge variant="outline">{field.count} products</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <ContentHealthTable
        healthResults={healthResults}
        onRefresh={handleRefresh}
        onCreditsUpdated={handleCreditsUpdated}
      />
    </div>
  );
};

export default ContentHealthDashboard;
