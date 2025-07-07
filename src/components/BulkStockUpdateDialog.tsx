
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BulkEditorProduct } from '@/pages/BulkEditor';
import { Package } from 'lucide-react';
import { toast } from 'sonner';

interface BulkStockUpdateDialogProps {
  selectedProducts: Set<number>;
  products: BulkEditorProduct[];
  onBulkUpdate: (productIds: number[], updates: any) => void;
}

const BulkStockUpdateDialog: React.FC<BulkStockUpdateDialogProps> = ({
  selectedProducts,
  products,
  onBulkUpdate
}) => {
  const [stockAction, setStockAction] = useState<'set' | 'increase' | 'decrease' | 'status'>('set');
  const [stockValue, setStockValue] = useState('');
  const [stockStatus, setStockStatus] = useState('');

  const handleBulkStockUpdate = () => {
    if (selectedProducts.size === 0) {
      toast.error('Please select products');
      return;
    }

    const productIds = Array.from(selectedProducts);
    const updates: any = {};

    if (stockAction === 'status') {
      if (!stockStatus) {
        toast.error('Please select a stock status');
        return;
      }
      updates.stock_status = stockStatus;
      onBulkUpdate(productIds, updates);
      setStockStatus('');
      toast.success(`Updated stock status for ${productIds.length} products`);
    } else {
      if (!stockValue) {
        toast.error('Please enter a stock value');
        return;
      }

      const numericValue = parseInt(stockValue);

      if (isNaN(numericValue)) {
        toast.error('Please enter a valid numeric value');
        return;
      }

      productIds.forEach(productId => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        let newValue: number;
        const currentStock = product.stock_quantity || 0;

        switch (stockAction) {
          case 'set':
            newValue = numericValue;
            break;
          case 'increase':
            newValue = currentStock + numericValue;
            break;
          case 'decrease':
            newValue = Math.max(0, currentStock - numericValue);
            break;
          default:
            return;
        }

        updates.stock_quantity = newValue;
        updates.manage_stock = true;
      });

      onBulkUpdate(productIds, updates);
      setStockValue('');
      toast.success(`Updated stock for ${productIds.length} products`);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={selectedProducts.size === 0}>
          <Package className="h-4 w-4 mr-2" />
          Update Stock
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Update Stock</DialogTitle>
          <DialogDescription>
            Update stock for {selectedProducts.size} selected products
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Action</label>
            <Select value={stockAction} onValueChange={(value) => setStockAction(value as 'set' | 'increase' | 'decrease' | 'status')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="set">Set quantity to</SelectItem>
                <SelectItem value="increase">Increase quantity by</SelectItem>
                <SelectItem value="decrease">Decrease quantity by</SelectItem>
                <SelectItem value="status">Change stock status</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {stockAction === 'status' ? (
            <div>
              <label className="text-sm font-medium">Stock Status</label>
              <Select value={stockStatus} onValueChange={setStockStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stock status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instock">In Stock</SelectItem>
                  <SelectItem value="outofstock">Out of Stock</SelectItem>
                  <SelectItem value="onbackorder">On Backorder</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium">Quantity</label>
              <Input
                type="number"
                placeholder="Enter stock quantity"
                value={stockValue}
                onChange={(e) => setStockValue(e.target.value)}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleBulkStockUpdate}>Update Stock</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkStockUpdateDialog;
