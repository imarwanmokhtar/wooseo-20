
import { WooCommerceCredentials, Category, Product, SeoContent } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export async function saveWooCommerceCredentials(
  userId: string, 
  credentials: WooCommerceCredentials
): Promise<void> {
  const { error } = await supabase
    .from('woocommerce_credentials')
    .upsert({
      user_id: userId,
      store_name: credentials.store_name,
      store_url: credentials.url,
      consumer_key: credentials.consumer_key,
      consumer_secret: credentials.consumer_secret,
    });

  if (error) throw error;
}

export async function getWooCommerceCredentials(userId: string, storeId?: string): Promise<WooCommerceCredentials | null> {
  if (!storeId) {
    console.error('No store ID provided for getWooCommerceCredentials');
    return null;
  }

  console.log('Fetching credentials for store ID:', storeId, 'user:', userId);

  const { data, error } = await supabase
    .from('woocommerce_credentials')
    .select('*')
    .eq('user_id', userId)
    .eq('id', storeId)
    .single();

  if (error) {
    console.error('Error fetching credentials for store:', storeId, error);
    return null;
  }

  if (!data) {
    console.error('No credentials found for store:', storeId);
    return null;
  }

  console.log('Successfully fetched credentials for store:', data.store_name);
  
  return {
    id: data.id,
    store_name: data.store_name,
    url: data.store_url,
    consumer_key: data.consumer_key,
    consumer_secret: data.consumer_secret,
    version: 'wc/v3',
    user_id: data.user_id,
    is_active: data.is_active,
    created_at: data.created_at,
    updated_at: data.updated_at,
  } as WooCommerceCredentials;
}

export async function updateCredits(userId: string, creditsToAdd: number): Promise<boolean> {
  try {
    console.log(`Updating credits for user ${userId}: adding ${creditsToAdd} credits`);
    
    // First get current credits
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching current credits:', fetchError);
      return false;
    }

    const newCredits = (currentUser?.credits || 0) + creditsToAdd;
    console.log(`Current credits: ${currentUser?.credits}, New total: ${newCredits}`);

    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: newCredits })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating credits:', updateError);
      return false;
    }

    console.log('Credits updated successfully');
    return true;
  } catch (error) {
    console.error('Error in updateCredits:', error);
    return false;
  }
}

// Detect which SEO plugin is active on the WordPress site
export async function detectSeoPlugin(credentials: WooCommerceCredentials): Promise<string | null> {
  try {
    console.log('Detecting active SEO plugin...');
    
    // Check for active plugins via WordPress REST API
    const pluginsUrl = `${credentials.url}/wp-json/wp/v2/plugins`;
    const auth = btoa(`${credentials.consumer_key}:${credentials.consumer_secret}`);

    try {
      const response = await fetch(pluginsUrl, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const plugins = await response.json();
        console.log('Found plugins:', plugins);
        
        // Check for each SEO plugin
        for (const plugin of plugins) {
          if (plugin.status === 'active') {
            if (plugin.plugin.includes('seo-by-rank-math') || plugin.name.toLowerCase().includes('rank math')) {
              console.log('Detected RankMath SEO plugin');
              return 'rankmath';
            }
            if (plugin.plugin.includes('wordpress-seo') || plugin.name.toLowerCase().includes('yoast')) {
              console.log('Detected Yoast SEO plugin');
              return 'yoast';
            }
            if (plugin.plugin.includes('all-in-one-seo-pack') || plugin.name.toLowerCase().includes('all in one seo')) {
              console.log('Detected All in One SEO plugin');
              return 'aioseo';
            }
          }
        }
      }
    } catch (pluginError) {
      console.log('Plugin detection via API failed, trying alternative method...');
    }

    // Alternative: Check for plugin-specific meta fields in a sample product
    const sampleProductUrl = `${credentials.url}/wp-json/${credentials.version}/products?per_page=1`;
    const sampleResponse = await fetch(sampleProductUrl, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (sampleResponse.ok) {
      const products = await sampleResponse.json();
      if (products.length > 0) {
        const metaData = products[0].meta_data || [];
        
        // Check for plugin-specific meta keys
        const metaKeys = metaData.map((meta: any) => meta.key);
        
        if (metaKeys.some((key: string) => key.startsWith('rank_math_'))) {
          console.log('Detected RankMath SEO (via meta fields)');
          return 'rankmath';
        }
        if (metaKeys.some((key: string) => key.startsWith('_yoast_wpseo_'))) {
          console.log('Detected Yoast SEO (via meta fields)');
          return 'yoast';
        }
        if (metaKeys.some((key: string) => key.startsWith('_aioseo_'))) {
          console.log('Detected All in One SEO (via meta fields)');
          return 'aioseo';
        }
      }
    }

    console.log('No SEO plugin detected, using default meta fields');
    return null;
  } catch (error) {
    console.error('Error detecting SEO plugin:', error);
    return null;
  }
}

// Generate SEO meta data based on selected plugin
export function generateSeoMetaData(seoContent: SeoContent, seoPlugin: string | null): Array<{ key: string; value: string }> {
  const focusKeywords = seoContent.focus_keywords || '';
  const keywordArray = focusKeywords.split(',').map(k => k.trim()).filter(k => k);
  const primaryFocusKeyword = keywordArray[0] || '';
  
  console.log('Generating meta data for SEO plugin:', seoPlugin);
  console.log('Focus keywords:', focusKeywords);
  console.log('Keyword array:', keywordArray);

  const metaData: Array<{ key: string; value: string }> = [];

  // Standard WordPress meta fields (always include these)
  metaData.push(
    { key: '_wp_page_template', value: 'default' },
    { key: 'product_seo_title', value: seoContent.meta_title },
    { key: 'product_seo_description', value: seoContent.meta_description },
    { key: 'product_seo_keywords', value: focusKeywords }
  );

  switch (seoPlugin) {
    case 'rankmath':
      console.log('Adding RankMath SEO meta fields');
      metaData.push(
        { key: 'rank_math_title', value: seoContent.meta_title },
        { key: 'rank_math_description', value: seoContent.meta_description },
        { key: 'rank_math_focus_keyword', value: focusKeywords },
        { key: 'rank_math_pillar_content', value: 'off' },
        { key: 'rank_math_robots', value: 'index,follow' },
        ...keywordArray.map((keyword, index) => ({
          key: `rank_math_focus_keyword_${index + 1}`,
          value: keyword
        }))
      );
      break;

    case 'yoast':
      console.log('Adding Yoast SEO meta fields with all focus keywords');
      metaData.push(
        { key: '_yoast_wpseo_title', value: seoContent.meta_title },
        { key: '_yoast_wpseo_metadesc', value: seoContent.meta_description },
        { key: '_yoast_wpseo_focuskw', value: primaryFocusKeyword },
        { key: '_yoast_wpseo_canonical', value: '' },
        { key: '_yoast_wpseo_meta-robots-noindex', value: '0' },
        { key: '_yoast_wpseo_meta-robots-nofollow', value: '0' },
        { key: '_yoast_wpseo_meta-robots-adv', value: 'none' },
        { key: '_yoast_wpseo_bctitle', value: seoContent.meta_title },
        { key: '_yoast_wpseo_opengraph-title', value: seoContent.meta_title },
        { key: '_yoast_wpseo_opengraph-description', value: seoContent.meta_description },
        { key: '_yoast_wpseo_twitter-title', value: seoContent.meta_title },
        { key: '_yoast_wpseo_twitter-description', value: seoContent.meta_description }
      );

      // Add ALL focus keywords for Yoast SEO - using multiple approaches for better compatibility
      keywordArray.forEach((keyword, index) => {
        // Add individual keyword fields
        metaData.push({ key: `_yoast_wpseo_focuskeyword_${index + 1}`, value: keyword });
        metaData.push({ key: `_yoast_wpseo_keyword_${index + 1}`, value: keyword });
        
        // Yoast Premium additional keyword fields
        if (index > 0) {
          metaData.push({ key: `_yoast_wpseo_focuskw_${index}`, value: keyword });
        }
      });

      // Add all keywords in various formats for maximum compatibility
      metaData.push(
        { key: '_yoast_wpseo_focuskeywords', value: focusKeywords },
        { key: '_yoast_wpseo_keywords', value: focusKeywords },
        { key: '_yoast_wpseo_focus_keywords', value: focusKeywords },
        { key: '_yoast_wpseo_additional_keyphrases', value: focusKeywords }
      );
      
      console.log(`Added ${keywordArray.length} focus keywords to Yoast SEO with multiple field formats`);
      console.log('Yoast meta fields added:', metaData.filter(m => m.key.includes('yoast')).map(m => `${m.key}: ${m.value}`));
      break;

    case 'aioseo':
      console.log('Adding All in One SEO meta fields - NOTE: Custom post types require AIOSEO Pro');
      metaData.push(
        { key: '_aioseo_title', value: seoContent.meta_title },
        { key: '_aioseo_description', value: seoContent.meta_description },
        { key: '_aioseo_focus_keyword', value: primaryFocusKeyword }
      );

      // Add all focus keywords for AIOSEO
      if (keywordArray.length > 1) {
        metaData.push({ key: '_aioseo_keyphrases', value: focusKeywords });
      }
      break;

    default:
      console.log('Using default/universal SEO meta fields');
      // Add universal meta fields that work with most themes and plugins
      metaData.push(
        { key: 'seo_title', value: seoContent.meta_title },
        { key: 'seo_description', value: seoContent.meta_description },
        { key: 'seo_keywords', value: focusKeywords },
        { key: 'meta_title', value: seoContent.meta_title },
        { key: 'meta_description', value: seoContent.meta_description },
        { key: 'meta_keywords', value: focusKeywords },
        { key: 'focus_keywords', value: focusKeywords },
        { key: 'ai_generated_seo', value: 'true' }
      );
      break;
  }

  // Add image alt text fields (universal)
  const imageAltText = seoContent.alt_text || seoContent.meta_title;
  metaData.push(
    { key: '_wp_attachment_image_alt', value: imageAltText },
    { key: 'product_image_caption', value: imageAltText },
    { key: 'product_image_description', value: imageAltText },
    { key: '_wp_attachment_image_caption', value: imageAltText },
    { key: '_wp_attachment_image_description', value: imageAltText }
  );

  console.log('Total meta fields generated:', metaData.length);
  console.log('Meta fields:', metaData.map(m => `${m.key}: ${m.value.substring(0, 50)}...`));

  return metaData;
}

export async function testConnection(credentials: WooCommerceCredentials): Promise<boolean> {
  try {
    console.log('Testing WooCommerce connection with:', {
      url: credentials.url,
      version: credentials.version,
      hasConsumerKey: !!credentials.consumer_key,
      hasConsumerSecret: !!credentials.consumer_secret
    });

    // Try multiple endpoints to test connection
    const endpoints = [
      `${credentials.url}/wp-json/${credentials.version}/products?per_page=1`,
      `${credentials.url}/wp-json/${credentials.version}/products/categories?per_page=1`,
      `${credentials.url}/wp-json/wc/v3/products?per_page=1` // Fallback to wc/v3
    ];

    const auth = btoa(`${credentials.consumer_key}:${credentials.consumer_secret}`);

    for (const url of endpoints) {
      try {
        console.log('Testing endpoint:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const data = await response.json();
          console.log('Connection successful with endpoint:', url);
          console.log('Sample data:', data);
          return true;
        } else {
          const errorText = await response.text();
          console.log('Response error:', response.status, errorText);
        }
      } catch (endpointError) {
        console.log('Endpoint error:', endpointError);
        continue; // Try next endpoint
      }
    }

    return false;
  } catch (error) {
    console.error('Error testing WooCommerce connection:', error);
    return false;
  }
}

export async function fetchCategories(credentials: WooCommerceCredentials): Promise<Category[]> {
  try {
    const url = `${credentials.url}/wp-json/${credentials.version}/products/categories?per_page=100`;
    const auth = btoa(`${credentials.consumer_key}:${credentials.consumer_secret}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch categories');
    const data = await response.json();
    return data as Category[];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function fetchProducts(
  credentials: WooCommerceCredentials,
  params: {
    category?: number[];
    search?: string;
    page?: number;
    per_page?: number;
    include?: number[];
  }
): Promise<{ products: Product[]; total: number; totalPages: number }> {
  try {
    console.log('Fetching products with params:', params);
    
    let url = `${credentials.url}/wp-json/${credentials.version}/products?`;
    
    // Handle multiple categories
    if (params.category && params.category.length > 0) {
      url += `&category=${params.category.join(',')}`;
      console.log('Added category filter:', params.category);
    }
    
    // Search only in product titles using the 'search' parameter
    if (params.search && params.search.trim()) {
      url += `&search=${encodeURIComponent(params.search.trim())}`;
      console.log('Added search filter:', params.search.trim());
    }
    
    if (params.include && params.include.length > 0) {
      url += `&include=${params.include.join(',')}`;
    }
    
    url += `&page=${params.page || 1}&per_page=${params.per_page || 10}`;
    
    console.log('Final products URL:', url);
    
    const auth = btoa(`${credentials.consumer_key}:${credentials.consumer_secret}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Products fetch failed:', response.status, errorText);
      throw new Error(`Failed to fetch products: ${response.status} ${errorText}`);
    }
    
    const products = await response.json();
    
    // Get pagination info from response headers
    const total = parseInt(response.headers.get('X-WP-Total') || '0', 10);
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0', 10);

    console.log(`Fetched ${products.length} products, total: ${total}, pages: ${totalPages}`);

    // If we have a search term, we might need to do additional filtering on the frontend
    // since WooCommerce search might not be as precise as we want
    let filteredProducts = products;
    if (params.search && params.search.trim()) {
      const searchTerm = params.search.trim().toLowerCase();
      filteredProducts = products.filter((product: Product) => 
        product.name.toLowerCase().includes(searchTerm)
      );
      console.log(`Frontend filtered ${filteredProducts.length} products by title containing "${searchTerm}"`);
    }

    // When we filter on frontend, we need to recalculate pagination
    // But we should respect the original API pagination for category filters
    if (params.search && params.search.trim() && filteredProducts.length !== products.length) {
      // For search results that we filter on frontend, recalculate pagination
      const perPage = params.per_page || 10;
      const filteredTotal = filteredProducts.length;
      const filteredTotalPages = Math.ceil(filteredTotal / perPage);
      
      return {
        products: filteredProducts,
        total: filteredTotal,
        totalPages: filteredTotalPages,
      };
    }

    // For category filters or no search, use the API pagination data
    return {
      products: filteredProducts,
      total: total,
      totalPages: totalPages,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      products: [],
      total: 0,
      totalPages: 0,
    };
  }
}

export async function updateProductSeo(
  credentials: WooCommerceCredentials,
  productId: number,
  data: {
    short_description?: string;
    description?: string;
    meta_data?: Array<{ key: string; value: string }>;
    images?: Array<{ id?: number; src?: string; alt?: string }>;
  }
): Promise<boolean> {
  try {
    const url = `${credentials.url}/wp-json/${credentials.version}/products/${productId}`;
    const auth = btoa(`${credentials.consumer_key}:${credentials.consumer_secret}`);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response.ok;
  } catch (error) {
    console.error('Error updating product SEO:', error);
    return false;
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

export async function updateProductWithSeoContent(
  credentials: WooCommerceCredentials,
  productId: number,
  seoContent: SeoContent,
  selectedPlugin?: string | null
): Promise<{ success: boolean; seoPlugin?: string | null }> {
  try {
    console.log('Updating WooCommerce product with comprehensive SEO content:', productId);
    console.log('Using selected SEO plugin:', selectedPlugin || 'universal fields');

    // Generate permalink from meta title (max 50 characters)
    const permalink = seoContent.permalink || generatePermalink(seoContent.meta_title);
    console.log('Using permalink:', permalink);

    // Generate appropriate meta data based on selected plugin
    const metaData = generateSeoMetaData(seoContent, selectedPlugin || null);

    const updateData = {
      short_description: seoContent.short_description,
      description: seoContent.long_description,
      slug: permalink,
      meta_data: metaData
    };

    console.log('Sending update data to WooCommerce:', updateData);
    console.log(`Using ${selectedPlugin || 'universal'} SEO fields`);
    console.log('Generated permalink (50 chars max):', permalink);
    console.log('Meta data being sent:', JSON.stringify(metaData, null, 2));

    const success = await updateProductSeo(credentials, productId, updateData);
    
    if (success) {
      console.log(`Product updated successfully in WooCommerce with ${selectedPlugin || 'universal'} SEO fields`);
      console.log('Permalink set to:', permalink);
      
      // Also update product images with alt text
      const imageAltText = seoContent.alt_text || seoContent.meta_title;
      await updateProductImages(credentials, productId, imageAltText);
    } else {
      console.error('Failed to update product in WooCommerce');
    }

    return { success, seoPlugin: selectedPlugin || null };
  } catch (error) {
    console.error('Error updating product with SEO content:', error);
    return { success: false };
  }
}

export async function updateProductImages(
  credentials: WooCommerceCredentials,
  productId: number,
  altText: string
): Promise<boolean> {
  try {
    console.log('Updating product images with alt text, caption, and description:', productId);
    
    // First, get the current product to see existing images
    const productUrl = `${credentials.url}/wp-json/${credentials.version}/products/${productId}`;
    const auth = btoa(`${credentials.consumer_key}:${credentials.consumer_secret}`);

    const getResponse = await fetch(productUrl, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!getResponse.ok) {
      console.error('Failed to fetch product for image update');
      return false;
    }

    const product = await getResponse.json();
    
    if (product.images && product.images.length > 0) {
      // Update images with alt text, caption, and description
      const updatedImages = product.images.map((image: any) => ({
        id: image.id,
        src: image.src,
        alt: altText,
        name: altText, // Image title/name
        caption: altText, // Image caption
        description: altText, // Image description
      }));

      const updateResponse = await fetch(productUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: updatedImages
        }),
      });

      if (updateResponse.ok) {
        console.log('Product images updated with alt text, caption, and description successfully');
        return true;
      }
    }

    return true; // Return true even if no images to update
  } catch (error) {
    console.error('Error updating product images:', error);
    return true; // Don't fail the whole process if image update fails
  }
}

export async function saveSeoContent(
  userId: string,
  content: SeoContent
): Promise<SeoContent> {
  // Since we removed the generated_content table, we'll just return the content as-is
  // This maintains the function interface but doesn't persist to database
  console.log('saveSeoContent called but not persisting to database (generated_content table removed)');
  
  return {
    ...content,
    id: Date.now(), // Generate a temporary ID for consistency
    created_at: new Date().toISOString(),
    user_id: userId,
  };
}

export async function getSavedSeoContent(
  userId: string,
  productId: number
): Promise<SeoContent | null> {
  // Since we removed the generated_content table, we'll return null
  // This maintains the function interface but doesn't fetch from database
  console.log('getSavedSeoContent called but returning null (generated_content table removed)');
  return null;
}
