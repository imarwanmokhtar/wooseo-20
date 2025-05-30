import { WooCommerceCredentials, Brand, Category, Product, SeoContent } from '@/types';
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

export async function fetchBrands(credentials: WooCommerceCredentials): Promise<Brand[]> {
  try {
    const url = `${credentials.url}/wp-json/${credentials.version}/products/attributes/1/terms?per_page=100`;
    const auth = btoa(`${credentials.consumer_key}:${credentials.consumer_secret}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch brands');
    const data = await response.json();
    return data as Brand[];
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
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
    category?: number;
    brand?: number;
    search?: string;
    page?: number;
    per_page?: number;
    include?: number[];
  }
): Promise<{ products: Product[]; total: number; totalPages: number }> {
  try {
    let url = `${credentials.url}/wp-json/${credentials.version}/products?`;
    
    if (params.category) url += `&category=${params.category}`;
    if (params.brand) url += `&attribute=1&attribute_term=${params.brand}`;
    if (params.search) url += `&search=${encodeURIComponent(params.search)}`;
    if (params.include && params.include.length > 0) {
      url += `&include=${params.include.join(',')}`;
    }
    
    url += `&page=${params.page || 1}&per_page=${params.per_page || 10}`;
    
    const auth = btoa(`${credentials.consumer_key}:${credentials.consumer_secret}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch products');
    
    const products = await response.json();
    const total = parseInt(response.headers.get('X-WP-Total') || '0', 10);
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0', 10);

    return {
      products,
      total,
      totalPages,
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
  seoContent: SeoContent
): Promise<boolean> {
  try {
    console.log('Updating WooCommerce product with comprehensive SEO content:', productId);
    console.log('All focus keywords to update:', seoContent.focus_keywords);

    // Parse all focus keywords
    const focusKeywords = seoContent.focus_keywords || '';
    const keywordArray = focusKeywords.split(',').map(k => k.trim()).filter(k => k);
    const primaryFocusKeyword = keywordArray[0] || '';
    
    console.log('Parsed keywords array:', keywordArray);
    console.log('Primary focus keyword for RankMath:', primaryFocusKeyword);

    // Generate permalink from meta title (max 50 characters)
    const permalink = seoContent.permalink || generatePermalink(seoContent.meta_title);
    console.log('Using permalink:', permalink);

    // Use the generated alt text for both alt text and image caption/description
    const imageAltText = seoContent.alt_text || seoContent.meta_title;
    console.log('Using alt text for images:', imageAltText);

    // Prepare comprehensive meta data for RankMath SEO - ensure all values are strings
    const metaData = [
      // RankMath SEO fields - use ALL focus keywords
      { key: 'rank_math_title', value: seoContent.meta_title },
      { key: 'rank_math_description', value: seoContent.meta_description },
      { key: 'rank_math_focus_keyword', value: focusKeywords }, // Send ALL keywords, not just primary
      { key: 'rank_math_pillar_content', value: 'off' },
      { key: 'rank_math_robots', value: 'index,follow' }, // Convert array to comma-separated string
      // Store individual keywords for RankMath (it can handle multiple)
      ...keywordArray.map((keyword, index) => ({
        key: `rank_math_focus_keyword_${index + 1}`,
        value: keyword
      })),
      // Yoast SEO compatibility
      { key: '_yoast_wpseo_title', value: seoContent.meta_title },
      { key: '_yoast_wpseo_metadesc', value: seoContent.meta_description },
      { key: '_yoast_wpseo_focuskw', value: primaryFocusKeyword },
      // Image alt text, caption, and description using the generated alt text
      { key: '_wp_attachment_image_alt', value: imageAltText },
      { key: 'product_image_caption', value: imageAltText },
      { key: 'product_image_description', value: imageAltText },
      { key: '_wp_attachment_image_caption', value: imageAltText },
      { key: '_wp_attachment_image_description', value: imageAltText },
      // Additional SEO meta fields
      { key: 'seo_focus_keywords', value: focusKeywords },
      { key: 'ai_generated_keywords', value: focusKeywords },
      // Permalink (slug)
      { key: '_wp_slug', value: permalink },
    ];

    const updateData = {
      short_description: seoContent.short_description,
      description: seoContent.long_description,
      slug: permalink, // WooCommerce product slug
      meta_data: metaData
    };

    console.log('Sending update data to WooCommerce:', updateData);
    console.log('All focus keywords being sent:', focusKeywords);
    console.log('Generated permalink (50 chars max):', permalink);

    const success = await updateProductSeo(credentials, productId, updateData);
    
    if (success) {
      console.log('Product updated successfully in WooCommerce with all focus keywords:', focusKeywords);
      console.log('Permalink set to:', permalink);
      
      // Also update product images with alt text, caption, and description
      await updateProductImages(credentials, productId, imageAltText);
    } else {
      console.error('Failed to update product in WooCommerce');
    }

    return success;
  } catch (error) {
    console.error('Error updating product with SEO content:', error);
    return false;
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
