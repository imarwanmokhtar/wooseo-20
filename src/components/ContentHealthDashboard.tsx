import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Settings, Download } from 'lucide-react';
import { useMultiStore } from '@/contexts/MultiStoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { fetchProducts } from '@/services/wooCommerceApi';
import { contentHealthAnalyzer } from '@/services/contentHealthService';
import { ProductContentHealth, ContentHealthSummary } from '@/types/contentHealth';
import ContentHealthTable from './ContentHealthTable';
import ContentHealthSettings from './ContentHealthSettings';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

const ContentHealthDashboard = () => {
  const { activeStore } = useMultiStore();
  const { user } = useAuth();
  const [healthResults, setHealthResults] = useState<ProductContentHealth[]>([]);
  const [summary, setSummary] = useState<ContentHealthSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [userCredits, setUserCredits] = useState(0);

  // Fetch user credits
  const fetchUserCredits = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single();
    
    if (!error && data) {
      setUserCredits(data.credits);
    }
  };

  const scanProducts = async () => {
    if (!activeStore || !user) return;

    setLoading(true);
    try {
      console.log('Starting content health scan...');
      
      // Fetch all products from the active store
      const { products } = await fetchProducts(activeStore, { per_page: 100 });
      console.log(`Analyzing ${products.length} products for content health...`);

      // Analyze each product
      const results = contentHealthAnalyzer.analyzeBatch(products);
      const summaryData = contentHealthAnalyzer.generateSummary(results);

      setHealthResults(results);
      setSummary(summaryData);
      setLastScan(new Date().toISOString());
      
      console.log('Content health analysis complete:', summaryData);
    } catch (error) {
      console.error('Error scanning products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeStore && user) {
      scanProducts();
      fetchUserCredits();
    }
  }, [activeStore, user]);

  const handleCreditsUpdated = () => {
    fetchUserCredits();
  };

  if (!activeStore) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Please select a store to view content health analysis.
        </AlertDescription>
      </Alert>
    );
  }

  const pieData = summary ? [
    { name: 'Complete', value: summary.complete_content, color: '#22c55e' },
    { name: 'Needs Attention', value: summary.missing_one_plus - summary.missing_three_plus, color: '#f59e0b' },
    { name: 'Critical', value: summary.critical_products, color: '#ef4444' },
  ] : [];

  const barData = summary?.common_missing_fields.map(field => ({
    field: field.field,
    count: field.count,
  })) || [];

  const healthScore = summary ? Math.round((summary.complete_content / summary.total_products) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Content Health Analysis</h2>
          <p className="text-gray-600">
            Identify and fix incomplete SEO content across your product catalog
          </p>
          {lastScan && (
            <p className="text-sm text-gray-500 mt-1">
              Last scan: {new Date(lastScan).toLocaleString()}
            </p>
          )}
          <p className="text-sm text-blue-600 mt-1">
            Available credits: {userCredits}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={scanProducts} 
            disabled={loading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Scanning...' : 'Refresh Scan'}
          </Button>
        </div>
      </div>

      {summary && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Products</p>
                      <p className="text-2xl font-bold">{summary.total_products}</p>
                    </div>
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">{summary.total_products}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Complete Content</p>
                      <p className="text-2xl font-bold text-green-600">{summary.complete_content}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Need Attention</p>
                      <p className="text-2xl font-bold text-yellow-600">{summary.missing_one_plus}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                      <p className="text-2xl font-bold text-red-600">{summary.critical_products}</p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Health Score */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Content Health Score</CardTitle>
                <CardDescription>
                  Percentage of products with complete SEO content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-2xl font-bold">{healthScore}%</span>
                    <Badge variant={healthScore >= 80 ? 'default' : healthScore >= 60 ? 'secondary' : 'destructive'}>
                      {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Needs Work'}
                    </Badge>
                  </div>
                  <Progress value={healthScore} className="w-full" />
                  <p className="text-sm text-gray-600">
                    {summary.complete_content} out of {summary.total_products} products have complete content
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Content Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Common Missing Fields</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="field" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <ContentHealthTable 
              healthResults={healthResults}
              onRefresh={scanProducts}
              onCreditsUpdated={handleCreditsUpdated}
            />
          </TabsContent>

          <TabsContent value="settings">
            <ContentHealthSettings />
          </TabsContent>
        </Tabs>
      )}

      {!summary && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold">No Health Data Available</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Run a content health scan to analyze your products and identify missing SEO fields.
              </p>
              <Button onClick={scanProducts}>
                Start Content Health Scan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContentHealthDashboard;
