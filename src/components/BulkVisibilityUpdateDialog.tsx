
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye } from 'lucide-react';
import { toast } from 'sonner';

interface BulkVisibilityUpdateDialogProps {
  selectedProducts: Set<number>;
  onBulkUpdate: (productIds: number[], updates: any) => void;
}

const BulkVisibilityUpdateDialog: React.FC<BulkVisibilityUpdateDialogProps> = ({
  selectedProducts,
  onBulkUpdate
}) => {
  const [visibilityValue, setVisibilityValue] = useState('');

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

  return (
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
        <DialogFooter>
          <Button onClick={handleBulkVisibilityUpdate}>Update Visibility</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkVisibilityUpdateDialog;
