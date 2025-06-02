import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiStore } from '@/contexts/MultiStoreContext';
import { getWooCommerceCredentials, fetchCategories, fetchProducts } from '@/services/wooCommerceApi';
import { Product, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import ProductCard from '@/components/ProductCard';
import Pagination from '@/components/Pagination';
import { AlertCircle, SearchIcon, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import SeoContentGenerator from './SeoContentGenerator';

const ProductSelector = () => {
  const { user } = useAuth();
  const { activeStore } = useMultiStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingFilters, setLoadingFilters] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [perPage, setPerPage] = useState<number>(10);
  const [showGenerator, setShowGenerator] = useState<boolean>(false);
  
  useEffect(() => {
    if (user && activeStore?.id) {
      loadFilters();
    }
  }, [user, activeStore]);

  useEffect(() => {
    if (user && activeStore?.id) {
      const timeoutId = setTimeout(() => {
        loadProducts();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [user, activeStore, selectedCategories, searchTerm, page, perPage]);

  const loadFilters = async () => {
    try {
      if (!user || !activeStore?.id) {
        setError("No active store selected. Please select a store first.");
        return;
      }
      
      setLoadingFilters(true);
      console.log('Loading filters for store:', activeStore.store_name, 'with ID:', activeStore.id);
      const credentials = await getWooCommerceCredentials(user.id, activeStore.id);
      if (!credentials) {
        setError("WooCommerce credentials not found. Please connect your store first.");
        return;
      }

      console.log('Credentials found, loading categories');
      const categoriesData = await fetchCategories(credentials);

      console.log('Categories loaded:', categoriesData.length);

      setCategories(categoriesData);
      setError(null);
    } catch (error) {
      console.error('Error loading filters:', error);
      setError("Failed to load categories. Please try refreshing the page.");
    } finally {
      setLoadingFilters(false);
    }
  };

  const loadProducts = async () => {
    try {
      if (!user || !activeStore?.id) {
        setError("No active store selected. Please select a store first.");
        return;
      }
      
      setLoading(true);
      setError(null);

      console.log('Loading products for store:', activeStore.store_name, 'with ID:', activeStore.id);
      const credentials = await getWooCommerceCredentials(user.id, activeStore.id);
      if (!credentials) {
        setError("WooCommerce credentials not found. Please connect your store first.");
        return;
      }

      console.log('Fetching products with filters:', {
        category: selectedCategories.length > 0 ? selectedCategories : undefined,
        search: searchTerm || undefined,
        page,
        per_page: perPage
      });

      const result = await fetchProducts(credentials, {
        category: selectedCategories.length > 0 ? selectedCategories : undefined,
        search: searchTerm || undefined,
        page,
        per_page: perPage
      });

      console.log('Products fetch result:', {
        count: result.products.length,
        total: result.total,
        totalPages: result.totalPages
      });

      setProducts(result.products);
      setTotalPages(result.totalPages);
      setTotalProducts(result.total);
      setError(null);
    } catch (error) {
      console.error('Error loading products:', error);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: number, checked: boolean) => {
    setSelectedCategories(prev => 
      checked 
        ? [...prev, categoryId]
        : prev.filter(c => c !== categoryId)
    );
    // Reset to page 1 when filters change
    setPage(1);
  };

  const removeCategoryFilter = (categoryId: number) => {
    setSelectedCategories(prev => prev.filter(c => c !== categoryId));
    // Reset to page 1 when filters change
    setPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSearchTerm('');
    // Reset to page 1 when filters change
    setPage(1);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Reset to page 1 when search changes
    setPage(1);
  };

  const handleSelectProduct = (productId: number) => {
    setSelectedProducts(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(productId)) {
        newSelection.delete(productId);
      } else {
        newSelection.add(productId);
      }
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  const handleGenerateContent = () => {
    if (selectedProducts.size === 0) {
      toast.error("Please select at least one product");
      return;
    }

    if (!activeStore?.id) {
      toast.error("No active store selected");
      return;
    }

    console.log('Starting content generation for products:', Array.from(selectedProducts));
    setShowGenerator(true);
  };

  const getSelectedProductsData = () => {
    return products.filter(product => selectedProducts.has(product.id));
  };

  if (!activeStore) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No active store selected. Please add or select a store from the store selector above.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (showGenerator) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Generate SEO Content</h2>
          <Button
            variant="outline"
            onClick={() => {
              setShowGenerator(false);
              setSelectedProducts(new Set());
            }}
          >
            Back to Product Selection
          </Button>
        </div>
        
        <SeoContentGenerator
          products={getSelectedProductsData()}
          onContentGenerated={(productId, content) => {
            console.log('Content generated for product:', productId);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-[300px_1fr] gap-6">
        {/* Filters sidebar */}
        <div className="space-y-6 bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Filters</h2>
            {loadingFilters && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-seo-primary"></div>
            )}
          </div>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="search">Search Products by Title</Label>
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Search by product title..."
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={(checked) => 
                        handleCategorySelect(category.id, checked as boolean)
                      }
                    />
                    <label 
                      htmlFor={`category-${category.id}`} 
                      className="text-sm cursor-pointer flex-1"
                    >
                      {category.name} ({category.count})
                    </label>
                  </div>
                ))}
              </div>
              
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCategories.map(categoryId => {
                    const category = categories.find(c => c.id === categoryId);
                    return category ? (
                      <div key={categoryId} className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {category.name}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-4 w-4 p-0"
                          onClick={() => removeCategoryFilter(categoryId)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {(selectedCategories.length > 0 || searchTerm) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="w-full"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </div>

        {/* Products list */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-lg">Products</h2>
                <p className="text-sm text-gray-600">
                  {totalProducts} products found in {activeStore.store_name}
                  {searchTerm && ` matching "${searchTerm}"`}
                  {selectedCategories.length > 0 && ` in ${selectedCategories.length} categories`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <Checkbox 
                    id="selectAll" 
                    checked={products.length > 0 && selectedProducts.size === products.length} 
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="selectAll" className="ml-2 text-sm">
                    Select All
                  </label>
                </div>

                <Button 
                  onClick={handleGenerateContent} 
                  disabled={selectedProducts.size === 0}
                  variant="default"
                  size="sm"
                >
                  Generate for {selectedProducts.size}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-seo-primary mx-auto mb-4"></div>
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <p className="text-gray-500">
                  {searchTerm || selectedCategories.length > 0
                    ? "No products found with the current filters. Try adjusting your search criteria."
                    : "No products found."
                  }
                </p>
              </div>
            ) : (
              <>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isSelected={selectedProducts.has(product.id)}
                    onSelect={() => handleSelectProduct(product.id)}
                  />
                ))}

                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSelector;
