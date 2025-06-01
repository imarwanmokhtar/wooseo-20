
export interface Product {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_modified: string;
  status: string;
  featured: boolean;
  catalog_visibility: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  downloads: any[];
  download_limit: number;
  download_expiry: number;
  external_url: string;
  button_text: string;
  tax_status: string;
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  backorders: string;
  backorders_allowed: boolean;
  backordered: boolean;
  low_stock_amount: number | null;
  sold_individually: boolean;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  shipping_required: boolean;
  shipping_taxable: boolean;
  shipping_class: string;
  shipping_class_id: number;
  reviews_allowed: boolean;
  average_rating: string;
  rating_count: number;
  upsell_ids: number[];
  cross_sell_ids: number[];
  parent_id: number;
  purchase_note: string;
  categories: Category[];
  tags: any[];
  images: {
    id: number;
    date_created: string;
    date_modified: string;
    src: string;
    name: string;
    alt: string;
  }[];
  attributes: any[];
  default_attributes: any[];
  variations: any[];
  grouped_products: any[];
  menu_order: number;
  price_html: string;
  related_ids: number[];
  meta_data: any[];
  stock_status: string;
  has_options: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: string;
  image: {
    id: number;
    date_created: string;
    date_modified: string;
    src: string;
    name: string;
    alt: string;
  } | null;
  menu_order: number;
  count: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
}

export interface SeoContent {
  id?: number;
  product_id: number;
  product_name: string;
  user_id: string;
  store_id?: string;
  short_description: string;
  long_description: string;
  meta_title: string;
  meta_description: string;
  alt_text: string;
  focus_keywords: string;
  permalink: string; // Add the missing permalink property
  created_at?: string;
}

export interface StoreUsage {
  store_id: string;
  store_name: string;
  credits_used: number;
  products_generated: number;
}

export interface WooCommerceCredentials {
  id?: string;
  store_name: string;
  url: string;
  consumer_key: string;
  consumer_secret: string;
  version: string;
  user_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}
