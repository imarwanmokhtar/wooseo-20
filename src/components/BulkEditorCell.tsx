
import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BulkEditorProduct } from '@/pages/BulkEditor';
import { Category } from '@/types';
import { toast } from 'sonner';

interface BulkEditorCellProps {
  productId: number;
  field: string;
  value: any;
  product: BulkEditorProduct;
  categories: Category[];
  onUpdate: (productId: number, field: string, value: any) => void;
}

const BulkEditorCell: React.FC<BulkEditorCellProps> = ({
  productId,
  field,
  value,
  product,
  categories,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>('');

  const startEditing = useCallback(() => {
    setIsEditing(true);
    setEditValue(value?.toString() || '');
  }, [value]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditValue('');
  }, []);

  const commitEdit = useCallback(() => {
    if (!isEditing) return;
    
    let processedValue: any = editValue;
    
    // Process value based on field type
    if (['regular_price', 'sale_price', 'stock_quantity'].includes(field)) {
      processedValue = parseFloat(editValue) || 0;
    }
    
    console.log('Committing edit:', productId, field, processedValue);
    
    setIsEditing(false);
    setEditValue('');
    
    // Update immediately
    onUpdate(productId, field, processedValue);
    toast.success('Field updated');
  }, [isEditing, editValue, productId, field, onUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  }, [commitEdit, cancelEditing]);

  const handleSelectChange = useCallback((newValue: string) => {
    console.log('Select change:', productId, field, newValue);
    onUpdate(productId, field, newValue);
    toast.success('Field updated');
  }, [productId, field, onUpdate]);

  const handleCategoryChange = useCallback((categoryId: string) => {
    const category = categories.find(cat => cat.id === parseInt(categoryId));
    const categoryValue = category ? [{ id: category.id, name: category.name }] : [];
    console.log('Category change:', productId, categoryValue);
    onUpdate(productId, field, categoryValue);
    toast.success('Field updated');
  }, [categories, productId, field, onUpdate]);

  const renderEditingInput = () => {
    switch (field) {
      case 'stock_status':
        return (
          <Select
            value={value || 'instock'}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instock">In Stock</SelectItem>
              <SelectItem value="outofstock">Out of Stock</SelectItem>
              <SelectItem value="onbackorder">On Backorder</SelectItem>
            </SelectContent>
          </Select>
        );
      
      case 'status':
        return (
          <Select
            value={value || 'publish'}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="publish">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        );
        
      case 'catalog_visibility':
        return (
          <Select
            value={value || 'visible'}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visible">Visible</SelectItem>
              <SelectItem value="catalog">Catalog</SelectItem>
              <SelectItem value="search">Search</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
        );

      case 'categories':
        const currentCategoryId = value?.[0]?.id?.toString() || '';
        return (
          <Select
            value={currentCategoryId}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            type={['regular_price', 'sale_price', 'stock_quantity'].includes(field) ? 'number' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 text-xs"
            autoFocus
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
          />
        );
    }
  };

  const renderDisplayValue = () => {
    if (field === 'categories') {
      return <span>{value?.[0]?.name || 'No category'}</span>;
    } else if (field === 'stock_status') {
      return (
        <Badge variant={value === 'instock' ? 'default' : value === 'outofstock' ? 'destructive' : 'secondary'}>
          {value || 'instock'}
        </Badge>
      );
    } else if (field === 'status') {
      return (
        <Badge variant={value === 'publish' ? 'default' : 'secondary'}>
          {value || 'publish'}
        </Badge>
      );
    } else {
      return <span>{value || ''}</span>;
    }
  };

  // For select fields, render the select directly instead of click-to-edit
  if (['stock_status', 'status', 'catalog_visibility', 'categories'].includes(field)) {
    return (
      <div className={`min-h-[32px] px-2 py-1 text-xs ${product.isEdited ? 'bg-yellow-50' : ''}`}>
        {renderEditingInput()}
      </div>
    );
  }

  if (isEditing) {
    return renderEditingInput();
  }

  return (
    <div
      className={`min-h-[32px] px-2 py-1 cursor-pointer hover:bg-gray-50 text-xs border border-transparent hover:border-gray-200 rounded ${
        product.isEdited ? 'bg-yellow-50' : ''
      }`}
      onClick={startEditing}
    >
      {renderDisplayValue()}
    </div>
  );
};

export default BulkEditorCell;
