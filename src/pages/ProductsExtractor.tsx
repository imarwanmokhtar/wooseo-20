
import React, { useState } from 'react';
import Header from '@/components/Header';
import StoreSelector from '@/components/StoreSelector';
import ProductsExtractor from '@/components/ProductsExtractor';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const ProductsExtractorPage = () => {
  const [showAddStore, setShowAddStore] = useState(false);

  const handleAddStore = () => {
    // For now, just show a toast. This can be expanded later with a proper store addition modal
    toast.info("Store addition feature coming soon!");
    setShowAddStore(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="space-y-6">
          <StoreSelector onAddStore={handleAddStore} />
          <ProductsExtractor />
        </div>
      </div>
    </div>
  );
};

export default ProductsExtractorPage;
