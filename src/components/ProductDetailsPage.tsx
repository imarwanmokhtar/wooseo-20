import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, RefreshCw, Save, Edit3, Image, ExternalLink, Upload } from 'lucide-react';
import { Product, SeoContent } from '@/types';
import { ProductContentHealth } from '@/types/contentHealth';
import { useMultiStore } from '@/contexts/MultiStoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSeoPlugin } from '@/contexts/SeoPluginContext';
import { generateSeoContent } from '@/services/aiGenerationService';
import { updateProductWithSeoContent, getWooCommerceCredentials } from '@/services/wooCommerceApi';
import { toast } from 'sonner';
import TagInput from './TagInput';
import ModelSelector, { AIModel } from './ModelSelector';

function extractMetaFromProduct(product: Product) {
  // Helper to find first matching meta key in product.meta_data from a list of possible variants
  function findMeta(keys: string[]): string {
    if (!Array.isArray(product.meta_data)) return "";
    for (const key of keys) {
      const found = product.meta_data.find((m: any) => m.key === key);
      if (found && typeof found.value === "string" && found.value.trim()) {
        return found.value.trim();
      }
    }
    return "";
  }

  return {
    meta_title:
      findMeta([
        "meta_title",               // universal/generic
        "product_seo_title",        // universal
        "rank_math_title",          // RankMath
        "_yoast_wpseo_title",       // Yoast
        "_aioseo_title",            // All In One SEO
      ]) ||
      "",
    meta_description:
      findMeta([
        "meta_description",
        "product_seo_description",
        "rank_math_description",
        "_yoast_wpseo_metadesc",
        "_aioseo_description",
      ]) ||
      "",
    focus_keywords:
      findMeta([
        "focus_keywords",
        "product_seo_keywords",
        "rank_math_focus_keyword",
        "_yoast_wpseo_focuskw",
        "_aioseo_focus_keyword",
      ]) ||
      "",
  };
}

interface ProductDetailsPageProps {
  product: Product;
  healthData: ProductContentHealth;
  onBack: () => void;
  onContentUpdated: () => void;
}

const FIELD_KEYS: Array<keyof SeoContent> = [
  'meta_title',
  'meta_description',
  'permalink',
  'focus_keywords',
  'short_description',
  'long_description',
  'alt_text'
];

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  product,
  healthData,
  onBack,
  onContentUpdated
}) => {
  const { user, credits, refreshCredits } = useAuth();
  const { activeStore } = useMultiStore();
  const { selectedPlugin } = useSeoPlugin();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [updatingWooCommerce, setUpdatingWooCommerce] = useState(false);
  const [hasRegeneratedContent, setHasRegeneratedContent] = useState(false);

  // Extract meta fields safely from product
  const extractedMeta = extractMetaFromProduct(product);

  const [seoContent, setSeoContent] = useState<SeoContent>({
    id: 0,
    product_id: product.id,
    product_name: product.name,
    user_id: user?.id || '',
    short_description: product.short_description || '',
    long_description: product.description || '',
    meta_title: extractedMeta.meta_title || "",
    meta_description: extractedMeta.meta_description || "",
    alt_text: product.images?.[0]?.alt || "",
    focus_keywords: extractedMeta.focus_keywords || "",
    permalink: product.slug || "",
  });

  // Model Selection State
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4o-mini');

  // Model credit cost lookup
  function getModelCreditCost(model: AIModel) {
    switch (model) {
      case "gpt-4o-mini":
        return 1;
      case "gpt-4o":
        return 2;
      case "gpt-4.1":
        return 3;
      case "gpt-3.5-turbo":
        return 1;
      case "gemini-2.0-flash":
        return 1;
      default:
        return 1;
    }
  }

  const handleFieldChange = (field: string, value: string) => {
    setSeoContent(prev => ({ ...prev, [field]: value }));
  };

  const handleFocusKeywordsChange = (keywords: string[]) => {
    const keywordsString = keywords.join(', ');
    setSeoContent(prev => ({ ...prev, focus_keywords: keywordsString }));
  };

  // Updated handleSaveField function with proper SEO plugin support
  const handleSaveField = async (field: string) => {
    if (!activeStore || !user) {
      toast.error('Store or user authentication required');
      return;
    }
    
    if (!selectedPlugin) {
      toast.error('Please select an SEO plugin first');
      return;
    }
    
    setSaving(true);
    try {
      console.log('Saving field with SEO plugin:', selectedPlugin);
      const credentials = await getWooCommerceCredentials(user.id, activeStore.id);
      if (!credentials) {
        toast.error('WooCommerce credentials not found');
        return;
      }
      
      const result = await updateProductWithSeoContent(
        credentials,
        product.id,
        seoContent,
        selectedPlugin
      );
      
      if (result.success) {
        toast.success(`${field.replace('_', ' ')} updated successfully in WooCommerce`);
        setEditingField(null);
        onContentUpdated();
      } else {
        toast.error(`Failed to update ${field.replace('_', ' ')} in WooCommerce`);
      }
    } catch (error) {
      console.error('Error saving field:', error);
      toast.error(`Error saving ${field.replace('_', ' ')}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  // Single field regeneration
  const handleRegenerateField = async (fieldName: string) => {
    if (!user || !activeStore) {
      toast.error('User authentication or store selection required');
      return;
    }
    if (credits < 1) {
      toast.error("You don't have enough credits.");
      return;
    }
    setRegenerating(fieldName);
    try {
      const prompt = `Generate SEO content for this WooCommerce product: ${product.name}. Description: ${product.description}. Price: ${product.price}`;
      const newContent = await generateSeoContent(product, prompt, user.id, selectedModel, activeStore.id);

      const fieldMap: { [key: string]: keyof SeoContent } = {
        'meta_title': 'meta_title',
        'meta_description': 'meta_description',
        'short_description': 'short_description',
        'long_description': 'long_description',
        'alt_text': 'alt_text',
        'focus_keywords': 'focus_keywords',
        'permalink': 'permalink'
      };
      const field = fieldMap[fieldName];
      if (field && newContent[field]) {
        setSeoContent(prev => ({
          ...prev,
          [field]: newContent[field]
        }));
        setHasRegeneratedContent(true);
        // Refresh credits from server after generation
        await refreshCredits();
        toast.success(`${fieldName.replace('_', ' ')} regenerated successfully`);
      }
    } catch (error) {
      console.error('Error regenerating field:', error);
      toast.error(`Failed to regenerate ${fieldName.replace('_', ' ')}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setRegenerating(null);
    }
  };

  // Regenerate All (COSTS: depends on selected model, single charge per product)
  const handleRegenerateAll = async () => {
    if (!user || !activeStore) {
      toast.error('User authentication or store selection required');
      return;
    }
    // Use correct model cost
    const cost = getModelCreditCost(selectedModel);
    if (credits < cost) {
      toast.error(`You don't have enough credits to regenerate all fields (${cost} needed).`);
      return;
    }
    setRegenerating('all');
    try {
      const prompt = `Generate comprehensive SEO content for this WooCommerce product: ${product.name}. Description: ${product.description}. Price: ${product.price}`;
      const newContent = await generateSeoContent(product, prompt, user.id, selectedModel, activeStore.id);

      setSeoContent(prev => ({
        ...prev,
        meta_title: newContent.meta_title || prev.meta_title,
        meta_description: newContent.meta_description || prev.meta_description,
        short_description: newContent.short_description || prev.short_description,
        long_description: newContent.long_description || prev.long_description,
        alt_text: newContent.alt_text || prev.alt_text,
        focus_keywords: newContent.focus_keywords || prev.focus_keywords,
        permalink: newContent.permalink || prev.permalink
      }));

      setHasRegeneratedContent(true);
      // Refresh credits from server after generation
      await refreshCredits();
      toast.success('All fields regenerated successfully');
    } catch (error) {
      console.error('Error regenerating all fields:', error);
      toast.error(`Failed to regenerate all fields: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setRegenerating(null);
    }
  };

  // Update all regenerated content to WooCommerce
  const handleUpdateWooCommerce = async () => {
    if (!activeStore || !user) {
      toast.error('Store or user authentication required');
      return;
    }
    
    if (!selectedPlugin) {
      toast.error('Please select an SEO plugin first');
      return;
    }
    
    setUpdatingWooCommerce(true);
    try {
      console.log('Updating WooCommerce with all regenerated content:', selectedPlugin);
      const credentials = await getWooCommerceCredentials(user.id, activeStore.id);
      if (!credentials) {
        toast.error('WooCommerce credentials not found');
        return;
      }
      
      const result = await updateProductWithSeoContent(
        credentials,
        product.id,
        seoContent,
        selectedPlugin
      );
      
      if (result.success) {
        toast.success('All content updated successfully in WooCommerce');
        setHasRegeneratedContent(false);
        onContentUpdated();
      } else {
        toast.error('Failed to update content in WooCommerce');
      }
    } catch (error) {
      console.error('Error updating WooCommerce:', error);
      toast.error(`Error updating WooCommerce: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUpdatingWooCommerce(false);
    }
  };

  const canAffordRegenerateAll = credits >= getModelCreditCost(selectedModel);
  const canAffordField = credits >= 1;

  // Renders update and regenerate buttons for each field
  const renderEditableField = (
    fieldName: string,
    label: string,
    value: string,
    isTextarea = false,
    placeholder = ''
  ) => {
    const isEditing = editingField === fieldName;
    const isRegeneratingField = regenerating === fieldName || regenerating === 'all';
    
    // Check if field is truly missing (not just poor quality)
    const fieldCheck = healthData.checks?.find(check => check.field === fieldName);
    const fieldIsMissing = fieldCheck?.status === 'missing';
    const fieldIsPoor = fieldCheck?.status === 'poor';

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              {fieldIsPoor && (
                <Badge className="text-xs bg-yellow-100 text-yellow-800">
                  Needs Improvement
                </Badge>
              )}
              {fieldIsMissing && (
                <Badge variant="destructive" className="text-xs">
                  Missing
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRegenerateField(fieldName)}
                disabled={isRegeneratingField || !canAffordField}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isRegeneratingField ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingField(isEditing ? null : fieldName)}
              >
                <Edit3 className="h-3 w-3 mr-1" />
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-3">
              {isTextarea ? (
                <Textarea
                  value={value}
                  onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                  placeholder={placeholder}
                  className="min-h-[120px]"
                />
              ) : (
                <Input
                  value={value}
                  onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                  placeholder={placeholder}
                />
              )}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleSaveField(fieldName)}
                  disabled={saving}
                >
                  <Save className="h-3 w-3 mr-1" />
                  {saving ? 'Saving...' : 'Update'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setEditingField(null)}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className={`bg-gray-50 p-3 rounded border min-h-[60px] cursor-pointer hover:bg-gray-100 transition-colors ${
              fieldIsMissing ? 'border-red-400 bg-red-50' : 
              fieldIsPoor ? 'border-yellow-400 bg-yellow-50' : ''
            }`}>
              {value ? (
                <div>
                  {isTextarea ? (
                    <div className="whitespace-pre-wrap text-sm">{value}</div>
                  ) : (
                    <span className="text-sm">{value}</span>
                  )}
                  {fieldIsPoor && fieldCheck?.reason && (
                    <div className="text-xs text-yellow-700 mt-1 italic">
                      {fieldCheck.reason}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-gray-400 text-sm italic">No content yet - click regenerate or edit to add</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Same as above, with TagInput and dedicated update button
  const renderFocusKeywordsField = () => {
    const isEditing = editingField === 'focus_keywords';
    const isRegeneratingField = regenerating === 'focus_keywords' || regenerating === 'all';
    const keywords = seoContent.focus_keywords ? seoContent.focus_keywords.split(',').map(k => k.trim()).filter(k => k) : [];
    
    const fieldCheck = healthData.checks?.find(check => check.field === 'focus_keywords');
    const fieldIsMissing = fieldCheck?.status === 'missing';
    const fieldIsPoor = fieldCheck?.status === 'poor';
    
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Focus Keywords</CardTitle>
              {fieldIsPoor && (
                <Badge className="text-xs bg-yellow-100 text-yellow-800">
                  Needs Improvement
                </Badge>
              )}
              {fieldIsMissing && (
                <Badge variant="destructive" className="text-xs">
                  Missing
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRegenerateField('focus_keywords')}
                disabled={isRegeneratingField || !canAffordField}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isRegeneratingField ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingField(isEditing ? null : 'focus_keywords')}
              >
                <Edit3 className="h-3 w-3 mr-1" />
                {isEditing ? 'Done' : 'Edit'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-3">
              <TagInput
                tags={keywords}
                onTagsChange={handleFocusKeywordsChange}
                placeholder="Add focus keyword and press Enter..."
                maxTags={15}
              />
              <Button 
                size="sm" 
                onClick={() => handleSaveField('focus_keywords')}
                disabled={saving}
              >
                <Save className="h-3 w-3 mr-1" />
                {saving ? 'Saving...' : 'Update Keywords'}
              </Button>
            </div>
          ) : (
            <div className={`bg-gray-50 p-3 rounded border min-h-[60px] cursor-pointer hover:bg-gray-100 transition-colors ${
              fieldIsMissing ? 'border-red-400 bg-red-50' : 
              fieldIsPoor ? 'border-yellow-400 bg-yellow-50' : ''
            }`}>
              {keywords.length > 0 ? (
                <div>
                  <div className="flex flex-wrap gap-1">
                    {keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  {fieldIsPoor && fieldCheck?.reason && (
                    <div className="text-xs text-yellow-700 mt-1 italic">
                      {fieldCheck.reason}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-gray-400 text-sm italic">No focus keywords set</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Model selector and header */}
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Health Analysis
        </Button>
        <div className="flex-1 flex flex-col lg:flex-row gap-2 items-center">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">ID: {product.id}</Badge>
            <Badge variant={healthData.overall_status === 'complete' ? 'default' : 
                          healthData.overall_status === 'needs_attention' ? 'secondary' : 'destructive'}>
              {healthData.overall_status.replace('_', ' ')}
            </Badge>
            <span className="text-sm text-gray-500">SEO Score: {healthData.seo_score}%</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            userCredits={credits}
          />
          <div className="flex gap-2">
            <Button 
              onClick={handleRegenerateAll}
              disabled={regenerating === 'all' || !canAffordRegenerateAll}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${regenerating === 'all' ? 'animate-spin' : ''}`} />
              Regenerate All ({getModelCreditCost(selectedModel)} Credit{getModelCreditCost(selectedModel) > 1 ? 's' : ''})
            </Button>
            {hasRegeneratedContent && (
              <Button 
                onClick={handleUpdateWooCommerce}
                disabled={updatingWooCommerce || !selectedPlugin}
                variant="default"
              >
                <Upload className={`h-4 w-4 mr-2 ${updatingWooCommerce ? 'animate-spin' : ''}`} />
                {updatingWooCommerce ? 'Updating...' : 'Update WooCommerce'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Show alert when content has been regenerated */}
      {hasRegeneratedContent && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-blue-700 font-medium">
                  Content has been regenerated. Click "Update WooCommerce" to save changes.
                </span>
              </div>
              <Button 
                onClick={handleUpdateWooCommerce}
                disabled={updatingWooCommerce || !selectedPlugin}
                size="sm"
              >
                <Upload className={`h-3 w-3 mr-1 ${updatingWooCommerce ? 'animate-spin' : ''}`} />
                {updatingWooCommerce ? 'Updating...' : 'Update WooCommerce'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Image and Basic Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Product Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              {product.images && product.images.length > 0 ? (
                <div className="space-y-3">
                  <img 
                    src={product.images[0].src} 
                    alt={product.images[0].alt || product.name}
                    className="w-full h-48 object-cover rounded border"
                  />
                  <div className="text-xs text-gray-600">
                    <p><strong>Current Alt Text:</strong> {product.images[0].alt || 'No alt text'}</p>
                    <p><strong>Image Name:</strong> {product.images[0].name || 'Unnamed'}</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded border flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><strong>Price:</strong> {product.price || 'N/A'}</div>
              <div><strong>SKU:</strong> {product.sku || 'N/A'}</div>
              <div><strong>Status:</strong> {product.status}</div>
              <div><strong>Stock:</strong> {product.stock_status}</div>
              {product.categories?.length > 0 && (
                <div>
                  <strong>Categories:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.categories.map(cat => (
                      <Badge key={cat.id} variant="outline" className="text-xs">
                        {cat.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="pt-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={product.permalink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Product
                  </a>
                </Button>
              </div>
              <Separator className="my-2" />
              <div className="text-xs text-gray-700 font-semibold">
                Available Credits: <span className="text-black font-bold">{credits}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SEO Content Fields */}
        <div className="lg:col-span-2 space-y-4">
          {renderEditableField(
            'meta_title', 
            'Meta Title (SEO)', 
            seoContent.meta_title,
            false,
            'Enter SEO title for search engines'
          )}
          
          {renderEditableField(
            'meta_description', 
            'Meta Description (SEO)', 
            seoContent.meta_description,
            true,
            'Enter meta description for search engine results'
          )}
          
          {renderEditableField(
            'permalink', 
            'Permalink/Slug', 
            seoContent.permalink,
            false,
            'product-url-slug'
          )}

          {renderFocusKeywordsField()}

          <Separator />

          {renderEditableField(
            'short_description', 
            'Short Description', 
            seoContent.short_description,
            true,
            'Enter a brief product description'
          )}
          
          {renderEditableField(
            'long_description', 
            'Long Description (HTML)', 
            seoContent.long_description,
            true,
            'Enter detailed product description with HTML formatting'
          )}
          
          {renderEditableField(
            'alt_text', 
            'Image Alt Text', 
            seoContent.alt_text,
            false,
            'Describe the product image for accessibility'
          )}
        </div>
      </div>

      {/* Missing Fields Summary */}
      {healthData.missing_fields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Missing SEO Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {healthData.missing_fields.map((field) => (
                <Badge key={field} variant="destructive" className="text-xs">
                  {field.replace('_', ' ')}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Complete these fields to improve your SEO score.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductDetailsPage;
