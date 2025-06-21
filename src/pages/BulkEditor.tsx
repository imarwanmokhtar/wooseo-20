import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import BulkEditorGrid from '@/components/BulkEditorGrid';
import BulkEditorSidebar from '@/components/BulkEditorSidebar';
import BulkEditorToolbar from '@/components/BulkEditorToolbar';
import { Category, Product } from '@/types';
import { Search, RefreshCw, AlertTriangle, Lock, Edit, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { useMultiStore } from '@/contexts/MultiStoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { createSubscription } from '@/services/stripeService';
import { fetchProducts, fetchCategories, getWooCommerceCredentials } from '@/services/wooCommerceApi';
import { Link } from 'react-router-dom';

export interface BulkEditorProduct {
  id: number;
  name: string;
  sku: string;
  regular_price: string;
  sale_price: string;
  stock_quantity: number | null;
  stock_status: string;
  manage_stock: boolean;
  shipping_class?: string;
  catalog_visibility: string;
  categories: Array<{ id: number; name: string }>;
  tags: Array<{ id: number; name: string }>;
  product_type: string;
  short_description: string;
  status: string;
  variations?: any[];
  isEdited?: boolean;
}

export interface FilterOptions {
  categories: number[];
  tags: number[];
  stockStatus: string[];
  productType: string[];
  priceRange: { min: number; max: number };
}

const BulkEditor: React.FC = () => {
  const { activeStore } = useMultiStore();
  const { user, bulkEditorAccess, refreshCredits } = useAuth();
  
  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL LOGIC
  const [products, setProducts] = useState<BulkEditorProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<BulkEditorProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessingSubscription, setIsProcessingSubscription] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [isSelectingAll, setIsSelectingAll] = useState(false);
  
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    tags: [],
    stockStatus: [],
    productType: [],
    priceRange: { min: 0, max: 10000 }
  });

  // Determine if we're searching - affects pagination behavior
  const isSearching = searchQuery.trim().length > 0;
  const productsPerPage = 20; // Changed from 100 to 20

  // Fetch WooCommerce credentials - enabled only when we have activeStore and user
  const { data: credentials, isLoading: credentialsLoading, error: credentialsError } = useQuery({
    queryKey: ['woo-credentials', activeStore?.id, user?.id],
    queryFn: async () => {
      if (!activeStore?.id || !user?.id) {
        console.log('Missing activeStore or user:', { activeStore: activeStore?.id, user: user?.id });
        return null;
      }
      console.log('Fetching credentials for store ID:', activeStore.id, 'user:', user.id);
      return await getWooCommerceCredentials(user.id, activeStore.id);
    },
    enabled: !!activeStore?.id && !!user?.id,
  });

  // Fetch categories with improved error handling and product counts
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useQuery({
    queryKey: ['woo-categories-with-counts', activeStore?.id, credentials],
    queryFn: async () => {
      if (!credentials) {
        console.log('No credentials available for fetching categories');
        return [];
      }
      
      console.log('Fetching categories with product counts');
      console.log('Using credentials:', { url: credentials.url, hasKey: !!credentials.consumer_key });
      
      try {
        // Try multiple category endpoints for better compatibility
        const endpoints = [
          `${credentials.url}/wp-json/wc/v3/products/categories?per_page=100&hide_empty=false`,
          `${credentials.url}/wp-json/wc/v3/products/categories?per_page=100`,
          `${credentials.url}/wp-json/wc/v2/products/categories?per_page=100&hide_empty=false`
        ];

        const auth = btoa(`${credentials.consumer_key}:${credentials.consumer_secret}`);
        let lastError = null;

        for (const endpoint of endpoints) {
          try {
            console.log('Trying category endpoint:', endpoint);
            
            const response = await fetch(endpoint, {
              method: 'GET',
              headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
            });
            
            console.log('Category response status:', response.status);
            console.log('Category response headers:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error(`Categories fetch failed for ${endpoint}:`, response.status, errorText);
              lastError = new Error(`HTTP ${response.status}: ${errorText}`);
              continue; // Try next endpoint
            }
            
            const categoriesData = await response.json();
            console.log('Successfully fetched categories:', categoriesData.length);
            console.log('Sample categories:', categoriesData.slice(0, 3));
            
            // Ensure each category has a count property
            const categoriesWithCounts = categoriesData.map((cat: any) => ({
              ...cat,
              count: cat.count || 0
            }));
            
            return categoriesWithCounts;
          } catch (endpointError) {
            console.error(`Error with endpoint ${endpoint}:`, endpointError);
            lastError = endpointError;
            continue; // Try next endpoint
          }
        }
        
        // If all endpoints failed, throw the last error
        throw lastError || new Error('All category endpoints failed');
        
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Return empty array instead of throwing to prevent the whole component from failing
        console.log('Returning empty categories array due to error');
        return [];
      }
    },
    enabled: !!credentials,
    retry: 2, // Retry twice on failure
    retryDelay: 1000 // Wait 1 second between retries
  });

  // Fetch products with infinite loading
  const { data: productsData, refetch: refetchProducts, error: productsError } = useQuery({
    queryKey: ['woo-products', activeStore?.id, currentPage, filters.categories, searchQuery, credentials],
    queryFn: async () => {
      if (!credentials) {
        console.log('No credentials available for fetching products');
        return { products: [], total: 0, totalPages: 0 };
      }
      
      const trimmedQuery = searchQuery.trim();
      console.log('Fetching products with search query:', trimmedQuery, 'page:', currentPage);
      
      const params: any = {
        per_page: productsPerPage,
        page: currentPage,
        category: filters.categories.length > 0 ? filters.categories : undefined,
      };

      // Handle search by ID or title
      if (trimmedQuery) {
        const isNumeric = /^\d+$/.test(trimmedQuery);
        
        if (isNumeric) {
          params.include = [parseInt(trimmedQuery)];
          delete params.category;
          delete params.per_page;
          delete params.page;
        } else {
          params.search = trimmedQuery;
        }
      }
      
      console.log('Final API params:', params);
      const result = await fetchProducts(credentials, params);
      console.log('Products fetch result:', result);
      return result;
    },
    enabled: !!credentials,
  });

  // Check bulk editor access on component mount and refresh
  useEffect(() => {
    if (user?.id) {
      refreshCredits();
    }
  }, [user?.id, refreshCredits]);

  // ALL useCallback hooks MUST be declared here, before any conditional returns
  const transformProducts = useCallback((wooProducts: Product[]): BulkEditorProduct[] => {
    return wooProducts.map(product => {
      // Determine product type based on available properties
      let productType = 'simple';
      if (product.variations && product.variations.length > 0) {
        productType = 'variable';
      } else if (product.virtual) {
        productType = 'virtual';
      } else if (product.downloadable) {
        productType = 'downloadable';
      }

      return {
        id: product.id,
        name: product.name,
        sku: product.sku || '',
        regular_price: product.regular_price || '0',
        sale_price: product.sale_price || '',
        stock_quantity: product.stock_quantity,
        stock_status: product.stock_status || 'instock',
        manage_stock: product.manage_stock || false,
        shipping_class: product.shipping_class || '',
        catalog_visibility: product.catalog_visibility || 'visible',
        categories: product.categories || [],
        tags: product.tags || [],
        product_type: productType,
        short_description: product.short_description || '',
        status: product.status || 'publish',
        variations: product.variations || [],
        isEdited: false,
      };
    });
  }, []);

  const loadMoreProducts = useCallback(async () => {
    if (!hasMoreProducts || isLoadingMore || !credentials) return;
    
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    
    try {
      const params: any = {
        per_page: productsPerPage,
        page: nextPage,
        category: filters.categories.length > 0 ? filters.categories : undefined,
      };

      const trimmedQuery = searchQuery.trim();
      if (trimmedQuery && !/^\d+$/.test(trimmedQuery)) {
        params.search = trimmedQuery;
      }

      const result = await fetchProducts(credentials, params);
      
      if (result.products.length > 0) {
        const newProducts = transformProducts(result.products);
        setProducts(prev => [...prev, ...newProducts]);
        setCurrentPage(nextPage);
        setTotalProducts(result.total);
        
        // Check if we have more products to load
        if (nextPage >= result.totalPages) {
          setHasMoreProducts(false);
        }
      } else {
        setHasMoreProducts(false);
      }
    } catch (error) {
      console.error('Error loading more products:', error);
      toast.error('Failed to load more products');
    } finally {
      setIsLoadingMore(false);
    }
  }, [credentials, currentPage, filters.categories, searchQuery, hasMoreProducts, isLoadingMore, transformProducts]);

  const handleProductUpdate = useCallback((productId: number, field: string, value: any) => {
    console.log('Updating product:', productId, field, value);
    
    setProducts(currentProducts => {
      const newProducts = currentProducts.map(product => {
        if (product.id === productId) {
          const updatedProduct = { 
            ...product, 
            [field]: value, 
            isEdited: true 
          };
          console.log('Updated product:', updatedProduct);
          return updatedProduct;
        }
        return product;
      });
      
      return newProducts;
    });
  }, []);

  const handleBulkUpdate = useCallback((productIds: number[], updates: any) => {
    const newProducts = products.map(product =>
      productIds.includes(product.id)
        ? { ...product, ...updates, isEdited: true }
        : product
    );
    setProducts(newProducts);
    toast.success(`Updated ${productIds.length} products`);
  }, [products]);

  // Optimized select all function using total count instead of fetching all IDs
  const handleSelectAll = useCallback(async (checked: boolean) => {
    if (!checked) {
      setSelectedProducts(new Set());
      return;
    }

    if (!credentials) {
      toast.error('No credentials available');
      return;
    }

    setIsSelectingAll(true);
    
    try {
      // Use the current filter context to get accurate count
      const params: any = {
        per_page: 100, // Maximum per page to reduce API calls
        category: filters.categories.length > 0 ? filters.categories : undefined,
      };

      const trimmedQuery = searchQuery.trim();
      if (trimmedQuery && !/^\d+$/.test(trimmedQuery)) {
        params.search = trimmedQuery;
      }

      const allIds: number[] = [];
      let currentPageForIds = 1;
      let hasMore = true;

      // Fetch all product IDs in batches of 100
      while (hasMore && allIds.length < 5000) { // Safety limit
        try {
          const result = await fetchProducts(credentials, { 
            ...params, 
            page: currentPageForIds,
            fields: 'id' // Only fetch IDs to reduce payload
          });
          
          const ids = result.products.map((p: any) => p.id);
          allIds.push(...ids);
          
          if (result.products.length < 100 || currentPageForIds >= result.totalPages) {
            hasMore = false;
          } else {
            currentPageForIds++;
          }
        } catch (error) {
          console.error('Error fetching product IDs:', error);
          hasMore = false;
        }
      }
      
      console.log('Selected all product IDs:', allIds.length);
      setSelectedProducts(new Set(allIds));
      toast.success(`Selected ${allIds.length} products`);
      
    } catch (error) {
      console.error('Error selecting all products:', error);
      toast.error('Failed to select all products');
    } finally {
      setIsSelectingAll(false);
    }
  }, [credentials, filters.categories, searchQuery]);

  const handleSyncToWooCommerce = useCallback(async () => {
    const editedProducts = products.filter(p => p.isEdited);
    console.log('Syncing products to WooCommerce:', editedProducts);
    
    if (!credentials) {
      toast.error('No WooCommerce credentials found');
      return;
    }

    setIsSyncing(true);

    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (const product of editedProducts) {
        try {
          const updateData: any = {
            name: product.name,
            sku: product.sku,
            regular_price: product.regular_price.toString(),
            manage_stock: product.manage_stock,
            stock_status: product.stock_status,
            catalog_visibility: product.catalog_visibility,
            status: product.status,
            short_description: product.short_description
          };

          if (product.sale_price && product.sale_price !== '') {
            updateData.sale_price = product.sale_price.toString();
          }

          if (product.manage_stock && product.stock_quantity !== null) {
            updateData.stock_quantity = product.stock_quantity;
          }

          if (product.categories && product.categories.length > 0) {
            updateData.categories = product.categories.map(cat => ({ id: cat.id }));
          }

          console.log(`Updating product ${product.id} with data:`, updateData);

          const response = await fetch(
            `${credentials.url}/wp-json/wc/v3/products/${product.id}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${btoa(`${credentials.consumer_key}:${credentials.consumer_secret}`)}`
              },
              body: JSON.stringify(updateData)
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to update product ${product.id}:`, errorText);
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            
            try {
              const errorData = JSON.parse(errorText);
              if (errorData.message) {
                errorMessage = errorData.message;
              }
            } catch (e) {
              // Keep the default error message if JSON parsing fails
            }
            
            throw new Error(errorMessage);
          }

          const responseData = await response.json();
          console.log(`Successfully updated product ${product.id}:`, responseData);
          successCount++;

        } catch (error) {
          console.error(`Failed to update product ${product.id}:`, error);
          errorCount++;
          toast.error(`Failed to update ${product.name}: ${error.message}`);
        }
      }

      if (successCount > 0) {
        const syncedProducts = products.map(p => 
          editedProducts.some(edited => edited.id === p.id && successCount > 0) 
            ? { ...p, isEdited: false } 
            : p
        );
        setProducts(syncedProducts);
        toast.success(`Successfully synced ${successCount} products to WooCommerce`);
      }

      if (errorCount > 0) {
        toast.error(`Failed to sync ${errorCount} products. Check console for details.`);
      }

      setShowSyncDialog(false);

    } catch (error) {
      console.error('Failed to sync products:', error);
      toast.error(`Failed to sync products: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  }, [products, credentials]);

  const handleSaveChanges = useCallback(() => {
    const editedProducts = products.filter(p => p.isEdited);
    if (editedProducts.length > 0) {
      setShowSyncDialog(true);
    } else {
      toast.info('No changes to save');
    }
  }, [products]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setProducts([]);
    setCurrentPage(1);
    setHasMoreProducts(true);
    try {
      await refetchProducts();
      toast.success('Products refreshed');
    } catch (error) {
      console.error('Failed to refresh products:', error);
      toast.error('Failed to refresh products');
    }
  }, [refetchProducts]);

  const handleSearch = useCallback((query: string) => {
    console.log('Search query changed:', query);
    setSearchQuery(query);
    setCurrentPage(1);
    setHasMoreProducts(true);
    setProducts([]);
  }, []);

  const handleSubscriptionPurchase = useCallback(async () => {
    if (!user) {
      toast.error('Please log in to purchase subscription');
      return;
    }
    
    setIsProcessingSubscription(true);
    try {
      const checkoutUrl = await createSubscription('bulk-editor');
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to initiate payment process. Please try again.');
      setIsProcessingSubscription(false);
    }
  }, [user]);

  // Update products when data changes - reset for new searches/filters
  useEffect(() => {
    if (productsData?.products) {
      console.log('Updating products with fresh data:', productsData.products.length);
      const transformedProducts = transformProducts(productsData.products);
      
      if (currentPage === 1) {
        // First page or new search - replace products
        setProducts(transformedProducts);
      } else {
        // Subsequent pages - this is handled by loadMoreProducts
        return;
      }
      
      setTotalPages(productsData.totalPages);
      setTotalProducts(productsData.total);
      setHasMoreProducts(currentPage < productsData.totalPages);
      setIsRefreshing(false);
    }
  }, [productsData, transformProducts, currentPage]);

  // Apply filters only when not searching
  useEffect(() => {
    console.log('Applying filters to products:', products.length);
    console.log('Is searching:', isSearching);
    console.log('Search query:', searchQuery);
    
    let filtered = [...products];

    if (!isSearching) {
      if (filters.categories.length > 0) {
        filtered = filtered.filter(product => {
          const productCategoryIds = product.categories.map(cat => cat.id);
          return filters.categories.some(filterId => productCategoryIds.includes(filterId));
        });
        console.log('After category filter:', filtered.length);
      }

      if (filters.stockStatus.length > 0) {
        filtered = filtered.filter(product =>
          filters.stockStatus.includes(product.stock_status)
        );
      }

      if (filters.productType.length > 0) {
        filtered = filtered.filter(product =>
          filters.productType.includes(product.product_type)
        );
      }

      filtered = filtered.filter(product => {
        const price = parseFloat(product.regular_price) || 0;
        return price >= filters.priceRange.min && price <= filters.priceRange.max;
      });
    }

    console.log('Final filtered products count:', filtered.length);
    setFilteredProducts(filtered);
  }, [products, filters, isSearching, searchQuery]);

  // Determine loading state - only show initial loading, not when loading more
  const isInitialLoading = (credentialsLoading || categoriesLoading) || (currentPage === 1 && !productsData && !productsError);

  // NOW WE CAN HAVE CONDITIONAL LOGIC AFTER ALL HOOKS ARE DECLARED
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please log in to use the bulk editor.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!bulkEditorAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-orange-200 bg-orange-50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                  <Lock className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-2xl text-orange-800">Bulk Editor Access Required</CardTitle>
                <CardDescription className="text-orange-700">
                  You need an active Unlimited Bulk Editor subscription to access this feature.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="bg-white p-6 rounded-lg border border-orange-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Unlimited Bulk Editor - $9/month</h3>
                  <ul className="text-left space-y-2 mb-6">
                    <li className="flex items-start">
                      <Edit className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>Edit unlimited products at once</span>
                    </li>
                    <li className="flex items-start">
                      <Edit className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>Real-time WooCommerce sync</span>
                    </li>
                    <li className="flex items-start">
                      <Edit className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>Advanced filtering & search</span>
                    </li>
                    <li className="flex items-start">
                      <Edit className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>Bulk actions for prices, stock, categories</span>
                    </li>
                  </ul>
                  <Button 
                    onClick={handleSubscriptionPurchase}
                    disabled={isProcessingSubscription}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3"
                  >
                    {isProcessingSubscription ? 'Processing...' : 'Subscribe for $9/month'}
                  </Button>
                </div>
                <p className="text-sm text-orange-600">
                  Already subscribed? Try refreshing the page or contact support if the issue persists.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!activeStore) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please select a WooCommerce store to use the bulk editor.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (credentialsError || productsError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error loading data: {credentialsError?.message || productsError?.message}
              <br />
              Please check your WooCommerce store connection and try again.
            </AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Show warning if categories failed but continue with products
  const showCategoriesWarning = categoriesError && !credentialsError && !productsError;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bulk Product Editor</h1>
              <p className="text-gray-600">
                Edit multiple products at once with powerful bulk actions
                {activeStore && ` - ${activeStore.store_name}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by product name or ID..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Categories Warning */}
        {showCategoriesWarning && (
          <Alert className="mb-4" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Warning: Failed to load categories. You can still edit products but category filtering may be limited.
              <Button 
                variant="link" 
                size="sm"
                onClick={() => refetchCategories()}
                className="ml-2 p-0 h-auto"
              >
                Retry loading categories
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isInitialLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading products...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search Results Info */}
            {isSearching && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  {filteredProducts.length > 0 
                    ? `Found ${filteredProducts.length} products matching "${searchQuery}"`
                    : `No products found matching "${searchQuery}"`
                  }
                  {filteredProducts.length === 0 && (
                    <span className="block mt-1 text-blue-600">
                      Try searching by product name or exact product ID
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Total Products Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">
                Loaded {products.length} of {totalProducts} total products
                {hasMoreProducts && !isSearching && ' - Scroll within the products table to load more'}
              </p>
            </div>

            {/* Horizontal Smart Filters */}
            <BulkEditorSidebar
              filters={filters}
              onFiltersChange={setFilters}
              categories={categories}
              productCount={filteredProducts.length}
              horizontal={true}
            />

            {/* Bulk Actions Toolbar */}
            <BulkEditorToolbar
              selectedProducts={selectedProducts}
              onBulkUpdate={handleBulkUpdate}
              categories={categories}
              products={products}
              totalProducts={totalProducts}
              onSelectionChange={setSelectedProducts}
              onSelectAll={handleSelectAll}
              isSelectingAll={isSelectingAll}
            />

            {/* Main Grid */}
            <div className="relative">
              <Card className="h-[600px] flex flex-col">
                <BulkEditorGrid
                  products={filteredProducts}
                  onProductUpdate={handleProductUpdate}
                  selectedProducts={selectedProducts}
                  onSelectionChange={setSelectedProducts}
                  categories={categories}
                  onSaveChanges={handleSaveChanges}
                  loadMoreProducts={loadMoreProducts}
                  hasMoreProducts={hasMoreProducts}
                  isLoadingMore={isLoadingMore}
                  isSearching={isSearching}
                  totalProducts={totalProducts}
                  onSelectAll={handleSelectAll}
                  isSelectingAll={isSelectingAll}
                />
              </Card>
            </div>
          </div>
        )}

        {/* Sync Confirmation Dialog */}
        <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sync Changes to WooCommerce</DialogTitle>
              <DialogDescription>
                This will update {products.filter(p => p.isEdited).length} products in your WooCommerce store. 
                This action cannot be undone. Are you sure you want to continue?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowSyncDialog(false)}
                disabled={isSyncing}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSyncToWooCommerce}
                disabled={isSyncing}
              >
                {isSyncing ? 'Syncing...' : 'Sync to WooCommerce'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BulkEditor;
