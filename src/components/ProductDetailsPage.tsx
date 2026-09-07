import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Wand2, Save, Loader2, RefreshCw, Edit3 } from 'lucide-react';
import { Product, SeoContent } from '@/types';
import { ProductContentHealth } from '@/types/contentHealth';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiStore } from '@/contexts/MultiStoreContext';
import { useSeoPlugin } from '@/contexts/SeoPluginContext';
import { generateSeoContent, getDefaultPromptTemplate } from '@/services/aiGenerationService';
import { updateProductWithSeoContent, getWooCommerceCredentials } from '@/services/wooCommerceApi';
import { toast } from 'sonner';
import EditableSeoContent from './EditableSeoContent';
import ModelSelector, { AIModel } from './ModelSelector';

interface ProductDetailsPageProps {
  product: Product;
  healthData: ProductContentHealth;
  onBack: () => void;
  onContentUpdated: () => void;
}

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  product,
  healthData,
  onBack,
  onContentUpdated
}) => {
  const { user, credits, refreshCredits } = useAuth();
  const { activeStore } = useMultiStore();
  const { selectedPlugin } = useSeoPlugin();

  // Helper function to get RankMath meta value
  const getRankMathMeta = (fieldName: string): string => {
    if (!product.meta_data || !Array.isArray(product.meta_data)) {
      return '';
    }
    
    const metaField = product.meta_data.find((meta: any) => meta.key === fieldName);
    return metaField ? metaField.value || '' : '';
  };

  // Get actual SEO values from meta_data
  const getMetaTitle = () => getRankMathMeta('rank_math_title') || product.meta_title || '';
  const getMetaDescription = () => getRankMathMeta('rank_math_description') || product.meta_description || '';
  const getFocusKeywords = () => getRankMathMeta('rank_math_focus_keyword') || product.focus_keywords || '';
  const getAltText = () => {
    // Check for image alt text in images array first
    if (product.images && product.images.length > 0 && product.images[0].alt) {
      return product.images[0].alt;
    }
    // Fallback to meta_data or product field
    return getRankMathMeta('rank_math_img_alt_text') || product.alt_text || '';
  };

  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4o-mini');
  const [generatedContent, setGeneratedContent] = useState<SeoContent | null>(null);
  const [generating, setGenerating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [defaultPrompt, setDefaultPrompt] = useState<string>('');
  const [editingProductField, setEditingProductField] = useState<string | null>(null);
  const [editedProduct, setEditedProduct] = useState<Product>(product);
  const [updatingProduct, setUpdatingProduct] = useState(false);

  // State to track SEO field values for editing
  const [seoFields, setSeoFields] = useState({
    meta_title: getMetaTitle(),
    meta_description: getMetaDescription(),
    focus_keywords: getFocusKeywords(),
    alt_text: getAltText()
  });

  // Fetch default prompt template on component mount
  useEffect(() => {
    const fetchPrompt = async () => {
      if (user?.id) {
        try {
          const prompt = await getDefaultPromptTemplate(user.id);
          setDefaultPrompt(prompt);
        } catch (error) {
          console.error('Error fetching default prompt:', error);
        }
      }
    };
    fetchPrompt();
  }, [user?.id]);

  // Update editedProduct when product prop changes
  useEffect(() => {
    setEditedProduct(product);
  }, [product]);

  const handleRegenerateAll = async () => {
    if (!user || !activeStore) {
      toast.error('User and active store required');
      return;
    }

    if (!selectedPlugin) {
      toast.error('Please select your SEO plugin first');
      return;
    }

    const modelCreditCost = {
      "gpt-4o-mini": 1,
      "gpt-4o": 2,
      "gpt-4.1": 3,
      "gpt-3.5-turbo": 1,
      "gemini-2.0-flash": 1,
    };

    const requiredCredits = modelCreditCost[selectedModel];
    if (credits < requiredCredits) {
      toast.error(`You need ${requiredCredits} credits to generate content with ${selectedModel}`);
      return;
    }

    setGenerating(true);

    try {
      console.log(`Generating AI content for product: ${product.name} using ${selectedModel}`);
      
      const defaultPrompt = await getDefaultPromptTemplate(user.id);
      
      const aiGeneratedContent = await generateSeoContent(
        product,
        defaultPrompt,
        user.id,
        selectedModel,
        activeStore.id
      );

      setGeneratedContent(aiGeneratedContent);
      await refreshCredits();
      
      toast.success(`AI content generated successfully using ${selectedModel}!`);
      console.log('AI content generated:', aiGeneratedContent);
      
    } catch (error) {
      console.error('Error generating AI content:', error);
      toast.error('Failed to generate AI content. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateWooCommerce = async () => {
    if (!user || !activeStore) {
      toast.error('User and active store required');
      return;
    }

    if (!selectedPlugin) {
      toast.error('Please select your SEO plugin first');
      return;
    }

    if (!generatedContent) {
      toast.error('No generated content available');
      return;
    }

    setUpdating(true);

    try {
      const credentials = await getWooCommerceCredentials(user.id, activeStore.id);
      if (!credentials) {
        toast.error('WooCommerce credentials not found');
        return;
      }

      const updateResult = await updateProductWithSeoContent(
        credentials,
        product.id,
        generatedContent,
        selectedPlugin
      );

      if (updateResult.success) {
        toast.success('Product updated successfully in WooCommerce!');
        onContentUpdated();
      } else {
        toast.error('Failed to update product in WooCommerce');
      }
    } catch (error) {
      console.error('Error updating product in WooCommerce:', error);
      toast.error('Failed to update product in WooCommerce');
    } finally {
      setUpdating(false);
    }
  };

  const handleProductFieldEdit = (field: string, value: string) => {
    if (['meta_title', 'meta_description', 'focus_keywords', 'alt_text'].includes(field)) {
      setSeoFields(prev => ({ ...prev, [field]: value }));
    } else {
      setEditedProduct(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleUpdateProductField = async () => {
    if (!user || !activeStore) {
      toast.error('User and active store required');
      return;
    }

    setUpdatingProduct(true);

    try {
      const credentials = await getWooCommerceCredentials(user.id, activeStore.id);
      if (!credentials) {
        toast.error('WooCommerce credentials not found');
        return;
      }

      let updateData: any = {};

      // Handle regular product fields
      if (editingProductField && ['name', 'description', 'short_description'].includes(editingProductField)) {
        updateData = {
          name: editedProduct.name,
          description: editedProduct.description,
          short_description: editedProduct.short_description
        };
      }

      // Handle SEO meta fields
      if (editingProductField && ['meta_title', 'meta_description', 'focus_keywords', 'alt_text'].includes(editingProductField)) {
        const metaData = [];
        
        if (editingProductField === 'meta_title') {
          metaData.push({ key: 'rank_math_title', value: seoFields.meta_title });
        } else if (editingProductField === 'meta_description') {
          metaData.push({ key: 'rank_math_description', value: seoFields.meta_description });
        } else if (editingProductField === 'focus_keywords') {
          metaData.push({ key: 'rank_math_focus_keyword', value: seoFields.focus_keywords });
        } else if (editingProductField === 'alt_text') {
          metaData.push({ key: 'rank_math_img_alt_text', value: seoFields.alt_text });
          // Also update the first image alt text if exists
          if (product.images && product.images.length > 0) {
            updateData.images = product.images.map((img, index) => ({
              ...img,
              alt: index === 0 ? seoFields.alt_text : img.alt
            }));
          }
        }

        updateData.meta_data = metaData;
      }

      const response = await fetch(`${credentials.url}/wp-json/wc/v3/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${credentials.consumer_key}:${credentials.consumer_secret}`)
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        toast.success('Product field updated successfully!');
        setEditingProductField(null);
        onContentUpdated();
      } else {
        toast.error('Failed to update product field');
      }
    } catch (error) {
      console.error('Error updating product field:', error);
      toast.error('Failed to update product field');
    } finally {
      setUpdatingProduct(false);
    }
  };

  const handleContentChange = (updatedContent: SeoContent) => {
    setGeneratedContent(updatedContent);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge variant="outline">Complete</Badge>;
      case 'needs_attention':
        return <Badge variant="destructive">Needs Attention</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const renderEditableProductField = (
    fieldName: string,
    label: string,
    value: string,
    isTextarea = false
  ) => {
    const isEditing = editingProductField === fieldName;
    const currentValue = ['meta_title', 'meta_description', 'focus_keywords', 'alt_text'].includes(fieldName) 
      ? seoFields[fieldName as keyof typeof seoFields] 
      : value;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm text-gray-700">{label}</h4>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditingProductField(isEditing ? null : fieldName)}
          >
            <Edit3 className="h-3 w-3 mr-1" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>
        
        {isEditing ? (
          <div className="space-y-2">
            {isTextarea ? (
              <Textarea
                value={currentValue}
                onChange={(e) => handleProductFieldEdit(fieldName, e.target.value)}
                className="min-h-[100px]"
              />
            ) : (
              <Input
                value={currentValue}
                onChange={(e) => handleProductFieldEdit(fieldName, e.target.value)}
              />
            )}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleUpdateProductField}
                disabled={updatingProduct}
              >
                {updatingProduct ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 mr-1" />
                    Update
                  </>
                )}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditingProductField(null)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm bg-gray-50 p-3 rounded border min-h-[40px] cursor-pointer hover:bg-gray-100 transition-colors">
            {isTextarea ? (
              <div dangerouslySetInnerHTML={{ __html: currentValue || 'No content' }} />
            ) : (
              <span>{currentValue || 'No content'}</span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Table
      </Button>

      {/* AI Model Selection Card - At the top */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI Content Generation Settings</CardTitle>
          <CardDescription>
            Select your AI model and generate SEO-optimized content for this product.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            userCredits={credits}
          />

          <div className="flex justify-between items-center">
            <Button
              onClick={handleRegenerateAll}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate AI Content
                </>
              )}
            </Button>

            {generatedContent && (
              <Button
                variant="secondary"
                onClick={handleUpdateWooCommerce}
                disabled={updating}
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Apply to WooCommerce
                  </>
                )}
              </Button>
            )}
          </div>

          {generating && (
            <Progress value={50} />
          )}
        </CardContent>
      </Card>

      {/* Product Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
          <CardDescription>
            View and edit product information and SEO content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Overall Status:</p>
              {getStatusBadge(healthData.overall_status)}
            </div>
            <div>
              <p className="text-sm font-medium">Product ID:</p>
              <p>{product.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Product Fields Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Product Fields</CardTitle>
          <CardDescription>
            Edit the actual product fields and SEO data that are stored in WooCommerce.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderEditableProductField('name', 'Product Name', editedProduct.name)}
          {renderEditableProductField('meta_title', 'Meta Title (RankMath)', seoFields.meta_title)}
          {renderEditableProductField('meta_description', 'Meta Description (RankMath)', seoFields.meta_description, true)}
          {renderEditableProductField('permalink', 'Permalink (RankMath)', product.permalink || '')}
          {renderEditableProductField('focus_keywords', 'Focus Keywords (RankMath)', seoFields.focus_keywords)}
          {renderEditableProductField('short_description', 'Short Description', editedProduct.short_description || '', true)}
          {renderEditableProductField('description', 'Long Description (HTML)', editedProduct.description || '', true)}
          {renderEditableProductField('alt_text', 'Image Alt Text', seoFields.alt_text)}
        </CardContent>
      </Card>

      {/* Generated Content Display */}
      {generatedContent && (
        <EditableSeoContent
          content={generatedContent}
          product={product}
          onContentUpdate={handleContentChange}
          prompt={defaultPrompt}
          selectedModel={selectedModel}
        />
      )}
    </div>
  );
};

export default ProductDetailsPage;
