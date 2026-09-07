
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_TEMPLATES = [
  {
    name: 'Professional',
    template: 'Act as a professional SEO content writer. Write in a clear, authoritative tone that builds trust and credibility. Use industry terminology appropriately and focus on the technical benefits and specifications. Maintain a formal but approachable style that appeals to business professionals and serious buyers.'
  },
  {
    name: 'Playful',
    template: 'Act as a creative and enthusiastic content writer. Write in a fun, engaging tone that uses conversational language, light humor, and excitement. Make the content feel approachable and entertaining while still being informative. Use casual expressions and create a friendly, upbeat atmosphere that makes shopping enjoyable.'
  },
  {
    name: 'Informative',
    template: 'Act as an expert product educator. Write in a detailed, educational tone that thoroughly explains features, benefits, and use cases. Focus on providing comprehensive information that helps customers make informed decisions. Use clear explanations, comparisons, and practical examples to guide the reader.'
  },
  {
    name: 'Luxury',
    template: 'Act as a luxury brand copywriter. Write in an elegant, sophisticated tone that emphasizes exclusivity, premium quality, and exceptional craftsmanship. Use refined language that conveys prestige and superior value. Focus on the premium experience and status that comes with owning this product.'
  },
  {
    name: 'Technical',
    template: 'Act as a technical specifications expert. Write in a precise, detailed tone that focuses on technical features, specifications, and performance metrics. Use accurate technical terminology and provide comprehensive details that appeal to technically-minded customers who want in-depth product information.'
  }
];

interface DefaultPromptTemplatesProps {
  onTemplatesCreated?: () => void;
}

const DefaultPromptTemplates: React.FC<DefaultPromptTemplatesProps> = ({ onTemplatesCreated }) => {
  const { user } = useAuth();

  useEffect(() => {
    const createDefaultTemplates = async () => {
      if (!user) return;

      try {
        // Check if user already has templates
        const { data: existingTemplates, error: checkError } = await supabase
          .from('prompt_templates')
          .select('id')
          .eq('user_id', user.id);

        if (checkError) throw checkError;

        // Only create defaults if user has no templates
        if (existingTemplates && existingTemplates.length === 0) {
          const templatesWithUserId = DEFAULT_TEMPLATES.map(template => ({
            ...template,
            user_id: user.id,
            is_default: false
          }));

          const { error: insertError } = await supabase
            .from('prompt_templates')
            .insert(templatesWithUserId);

          if (insertError) throw insertError;

          console.log('Default prompt templates created successfully');
          onTemplatesCreated?.();
        }
      } catch (error) {
        console.error('Error creating default templates:', error);
      }
    };

    createDefaultTemplates();
  }, [user, onTemplatesCreated]);

  return null; // This is a utility component that doesn't render anything
};

export default DefaultPromptTemplates;
