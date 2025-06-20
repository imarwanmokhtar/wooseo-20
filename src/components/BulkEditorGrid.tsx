
import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  loadMoreProducts: () => void;
  hasMoreProducts: boolean;
  isLoadingMore: boolean;
  isSearching: boolean;
}

const BulkEditorGrid: React.FC<BulkEditorGridProps> = ({
  products,
  onProductUpdate,
  selectedProducts,
  onSelectionChange,
  categories,
  onSaveChanges,
  loadMoreProducts,
  hasMoreProducts,
  isLoadingMore,
  isSearching
}) => {
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

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

  // Intersection Observer for infinite scrolling within the table container
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMoreProducts && !isLoadingMore && !isSearching) {
          loadMoreProducts();
        }
      },
      { 
        threshold: 0.1,
        root: scrollRef.current, // Only observe within the scroll container
        rootMargin: '100px' // Trigger 100px before reaching the bottom
      }
    );

    if (loadingRef.current && scrollRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [hasMoreProducts, isLoadingMore, loadMoreProducts, isSearching]);

  const unsavedChangesCount = products.filter(p => p.isEdited).length;

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Fixed Toolbar */}
      <BulkEditorGridToolbar
        onSaveChanges={onSaveChanges}
        unsavedChangesCount={unsavedChangesCount}
      />

      {/* Scrollable Table Container */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full" ref={scrollRef}>
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

            {/* Loading trigger and indicator - only show if not searching */}
            {!isSearching && (
              <div ref={loadingRef} className="flex justify-center py-4">
                {isLoadingMore ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-gray-600">Loading more products...</span>
                  </div>
                ) : hasMoreProducts ? (
                  <div className="text-gray-500 text-sm">Scroll down to load more products</div>
                ) : (
                  <div className="text-gray-500 text-sm">All products loaded</div>
                )}
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default BulkEditorGrid;
