
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { BulkEditorProduct } from '@/pages/BulkEditor';
import { Category } from '@/types';
import { Tag, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface BulkCategoryUpdateDialogProps {
  selectedProducts: Set<number>;
  products: BulkEditorProduct[];
  categories: Category[];
  onBulkUpdate: (productIds: number[], updates: any) => void;
}

const BulkCategoryUpdateDialog: React.FC<BulkCategoryUpdateDialogProps> = ({
  selectedProducts,
  products,
  categories,
  onBulkUpdate
}) => {
  const [categoryAction, setCategoryAction] = useState<'replace' | 'add' | 'remove'>('replace');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const handleCategoryToggle = (categoryId: number, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  const handleBulkCategoryUpdate = () => {
    if (selectedCategories.length === 0 || selectedProducts.size === 0) {
      toast.error('Please select categories and products');
      return;
    }

    const productIds = Array.from(selectedProducts);
    const selectedCategoryObjects = categories.filter(cat => selectedCategories.includes(cat.id));
    
    productIds.forEach(productId => {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      let newCategories = [...(product.categories || [])];

      switch (categoryAction) {
        case 'replace':
          newCategories = selectedCategoryObjects.map(cat => ({ id: cat.id, name: cat.name }));
          break;
        case 'add':
          selectedCategoryObjects.forEach(category => {
            if (!newCategories.some(cat => cat.id === category.id)) {
              newCategories.push({ id: category.id, name: category.name });
            }
          });
          break;
        case 'remove':
          newCategories = newCategories.filter(cat => !selectedCategories.includes(cat.id));
          break;
      }

      onBulkUpdate([productId], { categories: newCategories });
    });

    setSelectedCategories([]);
    toast.success(`Updated categories for ${productIds.length} products`);
  };

  const selectedCategoriesText = selectedCategories.length > 0 
    ? `${selectedCategories.length} categories selected` 
    : 'Select categories';

  return (
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
            <Select value={categoryAction} onValueChange={(value) => setCategoryAction(value as 'replace' | 'add' | 'remove')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="replace">Replace with</SelectItem>
                <SelectItem value="add">Add categories</SelectItem>
                <SelectItem value="remove">Remove categories</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Categories</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="truncate">{selectedCategoriesText}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full max-h-60 overflow-y-auto bg-white z-50">
                {categories.map((category) => (
                  <DropdownMenuCheckboxItem
                    key={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={(checked) => handleCategoryToggle(category.id, checked)}
                  >
                    {category.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedCategories.map(categoryId => {
                  const category = categories.find(cat => cat.id === categoryId);
                  return category ? (
                    <Badge key={categoryId} variant="secondary" className="text-xs">
                      {category.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleBulkCategoryUpdate}>Update Categories</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkCategoryUpdateDialog;
