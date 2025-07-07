import { supabase } from '@/integrations/supabase/client';

export const DEFAULT_PROMPT_TEMPLATE = `You are an expert eCommerce SEO product description writer specializing in RankMath optimization. Your task is to write detailed and SEO-optimized product descriptions that pass ALL RankMath SEO checks.

PRIMARY FOCUS KEYWORD: "{{name}}" (EXACT product name - use this EXACTLY as written)

MANDATORY REQUIREMENTS:
1. SEO Title MUST start with PRIMARY FOCUS KEYWORD "{{name}}" as the VERY FIRST WORDS
2. Meta Description MUST start with PRIMARY FOCUS KEYWORD "{{name}}" as the VERY FIRST WORDS  
3. URL/Permalink MUST start with PRIMARY FOCUS KEYWORD and be MAXIMUM 45 characters (RankMath requirement)
4. Content MUST start with PRIMARY FOCUS KEYWORD "{{name}}" as the VERY FIRST WORDS
5. Keyword density MUST be EXACTLY 1.5% (use "{{name}}" approximately 11-12 times in 750+ words)
6. Alt text MUST contain the PRIMARY FOCUS KEYWORD "{{name}}"
7. Content MUST be at least 750 words minimum (NOT 600)
8. MUST include exactly 3 short internal links (5-8 words each)
9. MUST include exactly 2 external authority links with target="_blank" but WITHOUT rel="nofollow" (make them FOLLOW links)
10. SEO Title MUST contain a power word: Ultimate, Best, Top, Premium, Professional, Advanced, Complete, Perfect, Amazing, Exclusive, Revolutionary, Innovative, Superior, Outstanding, Exceptional
11. SEO Title MUST be 50-60 characters maximum

Product Information:
Product Name: {{name}}
SKU: {{sku}}
Price: {{price}}
Description: {{description}}
Categories: {{categories}}
Store URL: {{store_url}}

STRICT OUTPUT REQUIREMENTS:

1. Long Description (750+ words, HTML format):
   - FIRST SENTENCE must start EXACTLY with: "{{name}}" (no other words before it)
   - Use PRIMARY FOCUS KEYWORD "{{name}}" EXACTLY 11-12 times naturally throughout content (1.5% density)
   - Use <strong>{{name}}</strong> for highlighting the product name (2-3 times only)
   - Include subheadings with <h3> tags
   - Include a product specifications table
   - Include FAQ section
   - Include exactly 3 SHORT internal links: <a href="{{store_url}}/category">Short Link Text</a> (max 8 words each)
   - Include exactly 2 external authority links with target="_blank" WITHOUT rel="nofollow" (FOLLOW links)
   - Must be minimum 750 words
   - Add detailed product benefits, usage instructions, and comparison sections

2. Short Description (60-80 words):
   - MUST start with PRIMARY FOCUS KEYWORD "{{name}}" exactly
   - Include key benefits and call-to-action

3. SEO Meta Title:
   - MUST start with "{{name}}" + power word + benefit
   - Maximum 60 characters
   - Example: "{{name}} - Ultimate [benefit]"

4. Meta Description:
   - MUST start with "{{name}}" + benefits + CTA
   - 150-155 characters
   - Example: "{{name}} offers [benefits]. Get [result]. Order now!"

5. URL Permalink:
   - MUST start with PRIMARY FOCUS KEYWORD (shortened if needed)
   - Use hyphens between words
   - MAXIMUM 45 characters (RankMath requirement)
   - Example: "product-name-key" (max 45 chars)

6. Alt Text:
   - MUST contain "{{name}}" + descriptive text
   - Example: "{{name}} product image"

7. Focus Keywords:
   - Generate EXACTLY 5 keywords total
   - First keyword: PRIMARY FOCUS KEYWORD (main part of product title - extract the core product name)
   - Keywords 2-5: SECONDARY KEYWORDS (more general terms related to product category, type, brand, features)
   - Output format: "keyword1, keyword2, keyword3, keyword4, keyword5" (no labels, just comma-separated)
   - Example: "iPhone 15 Pro, smartphone, Apple phone, premium mobile, flagship device"

INTERNAL LINKS REQUIREMENTS:
- Use store URL: {{store_url}}
- Create 3 SHORT links: /product-category/[category]
- Link text must be SHORT (5-8 words max)
- Format: <a href="{{store_url}}/product-category/[category]">Shop [Category]</a>

EXTERNAL LINKS REQUIREMENTS:
- Include exactly 2 external authority links
- Use target="_blank" WITHOUT rel="nofollow" (make them FOLLOW links)
- Link to relevant industry resources or reviews
- Examples: <a href="https://example.com" target="_blank">Industry Resource</a>

POWER WORDS (use exactly one in SEO title):
Ultimate, Best, Top, Premium, Professional, Advanced, Complete, Perfect, Amazing, Exclusive, Revolutionary, Innovative, Superior, Outstanding, Exceptional

CRITICAL KEYWORD DENSITY RULES:
- Use "{{name}}" EXACTLY 11-12 times in 750+ words for 1.5% density
- DO NOT exceed 12 mentions to avoid over-optimization
- Count each mention carefully
- Distribute naturally throughout content

CRITICAL URL/PERMALINK REQUIREMENTS:
- Maximum 45 characters
- Must start with primary focus keyword (shortened if needed)
- Use hyphens to separate words
- Example: "anker-soundcore-r50i" (19 chars)

CONTENT EXPANSION REQUIREMENTS:
- Add detailed product benefits section (150+ words)
- Include usage instructions and tips (150+ words)
- Add product comparison section (150+ words)
- Include customer testimonial style content (150+ words)
- Add technical specifications details (150+ words)
- Include warranty and support information (100+ words)

OUTPUT FORMAT - Use these EXACT headers:
LONG DESCRIPTION:
SHORT DESCRIPTION:
META TITLE:
META DESCRIPTION:
FOCUS KEYWORDS:
ALT TEXT:
PERMALINK:

VALIDATION CHECKLIST (MUST VERIFY):
✓ Content starts with "{{name}}" as first words
✓ SEO title starts with "{{name}}" + power word
✓ Meta description starts with "{{name}}" as first words
✓ URL starts with focus keyword (max 45 chars)
✓ Content is 750+ words minimum
✓ Focus keyword appears 11-12 times ONLY (1.5% density)
✓ Exactly 3 SHORT internal links included
✓ Exactly 2 external authority links included (WITHOUT nofollow)
✓ Power word in SEO title
✓ Alt text contains focus keyword
✓ SEO title is 50-60 characters
✓ 5 focus keywords generated (1 primary + 4 secondary)

IMPORTANT: No markdown formatting. Use clean HTML in descriptions. Count keywords carefully to maintain 1.5% density. External links MUST be FOLLOW links (no nofollow).`;

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
      .replace(/\{\{categories\}\}/g, product.categories?.map((c: any) => c.name).join(', ') || '')
      .replace(/\{\{store_url\}\}/g, product.store_url || '');

    const { data, error } = await supabase.functions.invoke('generate-content', {
      body: {
        product,
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

    if (!data) {
      throw new Error('No data returned from generate-content function');
    }

    console.log('Raw response from edge function:', data);

    // The edge function should return a parsed object, but let's ensure it's valid
    let content = data;

    // If the response is a string, it means the edge function didn't parse it properly
    if (typeof data === 'string') {
      console.error('Edge function returned a string instead of parsed object:', data);
      throw new Error('Content generation failed - invalid response format');
    }

    // Ensure we have a valid content object
    if (!content || typeof content !== 'object') {
      throw new Error('Invalid content format received from AI service');
    }

    // Add store_id to the content object (not to a string)
    if (storeId) {
      content.store_id = storeId;
    }

    // Set additional product and user info
    content.product_id = product.id;
    content.product_name = product.name;
    content.user_id = userId;

    console.log('Final processed content:', content);
    return content;
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
  // Always return the default template since we're now using system prompts separately
  return DEFAULT_PROMPT_TEMPLATE;
}

export async function deletePromptTemplate(templateId: string): Promise<void> {
  const { error } = await supabase
    .from('prompt_templates')
    .delete()
    .eq('id', templateId);

  if (error) throw error;
}
