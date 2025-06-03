
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus } from 'lucide-react';

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

  if (loading) {
    return <div className="text-sm text-gray-500">Loading system prompts...</div>;
  }

  return (
    <div className="space-y-2">
      <Label>System Prompt (Optional)</Label>
      <div className="flex gap-2">
        <Select value={selectedPromptId || 'none'} onValueChange={handlePromptChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select a system prompt to customize AI behavior" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No system prompt</SelectItem>
            {prompts.map((prompt) => (
              <SelectItem key={prompt.id} value={prompt.id}>
                {prompt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {onCreateNew && (
          <Button variant="outline" size="sm" onClick={onCreateNew}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      {selectedPromptId && selectedPromptId !== 'none' && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          {prompts.find(p => p.id === selectedPromptId)?.template}
        </div>
      )}
    </div>
  );
};

export default SystemPromptSelector;
