export type ContentType = 'post' | 'page';
export type ContentStatus = 'draft' | 'published' | 'scheduled' | 'private';

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  status: ContentStatus;
  excerpt?: string;
  featured_media_id?: string;
  author_id: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  // joined
  media?: MediaAsset;
  author_name?: string;
}

export interface ContentVersion {
  id: string;
  content_id: string;
  version_no: number;
  body_html?: string;
  editor_state_json?: Record<string, unknown>;
  created_by: string;
  created_at: string;
}

export interface MediaAsset {
  id: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  width?: number;
  height?: number;
  alt_text?: string;
  title?: string;
  uploaded_by: string;
  created_at: string;
}

export interface Taxonomy {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Term {
  id: string;
  taxonomy_id: string;
  name: string;
  slug: string;
  parent_id?: string;
  created_at: string;
  taxonomy?: Taxonomy;
}

export interface CmsMenu {
  id: string;
  name: string;
  location: 'header' | 'footer';
  created_at: string;
  items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  menu_id: string;
  label: string;
  item_type: 'url' | 'content' | 'term';
  target?: string;
  parent_id?: string;
  sort_order: number;
  created_at: string;
  children?: MenuItem[];
}

export interface SeoMeta {
  content_id: string;
  meta_title?: string;
  meta_desc?: string;
  canonical_url?: string;
  og_image_id?: string;
  robots?: string;
  schema_json?: Record<string, unknown>;
  updated_at: string;
}

export interface CmsSiteSettings {
  id: number;
  site_title: string;
  site_tagline?: string;
  logo_media_id?: string;
  favicon_media_id?: string;
  primary_color?: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  entity: string;
  entity_id?: string;
  meta?: Record<string, unknown>;
  created_at: string;
}
