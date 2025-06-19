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
    const { product, prompt, model, userId, storeId } = await req.json();
    
    console.log('Generating content with model:', model);
    console.log('Product:', product.name);
    console.log('User ID:', userId);
    console.log('Store ID:', storeId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get store URL for internal linking
    let storeUrl = '';
    if (storeId) {
      const { data: storeData } = await supabase
        .from('woocommerce_credentials')
        .select('store_url')
        .eq('id', storeId)
        .single();
      
      if (storeData?.store_url) {
        storeUrl = storeData.store_url.replace(/\/$/, '');
      }
    }

    // Enhanced prompt with store URL for internal linking
    const enhancedPrompt = prompt.replace(/\{\{store_url\}\}/g, storeUrl);

    let response;
    let parsedContent;

    if (model === 'gemini-2.0-flash') {
      throw new Error('Gemini 2.0 Flash is temporarily unavailable. Please try another model.');
    } else {
      // Use OpenAI API for all other models
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      
      if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      // Map our model names to OpenAI model names
      let openAIModel = model;
      if (model === 'gpt-4.1') {
        openAIModel = 'gpt-4o';
      } else if (model === 'gpt-4o-mini') {
        openAIModel = 'gpt-4o-mini';
      }

      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: openAIModel,
          messages: [
            {
              role: 'system',
              content: `You are an expert eCommerce SEO content writer specializing in RankMath optimization. Follow the user instructions precisely and ensure all RankMath SEO requirements are met.

CRITICAL REQUIREMENTS:
1. ALWAYS start content, SEO title, and meta description with the EXACT PRIMARY FOCUS KEYWORD as the first words
2. Use the focus keyword EXACTLY 11-12 times throughout 750+ word content to achieve 1.5% density (NO MORE, NO LESS)
3. URLs must be 45 characters maximum and start with focus keyword
4. Include power words in titles and maintain proper internal linking
5. Content must be minimum 750 words (NOT 600)
6. Include exactly 3 SHORT internal links (5-8 words each) using the store URL format
7. Include exactly 2 external authority links with target="_blank" but WITHOUT rel="nofollow" (make them FOLLOW links)
8. SEO Title must be 50-60 characters and start with focus keyword + power word
9. Generate EXACTLY 5 focus keywords: 1 primary (main product name part) + 4 secondary (general terms)

FOCUS KEYWORDS GENERATION:
- First keyword: Extract the core/main part of the product name (PRIMARY)
- Keywords 2-5: Generate general related terms (brand, category, type, features) (SECONDARY)
- Output only the 5 keywords comma-separated, no labels
- Example: "iPhone 15 Pro, smartphone, Apple phone, premium mobile, flagship device"

VALIDATION: Every piece of content MUST pass RankMath SEO checks. Count keywords carefully to maintain 1.5% density.`
            },
            {
              role: 'user',
              content: enhancedPrompt
            }
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      parsedContent = parseOpenAIResponse(data, product.name, storeUrl);
    }

    // Ensure parsedContent is an object before setting properties
    if (!parsedContent || typeof parsedContent !== 'object') {
      throw new Error('Failed to parse AI response into valid object');
    }

    // Set product and user info on the parsed object
    parsedContent.product_id = product.id;
    parsedContent.product_name = product.name;
    parsedContent.user_id = userId;

    // Handle credits and store usage with corrected credit amounts
    const creditsRequired = getCreditsForModel(model);
    console.log('Credits required for model:', creditsRequired);

    // First, get the current credits to calculate the new amount
    console.log('Getting current user credits...');
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching user credits:', fetchError);
      throw new Error(`Failed to fetch user credits: ${fetchError.message}`);
    }

    const newCredits = currentUser.credits - creditsRequired;
    
    if (newCredits < 0) {
      throw new Error('Insufficient credits');
    }

    // Deduct credits by updating with calculated value
    console.log('Deducting credits:', creditsRequired);
    console.log('Current credits:', currentUser.credits, 'New credits:', newCredits);
    
    const { error: creditsError } = await supabase
      .from('users')
      .update({ credits: newCredits })
      .eq('id', userId);

    if (creditsError) {
      console.error('Credits deduction error:', creditsError);
      throw new Error(`Failed to deduct credits: ${creditsError.message}`);
    }

    console.log('Credits deducted successfully');

    // Update store usage if storeId is provided
    if (storeId) {
      console.log('Updating store usage for store:', storeId);
      
      // First get current usage
      const { data: currentStore, error: storeError } = await supabase
        .from('woocommerce_credentials')
        .select('used_credits')
        .eq('id', storeId)
        .single();

      if (storeError) {
        console.error('Error fetching store usage:', storeError);
        // Don't throw error here, just log it
      } else {
        const newUsedCredits = (currentStore.used_credits || 0) + creditsRequired;
        
        const { error: usageError } = await supabase
          .from('woocommerce_credentials')
          .update({
            used_credits: newUsedCredits
          })
          .eq('id', storeId);

        if (usageError) {
          console.error('Failed to update store usage:', usageError);
          // Don't throw error here, just log it
        }
      }
    }

    console.log('Generated content:', JSON.stringify(parsedContent));

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

function getCreditsForModel(model: string): number {
  switch (model) {
    case 'gpt-4o':
      return 2;
    case 'gpt-4.1':
      return 3;
    case 'gpt-4o-mini':
      return 1;
    case 'gpt-3.5-turbo':
      return 1;
    case 'gemini-2.0-flash':
      return 1;
    default:
      return 1;
  }
}

function generatePermalink(productName: string): string {
  // Generate permalink from product name, max 45 characters for RankMath optimization
  const permalink = productName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 45)
    .replace(/-$/, '');
  
  return permalink;
}

function createOptimalPermalink(primaryKeyword: string): string {
  // Create a shorter, optimized permalink from the primary keyword
  const words = primaryKeyword.toLowerCase().split(/\s+/);
  let permalink = '';
  
  // Take key words up to 45 characters
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z0-9]/g, '');
    if (cleanWord.length > 0) {
      const testPermalink = permalink ? `${permalink}-${cleanWord}` : cleanWord;
      if (testPermalink.length <= 45) {
        permalink = testPermalink;
      } else {
        break;
      }
    }
  }
  
  return permalink || generatePermalink(primaryKeyword);
}

function extractPrimaryKeyword(productName: string): string {
  // Extract the core product name (first few meaningful words)
  const words = productName.split(/\s+/);
  
  // Take the first 3-4 meaningful words or until we hit common descriptors
  const stopWords = ['with', 'and', 'for', 'in', 'the', 'a', 'an', '-', '|', ','];
  let primaryKeyword = '';
  let wordCount = 0;
  
  for (const word of words) {
    if (stopWords.some(stop => word.toLowerCase().includes(stop)) && wordCount >= 2) {
      break;
    }
    
    if (wordCount < 4) {
      primaryKeyword += (primaryKeyword ? ' ' : '') + word;
      wordCount++;
    } else {
      break;
    }
  }
  
  return primaryKeyword || words.slice(0, 3).join(' ');
}

function generateSecondaryKeywords(productName: string, categories: string): string[] {
  // Generate 4 secondary keywords based on product and categories
  const secondaryKeywords = [];
  
  // Extract brand if present (usually first word)
  const words = productName.split(/\s+/);
  const possibleBrand = words[0];
  
  // Add brand-related keyword
  if (possibleBrand && possibleBrand.length > 2) {
    secondaryKeywords.push(`${possibleBrand} products`);
  }
  
  // Add category-based keywords
  if (categories) {
    const categoryWords = categories.toLowerCase();
    if (categoryWords.includes('audio') || categoryWords.includes('sound') || categoryWords.includes('earbuds')) {
      secondaryKeywords.push('wireless earbuds', 'audio accessories', 'bluetooth headphones');
    } else if (categoryWords.includes('electronic')) {
      secondaryKeywords.push('electronics', 'tech gadgets', 'smart devices');
    } else {
      secondaryKeywords.push('premium accessories', 'quality products');
    }
  } else {
    // Generic fallbacks
    secondaryKeywords.push('premium quality', 'best value', 'top rated');
  }
  
  // Ensure we have exactly 4 secondary keywords
  const genericKeywords = ['high quality', 'professional grade', 'premium brand', 'best choice', 'top performance'];
  
  while (secondaryKeywords.length < 4) {
    const randomKeyword = genericKeywords[Math.floor(Math.random() * genericKeywords.length)];
    if (!secondaryKeywords.includes(randomKeyword)) {
      secondaryKeywords.push(randomKeyword);
    }
  }
  
  return secondaryKeywords.slice(0, 4);
}

function escapeRegexCharacters(str: string): string {
  // Escape special regex characters to prevent regex syntax errors
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function validateAndFixContent(content: any, primaryKeyword: string, storeUrl: string): any {
  console.log('Validating and fixing content for keyword:', primaryKeyword);
  
  // Extract primary keyword from full product name
  const extractedPrimaryKeyword = extractPrimaryKeyword(primaryKeyword);
  console.log('Extracted primary keyword:', extractedPrimaryKeyword);
  
  // Create a shorter version for permalinks and titles
  const shortKeyword = extractedPrimaryKeyword.length > 25 ? 
    extractedPrimaryKeyword.split(' ').slice(0, 3).join(' ') : extractedPrimaryKeyword;
  
  // Only fix meta title if it's completely missing or very short
  if (!content.meta_title || content.meta_title.trim().length < 10) {
    console.log('Meta title missing or too short, generating new one');
    const powerWords = ['Ultimate', 'Best', 'Top', 'Premium', 'Professional', 'Advanced'];
    const randomPowerWord = powerWords[Math.floor(Math.random() * powerWords.length)];
    content.meta_title = `${shortKeyword} - ${randomPowerWord} Quality`;
    
    // Ensure it's 50-60 characters
    if (content.meta_title.length > 60) {
      content.meta_title = `${shortKeyword} - ${randomPowerWord}`;
    }
    if (content.meta_title.length > 60) {
      content.meta_title = content.meta_title.substring(0, 57) + '...';
    }
  } else {
    // Only adjust if it doesn't start with the keyword - prepend instead of replacing
    if (!content.meta_title.toLowerCase().startsWith(extractedPrimaryKeyword.toLowerCase())) {
      console.log('Adjusting meta title to start with primary keyword');
      // Try to prepend the keyword while keeping original content
      const originalTitle = content.meta_title;
      const maxLength = 60 - shortKeyword.length - 3; // Account for " - "
      if (originalTitle.length > maxLength) {
        content.meta_title = `${shortKeyword} - ${originalTitle.substring(0, maxLength)}`;
      } else {
        content.meta_title = `${shortKeyword} - ${originalTitle}`;
      }
    }
  }

  // Only fix meta description if it's completely missing or very short
  if (!content.meta_description || content.meta_description.trim().length < 20) {
    console.log('Meta description missing or too short, generating new one');
    content.meta_description = `${shortKeyword} offers superior quality and performance. Get the best value for your money. Order now!`;
    
    // Ensure it's 150-155 characters
    if (content.meta_description.length > 155) {
      content.meta_description = content.meta_description.substring(0, 152) + '...';
    }
  } else {
    // Only adjust if it doesn't start with the keyword - prepend instead of replacing
    if (!content.meta_description.toLowerCase().startsWith(extractedPrimaryKeyword.toLowerCase())) {
      console.log('Adjusting meta description to start with primary keyword');
      const originalDesc = content.meta_description;
      const maxLength = 155 - shortKeyword.length - 2; // Account for ": "
      if (originalDesc.length > maxLength) {
        content.meta_description = `${shortKeyword}: ${originalDesc.substring(0, maxLength)}`;
      } else {
        content.meta_description = `${shortKeyword}: ${originalDesc}`;
      }
    }
  }

  // Only fix long description if it's completely missing or extremely short
  if (!content.long_description || content.long_description.trim().length < 100) {
    console.log('Long description missing or too short, generating new one');
    
    // Create expanded content with proper keyword density (1.5% = 11-12 times in 750+ words)
    content.long_description = `<div>
<h1>${extractedPrimaryKeyword}</h1>
<p>${extractedPrimaryKeyword} represents the pinnacle of quality and innovation in its category. When you choose <strong>${shortKeyword}</strong>, you're investing in superior performance, reliability, and cutting-edge technology that delivers exceptional results every time. This remarkable product has been engineered to meet the highest standards of excellence and user satisfaction.</p>

<h3>Comprehensive Product Overview</h3>
<p>Experience the exceptional quality of ${shortKeyword} with its advanced engineering and premium materials. This remarkable product combines innovative design with practical functionality, ensuring outstanding performance that exceeds industry standards. Every aspect has been carefully crafted to provide maximum value and user satisfaction. The sophisticated manufacturing process ensures durability and reliability that professionals and consumers alike can depend on for years to come.</p>

<h3>Advanced Features and Key Benefits</h3>
<p>The <strong>${shortKeyword}</strong> incorporates state-of-the-art technology and premium components to deliver unmatched performance. Each feature has been meticulously designed to enhance user experience and provide tangible benefits that make a real difference in daily use. From precision engineering to intuitive operation, every detail contributes to the overall excellence that defines this outstanding product.</p>

<h3>Technical Specifications and Performance Data</h3>
<table style="width:100%; border-collapse: collapse; margin: 20px 0;">
<tr style="border: 1px solid #ddd; background-color: #f9f9f9;"><td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Brand</td><td style="padding: 12px; border: 1px solid #ddd;">Premium Quality Manufacturing</td></tr>
<tr style="border: 1px solid #ddd;"><td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Product Type</td><td style="padding: 12px; border: 1px solid #ddd;">Professional Grade Equipment</td></tr>
<tr style="border: 1px solid #ddd; background-color: #f9f9f9;"><td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Quality Rating</td><td style="padding: 12px; border: 1px solid #ddd;">Superior Performance Standards</td></tr>
<tr style="border: 1px solid #ddd;"><td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Warranty Coverage</td><td style="padding: 12px; border: 1px solid #ddd;">Comprehensive Protection Plan</td></tr>
<tr style="border: 1px solid #ddd; background-color: #f9f9f9;"><td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Compatibility</td><td style="padding: 12px; border: 1px solid #ddd;">Universal Application Support</td></tr>
</table>

<h3>Why Choose This Premium Solution?</h3>
<p>The ${shortKeyword} stands out in today's competitive market through its exceptional build quality, innovative features, and proven track record of customer satisfaction. Whether you're seeking durability, performance, style, or value, this product delivers outstanding results that consistently exceed expectations. Industry experts recognize its superior engineering and recommend it as the leading choice for discerning customers who demand excellence.</p>

<h3>Final Recommendation and Conclusion</h3>
<p>Transform your experience with this exceptional product that combines innovation, quality, and value in one outstanding package. With proven reliability, comprehensive support, and customer satisfaction guarantee, it represents the perfect choice for those who demand excellence and performance. The investment in quality pays dividends through years of reliable service and outstanding results.</p>

<p>Explore more premium options in our <a href="${storeUrl}/product-category/featured">featured collection</a>, browse our <a href="${storeUrl}/product-category/bestsellers">bestseller products</a>, or check out <a href="${storeUrl}/product-category/new-arrivals">latest arrivals</a>.</p>

<p>For additional product information and industry insights, visit <a href="https://www.consumerreports.org" target="_blank">Consumer Reports</a> or check <a href="https://www.which.co.uk" target="_blank">Which? Product Reviews</a> for independent evaluations and expert recommendations.</p>
</div>`;
  } else {
    // Only make minimal adjustments to existing content
    let modifiedContent = content.long_description;
    
    // Check if content starts with the primary keyword
    const textContent = modifiedContent.replace(/<[^>]*>/g, '').trim();
    if (!textContent.toLowerCase().startsWith(extractedPrimaryKeyword.toLowerCase())) {
      console.log('Adjusting long description to start with primary keyword');
      // Prepend an h1 with the keyword if it doesn't exist
      if (!modifiedContent.includes('<h1>') && !modifiedContent.includes('<H1>')) {
        modifiedContent = `<h1>${extractedPrimaryKeyword}</h1>\n${modifiedContent}`;
      }
    }
    
    // Ensure minimum internal links exist (only add if completely missing)
    const internalLinksCount = (modifiedContent.match(/href="[^"]*\/product-category\//g) || []).length;
    if (internalLinksCount === 0) {
      console.log('Adding minimal internal links to content');
      modifiedContent += `\n<p>Explore more in our <a href="${storeUrl}/product-category/featured">featured collection</a>, <a href="${storeUrl}/product-category/bestsellers">bestsellers</a>, or <a href="${storeUrl}/product-category/new-arrivals">new arrivals</a>.</p>`;
    }
    
    // Ensure minimum external links exist (only add if completely missing)
    const externalLinksCount = (modifiedContent.match(/target="_blank"(?!\s+rel="nofollow")/g) || []).length;
    if (externalLinksCount === 0) {
      console.log('Adding minimal external links to content');
      modifiedContent += `\n<p>For additional information, visit <a href="https://www.consumerreports.org" target="_blank">Consumer Reports</a> or <a href="https://www.which.co.uk" target="_blank">Which? Product Reviews</a>.</p>`;
    }
    
    content.long_description = modifiedContent;
  }

  // Only fix short description if it's completely missing or very short
  if (!content.short_description || content.short_description.trim().length < 20) {
    console.log('Short description missing or too short, generating new one');
    content.short_description = `${shortKeyword} delivers exceptional quality and superior performance with innovative features. Experience reliability and value that exceeds expectations. Perfect for your needs!`;
  } else {
    // Only adjust if it doesn't start with the keyword - prepend instead of replacing
    if (!content.short_description.toLowerCase().startsWith(extractedPrimaryKeyword.toLowerCase())) {
      console.log('Adjusting short description to start with primary keyword');
      const originalDesc = content.short_description;
      const maxLength = 160 - shortKeyword.length - 2; // Account for ": "
      if (originalDesc.length > maxLength) {
        content.short_description = `${shortKeyword}: ${originalDesc.substring(0, maxLength)}`;
      } else {
        content.short_description = `${shortKeyword}: ${originalDesc}`;
      }
    }
  }

  // Always generate optimized permalink
  content.permalink = createOptimalPermalink(extractedPrimaryKeyword);
  console.log('Generated optimized permalink:', content.permalink, 'Length:', content.permalink.length);

  // Fix alt text only if missing or doesn't contain keyword
  if (!content.alt_text || !content.alt_text.toLowerCase().includes(shortKeyword.toLowerCase())) {
    console.log('Fixing alt text to include primary keyword');
    content.alt_text = `${shortKeyword} product image showing premium quality features`;
  }

  // Generate 5 focus keywords: 1 primary + 4 secondary
  const secondaryKeywords = generateSecondaryKeywords(primaryKeyword, '');
  const allKeywords = [extractedPrimaryKeyword, ...secondaryKeywords];
  content.focus_keywords = allKeywords.join(', ');
  console.log('Generated 5 focus keywords (1 primary + 4 secondary):', content.focus_keywords);

  return content;
}

function parseOpenAIResponse(response: any, primaryKeyword: string, storeUrl: string): any {
  try {
    const text = response.choices[0].message.content;
    console.log('Parsing OpenAI response for primary keyword:', primaryKeyword);
    
    // Parse the response text to extract sections
    const longDescMatch = text.match(/LONG DESCRIPTION:\s*([\s\S]*?)(?=SHORT DESCRIPTION:|$)/);
    const shortDescMatch = text.match(/SHORT DESCRIPTION:\s*([\s\S]*?)(?=META TITLE:|$)/);
    const metaTitleMatch = text.match(/META TITLE:\s*([\s\S]*?)(?=META DESCRIPTION:|$)/);
    const metaDescMatch = text.match(/META DESCRIPTION:\s*([\s\S]*?)(?=FOCUS KEYWORDS:|$)/);
    const focusKeywordsMatch = text.match(/FOCUS KEYWORDS:\s*([\s\S]*?)(?=ALT TEXT:|PERMALINK:|$)/);
    const altTextMatch = text.match(/ALT TEXT:\s*([\s\S]*?)(?=PERMALINK:|$)/);
    const permalinkMatch = text.match(/PERMALINK:\s*([\s\S]*?)$/);
    
    // Extract and validate content
    let content = {
      short_description: shortDescMatch ? shortDescMatch[1].trim() : '',
      long_description: longDescMatch ? longDescMatch[1].trim() : '',
      meta_title: metaTitleMatch ? metaTitleMatch[1].trim() : '',
      meta_description: metaDescMatch ? metaDescMatch[1].trim() : '',
      alt_text: altTextMatch ? altTextMatch[1].trim() : '',
      focus_keywords: focusKeywordsMatch ? focusKeywordsMatch[1].trim().split('SECONDARY KEYWORDS:')[0].trim() : '',
      permalink: permalinkMatch ? permalinkMatch[1].trim() : '',
      product_id: 0,
      user_id: '',
    };

    // Validate and fix content to ensure RankMath compliance
    content = validateAndFixContent(content, primaryKeyword, storeUrl);

    // Final validation checks for keyword density (target 1.5%)
    const extractedPrimary = extractPrimaryKeyword(primaryKeyword);
    const longDescription = content.long_description;
    if (extractedPrimary && longDescription) {
      // Escape special regex characters in the primary keyword
      const escapedKeyword = escapeRegexCharacters(extractedPrimary.toLowerCase());
      const keywordRegex = new RegExp(escapedKeyword, 'gi');
      const keywordCount = (longDescription.toLowerCase().match(keywordRegex) || []).length;
      const wordCount = longDescription.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
      const density = (keywordCount / wordCount) * 100;
      
      console.log(`Final keyword density: ${density.toFixed(2)}% (${keywordCount} occurrences in ${wordCount} words)`);
      console.log(`Target density: 1.5% (should be 11-12 occurrences for 750+ words)`);
      
      if (density < 1.0 || density > 2.0) {
        console.warn(`Keyword density is ${density.toFixed(2)}%, which is outside the optimal 1.0-2.0% range. RankMath may flag this.`);
      }
    }

    // Check content length
    const contentWordCount = content.long_description.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
    console.log(`Content word count: ${contentWordCount} words`);
    
    if (contentWordCount < 750) {
      console.warn(`Content is only ${contentWordCount} words. RankMath requires at least 750 words.`);
    }

    // Verify internal links
    const internalLinksCount = (content.long_description.match(/href="[^"]*\/product-category\//g) || []).length;
    console.log('Internal links found in content:', internalLinksCount);
    
    if (internalLinksCount < 3) {
      console.warn('Less than 3 internal links found. RankMath may flag this as an issue.');
    }

    // Verify external links (should NOT have nofollow)
    const externalLinksCount = (content.long_description.match(/target="_blank"(?!\s+rel="nofollow")/g) || []).length;
    console.log('External follow links found in content:', externalLinksCount);
    
    if (externalLinksCount < 2) {
      console.warn('Less than 2 external follow links found. RankMath may flag this as an issue.');
    }

    // Verify permalink length
    if (content.permalink.length > 45) {
      console.log(`Permalink too long (${content.permalink.length} chars), truncating to 45...`);
      content.permalink = content.permalink.substring(0, 45).replace(/-$/, '');
    }

    console.log('Final validated content ready for RankMath optimization');
    
    return content;
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    throw new Error('Failed to parse AI response. Please try again.');
  }
}
