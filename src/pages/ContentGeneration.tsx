
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getWooCommerceCredentials, fetchProducts } from '@/services/wooCommerceApi';
import { Product, SeoContent } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import SeoContentGenerator from '@/components/SeoContentGenerator';

const ContentGeneration = () => {
  const { user, session, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      // Only redirect if we're certain there's no session or user
      if (!session && !user) {
        toast.error("Please log in to access this page");
        navigate('/login');
        return;
      }

      const productIds = searchParams.get('products');
      if (!productIds) {
        setError('No products selected');
        setLoading(false);
        return;
      }

      try {
        // If we got here, we should have a user, but let's double-check
        if (!user?.id) {
          setError('User information not available. Please refresh the page or log in again.');
          setLoading(false);
          return;
        }

        const credentials = await getWooCommerceCredentials(user.id);
        if (!credentials) {
          setError('WooCommerce credentials not found. Please connect your store first.');
          setLoading(false);
          return;
        }

        const ids = productIds.split(',').map(id => parseInt(id.trim(), 10));
        const allProducts: Product[] = [];

        // Fetch products one by one to avoid issues with large batches
        for (const id of ids) {
          try {
            // We only need to find the specific product, not all products
            const result = await fetchProducts(credentials, { 
              include: [id], 
              per_page: 1 
            });
            
            if (result.products && result.products.length > 0) {
              allProducts.push(result.products[0]);
            }
          } catch (error) {
            console.error(`Error fetching product ${id}:`, error);
          }
        }

        if (allProducts.length === 0) {
          setError('No products could be loaded. Please try again or select different products.');
        } else {
          setProducts(allProducts);
          if (allProducts.length < ids.length) {
            toast.warning(`Only ${allProducts.length} out of ${ids.length} products were loaded successfully.`);
          }
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setError('Failed to load products. Please ensure your WooCommerce credentials are correct.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [user, session, authLoading, searchParams, navigate]);

  const handleContentGenerated = (productId: number, content: SeoContent) => {
    console.log(`Content generated for product ${productId}:`, content);
    toast.success(`SEO content generated for product ${productId}`);
  };

  // Show loading while auth is loading
  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-seo-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate SEO Content</h1>
          <p className="text-gray-600">
            Create AI-powered SEO content for your selected WooCommerce products
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-500">
              <p className="mb-1">No products found</p>
              <p className="text-sm">The selected products could not be loaded</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selected Products</CardTitle>
              <CardDescription>
                {products.length} product(s) selected for SEO content generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</p>
                    </div>
                    <div className="text-sm font-medium">
                      {product.price && `${product.price} KD`}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <SeoContentGenerator 
            products={products}
            onContentGenerated={handleContentGenerated}
          />
        </div>
      )}
    </div>
  );
};

export default ContentGeneration;
