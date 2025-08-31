// API Response Types
export interface APIResponse<T = any> {
  data: T;
  message?: string;
  status: 'success' | 'error';
  errors?: string[];
  meta?: {
    pagination?: PaginationMeta;
    filters?: Record<string, any>;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  meta: {
    pagination: PaginationMeta;
  };
}

// Reusable Blocks Types
export interface ReusableBlock {
  id: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  preview_image_url?: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface InstantiateReusableBlockRequest {
  reusableBlockId: string;
  pageId: string;
  parentId?: string;
  position?: number;
  slot?: string;
  overrides?: Record<string, any>;
}

export interface InstantiateReusableBlockResponse {
  success: boolean;
  data: BlockNode;
}

// Content Types
export interface ContentItem {
  id: string;
  type: string;
  title: string;
  slug: string;
  content: Record<string, any>;
  excerpt?: string;
  featuredImage?: string;
  status: 'draft' | 'published' | 'archived' | 'scheduled';
  authorId: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  categories: string[];
  metadata: Record<string, any>;
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
    canonical?: string;
    noindex?: boolean;
    nofollow?: boolean;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  scheduledAt?: string;
}

// Block Content Types - конкретные типы для каждого типа блока
export interface HeadingContent {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  align: 'left' | 'center' | 'right';
}

export interface ParagraphContent {
  text: string;
}

export interface ImageContent {
  imageUrl: string;
  altText: string;
}

export interface ButtonContent {
  text: string;
  link: string;
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
}

export interface SpacerContent {
  height: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  customHeight?: number;
}

export interface SectionContent {
  backgroundColor?: string;
  padding: 'none' | 'small' | 'medium' | 'large';
  maxWidth: string;
}

export interface IconContent {
  icon: string;
  size: 'small' | 'medium' | 'large' | 'xl';
  color: string;
}

export interface ColumnsContent {
  layout: 'two' | 'three' | 'four';
}

export interface ContainerContent {
  title?: string;
  layout: 'vertical' | 'horizontal' | 'grid';
  gap: 'none' | 'small' | 'medium' | 'large';
  padding: 'none' | 'small' | 'medium' | 'large';
  backgroundColor?: string;
  borderRadius?: string;
  maxWidth?: string;
}

export interface TabsContent {
  tabs: Array<{
    id: string;
    title: string;
  }>;
  activeTab?: string;
}

export interface AccordionContent {
  sections: Array<{
    id: string;
    title: string;
  }>;
  expandedSections?: string[];
}

export interface CardContent {
  title?: string;
  description?: string;
  variant: 'default' | 'elevated' | 'outlined' | 'filled';
  size: 'small' | 'medium' | 'large';
  showHeader: boolean;
  showFooter: boolean;
}

// Union type для всех типов content
export type BlockContent =
  | HeadingContent
  | ParagraphContent
  | ImageContent
  | ButtonContent
  | SpacerContent
  | SectionContent
  | IconContent
  | ColumnsContent
  | ContainerContent
  | TabsContent
  | AccordionContent
  | CardContent;

// Block Types
export interface BlockData {
  id: string;
  blockType: string;
  content: Record<string, any>;
  metadata: Record<string, any>;
  position: number;
  parentBlockId?: string;
  slot?: string;
  isVisible: boolean;
  styles?: Record<string, any>;
  classes?: string[];
  createdAt: string;
  updatedAt: string;
}

import type { Json } from '@my-forum/db-types';

// Tree Block Types (новая древовидная структура)
// Синхронизировано с db-types для полного соответствия схеме БД
export interface BlockNode {
  // Поля из db-types layout_blocks
  id: string;
  block_type: string;
  content: BlockContent | null;
  depth: number;
  instance_id: string | null;
  metadata: Json;
  page_id: number;
  parent_block_id: string | null;
  position: number | null;
  slot: string | null;
  status: string;

  // Дополнительные поля для фронтенда
  children: BlockNode[];
  // Переопределения для экземпляров переиспользуемых блоков
  overrides?: Record<string, any>;
}

// API Response для дерева блоков
export interface LayoutApiResponse {
  pageId: number;
  blocks: BlockNode[];
}

// Единый Источник Правды для UI - главный тип BlockNode с children
// LayoutBlock - плоский тип для данных из БД (без children)
export type LayoutBlock = Omit<BlockNode, 'children'>;

// Page Types
export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  type: 'page' | 'post' | 'template';
  status: 'draft' | 'published' | 'archived';
  template?: string;
  layout?: string;
  blocks: BlockData[];
  authorId: string;
  metadata: Record<string, any>;
  seo: ContentItem['seo'];
  createdAt: string;
  updatedAt: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'super_admin' | 'admin' | 'editor' | 'author' | 'contributor' | 'reviewer' | 'viewer';

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

// Media Types
export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  altText?: string;
  caption?: string;
  metadata: MediaMetadata;
  folderId?: string;
  tags: string[];
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaMetadata {
  width?: number;
  height?: number;
  duration?: number;
  bitrate?: number;
  exif?: Record<string, any>;
  colors?: ColorInfo[];
  ocrText?: string;
  autoTags?: string[];
}

export interface ColorInfo {
  hex: string;
  rgb: [number, number, number];
  hsl: [number, number, number];
  percentage: number;
}

// Template Types
export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  description?: string;
  version: string;
  author: string;
  tags: string[];
  content: string;
  styles?: string;
  scripts?: string;
  variables: TemplateVariable[];
  settings: TemplateSettings;
  regions?: TemplateRegion[];
  dependencies?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export type TemplateType = 'page' | 'layout' | 'component' | 'partial' | 'email' | 'theme';

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  label: string;
  description?: string;
  defaultValue?: any;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}

export interface TemplateSettings {
  responsive: boolean;
  minWidth?: number;
  maxWidth?: number;
  cssFramework?: string;
  jsFramework?: string;
}

export interface TemplateRegion {
  name: string;
  description?: string;
  multiple?: boolean;
  allowedTypes?: string[];
  defaultContent?: any;
}

// Search Types
export interface SearchQuery {
  query?: string;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface SearchResult {
  items: ContentItem[];
  total: number;
  facets?: Record<string, any>;
  suggestions?: string[];
}

// Workflow Types
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'review' | 'approval' | 'publish' | 'notification' | 'task';
  assignees: WorkflowAssignee[];
  conditions?: WorkflowCondition[];
  actions?: WorkflowAction[];
  dueDate?: string;
}

export interface WorkflowAssignee {
  type: 'role' | 'user' | 'group';
  value: string;
}

export interface WorkflowCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'contains';
  value: any;
}

export interface WorkflowAction {
  type: string;
  config: Record<string, any>;
}

export interface WorkflowTrigger {
  event: string;
  conditions?: WorkflowCondition[];
}

// Analytics Types
export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  userId?: string;
  sessionId: string;
  timestamp: string;
  context: {
    page: string;
    referrer?: string;
    userAgent: string;
    viewport: {
      width: number;
      height: number;
    };
  };
}

export interface AnalyticsData {
  pageviews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{
    path: string;
    views: number;
    uniqueViews: number;
  }>;
  devices: Record<string, number>;
  browsers: Record<string, number>;
  referrers: Record<string, number>;
}

// Error Types
export interface APIError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
  timestamp: string;
  requestId: string;
}

// Webhook Types
export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  secret: string;
  headers?: Record<string, string>;
  retryPolicy?: {
    maxAttempts: number;
    backoffMs: number;
  };
  filters?: WebhookFilter[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookFilter {
  field: string;
  operator: string;
  value: any;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  payload: any;
  status: 'pending' | 'success' | 'failed' | 'retry';
  attempts: number;
  lastAttempt?: string;
  nextAttempt?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}
