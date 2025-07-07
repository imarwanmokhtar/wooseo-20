
import { Product, SeoContent } from '@/types';

export async function callOpenAIAPI(prompt: string, model: 'gpt-3.5-turbo' | 'gpt-4o'): Promise<any> {
  // This function should not be used directly - use the edge function instead
  throw new Error('Use the generate-content edge function instead of calling OpenAI directly');
}

function generatePermalink(title: string): string {
  // Generate permalink from title, max 40 characters for RankMath optimization
  const permalink = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 40) // Limit to 40 characters for better SEO
    .replace(/-$/, ''); // Remove trailing hyphen if present after truncation
  
  return permalink;
}

export function parseOpenAIResponse(response: any): SeoContent {
  try {
    const text = response.choices[0].message.content;
    console.log('Parsing OpenAI response:', text);
    
    // Improved regex patterns to better capture all sections
    const longDescMatch = text.match(/LONG\s+DESCRIPTION:\s*([\s\S]*?)(?=SHORT\s+DESCRIPTION:|$)/i);
    const shortDescMatch = text.match(/SHORT\s+DESCRIPTION:\s*([\s\S]*?)(?=META\s+TITLE:|$)/i);
    const metaTitleMatch = text.match(/META\s+TITLE:\s*([\s\S]*?)(?=META\s+DESCRIPTION:|$)/i);
    const metaDescMatch = text.match(/META\s+DESCRIPTION:\s*([\s\S]*?)(?=FOCUS\s+KEYWORDS:|$)/i);
    const focusKeywordsMatch = text.match(/FOCUS\s+KEYWORDS:\s*([\s\S]*?)(?=IMAGE\s+ALT\s+TEXT:|ALT\s+TEXT:|PERMALINK:|$)/i);
    const altTextMatch = text.match(/(?:IMAGE\s+ALT\s+TEXT|ALT\s+TEXT):\s*([\s\S]*?)(?=PERMALINK:|$)/i);
    const permalinkMatch = text.match(/PERMALINK:\s*([\s\S]*?)$/i);
    
    // Extract focus keywords and ensure we have exactly 5
    let focusKeywords = '';
    if (focusKeywordsMatch) {
      const keywords = focusKeywordsMatch[1].trim();
      console.log('Extracted focus keywords from OpenAI:', keywords);
      
      // Split by comma and clean up
      const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
      
      // Ensure we have exactly 5 keywords
      if (keywordArray.length >= 5) {
        focusKeywords = keywordArray.slice(0, 5).join(', ');
      } else if (keywordArray.length > 0) {
        // If less than 5, use what we have but log a warning
        focusKeywords = keywords;
        console.warn('Expected 5 focus keywords but got:', keywordArray.length);
      }
    }
    
    // Extract alt text
    const altText = altTextMatch ? altTextMatch[1].trim() : '';
    
    // Extract meta title and generate permalink
    const metaTitle = metaTitleMatch ? metaTitleMatch[1].trim() : '';
    
    // Use explicit permalink if provided, otherwise generate from meta title
    let permalink = '';
    if (permalinkMatch) {
      permalink = permalinkMatch[1].trim();
    } else {
      permalink = generatePermalink(metaTitle);
    }
    
    // Ensure permalink is within 40 characters
    if (permalink.length > 40) {
      permalink = permalink.substring(0, 40).replace(/-$/, '');
    }
    
    console.log('Final parsed focus keywords (exactly 5):', focusKeywords);
    console.log('Final parsed alt text:', altText);
    console.log('Generated/extracted permalink (40 chars max):', permalink);
    
    return {
      short_description: shortDescMatch ? shortDescMatch[1].trim() : '',
      long_description: longDescMatch ? longDescMatch[1].trim() : '',
      meta_title: metaTitle,
      meta_description: metaDescMatch ? metaDescMatch[1].trim() : '',
      alt_text: altText,
      focus_keywords: focusKeywords,
      permalink: permalink,
      product_id: 0,
      product_name: '', // This will be set by the calling function
      user_id: '',
    };
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    throw new Error('Failed to parse AI response. Please try again.');
  }
}
