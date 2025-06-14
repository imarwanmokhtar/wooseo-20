
import { ProductContentHealth, ContentHealthCheck, ContentHealthSummary } from '@/types/contentHealth';

interface ContentField {
  name: string;
  minLength?: number;
  minWords?: number;
  required: boolean;
}

const CONTENT_FIELDS: ContentField[] = [
  { name: 'meta_title', minLength: 30, required: true },
  { name: 'meta_description', minLength: 120, required: true },
  { name: 'short_description', minWords: 10, required: true },
  { name: 'long_description', minWords: 100, required: true },
  { name: 'alt_text', minLength: 5, required: false },
  { name: 'focus_keywords', required: false },
  { name: 'permalink', required: false }
];

class ContentHealthAnalyzer {
  analyzeBatch(products: any[]): ProductContentHealth[] {
    return products.map(product => this.analyzeProduct(product));
  }

  analyzeProduct(product: any): ProductContentHealth {
    const checks: ContentHealthCheck[] = [];
    const missingFields: string[] = [];

    // Check each content field
    CONTENT_FIELDS.forEach(field => {
      const check = this.checkField(product, field);
      checks.push(check);
      
      if (check.status === 'missing' || check.status === 'poor') {
        missingFields.push(field.name);
      }
    });

    // Determine overall status
    const overallStatus = this.determineOverallStatus(checks);

    return {
      product_id: product.id,
      product_name: product.name,
      overall_status: overallStatus,
      missing_fields: missingFields,
      checks,
      last_checked: new Date().toISOString(),
      seo_score: this.calculateSeoScore(checks)
    };
  }

  private checkField(product: any, field: ContentField): ContentHealthCheck {
    const fieldName = field.name;
    let value: string = '';

    // Extract field value based on field name
    switch (fieldName) {
      case 'meta_title':
        value = product.name || '';
        break;
      case 'meta_description':
        value = product.short_description || '';
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
      case 'focus_keywords':
        value = product.tags?.map((tag: any) => tag.name).join(', ') || '';
        break;
      case 'permalink':
        value = product.slug || '';
        break;
      default:
        value = '';
    }

    // Remove HTML tags for length/word counting
    const cleanValue = value.replace(/<[^>]*>/g, '').trim();

    // Check if field is missing
    if (field.required && !cleanValue) {
      return {
        field: fieldName,
        status: 'missing',
        reason: `${fieldName.replace('_', ' ')} is required but missing`
      };
    }

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

    // Field is complete
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
