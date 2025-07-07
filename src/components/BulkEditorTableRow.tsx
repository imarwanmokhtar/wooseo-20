
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { BulkEditorProduct } from '@/pages/BulkEditor';
import { Category } from '@/types';
import BulkEditorCell from './BulkEditorCell';

interface BulkEditorTableRowProps {
  product: BulkEditorProduct;
  isSelected: boolean;
  isExpanded: boolean;
  categories: Category[];
  onSelect: (productId: number, checked: boolean) => void;
  onToggleExpanded: (productId: number) => void;
  onProductUpdate: (productId: number, field: string, value: any) => void;
}

const BulkEditorTableRow: React.FC<BulkEditorTableRowProps> = ({
  product,
  isSelected,
  isExpanded,
  categories,
  onSelect,
  onToggleExpanded,
  onProductUpdate
}) => {
  const handleSelect = useCallback((checked: boolean) => {
    onSelect(product.id, checked);
  }, [product.id, onSelect]);

  const handleToggleExpanded = useCallback(() => {
    onToggleExpanded(product.id);
  }, [product.id, onToggleExpanded]);

  const getCurrentValue = (field: string) => {
    return product[field as keyof BulkEditorProduct];
  };

  const getProductTypeDisplay = () => {
    return product.product_type || 'simple';
  };

  return (
    <>
      <div className={`border-b ${product.isEdited ? 'bg-yellow-50' : ''}`}>
        <div className="grid grid-cols-[40px_40px_80px_250px_120px_100px_100px_80px_120px_100px_150px_100px_100px] gap-1 text-xs">
          <div className="p-2 border-r">
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleSelect}
            />
          </div>
          <div className="p-2 border-r">
            {product.variations && product.variations.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-6 w-6"
                onClick={handleToggleExpanded}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          <div className="border-r p-2 text-xs">{product.id}</div>
          <div className="border-r">
            <BulkEditorCell
              productId={product.id}
              field="name"
              value={getCurrentValue('name')}
              product={product}
              categories={categories}
              onUpdate={onProductUpdate}
            />
          </div>
          <div className="border-r">
            <BulkEditorCell
              productId={product.id}
              field="sku"
              value={getCurrentValue('sku')}
              product={product}
              categories={categories}
              onUpdate={onProductUpdate}
            />
          </div>
          <div className="border-r">
            <BulkEditorCell
              productId={product.id}
              field="regular_price"
              value={getCurrentValue('regular_price')}
              product={product}
              categories={categories}
              onUpdate={onProductUpdate}
            />
          </div>
          <div className="border-r">
            <BulkEditorCell
              productId={product.id}
              field="sale_price"
              value={getCurrentValue('sale_price')}
              product={product}
              categories={categories}
              onUpdate={onProductUpdate}
            />
          </div>
          <div className="border-r">
            <BulkEditorCell
              productId={product.id}
              field="stock_quantity"
              value={getCurrentValue('stock_quantity')}
              product={product}
              categories={categories}
              onUpdate={onProductUpdate}
            />
          </div>
          <div className="border-r">
            <BulkEditorCell
              productId={product.id}
              field="stock_status"
              value={getCurrentValue('stock_status')}
              product={product}
              categories={categories}
              onUpdate={onProductUpdate}
            />
          </div>
          <div className="border-r">
            <BulkEditorCell
              productId={product.id}
              field="catalog_visibility"
              value={getCurrentValue('catalog_visibility')}
              product={product}
              categories={categories}
              onUpdate={onProductUpdate}
            />
          </div>
          <div className="border-r">
            <BulkEditorCell
              productId={product.id}
              field="categories"
              value={getCurrentValue('categories')}
              product={product}
              categories={categories}
              onUpdate={onProductUpdate}
            />
          </div>
          <div className="border-r">
            <div className="min-h-[32px] px-2 py-1 text-xs">
              {getProductTypeDisplay()}
              {product.isEdited && (
                <Badge variant="secondary" className="text-xs ml-2">
                  Modified
                </Badge>
              )}
            </div>
          </div>
          <div className="border-r">
            <BulkEditorCell
              productId={product.id}
              field="status"
              value={getCurrentValue('status')}
              product={product}
              categories={categories}
              onUpdate={onProductUpdate}
            />
          </div>
        </div>
      </div>

      {/* Variations */}
      {isExpanded && product.variations && (
        <div className="ml-8 border-l-2 border-blue-200">
          {product.variations.map((variation: any) => (
            <div key={variation.id} className="grid grid-cols-[40px_40px_80px_250px_120px_100px_100px_80px_120px_100px_150px_100px_100px] gap-1 text-xs bg-blue-50">
              <div className="p-2"></div>
              <div className="p-2"></div>
              <div className="border-r p-2">{variation.id}</div>
              <div className="border-r p-2">{variation.attributes?.map((attr: any) => `${attr.name}: ${attr.option}`).join(', ')}</div>
              <div className="border-r">
                <BulkEditorCell
                  productId={variation.id}
                  field="sku"
                  value={variation.sku}
                  product={product}
                  categories={categories}
                  onUpdate={onProductUpdate}
                />
              </div>
              <div className="border-r">
                <BulkEditorCell
                  productId={variation.id}
                  field="regular_price"
                  value={variation.regular_price}
                  product={product}
                  categories={categories}
                  onUpdate={onProductUpdate}
                />
              </div>
              <div className="border-r">
                <BulkEditorCell
                  productId={variation.id}
                  field="sale_price"
                  value={variation.sale_price}
                  product={product}
                  categories={categories}
                  onUpdate={onProductUpdate}
                />
              </div>
              <div className="border-r">
                <BulkEditorCell
                  productId={variation.id}
                  field="stock_quantity"
                  value={variation.stock_quantity}
                  product={product}
                  categories={categories}
                  onUpdate={onProductUpdate}
                />
              </div>
              <div className="border-r">
                <BulkEditorCell
                  productId={variation.id}
                  field="stock_status"
                  value={variation.stock_status}
                  product={product}
                  categories={categories}
                  onUpdate={onProductUpdate}
                />
              </div>
              <div className="border-r"></div>
              <div className="border-r"></div>
              <div className="border-r p-2">Variation</div>
              <div className="border-r">
                <BulkEditorCell
                  productId={variation.id}
                  field="status"
                  value={variation.status}
                  product={product}
                  categories={categories}
                  onUpdate={onProductUpdate}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default BulkEditorTableRow;
