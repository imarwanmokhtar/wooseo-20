import { Product } from '@/types';
import { ProductContentHealth, ContentHealthCheck, ContentHealthSummary, ContentHealthSettings } from '@/types/contentHealth';

const DEFAULT_SETTINGS: ContentHealthSettings = {
  min_meta_description_length: 120,
  min_short_description_words: 20,
  check_gallery_images: true,
  auto_detect_interval: 24,
  auto_generate_missing: false,
  email_notifications: false,
  email_threshold: 10,
};

export class ContentHealthAnalyzer {
  private settings: ContentHealthSettings;

  constructor(settings?: Partial<ContentHealthSettings>) {
    this.settings = { ...DEFAULT_SETTINGS, ...settings };
  }

  analyzeProduct(product: Product): ProductContentHealth {
    const checks: ContentHealthCheck[] = [];
    const missing_fields: string[] = [];

    // Check Long Description
    const longDescCheck = this.checkLongDescription(product);
    checks.push(longDescCheck);
    if (longDescCheck.status !== 'complete') {
      missing_fields.push('Long Description');
    }

    // Check Short Description
    const shortDescCheck = this.checkShortDescription(product);
    checks.push(shortDescCheck);
    if (shortDescCheck.status !== 'complete') {
      missing_fields.push('Short Description');
    }

    // Check Meta Title (check actual meta_data)
    const metaTitleCheck = this.checkMetaTitle(product);
    checks.push(metaTitleCheck);
    if (metaTitleCheck.status !== 'complete') {
      missing_fields.push('Meta Title');
    }

    // Check Meta Description (check actual meta_data)
    const metaDescCheck = this.checkMetaDescription(product);
    checks.push(metaDescCheck);
    if (metaDescCheck.status !== 'complete') {
      missing_fields.push('Meta Description');
    }

    // Check Image Alt Text
    const altTextCheck = this.checkImageAltText(product);
    checks.push(altTextCheck);
    if (altTextCheck.status !== 'complete') {
      missing_fields.push('Image Alt Text');
    }

    // Check Categories
    const categoriesCheck = this.checkCategories(product);
    checks.push(categoriesCheck);
    if (categoriesCheck.status !== 'complete') {
      missing_fields.push('Categories');
    }

    // Calculate overall status
    const overall_status = this.calculateOverallStatus(missing_fields.length);

    // Calculate basic SEO score
    const seo_score = this.calculateSeoScore(checks);

    return {
      product_id: product.id,
      product_name: product.name,
      overall_status,
      missing_fields,
      checks,
      last_checked: new Date().toISOString(),
      seo_score,
    };
  }

  private checkLongDescription(product: Product): ContentHealthCheck {
    const description = product.description || '';
    const wordCount = description.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
    
    if (!description || description.trim().length === 0) {
      return {
        field: 'Long Description',
        status: 'missing',
        reason: 'No description provided'
      };
    }

    if (description.toLowerCase().includes('lorem ipsum')) {
      return {
        field: 'Long Description',
        status: 'poor',
        reason: 'Contains placeholder text'
      };
    }

    if (wordCount < 50) {
      return {
        field: 'Long Description',
        status: 'poor',
        reason: `Too short (${wordCount} words, recommend 50+)`
      };
    }

    return {
      field: 'Long Description',
      status: 'complete'
    };
  }

  private checkShortDescription(product: Product): ContentHealthCheck {
    const shortDesc = product.short_description || '';
    const wordCount = shortDesc.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
    
    if (!shortDesc || shortDesc.trim().length === 0) {
      return {
        field: 'Short Description',
        status: 'missing',
        reason: 'No short description provided'
      };
    }

    if (wordCount < this.settings.min_short_description_words) {
      return {
        field: 'Short Description',
        status: 'poor',
        reason: `Too short (${wordCount} words, recommend ${this.settings.min_short_description_words}+)`
      };
    }

    return {
      field: 'Short Description',
      status: 'complete'
    };
  }

  private checkMetaTitle(product: Product): ContentHealthCheck {
    console.log(`Checking meta title for product: ${product.name} (ID: ${product.id})`);
    
    // First, check for actual SEO meta title in meta_data array
    const seoMetaTitle = this.getMetaValue(product, '_yoast_wpseo_title') || 
                        this.getMetaValue(product, '_aioseop_title') ||
                        this.getMetaValue(product, 'rank_math_title') ||
                        this.getMetaValue(product, '_genesis_title') ||
                        this.getMetaValue(product, '_su_title');
    
    console.log(`SEO meta title found: ${seoMetaTitle ? 'Yes' : 'No'}`);
    
    // If we found a specific SEO meta title, validate it
    if (seoMetaTitle && seoMetaTitle.trim().length > 0) {
      console.log(`SEO meta title content: "${seoMetaTitle}"`);
      console.log(`SEO meta title validation - length: ${seoMetaTitle.length}, returning complete status`);
      
      if (seoMetaTitle.length > 60) {
        return {
          field: 'Meta Title',
          status: 'poor',
          reason: `SEO meta title too long (${seoMetaTitle.length} chars, recommend under 60)`
        };
      }

      if (seoMetaTitle.length < 10) {
        return {
          field: 'Meta Title',
          status: 'poor',
          reason: 'SEO meta title too short (recommend at least 10 characters)'
        };
      }

      // SEO meta title exists and is valid length - return complete
      console.log(`Meta title check result: COMPLETE for product ${product.id}`);
      return {
        field: 'Meta Title',
        status: 'complete'
      };
    }

    // No SEO meta title found, check product title as fallback
    const productTitle = product.name || '';
    console.log(`No SEO meta title found, checking product title: "${productTitle}"`);
    
    if (!productTitle || productTitle.trim().length === 0) {
      return {
        field: 'Meta Title',
        status: 'missing',
        reason: 'No SEO meta title and no product title found'
      };
    }

    // Check if product title is acceptable as meta title
    if (productTitle.toLowerCase() === 'product' || productTitle.length < 10) {
      return {
        field: 'Meta Title',
        status: 'missing',
        reason: 'No SEO meta title and product title is too generic/short'
      };
    }

    if (productTitle.length > 60) {
      return {
        field: 'Meta Title',
        status: 'poor',
        reason: `No SEO meta title and product title too long (${productTitle.length} chars, recommend under 60)`
      };
    }

    // Product title is acceptable but recommend adding proper SEO meta title
    return {
      field: 'Meta Title',
      status: 'complete',
      reason: 'Using product title (consider adding dedicated SEO meta title)'
    };
  }

  private checkMetaDescription(product: Product): ContentHealthCheck {
    console.log(`Checking meta description for product: ${product.name} (ID: ${product.id})`);
    
    // First, check for actual SEO meta description in meta_data array
    const seoMetaDesc = this.getMetaValue(product, '_yoast_wpseo_metadesc') || 
                       this.getMetaValue(product, '_aioseop_description') ||
                       this.getMetaValue(product, 'rank_math_description') ||
                       this.getMetaValue(product, '_genesis_description') ||
                       this.getMetaValue(product, '_su_description');
    
    console.log(`SEO meta description found: ${seoMetaDesc ? 'Yes' : 'No'}`);
    
    // If we found a specific SEO meta description, validate it
    if (seoMetaDesc && seoMetaDesc.trim().length > 0) {
      const cleanMetaDesc = seoMetaDesc.replace(/<[^>]*>/g, '').trim();
      console.log(`SEO meta description content length: ${cleanMetaDesc.length}`);
      console.log(`SEO meta description validation - returning status based on length`);

      if (cleanMetaDesc.length < this.settings.min_meta_description_length) {
        return {
          field: 'Meta Description',
          status: 'poor',
          reason: `SEO meta description too short (${cleanMetaDesc.length} chars, recommend ${this.settings.min_meta_description_length}+)`
        };
      }

      if (cleanMetaDesc.length > 155) {
        return {
          field: 'Meta Description',
          status: 'poor',
          reason: `SEO meta description too long (${cleanMetaDesc.length} chars, recommend under 155)`
        };
      }

      // SEO meta description exists and is valid length - return complete
      console.log(`Meta description check result: COMPLETE for product ${product.id}`);
      return {
        field: 'Meta Description',
        status: 'complete'
      };
    }

    // No SEO meta description found, check short description as fallback
    const shortDesc = product.short_description || '';
    const cleanShortDesc = shortDesc.replace(/<[^>]*>/g, '').trim();
    console.log(`No SEO meta description found, checking short description length: ${cleanShortDesc.length}`);
    
    if (!cleanShortDesc || cleanShortDesc.length === 0) {
      return {
        field: 'Meta Description',
        status: 'missing',
        reason: 'No SEO meta description and no short description found'
      };
    }

    // Check if short description is acceptable as meta description
    if (cleanShortDesc.length < this.settings.min_meta_description_length) {
      return {
        field: 'Meta Description',
        status: 'missing',
        reason: `No SEO meta description and short description too short (${cleanShortDesc.length} chars, recommend ${this.settings.min_meta_description_length}+)`
      };
    }

    if (cleanShortDesc.length > 155) {
      return {
        field: 'Meta Description',
        status: 'poor',
        reason: `No SEO meta description and short description too long for meta (${cleanShortDesc.length} chars, recommend under 155)`
      };
    }

    // Short description is acceptable but recommend adding proper SEO meta description
    return {
      field: 'Meta Description',
      status: 'complete',
      reason: 'Using short description (consider adding dedicated SEO meta description)'
    };
  }

  private getMetaValue(product: Product, metaKey: string): string | null {
    if (!product.meta_data || !Array.isArray(product.meta_data)) {
      console.log(`No meta_data array found for product ${product.id}`);
      return null;
    }

    const metaItem = product.meta_data.find(meta => meta.key === metaKey);
    const value = metaItem && metaItem.value ? String(metaItem.value) : null;
    
    if (value) {
      console.log(`Found meta key ${metaKey}: "${value}"`);
    }
    
    return value;
  }

  private checkImageAltText(product: Product): ContentHealthCheck {
    const images = product.images || [];
    
    if (images.length === 0) {
      return {
        field: 'Image Alt Text',
        status: 'missing',
        reason: 'No product images'
      };
    }

    const missingAltImages = images.filter(img => !img.alt || img.alt.trim().length === 0);
    
    if (missingAltImages.length === images.length) {
      return {
        field: 'Image Alt Text',
        status: 'missing',
        reason: 'All images missing alt text'
      };
    }

    if (missingAltImages.length > 0) {
      return {
        field: 'Image Alt Text',
        status: 'poor',
        reason: `${missingAltImages.length} of ${images.length} images missing alt text`
      };
    }

    return {
      field: 'Image Alt Text',
      status: 'complete'
    };
  }

  private checkCategories(product: Product): ContentHealthCheck {
    const categories = product.categories || [];
    
    if (categories.length === 0) {
      return {
        field: 'Categories',
        status: 'missing',
        reason: 'Product is uncategorized'
      };
    }

    const uncategorized = categories.find(cat => cat.name.toLowerCase() === 'uncategorized');
    if (uncategorized && categories.length === 1) {
      return {
        field: 'Categories',
        status: 'poor',
        reason: 'Only in "Uncategorized" category'
      };
    }

    return {
      field: 'Categories',
      status: 'complete'
    };
  }

  private calculateOverallStatus(missingFieldsCount: number): 'complete' | 'needs_attention' | 'critical' {
    if (missingFieldsCount === 0) return 'complete';
    if (missingFieldsCount >= 3) return 'critical';
    return 'needs_attention';
  }

  private calculateSeoScore(checks: ContentHealthCheck[]): number {
    const totalChecks = checks.length;
    const completeChecks = checks.filter(check => check.status === 'complete').length;
    const poorChecks = checks.filter(check => check.status === 'poor').length;
    
    // Complete = 100%, Poor = 50%, Missing = 0%
    const score = ((completeChecks * 100) + (poorChecks * 50)) / totalChecks;
    return Math.round(score);
  }

  analyzeBatch(products: Product[]): ProductContentHealth[] {
    return products.map(product => this.analyzeProduct(product));
  }

  generateSummary(healthResults: ProductContentHealth[]): ContentHealthSummary {
    const total_products = healthResults.length;
    const complete_content = healthResults.filter(h => h.overall_status === 'complete').length;
    const missing_one_plus = healthResults.filter(h => h.missing_fields.length >= 1).length;
    const missing_three_plus = healthResults.filter(h => h.missing_fields.length >= 3).length;
    const critical_products = healthResults.filter(h => h.overall_status === 'critical').length;

    // Calculate common missing fields
    const fieldCounts: { [key: string]: number } = {};
    healthResults.forEach(health => {
      health.missing_fields.forEach(field => {
        fieldCounts[field] = (fieldCounts[field] || 0) + 1;
      });
    });

    const common_missing_fields = Object.entries(fieldCounts)
      .map(([field, count]) => ({ field, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total_products,
      complete_content,
      missing_one_plus,
      missing_three_plus,
      critical_products,
      common_missing_fields,
    };
  }
}

export const contentHealthAnalyzer = new ContentHealthAnalyzer();
