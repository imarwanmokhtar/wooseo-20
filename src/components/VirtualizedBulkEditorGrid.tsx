
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BulkEditorProduct } from '@/pages/BulkEditor';
import { Category } from '@/types';
import BulkEditorGridToolbar from './BulkEditorGridToolbar';
import BulkEditorTableHeader from './BulkEditorTableHeader';
import BulkEditorTableRow from './BulkEditorTableRow';
import { useVirtualization } from '@/hooks/useVirtualization';

interface VirtualizedBulkEditorGridProps {
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
  totalProducts: number;
  onSelectAll: (checked: boolean) => void;
  isSelectingAll: boolean;
}

const ITEM_HEIGHT = 60; // Height of each product row
const CONTAINER_HEIGHT = 500; // Height of the scrollable container

const VirtualizedBulkEditorGrid: React.FC<VirtualizedBulkEditorGridProps> = ({
  products,
  onProductUpdate,
  selectedProducts,
  onSelectionChange,
  categories,
  onSaveChanges,
  loadMoreProducts,
  hasMoreProducts,
  isLoadingMore,
  isSearching,
  totalProducts,
  onSelectAll,
  isSelectingAll
}) => {
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const {
    visibleItems,
    totalHeight,
    scrollTop,
    setScrollTop,
    visibleRange
  } = useVirtualization({
    items: products,
    containerHeight: CONTAINER_HEIGHT,
    itemHeight: ITEM_HEIGHT,
    overscan: 5
  });

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

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    setScrollTop(scrollTop);

    // Load more products when near bottom
    const { scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 100 && hasMoreProducts && !isLoadingMore && !isSearching) {
      loadMoreProducts();
    }
  }, [setScrollTop, hasMoreProducts, isLoadingMore, isSearching, loadMoreProducts]);

  const unsavedChangesCount = products.filter(p => p.isEdited).length;

  // Memoize the visible rows to prevent unnecessary re-renders
  const visibleRows = useMemo(() => {
    return visibleItems.map((product) => (
      <div
        key={product.id}
        style={{
          position: 'absolute',
          top: product.index * ITEM_HEIGHT,
          width: '100%',
          height: ITEM_HEIGHT
        }}
      >
        <BulkEditorTableRow
          product={product}
          isSelected={selectedProducts.has(product.id)}
          isExpanded={expandedProducts.has(product.id)}
          categories={categories}
          onSelect={handleSelectProduct}
          onToggleExpanded={toggleExpanded}
          onProductUpdate={handleCellEdit}
        />
      </div>
    ));
  }, [visibleItems, selectedProducts, expandedProducts, categories, handleSelectProduct, toggleExpanded, handleCellEdit]);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Fixed Toolbar */}
      <BulkEditorGridToolbar
        onSaveChanges={onSaveChanges}
        unsavedChangesCount={unsavedChangesCount}
      />

      {/* Scrollable Table Container */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full w-full">
          <div className="min-w-[1500px]">
            {/* Table Header */}
            <BulkEditorTableHeader
              selectedCount={selectedProducts.size}
              totalCount={totalProducts}
              onSelectAll={onSelectAll}
              isSelectingAll={isSelectingAll}
            />

            {/* Virtualized Table Body */}
            <div 
              className="relative overflow-auto"
              style={{ height: CONTAINER_HEIGHT }}
              onScroll={handleScroll}
              ref={scrollRef}
            >
              <div style={{ height: totalHeight, position: 'relative' }}>
                {visibleRows}
              </div>

              {/* Loading indicator */}
              {!isSearching && (
                <div 
                  ref={loadingRef} 
                  className="absolute bottom-0 left-0 right-0 flex justify-center py-4 bg-white"
                >
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualizedBulkEditorGrid;
