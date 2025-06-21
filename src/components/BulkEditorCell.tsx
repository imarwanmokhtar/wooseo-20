
import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem 
} from '@/components/ui/dropdown-menu';
import { BulkEditorProduct } from '@/pages/BulkEditor';
import { Category } from '@/types';
import { toast } from 'sonner';
import { ChevronDown } from 'lucide-react';

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

  const handleCategoryToggle = useCallback((categoryId: number, checked: boolean) => {
    const currentCategories = value || [];
    let newCategories;
    
    if (checked) {
      // Add category if not already present
      const category = categories.find(cat => cat.id === categoryId);
      if (category && !currentCategories.some((cat: any) => cat.id === categoryId)) {
        newCategories = [...currentCategories, { id: category.id, name: category.name }];
      } else {
        return; // Category already exists
      }
    } else {
      // Remove category
      newCategories = currentCategories.filter((cat: any) => cat.id !== categoryId);
    }
    
    console.log('Category toggle:', productId, newCategories);
    onUpdate(productId, field, newCategories);
    toast.success('Categories updated');
  }, [categories, productId, field, onUpdate, value]);

  const renderCategoriesDropdown = () => {
    const selectedCategoryIds = (value || []).map((cat: any) => cat.id);
    const selectedCategoriesText = value && value.length > 0 
      ? `${value.length} categories selected` 
      : 'Select categories';

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-8 text-xs w-full justify-between">
            <span className="truncate">{selectedCategoriesText}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto bg-white">
          {categories.map((category) => (
            <DropdownMenuCheckboxItem
              key={category.id}
              checked={selectedCategoryIds.includes(category.id)}
              onCheckedChange={(checked) => handleCategoryToggle(category.id, checked)}
            >
              {category.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

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
        return renderCategoriesDropdown();

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
      const categories = value || [];
      if (categories.length === 0) {
        return <span className="text-gray-500">No categories</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {categories.slice(0, 2).map((cat: any) => (
            <Badge key={cat.id} variant="secondary" className="text-xs">
              {cat.name}
            </Badge>
          ))}
          {categories.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{categories.length - 2} more
            </Badge>
          )}
        </div>
      );
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
