export interface Painting {
  id: string;
  title: string;
  year: number;
  description: string;
  image_url: string;
  featured: boolean;
  view_count: number;
  categories: Category[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
}

export interface CategoryType {
  id: string;
  name: string; // e.g., 'artistic_style', 'thematic_genre', 'physical_format'
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
}

export interface SiteContent {
  hero_title: string;
  hero_subtitle: string;
  blog_visible: boolean;
  restoration_visible: boolean;
  newsletter_visible: boolean;
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
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
  created_at: string;
}

export interface RestorationShowcase {
  id: string;
  title: string;
  description: string;
  before_image: string;
  after_image: string;
}

export interface User {
  id: string;
  display_name: string;
  avatar_url?: string;
  role: 'admin' | 'moderator' | 'user';
}