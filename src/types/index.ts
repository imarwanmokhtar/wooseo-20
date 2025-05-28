export interface User {
  id: string;
  email: string;
  credits?: number;
  stripe_customer_id?: string;
}

export interface WooCommerceCredentials {
  id?: string;
  user_id?: string;
  store_name: string;
  url: string;
  consumer_key: string;
  consumer_secret: string;
  version: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  type: string;
  status: string;
  featured: boolean;
  catalog_visibility: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  categories: ProductCategory[];
  tags: ProductTag[];
  images: ProductImage[];
  attributes: ProductAttribute[];
  meta_data: ProductMetaData[];
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface ProductTag {
  id: number;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

export interface ProductAttribute {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

export interface ProductMetaData {
  id: number;
  key: string;
  value: string;
}

export interface SeoContent {
  id?: number;
  product_id: number;
  short_description: string;
  long_description: string;
  meta_title: string;
  meta_description: string;
  alt_text: string;
  focus_keywords?: string;
  created_at?: string;
  user_id?: string;
  product_name?: string;
  store_id?: string;
}

export interface StoreUsage {
  store_id: string;
  store_name: string;
  credits_used: number;
  products_generated: number;
  last_used?: string;
}

export interface PromptTemplate {
  id?: number;
  name: string;
  content: string;
  user_id: string;
  created_at?: string;
}
