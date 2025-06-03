
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiStore } from '@/contexts/MultiStoreContext';
import { generateSeoContent, getDefaultPromptTemplate } from '@/services/aiGenerationService';
import { updateProductWithSeoContent, getWooCommerceCredentials } from '@/services/wooCommerceApi';
import { Product, SeoContent } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Wand2, Save, Loader2, AlertCircle, Expand, Minimize2 } from 'lucide-react';
import CollapsibleSeoCard from './CollapsibleSeoCard';
import ModelSelector, { AIModel, modelConfig } from './ModelSelector';
import SystemPromptSelector from './SystemPromptSelector';

interface SeoContentGeneratorProps {
  products: Product[];
  getAllSelectedProducts?: () => Promise<Product[]>;
  onContentGenerated?: (productId: number, content: SeoContent) => void;
}

const SeoContentGenerator: React.FC<SeoContentGeneratorProps> = ({ 
  products, 
  getAllSelectedProducts,
  onContentGenerated 
}) => {
  const { user, credits, refreshCredits } = useAuth();
  const { activeStore, refreshUsage } = useMultiStore();
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4o-mini');
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [defaultPrompt, setDefaultPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [updatingWooCommerce, setUpdatingWooCommerce] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{ [productId: number]: SeoContent }>({});
  const [error, setError] = useState<string | null>(null);
  const [updatedProducts, setUpdatedProducts] = useState<Set<number>>(new Set());
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [allProducts, setAllProducts] = useState<Product[]>(products);

  useEffect(() => {
    const loadDefaultPrompt = async () => {
      if (!user?.id) return;

      try {
        const template = await getDefaultPromptTemplate(user.id);
        setDefaultPrompt(template);
      } catch (error) {
        console.error('Error loading default template:', error);
      }
    };

    loadDefaultPrompt();
  }, [user?.id]);

  // Load all selected products when component mounts
  useEffect(() => {
    const loadAllProducts = async () => {
      if (getAllSelectedProducts) {
        try {
          const allSelectedProducts = await getAllSelectedProducts();
          setAllProducts(allSelectedProducts);
          console.log('Loaded all selected products:', allSelectedProducts.length);
        } catch (error) {
          console.error('Error loading all selected products:', error);
        }
      }
    };

    loadAllProducts();
  }, [getAllSelectedProducts]);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const totalCreditsRequired = allProducts.length * modelConfig[selectedModel].credits;
  const canAffordGeneration = credits >= totalCreditsRequired;

  const handlePromptSelect = (promptId: string, promptText: string) => {
    setSelectedPromptId(promptId);
    setSystemPrompt(promptText);
  };

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

    if (allProducts.length === 0) {
      toast.error('No products selected');
      return;
    }

    if (!canAffordGeneration) {
      setError(`You need ${totalCreditsRequired} credits to generate content for ${allProducts.length} product(s) with ${modelConfig[selectedModel].name}. You have ${credits} credits.`);
      toast.error('Not enough credits');
      return;
    }

    setGenerating(true);
    setGenerationProgress({ current: 0, total: allProducts.length });
    const newContent: { [productId: number]: SeoContent } = {};
    let successCount = 0;

    try {
      // Combine system prompt with default template
      const finalPrompt = systemPrompt.trim() 
        ? `${systemPrompt}\n\n${defaultPrompt}` 
        : defaultPrompt;

      for (let i = 0; i < allProducts.length; i++) {
        const product = allProducts[i];
        
        console.log(`Generating content for product ${i + 1}/${allProducts.length}: ${product.name} using ${selectedModel}`);
        toast.info(`Generating content for ${product.name} (${i + 1}/${allProducts.length})...`);
        
        setGenerationProgress({ current: i + 1, total: allProducts.length });

        try {
          const content = await generateSeoContent(product, finalPrompt, user.id, selectedModel, activeStore.id);
          content.store_id = activeStore.id;
          newContent[product.id] = content;
          successCount++;

          if (onContentGenerated) {
            onContentGenerated(product.id, content);
          }

          const delayMs = allProducts.length > 10 ? 2000 : allProducts.length > 5 ? 1000 : 500;
          if (i < allProducts.length - 1) {
            await delay(delayMs);
          }
        } catch (error) {
          console.error(`Error generating content for ${product.name}:`, error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          toast.error(`Failed to generate content for ${product.name}: ${errorMessage}`);
        }
      }

      if (successCount > 0) {
        setGeneratedContent(prev => ({ ...prev, ...newContent }));
        toast.success(`Generated SEO content for ${successCount} product(s) using ${modelConfig[selectedModel].name}`);
        
        console.log('Refreshing credits and store usage...');
        await Promise.all([
          refreshCredits(),
          refreshUsage()
        ]);
        console.log('Credits and store usage refreshed');
      } else {
        setError('Failed to generate content for any products. Please try again.');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate content');
      toast.error(error instanceof Error ? error.message : 'Failed to generate content');
    } finally {
      setGenerating(false);
      setGenerationProgress({ current: 0, total: 0 });
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
      allProducts.some(p => p.id.toString() === productId)
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
        const product = allProducts.find(p => p.id === productId);
        
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

  const handleToggleExpand = (productId: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleExpandAll = () => {
    const productIds = allProducts.map(p => p.id);
    setExpandedCards(new Set(productIds));
  };

  const handleCollapseAll = () => {
    setExpandedCards(new Set());
  };

  const hasGeneratedContent = Object.keys(generatedContent).some(productId => 
    allProducts.some(p => p.id.toString() === productId)
  );

  const generatedProductsForCurrentSelection = Object.entries(generatedContent).filter(([productId]) => 
    allProducts.some(p => p.id.toString() === productId)
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
            Generate comprehensive SEO content for {allProducts.length} selected product(s) from {activeStore?.store_name || 'your store'}
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

            <SystemPromptSelector
              selectedPromptId={selectedPromptId}
              onPromptSelect={handlePromptSelect}
            />
            
            <div className="flex justify-between items-center">
              <div className="text-sm">
                Available credits: <span className="font-medium">{credits}</span>
              </div>
              <div className="text-sm text-gray-500">
                {canAffordGeneration ? (
                  `Total cost: ${totalCreditsRequired} credit${totalCreditsRequired !== 1 ? 's' : ''} (${modelConfig[selectedModel].credits} per product)`
                ) : (
                  <span className="text-red-500">
                    Need {totalCreditsRequired} credits (you have {credits})
                  </span>
                )}
              </div>
            </div>

            {generating && generationProgress.total > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Generation Progress</span>
                  <span>{generationProgress.current} / {generationProgress.total}</span>
                </div>
                <Progress 
                  value={(generationProgress.current / generationProgress.total) * 100} 
                  className="w-full" 
                />
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Selected products: {allProducts.slice(0, 3).map(p => p.name).join(', ')}
                {allProducts.length > 3 && ` and ${allProducts.length - 3} more...`}
                {allProducts.length > 10 && (
                  <div className="text-xs text-blue-600 mt-1">
                    Large batch detected - generation will include delays to prevent timeouts
                  </div>
                )}
              </div>
              <div className="space-x-2">
                <Button 
                  onClick={handleGenerateContent} 
                  disabled={generating || allProducts.length === 0 || !canAffordGeneration || !activeStore}
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

      {/* Generated Content Section */}
      {generatedProductsForCurrentSelection.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated SEO Content ({generatedProductsForCurrentSelection.length} products)</CardTitle>
              <div className="space-x-2">
                <Button size="sm" variant="outline" onClick={handleExpandAll}>
                  <Expand className="h-4 w-4 mr-1" />
                  Expand All
                </Button>
                <Button size="sm" variant="outline" onClick={handleCollapseAll}>
                  <Minimize2 className="h-4 w-4 mr-1" />
                  Collapse All
                </Button>
              </div>
            </div>
            <CardDescription>
              Click on any product card to expand and view/edit all SEO fields
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedProductsForCurrentSelection.map(([productIdStr, content]) => {
              const product = allProducts.find(p => p.id.toString() === productIdStr);
              const productId = parseInt(productIdStr);
              
              if (!product) return null;

              return (
                <CollapsibleSeoCard
                  key={productIdStr}
                  content={content}
                  product={product}
                  onContentUpdate={(updatedContent) => handleContentUpdate(productId, updatedContent)}
                  prompt={systemPrompt.trim() ? `${systemPrompt}\n\n${defaultPrompt}` : defaultPrompt}
                  selectedModel={selectedModel}
                  isExpanded={expandedCards.has(productId)}
                  onToggleExpand={() => handleToggleExpand(productId)}
                />
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SeoContentGenerator;
