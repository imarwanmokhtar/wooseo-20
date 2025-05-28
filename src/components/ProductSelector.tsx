
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiStore } from '@/contexts/MultiStoreContext';
import { getWooCommerceCredentials, fetchCategories, fetchProducts, fetchBrands } from '@/services/wooCommerceApi';
import { Product, Category, Brand } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import ProductCard from '@/components/ProductCard';
import Pagination from '@/components/Pagination';
import { AlertCircle, SearchIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import SeoContentGenerator from './SeoContentGenerator';

const ProductSelector = () => {
  const { user } = useAuth();
  const { activeStore } = useMultiStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
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
      loadProducts();
    }
  }, [user, activeStore, selectedCategory, selectedBrand, page, perPage]);

  const loadFilters = async () => {
    try {
      if (!user || !activeStore?.id) {
        setError("No active store selected. Please select a store first.");
        return;
      }
      
      console.log('Loading filters for store:', activeStore.store_name, 'with ID:', activeStore.id);
      const credentials = await getWooCommerceCredentials(user.id, activeStore.id);
      if (!credentials) {
        setError("WooCommerce credentials not found. Please connect your store first.");
        return;
      }

      console.log('Credentials found, loading categories and brands');
      const [categoriesData, brandsData] = await Promise.all([
        fetchCategories(credentials),
        fetchBrands(credentials)
      ]);

      setCategories(categoriesData);
      setBrands(brandsData);
      setError(null);
    } catch (error) {
      console.error('Error loading filters:', error);
      setError("Failed to load categories and brands. Please try refreshing the page.");
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

      console.log('Credentials found, fetching products');
      const category = selectedCategory !== 'all' ? parseInt(selectedCategory, 10) : undefined;
      const brand = selectedBrand !== 'all' ? parseInt(selectedBrand, 10) : undefined;

      const result = await fetchProducts(credentials, {
        category,
        brand,
        search: searchTerm,
        page,
        per_page: perPage
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    loadProducts();
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
      // Deselect all
      setSelectedProducts(new Set());
    } else {
      // Select all
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
          <h2 className="font-semibold text-lg">Filters</h2>
          
          <form onSubmit={handleSearch}>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="search"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={selectedCategory} 
                  onValueChange={(value) => {
                    setSelectedCategory(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name} ({category.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Select 
                  value={selectedBrand} 
                  onValueChange={(value) => {
                    setSelectedBrand(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger id="brand">
                    <SelectValue placeholder="All Brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name} ({brand.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? "Searching..." : "Apply Filters"}
              </Button>
            </div>
          </form>
        </div>

        {/* Products list */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-lg">Products</h2>
                <p className="text-sm text-gray-600">
                  {totalProducts} products found in {activeStore.store_name}
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
                >
                  Generate for {selectedProducts.size} {selectedProducts.size === 1 ? 'Product' : 'Products'}
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
                <p className="text-gray-500">No products found. Try changing your filters.</p>
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
