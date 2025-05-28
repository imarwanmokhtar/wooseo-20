
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMultiStore } from '@/contexts/MultiStoreContext';
import { Store, Plus, TrendingUp } from 'lucide-react';

interface StoreSelectorProps {
  onAddStore: () => void;
}

const StoreSelector: React.FC<StoreSelectorProps> = ({ onAddStore }) => {
  const { stores, activeStore, storeUsage, setActiveStore } = useMultiStore();

  const getStoreUsage = (storeId: string) => {
    return storeUsage.find(usage => usage.store_id === storeId);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center">
        <Store className="h-5 w-5 mr-2 text-seo-primary" />
        <span className="text-sm font-medium">Active Store:</span>
      </div>
      
      <Select
        value={activeStore?.id || ''}
        onValueChange={(storeId) => {
          const store = stores.find(s => s.id === storeId);
          if (store) setActiveStore(store);
        }}
      >
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Select a store">
            {activeStore && (
              <div className="flex items-center justify-between w-full">
                <span>{activeStore.store_name}</span>
                {getStoreUsage(activeStore.id || '') && (
                  <Badge variant="secondary" className="ml-2">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {getStoreUsage(activeStore.id || '')?.credits_used || 0}
                  </Badge>
                )}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {stores.map((store) => {
            const usage = getStoreUsage(store.id || '');
            return (
              <SelectItem key={store.id} value={store.id || ''}>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="font-medium">{store.store_name}</div>
                    <div className="text-xs text-gray-500">{store.url}</div>
                  </div>
                  {usage && (
                    <Badge variant="outline" className="ml-2">
                      {usage.credits_used} credits used
                    </Badge>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm" onClick={onAddStore}>
        <Plus className="h-4 w-4 mr-2" />
        Add Store
      </Button>
    </div>
  );
};

export default StoreSelector;
