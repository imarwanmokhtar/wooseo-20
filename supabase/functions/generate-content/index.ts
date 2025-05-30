
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { product, prompt, model, userId } = await req.json();
    
    console.log('Generating content with model:', model);
    console.log('Product:', product.name);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let response;
    let parsedContent;

    if (model === 'gemini-2.0-flash') {
      // Use Gemini API
      const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyBzV_v93D5yfZP-VnT2TWH0Pf1EATMRDbk';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      parsedContent = parseGeminiResponse(data);
    } else {
      // Use OpenAI API
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      
      if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert eCommerce SEO content writer. Follow the user instructions precisely and return content in the exact format requested.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      parsedContent = parseOpenAIResponse(data);
    }

    // Set product and user info
    parsedContent.product_id = product.id;
    parsedContent.product_name = product.name;
    parsedContent.user_id = userId;

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function parseGeminiResponse(response: any): any {
  try {
    const text = response.candidates[0].content.parts[0].text;
    console.log('Parsing Gemini response:', text);
    
    return parseAIResponse(text);
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    throw new Error('Failed to parse Gemini response. Please try again.');
  }
}

function parseOpenAIResponse(response: any): any {
  try {
    const text = response.choices[0].message.content;
    console.log('Parsing OpenAI response:', text);
    
    return parseAIResponse(text);
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    throw new Error('Failed to parse OpenAI response. Please try again.');
  }
}

function generatePermalink(title: string): string {
  // Generate permalink from title, max 50 characters
  const permalink = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50) // Limit to 50 characters
    .replace(/-$/, ''); // Remove trailing hyphen if present after truncation
  
  return permalink;
}

function parseAIResponse(text: string): any {
  // Parse the response text to extract sections
  const longDescMatch = text.match(/LONG DESCRIPTION:\s*([\s\S]*?)(?=SHORT DESCRIPTION:|$)/);
  const shortDescMatch = text.match(/SHORT DESCRIPTION:\s*([\s\S]*?)(?=META TITLE:|$)/);
  const metaTitleMatch = text.match(/META TITLE:\s*([\s\S]*?)(?=META DESCRIPTION:|$)/);
  const metaDescMatch = text.match(/META DESCRIPTION:\s*([\s\S]*?)(?=FOCUS KEYWORDS:|$)/);
  const focusKeywordsMatch = text.match(/FOCUS KEYWORDS:\s*([\s\S]*?)(?=IMAGE ALT TEXT:|PERMALINK:|$)/);
  const altTextMatch = text.match(/IMAGE ALT TEXT:\s*([\s\S]*?)(?=PERMALINK:|$)/);
  
  // Extract focus keywords and ensure we have exactly 3
  let focusKeywords = '';
  if (focusKeywordsMatch) {
    const keywords = focusKeywordsMatch[1].trim();
    console.log('Extracted focus keywords from AI:', keywords);
    
    // Split by comma and clean up
    const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
    
    // Ensure we have exactly 3 keywords
    if (keywordArray.length >= 3) {
      focusKeywords = keywordArray.slice(0, 3).join(', ');
    } else if (keywordArray.length > 0) {
      // If less than 3, use what we have but log a warning
      focusKeywords = keywords;
      console.warn('Expected 3 focus keywords but got:', keywordArray.length);
    }
  }
  
  // Extract alt text
  const altText = altTextMatch ? altTextMatch[1].trim() : '';
  
  // Extract meta title and generate permalink
  const metaTitle = metaTitleMatch ? metaTitleMatch[1].trim() : '';
  const permalink = generatePermalink(metaTitle);
  
  console.log('Final parsed focus keywords (exactly 3):', focusKeywords);
  console.log('Final parsed alt text:', altText);
  console.log('Generated permalink from title:', permalink);
  
  return {
    short_description: shortDescMatch ? shortDescMatch[1].trim() : '',
    long_description: longDescMatch ? longDescMatch[1].trim() : '',
    meta_title: metaTitle,
    meta_description: metaDescMatch ? metaDescMatch[1].trim() : '',
    alt_text: altText,
    focus_keywords: focusKeywords,
    permalink: permalink, // Add the generated permalink
    product_id: 0,
    user_id: '',
  };
}
