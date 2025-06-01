import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiStore } from '@/contexts/MultiStoreContext';
import { generateSeoContent, getDefaultPromptTemplate, getPromptTemplates } from '@/services/aiGenerationService';
import { updateProductWithSeoContent, getWooCommerceCredentials } from '@/services/wooCommerceApi';
import { Product, SeoContent } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Wand2, Save, Loader2, AlertCircle } from 'lucide-react';
import EditableSeoContent from './EditableSeoContent';
import ModelSelector, { AIModel, modelConfig } from './ModelSelector';
import SeoOptionsChecklist, { SeoOptions } from './SeoOptionsChecklist';

interface SeoContentGeneratorProps {
  products: Product[];
  onContentGenerated?: (productId: number, content: SeoContent) => void;
}

const SeoContentGenerator: React.FC<SeoContentGeneratorProps> = ({ 
  products, 
  onContentGenerated 
}) => {
  const { user, credits, refreshCredits } = useAuth();
  const { activeStore, refreshUsage } = useMultiStore();
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4o-mini');
  const [prompt, setPrompt] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [updatingWooCommerce, setUpdatingWooCommerce] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{ [productId: number]: SeoContent }>({});
  const [error, setError] = useState<string | null>(null);
  const [updatedProducts, setUpdatedProducts] = useState<Set<number>>(new Set());
  
  // SEO options state with all options enabled by default (for RankMath compliance)
  const [seoOptions, setSeoOptions] = useState<SeoOptions>({
    includeInternalLinks: true,
    includeOutboundLinks: true,
    includePowerWords: true,
    includeSentimentWords: true,
    includePermalink: true,
    includeAltText: true,
    includeFocusKeywords: true,
    includeMetaDescription: true,
  });

  useEffect(() => {
    const loadTemplates = async () => {
      if (!user?.id) return;

      try {
        // Load user's templates
        const templatesData = await getPromptTemplates(user.id);
        setTemplates(templatesData);

        // Load default template
        const defaultTemplate = await getDefaultPromptTemplate(user.id);
        setPrompt(defaultTemplate);

        // Set the default template as selected if available
        if (templatesData.length > 0) {
          const defaultTemplateRecord = templatesData.find(t => t.is_default);
          if (defaultTemplateRecord) {
            setSelectedTemplateId(defaultTemplateRecord.id);
            setPrompt(defaultTemplateRecord.template);
          } else {
            setSelectedTemplateId(templatesData[0].id);
            setPrompt(templatesData[0].template);
          }
        }
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    };

    loadTemplates();
  }, [user?.id]);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const selectedTemplate = templates.find(t => t.id === templateId);
    if (selectedTemplate) {
      setPrompt(selectedTemplate.template);
    }
  };

  const totalCreditsRequired = products.length * modelConfig[selectedModel].credits;
  const canAffordGeneration = credits >= totalCreditsRequired;

  // Function to modify the prompt based on selected options
  const getModifiedPrompt = (basePrompt: string): string => {
    let modifiedPrompt = basePrompt;

    // Remove or modify sections based on unchecked options
    if (!seoOptions.includeOutboundLinks) {
      modifiedPrompt = modifiedPrompt.replace(/OUTBOUND LINKS STRATEGY[\s\S]*?(?=INTERNAL LINKS STRATEGY|FOCUS KEYWORDS|$)/g, '');
      modifiedPrompt = modifiedPrompt.replace(/- MANDATORY: Include 3-5 OUTBOUND LINKS[\s\S]*?(?=- Content should be|$)/g, '');
      modifiedPrompt = modifiedPrompt.replace(/OUTBOUND LINKING EXAMPLES[\s\S]*?(?=Output MUST|$)/g, '');
    }

    if (!seoOptions.includeInternalLinks) {
      modifiedPrompt = modifiedPrompt.replace(/INTERNAL LINKS STRATEGY[\s\S]*?(?=FOCUS KEYWORDS|OUTBOUND LINKS|$)/g, '');
      modifiedPrompt = modifiedPrompt.replace(/- Include 3-5 internal product links[\s\S]*?(?=- Include 2-3 internal category|$)/g, '');
      modifiedPrompt = modifiedPrompt.replace(/- Include 2-3 internal category links[\s\S]*?(?=- MANDATORY|$)/g, '');
      modifiedPrompt = modifiedPrompt.replace(/INTERNAL LINKING EXAMPLES[\s\S]*?(?=OUTBOUND LINKING|$)/g, '');
    }

    if (!seoOptions.includePowerWords) {
      modifiedPrompt = modifiedPrompt.replace(/MUST include a POWER WORD \([^)]+\)/g, '');
      modifiedPrompt = modifiedPrompt.replace(/AND a SENTIMENT WORD/g, 'MUST include a SENTIMENT WORD');
    }

    if (!seoOptions.includeSentimentWords) {
      modifiedPrompt = modifiedPrompt.replace(/AND a SENTIMENT WORD \([^)]+\)/g, '');
      modifiedPrompt = modifiedPrompt.replace(/MUST include a POWER WORD \([^)]+\) AND/g, 'MUST include a POWER WORD');
    }

    if (!seoOptions.includePermalink) {
      modifiedPrompt = modifiedPrompt.replace(/PERMALINK:\s*/g, '');
      modifiedPrompt = modifiedPrompt.replace(/- SEO Permalink:[\s\S]*?(?=- Meta Description|$)/g, '');
    }

    if (!seoOptions.includeAltText) {
      modifiedPrompt = modifiedPrompt.replace(/IMAGE ALT TEXT:\s*/g, '');
      modifiedPrompt = modifiedPrompt.replace(/- Image Alt Text:[\s\S]*?(?=Output MUST|$)/g, '');
    }

    if (!seoOptions.includeFocusKeywords) {
      modifiedPrompt = modifiedPrompt.replace(/FOCUS KEYWORDS:\s*/g, '');
      modifiedPrompt = modifiedPrompt.replace(/- Focus Keywords:[\s\S]*?(?=- Image Alt Text|$)/g, '');
      modifiedPrompt = modifiedPrompt.replace(/FOCUS KEYWORDS INSTRUCTION[\s\S]*?(?=Content Requirements|$)/g, '');
    }

    if (!seoOptions.includeMetaDescription) {
      modifiedPrompt = modifiedPrompt.replace(/META DESCRIPTION:\s*/g, '');
      modifiedPrompt = modifiedPrompt.replace(/- Meta Description:[\s\S]*?(?=- Focus Keywords|$)/g, '');
    }

    // Update the output sections list based on selected options
    const outputSections = [];
    outputSections.push('LONG DESCRIPTION:');
    outputSections.push('SHORT DESCRIPTION:');
    outputSections.push('META TITLE:');
    
    if (seoOptions.includeMetaDescription) outputSections.push('META DESCRIPTION:');
    if (seoOptions.includeFocusKeywords) outputSections.push('FOCUS KEYWORDS:');
    if (seoOptions.includeAltText) outputSections.push('IMAGE ALT TEXT:');
    if (seoOptions.includePermalink) outputSections.push('PERMALINK:');

    const outputSectionText = `Output MUST include these EXACT section headers in your response:\n${outputSections.join('\n')}`;
    modifiedPrompt = modifiedPrompt.replace(/Output MUST include these EXACT section headers[\s\S]*?(?=Do not include|$)/g, outputSectionText + '\n\n');

    return modifiedPrompt;
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

    if (products.length === 0) {
      toast.error('No products selected');
      return;
    }

    if (!canAffordGeneration) {
      setError(`You need ${totalCreditsRequired} credits to generate content for ${products.length} product(s) with ${modelConfig[selectedModel].name}. You have ${credits} credits.`);
      toast.error('Not enough credits');
      return;
    }

    setGenerating(true);
    const newContent: { [productId: number]: SeoContent } = {};
    let successCount = 0;

    try {
      // Get the modified prompt based on selected options
      const modifiedPrompt = getModifiedPrompt(prompt);
      
      for (const product of products) {
        console.log(`Generating content for product: ${product.name} using ${selectedModel}`);
        toast.info(`Generating content for ${product.name} with ${modelConfig[selectedModel].name}...`);

        try {
          const content = await generateSeoContent(product, modifiedPrompt, user.id, selectedModel, activeStore.id);
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
        toast.success(`Generated SEO content for ${successCount} product(s) using ${modelConfig[selectedModel].name}`);
        
        // Refresh both user credits and store usage
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
                  `Total cost: ${totalCreditsRequired} credit${totalCreditsRequired !== 1 ? 's' : ''} (${modelConfig[selectedModel].credits} per product)`
                ) : (
                  <span className="text-red-500">
                    Need {totalCreditsRequired} credits (you have {credits})
                  </span>
                )}
              </div>
            </div>

            <SeoOptionsChecklist
              options={seoOptions}
              onOptionsChange={setSeoOptions}
            />

            {/* Template Selector */}
            {templates.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="templateSelector">Select Template</Label>
                <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          {template.name}
                          {template.is_default && (
                            <span className="text-xs text-blue-600">(Default)</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
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
