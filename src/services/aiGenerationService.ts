
import { supabase } from '@/integrations/supabase/client';

export const DEFAULT_PROMPT_TEMPLATE = `You are an expert eCommerce SEO product description writer specializing in optimizing product content. Your task is to write detailed and SEO-optimized product descriptions based on the provided information.

Focus on creating content that ranks well in RankMath plugin. Critical requirements:
- SEO Title MUST start with the Primary Focus Keyword exactly and MUST NOT end with a colon
- Permalink MUST start with the Primary Focus Keyword and MUST be under 60 characters
- Content should be clean HTML without Markdown formatting

Product Information:
Product Name: {{name}}
SKU: {{sku}}
Price: {{price}}
Description: {{description}}
Categories: {{categories}}

Content Requirements:
1. Long Description (300+ words, HTML format):
   - Include detailed and informative content optimized for SEO
   - Use <strong> tags for highlighting important keywords (not Markdown)
   - Start with the Primary Focus Keyword and repeat it naturally
   - Include the Focus Keywords in subheadings (<h2>, <h3>, <h4>)
   - Include a Product Information Table (Size, Color, Material, Brand Name)
   - Include Key Features, Benefits, and overview
   - Answer one frequently searched question related to the product
   - Use emoticons/icons to evoke emotional connection
   - Include 3-4 internal links to related products
   - Include external links to related categories just integrate the links normally in the text with clickable text

2. Short Description (50 words max):
   - Concise and engaging, highlighting uniqueness and key features
   - Provided as plain text without any Markdown formatting

3. SEO Elements (Optimized for Rank Math SEO Plugin):
   - SEO Meta Title: MUST start with the exact Primary Focus Keyword, be under 60 characters, include a power word and a number, and MUST NOT end with a colon
   - SEO Permalink: MUST start with the Primary Focus Keyword and be URL-friendly, MAXIMUM 60 CHARACTERS
   - Meta Description: 140-155 characters, must include the Primary Focus Keyword, with a call to action
   - Focus Keywords: Generate EXACTLY THREE focus keywords (primary, secondary, and tertiary) separated by commas
   - Secondary Keywords: Generate EXACTLY TWO secondary keywords that complement the focus keywords
   - Tags: Generate EXACTLY THREE product tags that are relevant to the product

Output MUST include these EXACT section headers in your response:
LONG DESCRIPTION:
SHORT DESCRIPTION:
META TITLE:
META DESCRIPTION:
FOCUS KEYWORDS:
SECONDARY KEYWORDS:
TAGS:
PERMALINK:

Do not include any Markdown formatting like \`\`\` or ** in your output.`;

export async function generateSeoContent(
  product: any,
  prompt: string,
  userId: string,
  model: string = 'gemini-2.0-flash',
  storeId?: string
): Promise<any> {
  try {
    console.log('Generating SEO content for product:', product.name);
    
    // Replace template variables in the prompt
    const processedPrompt = prompt
      .replace(/\{\{name\}\}/g, product.name || '')
      .replace(/\{\{sku\}\}/g, product.sku || '')
      .replace(/\{\{price\}\}/g, product.price || '')
      .replace(/\{\{description\}\}/g, product.description || '')
      .replace(/\{\{categories\}\}/g, product.categories?.map((c: any) => c.name).join(', ') || '');

    const { data, error } = await supabase.functions.invoke('generate-content', {
      body: {
        prompt: processedPrompt,
        userId,
        model,
        storeId
      }
    });

    if (error) {
      console.error('Error from generate-content function:', error);
      throw new Error(error.message || 'Failed to generate content');
    }

    if (!data || !data.content) {
      throw new Error('No content generated');
    }

    console.log('Generated content:', data.content);
    return data.content;
  } catch (error) {
    console.error('Error generating SEO content:', error);
    throw error;
  }
}

export async function savePromptTemplate(
  userId: string,
  name: string,
  template: string
): Promise<void> {
  const { error } = await supabase
    .from('prompt_templates')
    .upsert({
      user_id: userId,
      name,
      template,
      is_default: name === 'Default Template',
    });

  if (error) throw error;
}

export async function getPromptTemplates(userId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('prompt_templates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getDefaultPromptTemplate(userId: string): Promise<string> {
  try {
    console.log('Getting default prompt template for user:', userId);
    
    // First try to get the user's default template
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('template')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (error || !data) {
      console.log('No default template found for user, checking for any template');
      
      // If no default, get the first template they have
      const { data: anyTemplate, error: anyError } = await supabase
        .from('prompt_templates')
        .select('template')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (anyError || !anyTemplate) {
        console.log('No templates found for user, returning default');
        return DEFAULT_PROMPT_TEMPLATE;
      }

      console.log('Using user\'s first template as default');
      return anyTemplate.template;
    }

    console.log('Using user\'s default template');
    return data.template;
  } catch (error) {
    console.error('Error getting default prompt template:', error);
    return DEFAULT_PROMPT_TEMPLATE;
  }
}

export async function deletePromptTemplate(templateId: string): Promise<void> {
  const { error } = await supabase
    .from('prompt_templates')
    .delete()
    .eq('id', templateId);

  if (error) throw error;
}
