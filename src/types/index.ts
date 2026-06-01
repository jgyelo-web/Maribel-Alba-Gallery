export interface User {
  id: string;
  display_name: string;
  email: string;
  role: string;
  email_verified: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Painting {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category_id?: string;
  featured: boolean;
  price?: number;
  dimensions?: string;
  technique?: string;
  year?: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryType {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  type_id?: string;
  type?: CategoryType;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image_url?: string;
  document_urls?: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteContent {
  id?: string;
  hero_title?: string;
  hero_subtitle?: string;
  about_text?: string;
  legal_notice?: string;
  privacy_policy?: string;
  cookie_policy?: string;
  blog_visible: boolean;
  restoration_visible: boolean;
  newsletter_visible: boolean;
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
  updated_at?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export interface RestorationRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RestorationShowcase {
  id: string;
  title: string;
  description: string;
  before_image?: string;
  after_image?: string;
  created_at: string;
  updated_at: string;
}
