
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BulkEditorProduct } from '@/pages/BulkEditor';
import { Category } from '@/types';
import { 
  CheckSquare,
  Square
} from 'lucide-react';
import BulkPriceUpdateDialog from './BulkPriceUpdateDialog';
import BulkStockUpdateDialog from './BulkStockUpdateDialog';
import BulkCategoryUpdateDialog from './BulkCategoryUpdateDialog';
import BulkStatusUpdateDialog from './BulkStatusUpdateDialog';
import BulkVisibilityUpdateDialog from './BulkVisibilityUpdateDialog';

interface OptimizedBulkEditorToolbarProps {
  selectedProducts: Set<number>;
  onBulkUpdate: (productIds: number[], updates: any) => void;
  categories: Category[];
  products: BulkEditorProduct[];
  totalProducts: number;
  onSelectionChange: (productIds: Set<number>) => void;
  onSelectAll: (checked: boolean) => void;
  isSelectingAll: boolean;
}

const OptimizedBulkEditorToolbar: React.FC<OptimizedBulkEditorToolbarProps> = ({
  selectedProducts,
  onBulkUpdate,
  categories,
  products,
  totalProducts,
  onSelectionChange,
  onSelectAll,
  isSelectingAll
}) => {
  const handleSelectAll = () => {
    const isAllSelected = selectedProducts.size === totalProducts && totalProducts > 0;
    onSelectAll(!isAllSelected);
  };

  const handleDeselectAll = () => {
    onSelectionChange(new Set());
  };

  // Memoize the selected products array to avoid recreating it on every render
  const selectedProductsArray = useMemo(() => Array.from(selectedProducts), [selectedProducts]);

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
          <BulkPriceUpdateDialog
            selectedProducts={selectedProducts}
            products={products}
            onBulkUpdate={onBulkUpdate}
          />
          
          <BulkStockUpdateDialog
            selectedProducts={selectedProducts}
            products={products}
            onBulkUpdate={onBulkUpdate}
          />
          
          <BulkCategoryUpdateDialog
            selectedProducts={selectedProducts}
            products={products}
            categories={categories}
            onBulkUpdate={onBulkUpdate}
          />
          
          <BulkStatusUpdateDialog
            selectedProducts={selectedProducts}
            onBulkUpdate={onBulkUpdate}
          />
          
          <BulkVisibilityUpdateDialog
            selectedProducts={selectedProducts}
            onBulkUpdate={onBulkUpdate}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default OptimizedBulkEditorToolbar;
