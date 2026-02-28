export type AppRole = 'super_admin' | 'admin' | 'editor';
export type LeadStatus = 'new' | 'in_progress' | 'contacted' | 'converted' | 'closed';
export type LeadSource = 'quote_form' | 'contact_form' | 'whatsapp' | 'other';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service_interested?: string;
  budget_range?: string;
  project_description?: string;
  timeline?: string;
  source: LeadSource;
  status: LeadStatus;
  notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  short_description?: string;
  description?: string;
  icon?: string;
  image_url?: string;
  features?: string[];
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  client_name?: string;
  description?: string;
  short_description?: string;
  image_url?: string;
  gallery_urls?: string[];
  tech_stack?: string[];
  category?: string;
  project_url?: string;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  author_id?: string;
  category_id?: string;
  tags?: string[];
  is_featured: boolean;
  is_published: boolean;
  published_at?: string;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  read_time_minutes?: number;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface Testimonial {
  id: string;
  client_name: string;
  client_title?: string;
  client_company?: string;
  client_avatar?: string;
  content: string;
  rating: number;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  avatar_url?: string;
  email?: string;
  linkedin_url?: string;
  twitter_url?: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  logo_url?: string;
  website_url?: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  price_monthly?: number;
  price_yearly?: number;
  currency: string;
  features?: string[];
  is_popular: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Career {
  id: string;
  title: string;
  department?: string;
  location: string;
  type: string;
  description?: string;
  requirements?: string[];
  is_published: boolean;
  deadline?: string;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value?: string;
  type: string;
  group_name: string;
  label?: string;
  created_at: string;
  updated_at: string;
}
