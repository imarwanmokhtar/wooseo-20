import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BulkEditorProduct } from '@/pages/BulkEditor';
import { Category } from '@/types';
import { 
  DollarSign, 
  Package, 
  Tag, 
  Eye, 
  ToggleLeft,
  CheckSquare,
  Square
} from 'lucide-react';
import { toast } from 'sonner';

interface BulkEditorToolbarProps {
  selectedProducts: Set<number>;
  onBulkUpdate: (productIds: number[], updates: any) => void;
  categories: Category[];
  products: BulkEditorProduct[];
  totalProducts: number;
  onSelectionChange: (productIds: Set<number>) => void;
  onSelectAll: (checked: boolean) => void;
  isSelectingAll: boolean;
}

const BulkEditorToolbar: React.FC<BulkEditorToolbarProps> = ({
  selectedProducts,
  onBulkUpdate,
  categories,
  products,
  totalProducts,
  onSelectionChange,
  onSelectAll,
  isSelectingAll
}) => {
  // Price bulk update states
  const [priceAction, setPriceAction] = useState<'set' | 'increase' | 'decrease'>('set');
  const [priceValue, setPriceValue] = useState('');
  const [priceType, setPriceType] = useState<'regular' | 'sale'>('regular');

  // Stock bulk update states
  const [stockAction, setStockAction] = useState<'set' | 'increase' | 'decrease' | 'status'>('set');
  const [stockValue, setStockValue] = useState('');
  const [stockStatus, setStockStatus] = useState('');

  // Category bulk update states
  const [categoryAction, setCategoryAction] = useState<'replace' | 'add' | 'remove'>('replace');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Status bulk update states
  const [statusValue, setStatusValue] = useState('');

  // Visibility bulk update states
  const [visibilityValue, setVisibilityValue] = useState('');

  const handleBulkPriceUpdate = () => {
    if (!priceValue || selectedProducts.size === 0) {
      toast.error('Please enter a price value and select products');
      return;
    }

    const productIds = Array.from(selectedProducts);
    const numericValue = parseFloat(priceValue);

    if (isNaN(numericValue)) {
      toast.error('Please enter a valid numeric value');
      return;
    }

    const updates: any = {};
    const fieldName = priceType === 'regular' ? 'regular_price' : 'sale_price';

    productIds.forEach(productId => {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      let newValue: number;
      const currentPrice = parseFloat(product[fieldName]) || 0;

      switch (priceAction) {
        case 'set':
          newValue = numericValue;
          break;
        case 'increase':
          // Apply percentage increase
          newValue = currentPrice * (1 + numericValue / 100);
          break;
        case 'decrease':
          // Apply percentage decrease
          newValue = Math.max(0, currentPrice * (1 - numericValue / 100));
          break;
        default:
          return;
      }

      updates[fieldName] = newValue.toFixed(2);
    });

    onBulkUpdate(productIds, updates);
    setPriceValue('');
    
    const actionText = priceAction === 'set' ? 'set' : `${priceAction}d by ${numericValue}%`;
    toast.success(`Updated ${priceType} price for ${productIds.length} products - ${actionText}`);
  };

  const handleBulkStockUpdate = () => {
    if (selectedProducts.size === 0) {
      toast.error('Please select products');
      return;
    }

    const productIds = Array.from(selectedProducts);
    const updates: any = {};

    if (stockAction === 'status') {
      if (!stockStatus) {
        toast.error('Please select a stock status');
        return;
      }
      updates.stock_status = stockStatus;
      onBulkUpdate(productIds, updates);
      setStockStatus('');
      toast.success(`Updated stock status for ${productIds.length} products`);
    } else {
      if (!stockValue) {
        toast.error('Please enter a stock value');
        return;
      }

      const numericValue = parseInt(stockValue);

      if (isNaN(numericValue)) {
        toast.error('Please enter a valid numeric value');
        return;
      }

      productIds.forEach(productId => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        let newValue: number;
        const currentStock = product.stock_quantity || 0;

        switch (stockAction) {
          case 'set':
            newValue = numericValue;
            break;
          case 'increase':
            newValue = currentStock + numericValue;
            break;
          case 'decrease':
            newValue = Math.max(0, currentStock - numericValue);
            break;
          default:
            return;
        }

        updates.stock_quantity = newValue;
        updates.manage_stock = true;
      });

      onBulkUpdate(productIds, updates);
      setStockValue('');
      toast.success(`Updated stock for ${productIds.length} products`);
    }
  };

  const handleBulkCategoryUpdate = () => {
    if (!selectedCategory || selectedProducts.size === 0) {
      toast.error('Please select a category and products');
      return;
    }

    const productIds = Array.from(selectedProducts);
    const category = categories.find(cat => cat.id.toString() === selectedCategory);
    
    if (!category) {
      toast.error('Selected category not found');
      return;
    }

    const updates: any = {};

    productIds.forEach(productId => {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      let newCategories = [...product.categories];

      switch (categoryAction) {
        case 'replace':
          newCategories = [{ id: category.id, name: category.name }];
          break;
        case 'add':
          if (!newCategories.some(cat => cat.id === category.id)) {
            newCategories.push({ id: category.id, name: category.name });
          }
          break;
        case 'remove':
          newCategories = newCategories.filter(cat => cat.id !== category.id);
          break;
      }

      updates.categories = newCategories;
    });

    onBulkUpdate(productIds, updates);
    setSelectedCategory('');
    toast.success(`Updated categories for ${productIds.length} products`);
  };

  const handleBulkStatusUpdate = () => {
    if (!statusValue || selectedProducts.size === 0) {
      toast.error('Please select a status and products');
      return;
    }

    const productIds = Array.from(selectedProducts);
    onBulkUpdate(productIds, { status: statusValue });
    setStatusValue('');
    toast.success(`Updated status for ${productIds.length} products`);
  };

  const handleBulkVisibilityUpdate = () => {
    if (!visibilityValue || selectedProducts.size === 0) {
      toast.error('Please select visibility and products');
      return;
    }

    const productIds = Array.from(selectedProducts);
    onBulkUpdate(productIds, { catalog_visibility: visibilityValue });
    setVisibilityValue('');
    toast.success(`Updated visibility for ${productIds.length} products`);
  };

  const handleSelectAll = () => {
    const isAllSelected = selectedProducts.size === totalProducts && totalProducts > 0;
    onSelectAll(!isAllSelected);
  };

  const handleDeselectAll = () => {
    onSelectionChange(new Set());
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Bulk Actions</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {selectedProducts.size} of {totalProducts} selected
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={isSelectingAll}
            >
              <CheckSquare className="h-4 w-4 mr-1" />
              {isSelectingAll ? 'Selecting...' : 'Select All'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              disabled={selectedProducts.size === 0}
            >
              <Square className="h-4 w-4 mr-1" />
              Deselect All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Price Bulk Update */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={selectedProducts.size === 0}>
                <DollarSign className="h-4 w-4 mr-2" />
                Update Prices
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Update Prices</DialogTitle>
                <DialogDescription>
                  Update prices for {selectedProducts.size} selected products
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Price Type</label>
                  <div>
                    <Select value={priceType} onValueChange={(value: 'regular' | 'sale') => setPriceType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular Price</SelectItem>
                        <SelectItem value="sale">Sale Price</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Action</label>
                  <div>
                    <Select value={priceAction} onValueChange={(value) => setPriceAction(value as 'set' | 'increase' | 'decrease')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="set">Set to</SelectItem>
                        <SelectItem value="increase">Increase by %</SelectItem>
                        <SelectItem value="decrease">Decrease by %</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {priceAction === 'set' ? 'Price Value' : 'Percentage (%)'}
                  </label>
                  <Input
                    type="number"
                    step={priceAction === 'set' ? "0.01" : "0.1"}
                    placeholder={priceAction === 'set' ? "Enter price value" : "Enter percentage"}
                    value={priceValue}
                    onChange={(e) => setPriceValue(e.target.value)}
                  />
                  {priceAction !== 'set' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Example: Enter 10 for 10% {priceAction}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleBulkPriceUpdate}>Update Prices</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Stock Bulk Update */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={selectedProducts.size === 0}>
                <Package className="h-4 w-4 mr-2" />
                Update Stock
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Update Stock</DialogTitle>
                <DialogDescription>
                  Update stock for {selectedProducts.size} selected products
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Action</label>
                  <div>
                    <Select value={stockAction} onValueChange={(value) => setStockAction(value as 'set' | 'increase' | 'decrease' | 'status')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="set">Set quantity to</SelectItem>
                        <SelectItem value="increase">Increase quantity by</SelectItem>
                        <SelectItem value="decrease">Decrease quantity by</SelectItem>
                        <SelectItem value="status">Change stock status</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {stockAction === 'status' ? (
                  <div>
                    <label className="text-sm font-medium">Stock Status</label>
                    <Select value={stockStatus} onValueChange={setStockStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stock status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instock">In Stock</SelectItem>
                        <SelectItem value="outofstock">Out of Stock</SelectItem>
                        <SelectItem value="onbackorder">On Backorder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium">Quantity</label>
                    <Input
                      type="number"
                      placeholder="Enter stock quantity"
                      value={stockValue}
                      onChange={(e) => setStockValue(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={handleBulkStockUpdate}>Update Stock</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Category Bulk Update */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={selectedProducts.size === 0}>
                <Tag className="h-4 w-4 mr-2" />
                Update Categories
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Update Categories</DialogTitle>
                <DialogDescription>
                  Update categories for {selectedProducts.size} selected products
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Action</label>
                  <div>
                    <Select value={categoryAction} onValueChange={(value) => setCategoryAction(value as 'replace' | 'add' | 'remove')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="replace">Replace with</SelectItem>
                        <SelectItem value="add">Add category</SelectItem>
                        <SelectItem value="remove">Remove category</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleBulkCategoryUpdate}>Update Categories</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Status Bulk Update */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={selectedProducts.size === 0}>
                <ToggleLeft className="h-4 w-4 mr-2" />
                Update Status
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Update Status</DialogTitle>
                <DialogDescription>
                  Update status for {selectedProducts.size} selected products
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div>
                    <Select value={statusValue} onValueChange={setStatusValue}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="publish">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleBulkStatusUpdate}>Update Status</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Visibility Bulk Update */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={selectedProducts.size === 0}>
                <Eye className="h-4 w-4 mr-2" />
                Update Visibility
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Update Visibility</DialogTitle>
                <DialogDescription>
                  Update catalog visibility for {selectedProducts.size} selected products
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Visibility</label>
                  <div>
                    <Select value={visibilityValue} onValueChange={setVisibilityValue}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visible">Visible</SelectItem>
                        <SelectItem value="catalog">Catalog only</SelectItem>
                        <SelectItem value="search">Search only</SelectItem>
                        <SelectItem value="hidden">Hidden</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleBulkVisibilityUpdate}>Update Visibility</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkEditorToolbar;
