
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Save, X, FileText } from 'lucide-react';
import DefaultPromptTemplates from './DefaultPromptTemplates';

interface SystemPrompt {
  id: string;
  name: string;
  template: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const PromptTemplates = () => {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', template: '' });

  useEffect(() => {
    if (user) {
      fetchPrompts();
    }
  }, [user]);

  const fetchPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('prompt_templates')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts(data || []);
    } catch (error) {
      console.error('Error fetching system prompts:', error);
      toast.error('Failed to load system prompts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.template.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      if (editingId) {
        // Update existing prompt
        const { error } = await supabase
          .from('prompt_templates')
          .update({
            name: formData.name,
            template: formData.template,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('System prompt updated successfully');
      } else {
        // Create new prompt
        const { error } = await supabase
          .from('prompt_templates')
          .insert({
            user_id: user?.id,
            name: formData.name,
            template: formData.template,
            is_default: false
          });

        if (error) throw error;
        toast.success('System prompt created successfully');
      }

      setFormData({ name: '', template: '' });
      setEditingId(null);
      setIsCreating(false);
      fetchPrompts();
    } catch (error) {
      console.error('Error saving system prompt:', error);
      toast.error('Failed to save system prompt');
    }
  };

  const handleEdit = (prompt: SystemPrompt) => {
    setFormData({ name: prompt.name, template: prompt.template });
    setEditingId(prompt.id);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('prompt_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('System prompt deleted successfully');
      fetchPrompts();
    } catch (error) {
      console.error('Error deleting system prompt:', error);
      toast.error('Failed to delete system prompt');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', template: '' });
    setEditingId(null);
    setIsCreating(false);
  };

  const getPromptTypeColor = (name: string) => {
    const colors: { [key: string]: string } = {
      'Professional': 'bg-blue-100 text-blue-800',
      'Playful': 'bg-pink-100 text-pink-800',
      'Informative': 'bg-green-100 text-green-800',
      'Luxury': 'bg-purple-100 text-purple-800',
      'Technical': 'bg-gray-100 text-gray-800',
    };
    return colors[name] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-seo-primary"></div>
        <span className="ml-2 text-gray-600">Loading system prompts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DefaultPromptTemplates onTemplatesCreated={fetchPrompts} />
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">System Prompt Templates</h3>
          <p className="text-sm text-gray-600">Customize how the AI writes your content with different styles and tones</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        )}
      </div>

      {isCreating && (
        <Card className="border-2 border-seo-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-seo-primary" />
              {editingId ? 'Edit System Prompt' : 'Create New System Prompt'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prompt-name">Template Name</Label>
              <Input
                id="prompt-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Casual & Friendly"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="prompt-content">System Prompt</Label>
              <Textarea
                id="prompt-content"
                value={formData.template}
                onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                placeholder="e.g., Act like a friendly and casual content writer. Write in a conversational tone that makes customers feel comfortable and engaged..."
                rows={4}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                This prompt will guide the AI's writing style and tone. Be specific about the desired voice, style, and approach.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="bg-seo-primary hover:bg-seo-primary/90">
                <Save className="h-4 w-4 mr-2" />
                {editingId ? 'Update Template' : 'Create Template'}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {prompts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="space-y-4">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">No templates found</h4>
                  <p className="text-gray-600 max-w-sm mx-auto">
                    Create your first system prompt template to customize how the AI writes your content.
                  </p>
                </div>
                <Button onClick={() => setIsCreating(true)} className="bg-seo-primary hover:bg-seo-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          prompts.map((prompt) => (
            <Card key={prompt.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{prompt.name}</CardTitle>
                    <Badge className={getPromptTypeColor(prompt.name)}>
                      {prompt.name}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(prompt)}
                      className="hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(prompt.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm bg-gray-50 p-4 rounded-lg border">
                  <p className="leading-relaxed">{prompt.template}</p>
                </div>
                <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                  <span>Created: {new Date(prompt.created_at).toLocaleDateString()}</span>
                  <span>Updated: {new Date(prompt.updated_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PromptTemplates;
