
import React, { useState } from 'react';
import Header from '@/components/Header';
import StoreSelector from '@/components/StoreSelector';
import ProductsExtractor from '@/components/ProductsExtractor';
import ContentHealthDashboard from '@/components/ContentHealthDashboard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, CheckCircle, Download, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const ProductsExtractorPage = () => {
  const [showAddStore, setShowAddStore] = useState(false);
  const [activeTab, setActiveTab] = useState('extractor');

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
            <h1 className="text-2xl font-bold text-gray-900">Products Extractor</h1>
            <p className="text-gray-600">Extract and analyze your WooCommerce products</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <StoreSelector onAddStore={handleAddStore} />
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="extractor" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Products & SEO Generation
              </TabsTrigger>
              <TabsTrigger value="health" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Content Health Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="extractor" className="mt-6">
              <ProductsExtractor />
            </TabsContent>

            <TabsContent value="health" className="mt-6">
              <ContentHealthDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProductsExtractorPage;
