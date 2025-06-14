
export interface ContentHealthCheck {
  field: string;
  status: 'complete' | 'missing' | 'poor';
  reason?: string;
  threshold?: number;
}

export interface ProductContentHealth {
  product_id: number;
  product_name: string;
  overall_status: 'complete' | 'needs_attention' | 'critical';
  missing_fields: string[];
  checks: ContentHealthCheck[];
  last_checked: string;
  seo_score?: number;
}

export interface ContentHealthSummary {
  total_products: number;
  complete_content: number;
  missing_one_plus: number;
  missing_three_plus: number;
  critical_products: number;
  common_missing_fields: { field: string; count: number }[];
}

export interface ContentHealthSettings {
  min_meta_description_length: number;
  min_short_description_words: number;
  check_gallery_images: boolean;
  auto_detect_interval: number; // hours
  auto_generate_missing: boolean;
  email_notifications: boolean;
  email_threshold: number;
}

export interface BulkFixOptions {
  product_ids: number[];
  fields_to_generate: string[];
  prompt_template?: string;
  model?: string;
}
