
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateContentRequest {
  product: any;
  prompt: string;
  userId: string;
  model: string;
  storeId?: string;
}

function generatePermalink(title: string): string {
  const permalink = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 40)
    .replace(/-$/, '');
  
  return permalink;
}

function parseOpenAIResponse(response: any): any {
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
    
    let focusKeywords = '';
    if (focusKeywordsMatch) {
      const keywords = focusKeywordsMatch[1].trim();
      const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
      
      if (keywordArray.length >= 5) {
        focusKeywords = keywordArray.slice(0, 5).join(', ');
      } else if (keywordArray.length > 0) {
        focusKeywords = keywords;
      }
    }
    
    const altText = altTextMatch ? altTextMatch[1].trim() : '';
    const metaTitle = metaTitleMatch ? metaTitleMatch[1].trim() : '';
    
    console.log('Parsed alt text:', altText);
    console.log('Alt text match result:', altTextMatch);
    
    let permalink = '';
    if (permalinkMatch) {
      permalink = permalinkMatch[1].trim();
    } else {
      permalink = generatePermalink(metaTitle);
    }
    
    if (permalink.length > 40) {
      permalink = permalink.substring(0, 40).replace(/-$/, '');
    }
    
    const result = {
      short_description: shortDescMatch ? shortDescMatch[1].trim() : '',
      long_description: longDescMatch ? longDescMatch[1].trim() : '',
      meta_title: metaTitle,
      meta_description: metaDescMatch ? metaDescMatch[1].trim() : '',
      alt_text: altText,
      focus_keywords: focusKeywords,
      permalink: permalink,
      product_id: 0,
      product_name: '',
      user_id: '',
    };
    
    console.log('Final parsed result:', result);
    return result;
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    // Trim the OpenAI API key to remove any whitespace/newlines
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')?.trim();

    // Enhanced environment check with timestamp for debugging
    const envCheck = {
      timestamp: new Date().toISOString(),
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseServiceKey,
      hasOpenAIKey: !!openaiApiKey,
      openaiKeyPrefix: openaiApiKey ? openaiApiKey.substring(0, 15) + '...' : 'NOT SET',
      openaiKeyLength: openaiApiKey ? openaiApiKey.length : 0,
      allEnvVars: Object.keys(Deno.env.toObject()).filter(key => 
        key.includes('OPENAI') || key.includes('SUPABASE')
      )
    };
    console.log('Environment check:', envCheck);

    if (!openaiApiKey || openaiApiKey.length === 0) {
      console.error('OPENAI_API_KEY environment variable not set or empty after trimming');
      console.error('Raw OPENAI_API_KEY value:', JSON.stringify(Deno.env.get('OPENAI_API_KEY')));
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured in edge function secrets',
        debug: envCheck
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { product, prompt, userId, model, storeId }: GenerateContentRequest = await req.json();

    console.log('Request details:', {
      productName: product.name,
      model: model,
      userId: userId,
      storeId: storeId,
      promptLength: prompt.length
    });

    // Deduct credits first
    const modelCredits = {
      'gemini-2.0-flash': 1,
      'gpt-4o-mini': 1,
      'gpt-3.5-turbo': 1,
      'gpt-4o': 2,
      'gpt-4.1': 3
    };

    const creditsRequired = modelCredits[model as keyof typeof modelCredits] || 1;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user:', userError);
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (userData.credits < creditsRequired) {
      return new Response(JSON.stringify({ 
        error: `Insufficient credits. Required: ${creditsRequired}, Available: ${userData.credits}` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call OpenAI API
    console.log('Calling OpenAI API with model:', model);
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model === 'gpt-4.1' ? 'gpt-4o' : model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert eCommerce SEO content writer. Follow the user instructions precisely and return content in the exact format requested. ALWAYS include the IMAGE ALT TEXT section in your response.'
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

    console.log('OpenAI API response status:', openaiResponse.status);

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error details:', {
        status: openaiResponse.status,
        statusText: openaiResponse.statusText,
        error: errorText
      });
      
      return new Response(JSON.stringify({ 
        error: `OpenAI API error: ${openaiResponse.status} - ${errorText}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openaiData = await openaiResponse.json();
    console.log('OpenAI response received successfully');

    // Parse the response
    const parsedContent = parseOpenAIResponse(openaiData);
    
    // Set additional fields
    parsedContent.product_id = product.id;
    parsedContent.product_name = product.name;
    parsedContent.user_id = userId;
    if (storeId) {
      parsedContent.store_id = storeId;
    }

    // Deduct credits
    const { error: creditError } = await supabase
      .from('users')
      .update({ credits: userData.credits - creditsRequired })
      .eq('id', userId);

    if (creditError) {
      console.error('Error deducting credits:', creditError);
    } else {
      console.log(`Deducted ${creditsRequired} credits from user ${userId}`);
    }

    // Update store usage if storeId is provided
    if (storeId) {
      const { error: usageError } = await supabase
        .from('woo_stores')
        .update({ 
          monthly_generations: supabase.rpc('increment', { x: 1 })
        })
        .eq('id', storeId);

      if (usageError) {
        console.error('Error updating store usage:', usageError);
      }
    }

    console.log('Content generation completed successfully');
    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({ 
      error: `Function error: ${error instanceof Error ? error.message : 'Unknown error occurred'}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
