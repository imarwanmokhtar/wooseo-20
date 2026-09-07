
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ToggleLeft } from 'lucide-react';
import { toast } from 'sonner';

interface BulkStatusUpdateDialogProps {
  selectedProducts: Set<number>;
  onBulkUpdate: (productIds: number[], updates: any) => void;
}

const BulkStatusUpdateDialog: React.FC<BulkStatusUpdateDialogProps> = ({
  selectedProducts,
  onBulkUpdate
}) => {
  const [statusValue, setStatusValue] = useState('');

  const handleBulkStatusUpdate = () => {
    if (!statusValue || selectedProducts.size === 0) {
      toast.error('Please select a status and products');
      return;
    }

    const productIds = Array.from(selectedProducts);
    onBulkUpdate(productIds, { status: statusValue });
    setStatusValue('');
    toast.success(`Updated status for ${productIds.length} products`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={selectedProducts.size === 0}>
          <ToggleLeft className="h-4 w-4 mr-2" />
          Update Status
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Update Status</DialogTitle>
          <DialogDescription>
            Update status for {selectedProducts.size} selected products
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select value={statusValue} onValueChange={setStatusValue}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publish">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleBulkStatusUpdate}>Update Status</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkStatusUpdateDialog;
