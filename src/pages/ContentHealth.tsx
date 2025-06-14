
import React, { useState } from 'react';
import Header from '@/components/Header';
import StoreSelector from '@/components/StoreSelector';
import ContentHealthDashboard from '@/components/ContentHealthDashboard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const ContentHealthPage = () => {
  const [showAddStore, setShowAddStore] = useState(false);

  const handleAddStore = () => {
    toast.info("Store addition feature coming soon!");
    setShowAddStore(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="space-y-6">
          <StoreSelector onAddStore={handleAddStore} />
          <ContentHealthDashboard />
        </div>
      </div>
    </div>
  );
};

export default ContentHealthPage;
