
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

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

  if (isLoading) {
    return <div className="text-center">Loading system prompts...</div>;
  }

  return (
    <div className="space-y-6">
      {!isCreating && (
        <Button onClick={() => setIsCreating(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create New System Prompt
        </Button>
      )}

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit System Prompt' : 'Create New System Prompt'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prompt-name">Prompt Name</Label>
              <Input
                id="prompt-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., TV Store SEO Writer"
              />
            </div>
            <div>
              <Label htmlFor="prompt-content">System Prompt</Label>
              <Textarea
                id="prompt-content"
                value={formData.template}
                onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                placeholder="e.g., Act like a professional SEO writer for a TV store. Write engaging, technical content that highlights the features and benefits of televisions..."
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                This prompt will guide the AI's writing style and tone, but won't change the content structure.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {editingId ? 'Update' : 'Create'}
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
          <div className="text-center text-gray-500 py-8">
            <p className="mb-2">No system prompts found.</p>
            <p className="text-sm">Create your first system prompt to customize how the AI writes your content.</p>
          </div>
        ) : (
          prompts.map((prompt) => (
            <Card key={prompt.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{prompt.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(prompt)}
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
                <div className="text-sm bg-gray-50 p-3 rounded border">
                  {prompt.template}
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
