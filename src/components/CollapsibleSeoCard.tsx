
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Edit3, RefreshCw, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { SeoContent, Product } from '@/types';
import { generateSeoContent } from '@/services/aiGenerationService';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiStore } from '@/contexts/MultiStoreContext';
import { toast } from 'sonner';
import TagInput from './TagInput';

interface CollapsibleSeoCardProps {
  content: SeoContent;
  product: Product;
  onContentUpdate: (updatedContent: SeoContent) => void;
  prompt: string;
  selectedModel?: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const CollapsibleSeoCard: React.FC<CollapsibleSeoCardProps> = ({
  content,
  product,
  onContentUpdate,
  prompt,
  selectedModel = 'gpt-4o-mini',
  isExpanded,
  onToggleExpand
}) => {
  const { user } = useAuth();
  const { activeStore } = useMultiStore();
  const [editableContent, setEditableContent] = useState(content);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  const handleFieldEdit = (field: string, value: string) => {
    setEditableContent(prev => ({ ...prev, [field]: value }));
  };

  const handleFocusKeywordsChange = (keywords: string[]) => {
    const keywordsString = keywords.join(', ');
    setEditableContent(prev => ({ ...prev, focus_keywords: keywordsString }));
  };

  const handleSave = () => {
    onContentUpdate(editableContent);
    setEditingField(null);
    toast.success('Content saved successfully');
  };

  const handleRegenerateField = async (fieldName: string) => {
    if (!user || !activeStore) {
      toast.error('User authentication or store selection required');
      return;
    }
    
    setRegenerating(fieldName);
    try {
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
        const updatedContent = {
          ...editableContent,
          [field]: newContent[field]
        };
        setEditableContent(updatedContent);
        onContentUpdate(updatedContent);
        toast.success(`${fieldName.replace('_', ' ')} regenerated successfully`);
      }
    } catch (error) {
      console.error('Error regenerating field:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to regenerate ${fieldName.replace('_', ' ')}: ${errorMessage}`);
    } finally {
      setRegenerating(null);
    }
  };

  const renderEditableField = (
    fieldName: string,
    label: string,
    value: string,
    isTextarea = false
  ) => {
    const isEditing = editingField === fieldName;
    const isRegeneratingField = regenerating === fieldName;

    return (
      <div className="space-y-2 border-b pb-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm text-gray-700">{label}</h4>
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
        
        {isEditing ? (
          <div className="space-y-2">
            {isTextarea ? (
              <Textarea
                value={value}
                onChange={(e) => handleFieldEdit(fieldName, e.target.value)}
                className="min-h-[100px]"
              />
            ) : (
              <Input
                value={value}
                onChange={(e) => handleFieldEdit(fieldName, e.target.value)}
              />
            )}
            <Button size="sm" onClick={handleSave}>
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
          </div>
        ) : (
          <div className="text-sm bg-gray-50 p-3 rounded border cursor-pointer hover:bg-gray-100 transition-colors">
            {isTextarea ? (
              <div className="line-clamp-3">{value}</div>
            ) : (
              <span className="line-clamp-1">{value}</span>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderFocusKeywordsField = () => {
    const isEditing = editingField === 'focus_keywords';
    const isRegeneratingField = regenerating === 'focus_keywords';
    const keywords = editableContent.focus_keywords ? editableContent.focus_keywords.split(',').map(k => k.trim()).filter(k => k) : [];

    return (
      <div className="space-y-2 border-b pb-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm text-gray-700">Focus Keywords (5 keywords)</h4>
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
        
        {isEditing ? (
          <div className="space-y-2">
            <TagInput
              tags={keywords}
              onTagsChange={handleFocusKeywordsChange}
              placeholder="Add focus keyword and press Enter..."
              maxTags={5}
            />
            <Button size="sm" onClick={handleSave}>
              <Save className="h-3 w-3 mr-1" />
              Save Keywords
            </Button>
          </div>
        ) : (
          <div className="text-sm bg-gray-50 p-3 rounded border">
            <div className="flex flex-wrap gap-1">
              {keywords.slice(0, 3).map((keyword, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
              {keywords.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{keywords.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
                <div>
                  <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
                  <p className="text-sm text-gray-500">SKU: {product.sku || 'N/A'} | Price: {product.price || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {editableContent.focus_keywords ? editableContent.focus_keywords.split(',').length : 0} keywords
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {editableContent.long_description ? `${editableContent.long_description.length} chars` : '0 chars'}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {renderEditableField('meta_title', 'Meta Title', editableContent.meta_title)}
            {renderEditableField('meta_description', 'Meta Description', editableContent.meta_description)}
            {renderEditableField('permalink', 'Permalink (≤45 chars)', editableContent.permalink || '')}
            {renderFocusKeywordsField()}
            {renderEditableField('short_description', 'Short Description', editableContent.short_description, true)}
            {renderEditableField('long_description', 'Long Description (≥750 words)', editableContent.long_description, true)}
            {renderEditableField('alt_text', 'Image Alt Text', editableContent.alt_text || '')}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default CollapsibleSeoCard;
