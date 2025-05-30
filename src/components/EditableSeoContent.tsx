
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SeoContent, Product } from '@/types';
import { RefreshCw, Save, Edit3 } from 'lucide-react';
import { generateSeoContent } from '@/services/aiGenerationService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import TagInput from './TagInput';

interface EditableSeoContentProps {
  content: SeoContent;
  product: Product;
  onContentUpdate: (updatedContent: SeoContent) => void;
  prompt: string;
}

const EditableSeoContent: React.FC<EditableSeoContentProps> = ({
  content,
  product,
  onContentUpdate,
  prompt
}) => {
  const { user } = useAuth();
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
    if (!user) return;
    
    setRegenerating(fieldName);
    try {
      const newContent = await generateSeoContent(product, prompt, user.id);
      
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
      toast.error(`Failed to regenerate ${fieldName.replace('_', ' ')}`);
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
      <div className="space-y-2">
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
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm bg-gray-50 p-3 rounded border min-h-[40px] cursor-pointer hover:bg-gray-100 transition-colors">
            {isTextarea ? (
              <pre className="whitespace-pre-wrap">{value}</pre>
            ) : (
              <span>{value}</span>
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

    console.log('Current focus keywords:', editableContent.focus_keywords);
    console.log('Parsed keywords array:', keywords);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm text-gray-700">Focus Keywords (RankMath)</h4>
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
              maxTags={15} // Allow more keywords than just 3
            />
            <Button size="sm" onClick={handleSave}>
              <Save className="h-3 w-3 mr-1" />
              Save Keywords
            </Button>
          </div>
        ) : (
          <div className="text-sm bg-gray-50 p-3 rounded border min-h-[40px] cursor-pointer hover:bg-gray-100 transition-colors">
            {keywords.length > 0 ? keywords.join(', ') : 'No focus keywords set'}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Generated Content for: {product.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderEditableField('meta_title', 'Meta Title (RankMath)', editableContent.meta_title)}
        {renderEditableField('meta_description', 'Meta Description (RankMath)', editableContent.meta_description)}
        {renderEditableField('permalink', 'Permalink (RankMath)', editableContent.permalink || '')}
        {renderFocusKeywordsField()}
        {renderEditableField('short_description', 'Short Description', editableContent.short_description, true)}
        {renderEditableField('long_description', 'Long Description (HTML)', editableContent.long_description, true)}
        {renderEditableField('alt_text', 'Image Alt Text', editableContent.alt_text)}
      </CardContent>
    </Card>
  );
};

export default EditableSeoContent;
