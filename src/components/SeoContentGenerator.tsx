
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiStore } from '@/contexts/MultiStoreContext';
import { generateSeoContent, DEFAULT_PROMPT_TEMPLATE } from '@/services/aiGenerationService';
import { updateProductWithSeoContent, getWooCommerceCredentials } from '@/services/wooCommerceApi';
import { Product, SeoContent } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Wand2, Save, Loader2, AlertCircle } from 'lucide-react';
import EditableSeoContent from './EditableSeoContent';

interface SeoContentGeneratorProps {
  products: Product[];
  onContentGenerated?: (productId: number, content: SeoContent) => void;
}

const SeoContentGenerator: React.FC<SeoContentGeneratorProps> = ({ 
  products, 
  onContentGenerated 
}) => {
  const { user, credits, refreshCredits } = useAuth();
  const { activeStore } = useMultiStore();
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT_TEMPLATE);
  const [generating, setGenerating] = useState(false);
  const [updatingWooCommerce, setUpdatingWooCommerce] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{ [productId: number]: SeoContent }>({});
  const [error, setError] = useState<string | null>(null);
  const [updatedProducts, setUpdatedProducts] = useState<Set<number>>(new Set());

  const handleGenerateContent = async () => {
    setError(null);
    
    if (!user) {
      toast.error('You must be logged in to generate content');
      setError('Authentication required. Please log in and try again.');
      return;
    }

    if (!activeStore?.id) {
      toast.error('No active store selected');
      setError('No active store selected. Please select a store first.');
      return;
    }

    if (products.length === 0) {
      toast.error('No products selected');
      return;
    }

    if (credits <= 0) {
      setError('You do not have enough credits to generate content. Please purchase credits first.');
      toast.error('Not enough credits');
      return;
    }

    setGenerating(true);
    const newContent: { [productId: number]: SeoContent } = {};
    let successCount = 0;

    try {
      for (const product of products) {
        console.log(`Generating content for product: ${product.name}`);
        toast.info(`Generating content for ${product.name}...`);

        try {
          const content = await generateSeoContent(product, prompt, user.id);
          // Add store_id to the content
          content.store_id = activeStore.id;
          newContent[product.id] = content;
          successCount++;

          if (onContentGenerated) {
            onContentGenerated(product.id, content);
          }
        } catch (error) {
          console.error(`Error generating content for ${product.name}:`, error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          toast.error(`Failed to generate content for ${product.name}: ${errorMessage}`);
        }
      }

      if (successCount > 0) {
        setGeneratedContent(prev => ({ ...prev, ...newContent }));
        toast.success(`Generated SEO content for ${successCount} product(s)`);
        // Refresh credits to show updated value
        await refreshCredits();
      } else {
        setError('Failed to generate content for any products. Please try again.');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate content');
      toast.error(error instanceof Error ? error.message : 'Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateWooCommerce = async () => {
    setError(null);
    
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    if (!activeStore?.id) {
      toast.error('No active store selected');
      setError('No active store selected. Please select a store first.');
      return;
    }

    const contentToUpdate = Object.entries(generatedContent).filter(([productId]) => 
      products.some(p => p.id.toString() === productId)
    );

    if (contentToUpdate.length === 0) {
      toast.error('No generated content to update');
      return;
    }

    setUpdatingWooCommerce(true);

    try {
      const credentials = await getWooCommerceCredentials(user.id, activeStore.id);
      if (!credentials) {
        setError('WooCommerce credentials not found. Please connect your store first.');
        toast.error('WooCommerce credentials not found');
        setUpdatingWooCommerce(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;
      const newUpdatedProducts = new Set(updatedProducts);
      
      for (const [productIdStr, content] of contentToUpdate) {
        const productId = parseInt(productIdStr);
        const product = products.find(p => p.id === productId);
        
        if (product) {
          console.log(`Updating WooCommerce product: ${product.name}`);
          toast.info(`Updating ${product.name} in WooCommerce...`);

          try {
            const success = await updateProductWithSeoContent(credentials, productId, content);
            if (success) {
              successCount++;
              newUpdatedProducts.add(productId);
              toast.success(`✅ ${product.name} updated successfully`);
            } else {
              errorCount++;
              console.error(`Failed to update product ${productId}`);
              toast.error(`❌ Failed to update ${product.name}`);
            }
          } catch (error) {
            errorCount++;
            console.error(`Error updating product ${productId}:`, error);
            toast.error(`❌ Error updating ${product.name}`);
          }
        }
      }

      setUpdatedProducts(newUpdatedProducts);

      if (successCount > 0) {
        toast.success(`🎉 Successfully updated ${successCount} product(s) in WooCommerce!`);
      }
      
      if (errorCount > 0) {
        setError(`Failed to update ${errorCount} product(s) in WooCommerce. Please try again.`);
      }
    } catch (error) {
      console.error('Error updating WooCommerce:', error);
      setError('Failed to update products in WooCommerce. Please check your credentials and try again.');
      toast.error('Failed to update products in WooCommerce');
    } finally {
      setUpdatingWooCommerce(false);
    }
  };

  const handleContentUpdate = (productId: number, updatedContent: SeoContent) => {
    setGeneratedContent(prev => ({
      ...prev,
      [productId]: updatedContent
    }));
  };

  const hasGeneratedContent = Object.keys(generatedContent).some(productId => 
    products.some(p => p.id.toString() === productId)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wand2 className="h-5 w-5 mr-2 text-seo-primary" />
            AI SEO Content Generator
          </CardTitle>
          <CardDescription>
            Generate comprehensive SEO content for {products.length} selected product(s) from {activeStore?.store_name || 'your store'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm">
                Available credits: <span className="font-medium">{credits}</span>
              </div>
              <div className="text-sm text-gray-500">
                {credits <= 0 ? (
                  <span className="text-red-500">Please purchase credits to continue</span>
                ) : (
                  `Each product uses 1 credit`
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">AI Prompt Template</label>
              <Textarea 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                placeholder="Enter your prompt template..."
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Selected products: {products.map(p => p.name).join(', ')}
              </div>
              <div className="space-x-2">
                <Button 
                  onClick={handleGenerateContent} 
                  disabled={generating || products.length === 0 || credits <= 0 || !activeStore}
                  className="min-w-[140px]"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>
                
                {hasGeneratedContent && (
                  <Button 
                    onClick={handleUpdateWooCommerce}
                    disabled={updatingWooCommerce || !activeStore}
                    variant="outline"
                    className="min-w-[140px]"
                  >
                    {updatingWooCommerce ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update WooCommerce
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display generated content with editing capabilities */}
      {Object.entries(generatedContent).map(([productIdStr, content]) => {
        const product = products.find(p => p.id.toString() === productIdStr);
        const productId = parseInt(productIdStr);
        
        if (!product) return null;

        return (
          <EditableSeoContent
            key={productIdStr}
            content={content}
            product={product}
            onContentUpdate={(updatedContent) => handleContentUpdate(productId, updatedContent)}
            prompt={prompt}
          />
        );
      })}
    </div>
  );
};

export default SeoContentGenerator;
