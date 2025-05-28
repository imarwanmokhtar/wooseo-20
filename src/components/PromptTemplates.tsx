import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { savePromptTemplate, getPromptTemplates, DEFAULT_PROMPT_TEMPLATE } from '@/services/aiGenerationService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Check, Copy, FileText, PlusCircle, Trash } from 'lucide-react';

const PromptTemplates = () => {
  const [templateName, setTemplateName] = useState('');
  const [promptContent, setPromptContent] = useState(DEFAULT_PROMPT_TEMPLATE);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTemplates = async () => {
      if (user) {
        try {
          const data = await getPromptTemplates(user.id);
          setTemplates(data);
        } catch (error) {
          console.error('Error fetching prompt templates:', error);
          toast.error('Failed to load prompt templates.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTemplates();
  }, [user]);

  const handleSaveTemplate = async () => {
    if (!user) {
      toast.error('You must be logged in to save templates.');
      return;
    }

    if (!templateName || !promptContent) {
      toast.error('Template name and content are required.');
      return;
    }

    setSaving(true);
    try {
      await savePromptTemplate(user.id, templateName, promptContent);
      toast.success('Template saved successfully!');
      const updatedTemplates = await getPromptTemplates(user.id);
      setTemplates(updatedTemplates);
      resetForm();
    } catch (error) {
      console.error('Error saving prompt template:', error);
      toast.error('Failed to save template.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!user) {
      toast.error('You must be logged in to delete templates.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      // Optimistically update the UI
      setTemplates(templates.filter(template => template.id !== templateId));

      // Delete the template from the database
      // await deletePromptTemplate(templateId); // Assuming you have a deletePromptTemplate function
      // toast.success('Template deleted successfully!');
      
      // For now, just log the action since we don't have a delete function
      console.log('Template deleted:', templateId);
    } catch (error) {
      console.error('Error deleting prompt template:', error);
      toast.error('Failed to delete template.');
      // If there was an error, revert the UI update
      // const updatedTemplates = await getPromptTemplates(user.id);
      // setTemplates(updatedTemplates);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success('Template copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetForm = () => {
    setTemplateName('');
    setPromptContent('');
  };

  return (
    <div className="space-y-6">
      {/* Create New Template Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PlusCircle className="h-5 w-5 mr-2 text-seo-primary" />
            Create New Template
          </CardTitle>
          <CardDescription>
            Design a custom prompt template for generating SEO content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Template Name</label>
              <Input 
                value={templateName} 
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="E.g., Technical Products, Fashion Items, etc."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Prompt Template</label>
              <p className="text-sm text-gray-500">
                Use variables like {"{name}"}, {"{sku}"}, {"{price}"}, {"{description}"}, and {"{categories}"} that will be replaced with actual product data.
              </p>
              <Textarea 
                value={promptContent} 
                onChange={(e) => setPromptContent(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                placeholder={DEFAULT_PROMPT_TEMPLATE}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={resetForm}>
              Clear
            </Button>
            <div className="space-x-2">
              <Button 
                variant="outline"
                onClick={() => setPromptContent(DEFAULT_PROMPT_TEMPLATE)}
              >
                Use Default
              </Button>
              <Button onClick={handleSaveTemplate} disabled={saving || !templateName || !promptContent}>
                {saving ? 'Saving...' : 'Save Template'}
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Saved Templates Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Saved Templates</h3>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-seo-primary mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8">
              <div className="text-center text-gray-500">
                <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p className="mb-1">No templates saved yet</p>
                <p className="text-sm">Create your first template to get started</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {templates.map(template => (
              <Card key={template.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">{template.name}</CardTitle>
                  <CardDescription className="text-xs">Created {new Date(template.created_at).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="bg-gray-50 rounded p-3 font-mono text-xs overflow-auto max-h-[150px]">
                    {template.content.split('\n').map((line, i) => (
                      <div key={i} className="whitespace-pre-wrap mb-1">
                        {line}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="flex justify-between w-full">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash className="h-4 w-4 mr-1" /> Delete
                    </Button>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setTemplateName(template.name);
                          setPromptContent(template.content);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center" 
                        onClick={() => handleCopyToClipboard(template.content)}
                      >
                        {copiedId === template.id ? (
                          <><Check className="h-4 w-4 mr-1" /> Copied</>
                        ) : (
                          <><Copy className="h-4 w-4 mr-1" /> Copy</>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Template Variables Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-md">Template Variables</CardTitle>
          <CardDescription>
            Use these variables in your templates to dynamically insert product data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 p-2 rounded">
                <code className="text-sm font-bold">{"{{name}}"}</code>
                <p className="text-xs text-gray-500">Product name</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <code className="text-sm font-bold">{"{{sku}}"}</code>
                <p className="text-xs text-gray-500">Product SKU</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <code className="text-sm font-bold">{"{{price}}"}</code>
                <p className="text-xs text-gray-500">Product price</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <code className="text-sm font-bold">{"{{description}}"}</code>
                <p className="text-xs text-gray-500">Product description</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <code className="text-sm font-bold">{"{{categories}}"}</code>
                <p className="text-xs text-gray-500">Product categories</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromptTemplates;
