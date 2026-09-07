
import React, { useState } from 'react';
import Header from '@/components/Header';
import StoreSelector from '@/components/StoreSelector';
import ContentHealthDashboard from '@/components/ContentHealthDashboard';
import { Button } from '@/components/ui/button';
import { Plus, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

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
        <div className="flex items-center gap-4 mb-6">
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Health Analysis</h1>
            <p className="text-gray-600">Monitor and improve your product content quality</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <StoreSelector onAddStore={handleAddStore} />
          <ContentHealthDashboard />
        </div>
      </div>
    </div>
  );
};

export default ContentHealthPage;
