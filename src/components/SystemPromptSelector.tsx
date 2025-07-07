
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, FileText } from 'lucide-react';

interface SystemPrompt {
  id: string;
  name: string;
  template: string;
}

interface SystemPromptSelectorProps {
  selectedPromptId?: string;
  onPromptSelect: (promptId: string, promptText: string) => void;
  onCreateNew?: () => void;
}

const SystemPromptSelector: React.FC<SystemPromptSelectorProps> = ({
  selectedPromptId,
  onPromptSelect,
  onCreateNew
}) => {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPrompts();
    }
  }, [user]);

  const fetchPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('prompt_templates')
        .select('id, name, template')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts(data || []);
    } catch (error) {
      console.error('Error fetching system prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptChange = (promptId: string) => {
    if (promptId === 'none') {
      onPromptSelect('', '');
    } else {
      const selectedPrompt = prompts.find(p => p.id === promptId);
      if (selectedPrompt) {
        onPromptSelect(promptId, selectedPrompt.template);
      }
    }
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

  if (loading) {
    return <div className="text-sm text-gray-500">Loading system prompts...</div>;
  }

  const selectedPrompt = prompts.find(p => p.id === selectedPromptId);

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-seo-primary" />
        System Prompt Template (Optional)
      </Label>
      <div className="flex gap-2">
        <Select value={selectedPromptId || 'none'} onValueChange={handlePromptChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Choose a writing style for the AI" />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg z-50">
            <SelectItem value="none">No system prompt (default style)</SelectItem>
            {prompts.map((prompt) => (
              <SelectItem key={prompt.id} value={prompt.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{prompt.name}</span>
                  <Badge className={`${getPromptTypeColor(prompt.name)} text-xs`}>
                    {prompt.name}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {onCreateNew && (
          <Button variant="outline" size="sm" onClick={onCreateNew} title="Create new template">
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {selectedPrompt && (
        <div className="bg-gray-50 border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={getPromptTypeColor(selectedPrompt.name)}>
              {selectedPrompt.name}
            </Badge>
            <span className="text-sm font-medium">Selected Style</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            {selectedPrompt.template}
          </p>
        </div>
      )}
      
      {prompts.length === 0 && (
        <div className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded p-3">
          <p className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            No system prompts available. Create your first template in the Prompt Templates tab.
          </p>
        </div>
      )}
    </div>
  );
};

export default SystemPromptSelector;
