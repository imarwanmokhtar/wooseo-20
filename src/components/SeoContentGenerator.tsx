import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiStore } from '@/contexts/MultiStoreContext';
import { generateSeoContent, DEFAULT_PROMPT_TEMPLATE } from '@/services/aiGenerationService';
import { updateProductWithSeoContent, getWooCommerceCredentials, testConnection, updateCredits } from '@/services/wooCommerceApi';
import { Product, SeoContent } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Wand2, Save, Loader2, AlertCircle } from 'lucide-react';
import EditableSeoContent from './EditableSeoContent';
import ModelSelector, { AIModel } from './ModelSelector';

// Define model configuration
const modelConfig = {
  'gemini-2.0-flash': {
    name: 'Gemini 2.0 Flash',
    credits: 1,
    description: 'Fast and efficient content generation'
  },
  'gemini-2.0-pro': {
    name: 'Gemini 2.0 Pro',
    credits: 2,
    description: 'High-quality content with advanced features'
  },
  'claude-3-opus': {
    name: 'Claude 3 Opus',
    credits: 3,
    description: 'Premium content generation with maximum quality'
  }
} as const;

interface SeoContentGeneratorProps {
  products: Product[];
  onContentGenerated?: (productId: number, content: SeoContent) => void;
}

const SeoContentGenerator: React.FC<SeoContentGeneratorProps> = ({ 
  products, 
  onContentGenerated 
}) => {
  const { user, credits = 0, refreshCredits, loading: authLoading } = useAuth();
  const { activeStore } = useMultiStore();
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini-2.0-flash');
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT_TEMPLATE);
  const [generating, setGenerating] = useState(false);
  const [updatingWooCommerce, setUpdatingWooCommerce] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{ [productId: number]: SeoContent }>({});
  const [error, setError] = useState<string | null>(null);
  const [updatedProducts, setUpdatedProducts] = useState<Set<number>>(new Set());
  const [currentProduct, setCurrentProduct] = useState<number | null>(null);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to use this feature. Please log in and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!modelConfig[selectedModel]) {
    setSelectedModel('gemini-2.0-flash');
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading model configuration...</span>
      </div>
    );
  }

  const totalCreditsRequired = products.length * modelConfig[selectedModel].credits;
  const canAffordGeneration = credits >= modelConfig[selectedModel].credits;

  const handleGenerateContent = async (product: Product) => {
    try {
      if (!product) {
        toast.error("No product selected");
        return;
      }

      if (!user || !activeStore?.id) {
        toast.error("Please select a store first");
        return;
      }

      const modelInfo = modelConfig[selectedModel];
      if (!modelInfo) {
        toast.error("Invalid model selected");
        return;
      }

      if (credits < modelInfo.credits) {
        toast.error(`You need ${modelInfo.credits} credits to generate content with ${modelInfo.name}. You have ${credits} credits.`);
        return;
      }

      setGenerating(true);
      setCurrentProduct(product.id);
      setError(null);

      const credentials = await getWooCommerceCredentials(user.id, activeStore.id);
      if (!credentials) {
        toast.error("Failed to fetch store credentials. Please check your store connection.");
        setError("Failed to fetch store credentials. Please check your store connection.");
        return;
      }

      const connectionTest = await testConnection(credentials);
      if (!connectionTest.success) {
        toast.error(connectionTest.message);
        setError(connectionTest.message);
        return;
      }

      const content = await generateSeoContent(product, prompt, user.id, selectedModel);
      
      if (!content) {
        throw new Error("Failed to generate content");
      }

      const savedContent = await saveSeoContent(user.id, {
        ...content,
        product_id: product.id,
        store_id: activeStore.id
      });

      const updateSuccess = await updateProductWithSeoContent(credentials, product.id, savedContent);
      
      if (!updateSuccess) {
        throw new Error("Failed to update product in WooCommerce");
      }

      const creditsUpdated = await updateCredits(user.id, -modelInfo.credits);
      if (!creditsUpdated) {
        console.error("Failed to update credits");
      }

      await refreshCredits();

      toast.success(`Successfully generated and updated content for ${product.name}`);
      onContentGenerated(product.id, savedContent);
    } catch (error) {
      console.error('Error generating content:', error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setGenerating(false);
      setCurrentProduct(null);
    }
  };

  const handleUpdateWooCommerce = async () => {
    setError(null);
    
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
          
          <div className="space-y-6">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              userCredits={credits}
            />
            
            <div className="flex justify-between items-center">
              <div className="text-sm">
                Available credits: <span className="font-medium">{credits}</span>
              </div>
              <div className="text-sm text-gray-500">
                {canAffordGeneration ? (
                  `Cost per product: ${modelConfig[selectedModel].credits} credit${modelConfig[selectedModel].credits !== 1 ? 's' : ''}`
                ) : (
                  <span className="text-red-500">
                    Need {modelConfig[selectedModel].credits} credits per product (you have {credits})
                  </span>
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
                  onClick={() => {
                    if (products.length > 0) {
                      handleGenerateContent(products[0]);
                    } else {
                      toast.error("No products selected");
                    }
                  }}
                  disabled={generating || products.length === 0 || !canAffordGeneration || !activeStore}
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
