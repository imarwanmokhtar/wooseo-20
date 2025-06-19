
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BulkEditorProduct } from '@/pages/BulkEditor';
import { Category } from '@/types';
import { Settings, Trash2, Eye, EyeOff, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface BulkEditorToolbarProps {
  selectedProducts: Set<number>;
  onBulkUpdate: (productIds: number[], updates: any) => void;
  categories: Category[];
  products: BulkEditorProduct[];
}

const BulkEditorToolbar: React.FC<BulkEditorToolbarProps> = ({
  selectedProducts,
  onBulkUpdate,
  categories,
  products
}) => {
  const [bulkUpdateField, setBulkUpdateField] = useState('');
  const [bulkUpdateValue, setBulkUpdateValue] = useState('');
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const selectedCount = selectedProducts.size;
  const selectedProductIds = Array.from(selectedProducts);

  const handleBulkUpdate = () => {
    if (!bulkUpdateField || !bulkUpdateValue) {
      toast.error('Please select a field and enter a value');
      return;
    }

    let processedValue: any = bulkUpdateValue;
    
    // Process value based on field type
    switch (bulkUpdateField) {
      case 'regular_price':
      case 'sale_price':
      case 'stock_quantity':
        processedValue = parseFloat(bulkUpdateValue) || 0;
        break;
      case 'manage_stock':
        processedValue = bulkUpdateValue.toLowerCase() === 'true';
        break;
      case 'categories':
        // Handle category as an array of objects
        const categoryId = parseInt(bulkUpdateValue);
        const category = categories.find(cat => cat.id === categoryId);
        if (category) {
          processedValue = [{ id: category.id, name: category.name }];
        } else {
          processedValue = [];
        }
        break;
      default:
        processedValue = bulkUpdateValue;
        break;
    }

    onBulkUpdate(selectedProductIds, { [bulkUpdateField]: processedValue });
    
    toast.success(`Updated ${selectedCount} products`);
    setBulkUpdateField('');
    setBulkUpdateValue('');
    setShowBulkDialog(false);
  };

  const handleBulkPublish = () => {
    onBulkUpdate(selectedProductIds, { status: 'publish' });
    toast.success(`Published ${selectedCount} products`);
  };

  const handleBulkUnpublish = () => {
    onBulkUpdate(selectedProductIds, { status: 'draft' });
    toast.success(`Unpublished ${selectedCount} products`);
  };

  const handleBulkDelete = () => {
    // In a real implementation, this would mark products for deletion
    // For now, we'll just show a confirmation
    toast.success(`Marked ${selectedCount} products for deletion`);
    setShowDeleteDialog(false);
  };

  const getBulkFieldOptions = () => {
    return [
      { value: 'regular_price', label: 'Regular Price', type: 'number' },
      { value: 'sale_price', label: 'Sale Price', type: 'number' },
      { value: 'stock_quantity', label: 'Stock Quantity', type: 'number' },
      { value: 'stock_status', label: 'Stock Status', type: 'select', options: ['instock', 'outofstock', 'onbackorder'] },
      { value: 'manage_stock', label: 'Manage Stock', type: 'select', options: ['true', 'false'] },
      { value: 'status', label: 'Status', type: 'select', options: ['publish', 'draft', 'private'] },
      { value: 'catalog_visibility', label: 'Visibility', type: 'select', options: ['visible', 'catalog', 'search', 'hidden'] },
      { value: 'categories', label: 'Category', type: 'category' },
      { value: 'short_description', label: 'Short Description', type: 'text' }
    ];
  };

  const getSelectedFieldConfig = () => {
    return getBulkFieldOptions().find(option => option.value === bulkUpdateField);
  };

  const renderValueInput = () => {
    const fieldConfig = getSelectedFieldConfig();
    if (!fieldConfig) return null;

    if (fieldConfig.type === 'select') {
      return (
        <Select value={bulkUpdateValue} onValueChange={setBulkUpdateValue}>
          <SelectTrigger>
            <SelectValue placeholder="Select value..." />
          </SelectTrigger>
          <SelectContent>
            {fieldConfig.options?.map(option => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (fieldConfig.type === 'category') {
      return (
        <Select value={bulkUpdateValue} onValueChange={setBulkUpdateValue}>
          <SelectTrigger>
            <SelectValue placeholder="Select category..." />
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
    }

    return (
      <Input
        type={fieldConfig.type === 'number' ? 'number' : 'text'}
        value={bulkUpdateValue}
        onChange={(e) => setBulkUpdateValue(e.target.value)}
        placeholder={`Enter ${fieldConfig.label.toLowerCase()}...`}
      />
    );
  };

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Selected:</span>
            <Badge variant={selectedCount > 0 ? 'default' : 'secondary'}>
              {selectedCount} products
            </Badge>
          </div>

          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Bulk Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bulk Edit {selectedCount} Products</DialogTitle>
                    <DialogDescription>
                      Set the same value for all selected products
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label>Field to Update</Label>
                      <Select value={bulkUpdateField} onValueChange={setBulkUpdateField}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select field..." />
                        </SelectTrigger>
                        <SelectContent>
                          {getBulkFieldOptions().map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {bulkUpdateField && (
                      <div>
                        <Label>New Value</Label>
                        {renderValueInput()}
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleBulkUpdate}>
                      Update {selectedCount} Products
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkPublish}
              >
                <Eye className="h-4 w-4 mr-2" />
                Publish
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkUnpublish}
              >
                <EyeOff className="h-4 w-4 mr-2" />
                Unpublish
              </Button>

              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete {selectedCount} Products</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete these products? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleBulkDelete}>
                      Delete Products
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600">
          {products.filter(p => p.isEdited).length} unsaved changes
        </div>
      </div>
    </Card>
  );
};

export default BulkEditorToolbar;
