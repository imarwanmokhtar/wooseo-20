
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BulkEditorProduct } from '@/pages/BulkEditor';
import { DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface BulkPriceUpdateDialogProps {
  selectedProducts: Set<number>;
  products: BulkEditorProduct[];
  onBulkUpdate: (productIds: number[], updates: any) => void;
}

const BulkPriceUpdateDialog: React.FC<BulkPriceUpdateDialogProps> = ({
  selectedProducts,
  products,
  onBulkUpdate
}) => {
  const [priceAction, setPriceAction] = useState<'set' | 'increase' | 'decrease'>('set');
  const [priceValue, setPriceValue] = useState('');
  const [priceType, setPriceType] = useState<'regular' | 'sale'>('regular');

  const handleBulkPriceUpdate = () => {
    if (!priceValue || selectedProducts.size === 0) {
      toast.error('Please enter a price value and select products');
      return;
    }

    const productIds = Array.from(selectedProducts);
    const numericValue = parseFloat(priceValue);

    if (isNaN(numericValue)) {
      toast.error('Please enter a valid numeric value');
      return;
    }

    const updates: any = {};
    const fieldName = priceType === 'regular' ? 'regular_price' : 'sale_price';

    productIds.forEach(productId => {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      let newValue: number;
      const currentPrice = parseFloat(product[fieldName]) || 0;

      switch (priceAction) {
        case 'set':
          newValue = numericValue;
          break;
        case 'increase':
          newValue = currentPrice * (1 + numericValue / 100);
          break;
        case 'decrease':
          newValue = Math.max(0, currentPrice * (1 - numericValue / 100));
          break;
        default:
          return;
      }

      updates[fieldName] = newValue.toFixed(2);
    });

    onBulkUpdate(productIds, updates);
    setPriceValue('');
    
    const actionText = priceAction === 'set' ? 'set' : `${priceAction}d by ${numericValue}%`;
    toast.success(`Updated ${priceType} price for ${productIds.length} products - ${actionText}`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={selectedProducts.size === 0}>
          <DollarSign className="h-4 w-4 mr-2" />
          Update Prices
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Update Prices</DialogTitle>
          <DialogDescription>
            Update prices for {selectedProducts.size} selected products
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Price Type</label>
            <Select value={priceType} onValueChange={(value: 'regular' | 'sale') => setPriceType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular Price</SelectItem>
                <SelectItem value="sale">Sale Price</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Action</label>
            <Select value={priceAction} onValueChange={(value) => setPriceAction(value as 'set' | 'increase' | 'decrease')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="set">Set to</SelectItem>
                <SelectItem value="increase">Increase by %</SelectItem>
                <SelectItem value="decrease">Decrease by %</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">
              {priceAction === 'set' ? 'Price Value' : 'Percentage (%)'}
            </label>
            <Input
              type="number"
              step={priceAction === 'set' ? "0.01" : "0.1"}
              placeholder={priceAction === 'set' ? "Enter price value" : "Enter percentage"}
              value={priceValue}
              onChange={(e) => setPriceValue(e.target.value)}
            />
            {priceAction !== 'set' && (
              <p className="text-xs text-gray-500 mt-1">
                Example: Enter 10 for 10% {priceAction}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleBulkPriceUpdate}>Update Prices</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkPriceUpdateDialog;
