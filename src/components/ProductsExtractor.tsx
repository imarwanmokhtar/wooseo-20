
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiStore } from '@/contexts/MultiStoreContext';
import { getWooCommerceCredentials, fetchCategories, fetchProducts } from '@/services/wooCommerceApi';
import { Product, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { AlertCircle, Download, FileSpreadsheet } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import * as XLSX from 'xlsx';

const ProductsExtractor = () => {
  const { user } = useAuth();
  const { activeStore } = useMultiStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportAll, setExportAll] = useState(false);

  useEffect(() => {
    if (user && activeStore?.id) {
      loadCategories();
    }
  }, [user, activeStore]);

  const loadCategories = async () => {
    try {
      if (!user || !activeStore?.id) {
        setError("No active store selected. Please select a store first.");
        return;
      }
      
      setLoadingCategories(true);
      const credentials = await getWooCommerceCredentials(user.id, activeStore.id);
      if (!credentials) {
        setError("WooCommerce credentials not found. Please connect your store first.");
        return;
      }

      const categoriesData = await fetchCategories(credentials);
      setCategories(categoriesData);
      setError(null);
    } catch (error) {
      console.error('Error loading categories:', error);
      setError("Failed to load categories. Please try refreshing the page.");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCategorySelect = (categoryId: number, checked: boolean) => {
    setSelectedCategories(prev => 
      checked 
        ? [...prev, categoryId]
        : prev.filter(c => c !== categoryId)
    );
  };

  const getAllProducts = async (): Promise<Product[]> => {
    if (!user || !activeStore?.id) {
      throw new Error("No active store selected");
    }

    const credentials = await getWooCommerceCredentials(user.id, activeStore.id);
    if (!credentials) {
      throw new Error("WooCommerce credentials not found");
    }

    let allProducts: Product[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const result = await fetchProducts(credentials, {
        category: !exportAll && selectedCategories.length > 0 ? selectedCategories : undefined,
        page,
        per_page: perPage
      });

      allProducts.push(...result.products);

      if (page >= result.totalPages) {
        break;
      }
      page++;
    }

    return allProducts;
  };

  const exportToXLSX = async () => {
    try {
      setLoading(true);
      
      if (!exportAll && selectedCategories.length === 0) {
        toast.error("Please select at least one category or choose to export all products");
        return;
      }

      console.log('Starting product export...');
      const products = await getAllProducts();
      
      if (products.length === 0) {
        toast.error("No products found to export");
        return;
      }

      console.log(`Exporting ${products.length} products`);

      // Prepare data for Excel
      const excelData = products.map(product => ({
        ID: product.id,
        Title: product.name,
        Link: product.permalink,
        'Short Description': product.short_description ? 
          product.short_description.replace(/<[^>]*>/g, '') : '', // Remove HTML tags
        'Long Description': product.description ? 
          product.description.replace(/<[^>]*>/g, '') : '', // Remove HTML tags
        Price: product.price,
        SKU: product.sku || ''
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths for better readability
      const colWidths = [
        { wch: 10 }, // ID
        { wch: 30 }, // Title
        { wch: 40 }, // Link
        { wch: 40 }, // Short Description
        { wch: 50 }, // Long Description
        { wch: 15 }, // Price
        { wch: 20 }  // SKU
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Products');

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const storeName = activeStore?.store_name.replace(/[^a-zA-Z0-9]/g, '_') || 'store';
      const filename = `${storeName}_products_${timestamp}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);

      toast.success(`Successfully exported ${products.length} products to ${filename}`);
      console.log('Export completed successfully');
    } catch (error) {
      console.error('Error exporting products:', error);
      toast.error("Failed to export products. Please try again.");
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center mb-6">
          <FileSpreadsheet className="h-6 w-6 text-seo-primary mr-3" />
          <div>
            <h2 className="text-2xl font-semibold">Products Extractor</h2>
            <p className="text-gray-600">Export your WooCommerce products to an Excel file</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Export Options</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="exportAll"
                  checked={exportAll}
                  onCheckedChange={(checked) => {
                    setExportAll(checked as boolean);
                    if (checked) {
                      setSelectedCategories([]);
                    }
                  }}
                />
                <label htmlFor="exportAll" className="text-sm font-medium">
                  Export all products from {activeStore.store_name}
                </label>
              </div>

              {!exportAll && (
                <div className="ml-6 space-y-2">
                  <Label className="text-sm">Or select specific categories:</Label>
                  {loadingCategories ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-seo-primary mr-2"></div>
                      <span className="text-sm text-gray-500">Loading categories...</span>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto border rounded p-3 bg-white">
                      {categories.length === 0 ? (
                        <p className="text-sm text-gray-500">No categories found</p>
                      ) : (
                        categories.map((category) => (
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
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Export Format</h4>
            <p className="text-sm text-blue-800 mb-3">
              The exported Excel file will contain the following columns:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-blue-700">
              <div className="bg-blue-100 px-2 py-1 rounded">ID</div>
              <div className="bg-blue-100 px-2 py-1 rounded">Title</div>
              <div className="bg-blue-100 px-2 py-1 rounded">Link</div>
              <div className="bg-blue-100 px-2 py-1 rounded">Short Description</div>
              <div className="bg-blue-100 px-2 py-1 rounded">Long Description</div>
              <div className="bg-blue-100 px-2 py-1 rounded">Price</div>
              <div className="bg-blue-100 px-2 py-1 rounded">SKU</div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={exportToXLSX}
              disabled={loading || (!exportAll && selectedCategories.length === 0)}
              size="lg"
              className="bg-gradient-to-r from-seo-primary to-seo-secondary hover:from-seo-primary/90 hover:to-seo-secondary/90"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsExtractor;
