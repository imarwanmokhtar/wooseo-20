
import React, { useState, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { BulkEditorProduct } from '@/pages/BulkEditor';
import { Category } from '@/types';
import BulkEditorGridToolbar from './BulkEditorGridToolbar';
import BulkEditorTableHeader from './BulkEditorTableHeader';
import BulkEditorTableRow from './BulkEditorTableRow';

interface BulkEditorGridProps {
  products: BulkEditorProduct[];
  onProductUpdate: (productId: number, field: string, value: any) => void;
  selectedProducts: Set<number>;
  onSelectionChange: (productIds: Set<number>) => void;
  categories: Category[];
  onSaveChanges: () => void;
}

const BulkEditorGrid: React.FC<BulkEditorGridProps> = ({
  products,
  onProductUpdate,
  selectedProducts,
  onSelectionChange,
  categories,
  onSaveChanges
}) => {
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      onSelectionChange(new Set(products.map(p => p.id)));
    } else {
      onSelectionChange(new Set());
    }
  }, [products, onSelectionChange]);

  const handleSelectProduct = useCallback((productId: number, checked: boolean) => {
    const newSelection = new Set(selectedProducts);
    if (checked) {
      newSelection.add(productId);
    } else {
      newSelection.delete(productId);
    }
    onSelectionChange(newSelection);
  }, [selectedProducts, onSelectionChange]);

  const handleCellEdit = useCallback((productId: number, field: string, value: any) => {
    onProductUpdate(productId, field, value);
  }, [onProductUpdate]);

  const toggleExpanded = useCallback((productId: number) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  }, [expandedProducts]);

  const unsavedChangesCount = products.filter(p => p.isEdited).length;

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Fixed Toolbar - removed undo/redo buttons */}
      <BulkEditorGridToolbar
        onSaveChanges={onSaveChanges}
        unsavedChangesCount={unsavedChangesCount}
      />

      {/* Scrollable Table Container */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="min-w-[1500px] pb-4">
            {/* Table Header */}
            <BulkEditorTableHeader
              selectedCount={selectedProducts.size}
              totalCount={products.length}
              onSelectAll={handleSelectAll}
            />

            {/* Table Body */}
            <div>
              {products.map((product) => (
                <BulkEditorTableRow
                  key={product.id}
                  product={product}
                  isSelected={selectedProducts.has(product.id)}
                  isExpanded={expandedProducts.has(product.id)}
                  categories={categories}
                  onSelect={handleSelectProduct}
                  onToggleExpanded={toggleExpanded}
                  onProductUpdate={handleCellEdit}
                />
              ))}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default BulkEditorGrid;
