
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, RefreshCw, Save, Edit3, Image, ExternalLink } from 'lucide-react';
import { Product, SeoContent } from '@/types';
import { ProductContentHealth } from '@/types/contentHealth';
import { useMultiStore } from '@/contexts/MultiStoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { generateSeoContent } from '@/services/aiGenerationService';
import { updateProductWithSeoContent, getWooCommerceCredentials } from '@/services/wooCommerceApi';
import { toast } from 'sonner';
import TagInput from './TagInput';

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
  const { user } = useAuth();
  const { activeStore } = useMultiStore();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [seoContent, setSeoContent] = useState<SeoContent>({
    id: 0,
    product_id: product.id,
    product_name: product.name,
    user_id: user?.id || '',
    short_description: product.short_description || '',
    long_description: product.description || '',
    meta_title: '',
    meta_description: '',
    alt_text: product.images?.[0]?.alt || '',
    focus_keywords: '',
    permalink: product.slug || ''
  });

  const handleFieldChange = (field: string, value: string) => {
    setSeoContent(prev => ({ ...prev, [field]: value }));
  };

  const handleFocusKeywordsChange = (keywords: string[]) => {
    const keywordsString = keywords.join(', ');
    setSeoContent(prev => ({ ...prev, focus_keywords: keywordsString }));
  };

  const handleSaveField = async (field: string) => {
    if (!activeStore || !user) {
      toast.error('Store or user authentication required');
      return;
    }

    setSaving(true);
    try {
      const credentials = await getWooCommerceCredentials(user.id, activeStore.id);
      if (!credentials) {
        toast.error('WooCommerce credentials not found');
        return;
      }

      const success = await updateProductWithSeoContent(
        credentials,
        product.id,
        seoContent
      );

      if (success) {
        toast.success(`${field.replace('_', ' ')} updated successfully`);
        setEditingField(null);
        onContentUpdated();
      } else {
        toast.error(`Failed to update ${field.replace('_', ' ')}`);
      }
    } catch (error) {
      console.error('Error saving field:', error);
      toast.error(`Error saving ${field.replace('_', ' ')}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateField = async (fieldName: string) => {
    if (!user || !activeStore) {
      toast.error('User authentication or store selection required');
      return;
    }
    
    setRegenerating(fieldName);
    try {
      const prompt = `Generate SEO content for this WooCommerce product: ${product.name}. Description: ${product.description}. Price: ${product.price}`;
      const newContent = await generateSeoContent(product, prompt, user.id, 'gpt-4o-mini', activeStore.id);
      
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
        toast.success(`${fieldName.replace('_', ' ')} regenerated successfully`);
      }
    } catch (error) {
      console.error('Error regenerating field:', error);
      toast.error(`Failed to regenerate ${fieldName.replace('_', ' ')}`);
    } finally {
      setRegenerating(null);
    }
  };

  const handleRegenerateAll = async () => {
    if (!user || !activeStore) {
      toast.error('User authentication or store selection required');
      return;
    }
    
    setRegenerating('all');
    try {
      const prompt = `Generate comprehensive SEO content for this WooCommerce product: ${product.name}. Description: ${product.description}. Price: ${product.price}`;
      const newContent = await generateSeoContent(product, prompt, user.id, 'gpt-4o-mini', activeStore.id);
      
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
      
      toast.success('All fields regenerated successfully');
    } catch (error) {
      console.error('Error regenerating all fields:', error);
      toast.error('Failed to regenerate all fields');
    } finally {
      setRegenerating(null);
    }
  };

  const renderEditableField = (
    fieldName: string,
    label: string,
    value: string,
    isTextarea = false,
    placeholder = ''
  ) => {
    const isEditing = editingField === fieldName;
    const isRegeneratingField = regenerating === fieldName || regenerating === 'all';

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRegenerateField(fieldName)}
                disabled={isRegeneratingField}
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
                  {saving ? 'Saving...' : 'Save'}
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
            <div className="bg-gray-50 p-3 rounded border min-h-[60px] cursor-pointer hover:bg-gray-100 transition-colors">
              {value ? (
                isTextarea ? (
                  <div className="whitespace-pre-wrap text-sm">{value}</div>
                ) : (
                  <span className="text-sm">{value}</span>
                )
              ) : (
                <span className="text-gray-400 text-sm italic">No content yet - click regenerate or edit to add</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderFocusKeywordsField = () => {
    const isEditing = editingField === 'focus_keywords';
    const isRegeneratingField = regenerating === 'focus_keywords' || regenerating === 'all';
    const keywords = seoContent.focus_keywords ? seoContent.focus_keywords.split(',').map(k => k.trim()).filter(k => k) : [];

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Focus Keywords</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRegenerateField('focus_keywords')}
                disabled={isRegeneratingField}
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
                {saving ? 'Saving...' : 'Save Keywords'}
              </Button>
            </div>
          ) : (
            <div className="bg-gray-50 p-3 rounded border min-h-[60px] cursor-pointer hover:bg-gray-100 transition-colors">
              {keywords.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Health Analysis
        </Button>
        <div className="flex-1">
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
        <Button 
          onClick={handleRegenerateAll}
          disabled={regenerating === 'all'}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${regenerating === 'all' ? 'animate-spin' : ''}`} />
          Regenerate All
        </Button>
      </div>

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
