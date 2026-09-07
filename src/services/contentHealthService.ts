
import { ProductContentHealth, ContentHealthCheck, ContentHealthSummary } from '@/types/contentHealth';

interface ContentField {
  name: string;
  minLength?: number;
  minWords?: number;
  required: boolean;
}

const CONTENT_FIELDS: ContentField[] = [
  { name: 'meta_title', minLength: 30, required: true },
  { name: 'meta_description', minLength: 80, required: true },
  { name: 'short_description', minWords: 10, required: true },
  { name: 'long_description', minWords: 100, required: true },
  { name: 'alt_text', minLength: 5, required: false },
  { name: 'focus_keywords', required: false },
  { name: 'permalink', required: false }
];

// SEO plugin field mappings for better detection
const SEO_FIELD_MAPPINGS = {
  meta_title: {
    rankmath: ['rank_math_title'],
    yoast: ['_yoast_wpseo_title'],
    aioseo: ['_aioseo_title'],
    universal: ['seo_title', 'meta_title', 'product_seo_title']
  },
  meta_description: {
    rankmath: ['rank_math_description'],
    yoast: ['_yoast_wpseo_metadesc'],
    aioseo: ['_aioseo_description'],
    universal: ['seo_description', 'meta_description', 'product_seo_description']
  },
  focus_keywords: {
    rankmath: ['rank_math_focus_keyword'],
    yoast: ['_yoast_wpseo_focuskw', '_yoast_wpseo_focuskeywords', '_yoast_wpseo_keywords'],
    aioseo: ['_aioseo_focus_keyword', '_aioseo_keyphrases'],
    universal: ['focus_keywords', 'seo_keywords', 'product_seo_keywords']
  }
};

class ContentHealthAnalyzer {
  analyzeBatch(products: any[], seoPlugin?: string | null): ProductContentHealth[] {
    console.log(`Analyzing ${products.length} products for content health with SEO plugin: ${seoPlugin || 'universal'}`);
    return products.map(product => this.analyzeProduct(product, seoPlugin));
  }

  analyzeProduct(product: any, seoPlugin?: string | null): ProductContentHealth {
    const checks: ContentHealthCheck[] = [];
    const missingFields: string[] = [];

    console.log(`Analyzing product: ${product.name} (ID: ${product.id}) with plugin: ${seoPlugin || 'universal'}`);

    // Check each content field
    CONTENT_FIELDS.forEach(field => {
      const check = this.checkField(product, field, seoPlugin);
      checks.push(check);
      
      // Only add to missing fields if the content is actually missing (not just poor quality)
      if (check.status === 'missing') {
        missingFields.push(field.name);
      }
    });

    // Determine overall status
    const overallStatus = this.determineOverallStatus(checks);
    const seoScore = this.calculateSeoScore(checks);

    console.log(`Product ${product.name} analysis complete - Status: ${overallStatus}, Score: ${seoScore}%, Missing: ${missingFields.join(', ')}`);

    return {
      product_id: product.id,
      product_name: product.name,
      overall_status: overallStatus,
      missing_fields: missingFields,
      checks,
      last_checked: new Date().toISOString(),
      seo_score: seoScore
    };
  }

  private extractMetaFromProduct(product: any, fieldMappings: string[]): string {
    // First check meta_data array for plugin-specific fields
    if (product.meta_data && Array.isArray(product.meta_data)) {
      for (const mapping of fieldMappings) {
        const metaItem = product.meta_data.find((meta: any) => meta.key === mapping);
        if (metaItem && metaItem.value && metaItem.value.trim()) {
          console.log(`Found ${mapping}: ${metaItem.value.substring(0, 50)}...`);
          return metaItem.value.trim();
        }
      }
    }

    // Fallback to direct property access
    for (const mapping of fieldMappings) {
      if (product[mapping] && typeof product[mapping] === 'string' && product[mapping].trim()) {
        console.log(`Found direct property ${mapping}: ${product[mapping].substring(0, 50)}...`);
        return product[mapping].trim();
      }
    }

    return '';
  }

  private checkField(product: any, field: ContentField, seoPlugin?: string | null): ContentHealthCheck {
    const fieldName = field.name;
    let value: string = '';

    // Extract field value based on field name and SEO plugin
    switch (fieldName) {
      case 'meta_title':
        if (seoPlugin && SEO_FIELD_MAPPINGS.meta_title[seoPlugin as keyof typeof SEO_FIELD_MAPPINGS.meta_title]) {
          value = this.extractMetaFromProduct(product, SEO_FIELD_MAPPINGS.meta_title[seoPlugin as keyof typeof SEO_FIELD_MAPPINGS.meta_title]);
        }
        if (!value) {
          value = this.extractMetaFromProduct(product, SEO_FIELD_MAPPINGS.meta_title.universal);
        }
        if (!value) {
          value = product.name || '';
        }
        break;

      case 'meta_description':
        if (seoPlugin && SEO_FIELD_MAPPINGS.meta_description[seoPlugin as keyof typeof SEO_FIELD_MAPPINGS.meta_description]) {
          value = this.extractMetaFromProduct(product, SEO_FIELD_MAPPINGS.meta_description[seoPlugin as keyof typeof SEO_FIELD_MAPPINGS.meta_description]);
        }
        if (!value) {
          value = this.extractMetaFromProduct(product, SEO_FIELD_MAPPINGS.meta_description.universal);
        }
        if (!value) {
          value = product.short_description || '';
        }
        break;

      case 'focus_keywords':
        if (seoPlugin && SEO_FIELD_MAPPINGS.focus_keywords[seoPlugin as keyof typeof SEO_FIELD_MAPPINGS.focus_keywords]) {
          value = this.extractMetaFromProduct(product, SEO_FIELD_MAPPINGS.focus_keywords[seoPlugin as keyof typeof SEO_FIELD_MAPPINGS.focus_keywords]);
        }
        if (!value) {
          value = this.extractMetaFromProduct(product, SEO_FIELD_MAPPINGS.focus_keywords.universal);
        }
        if (!value) {
          value = product.tags?.map((tag: any) => tag.name).join(', ') || '';
        }
        break;

      case 'short_description':
        value = product.short_description || '';
        break;

      case 'long_description':
        value = product.description || '';
        break;

      case 'alt_text':
        value = product.images?.[0]?.alt || '';
        break;

      case 'permalink':
        value = product.slug || '';
        break;

      default:
        value = '';
    }

    // Remove HTML tags for length/word counting
    const cleanValue = value.replace(/<[^>]*>/g, '').trim();

    // Check if field is missing (truly has no content)
    if (!cleanValue) {
      if (field.required) {
        return {
          field: fieldName,
          status: 'missing',
          reason: `${fieldName.replace('_', ' ')} is required but missing`
        };
      } else {
        return {
          field: fieldName,
          status: 'missing',
          reason: `${fieldName.replace('_', ' ')} is not set`
        };
      }
    }

    // Content exists, now check quality requirements
    // Check minimum length requirements
    if (field.minLength && cleanValue.length < field.minLength) {
      return {
        field: fieldName,
        status: 'poor',
        reason: `${fieldName.replace('_', ' ')} is too short (${cleanValue.length} chars, minimum ${field.minLength})`
      };
    }

    // Check minimum word requirements
    if (field.minWords) {
      const wordCount = cleanValue.split(/\s+/).filter(word => word.length > 0).length;
      if (wordCount < field.minWords) {
        return {
          field: fieldName,
          status: 'poor',
          reason: `${fieldName.replace('_', ' ')} has too few words (${wordCount} words, minimum ${field.minWords})`
        };
      }
    }

    // Field is complete and meets quality requirements
    return {
      field: fieldName,
      status: 'complete'
    };
  }

  private determineOverallStatus(checks: ContentHealthCheck[]): 'complete' | 'needs_attention' | 'critical' {
    const missingCount = checks.filter(c => c.status === 'missing').length;
    const poorCount = checks.filter(c => c.status === 'poor').length;
    const totalIssues = missingCount + poorCount;

    if (totalIssues === 0) {
      return 'complete';
    } else if (missingCount >= 3 || totalIssues >= 4) {
      return 'critical';
    } else {
      return 'needs_attention';
    }
  }

  private calculateSeoScore(checks: ContentHealthCheck[]): number {
    const totalChecks = checks.length;
    const completeChecks = checks.filter(c => c.status === 'complete').length;
    const poorChecks = checks.filter(c => c.status === 'poor').length;
    
    // Complete checks get full points, poor checks get half points, missing get 0
    const score = (completeChecks + (poorChecks * 0.5)) / totalChecks;
    return Math.round(score * 100);
  }

  generateSummary(results: ProductContentHealth[]): ContentHealthSummary {
    const total = results.length;
    const complete = results.filter(r => r.overall_status === 'complete').length;
    const needsAttention = results.filter(r => r.overall_status === 'needs_attention').length;
    const critical = results.filter(r => r.overall_status === 'critical').length;
    const missingOnePlus = needsAttention + critical;
    const missingThreePlus = critical;

    // Count common missing fields
    const fieldCounts: { [key: string]: number } = {};
    results.forEach(result => {
      result.missing_fields.forEach(field => {
        fieldCounts[field] = (fieldCounts[field] || 0) + 1;
      });
    });

    const commonMissingFields = Object.entries(fieldCounts)
      .map(([field, count]) => ({ field: field.replace('_', ' '), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return {
      total_products: total,
      complete_content: complete,
      missing_one_plus: missingOnePlus,
      missing_three_plus: missingThreePlus,
      critical_products: critical,
      common_missing_fields: commonMissingFields
    };
  }
}

export const contentHealthAnalyzer = new ContentHealthAnalyzer();
export type { ProductContentHealth, ContentHealthSummary } from '@/types/contentHealth';
