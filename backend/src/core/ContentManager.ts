import { EventBus, CMS_EVENTS } from './events/EventBus';
import { DatabaseService } from './database/DatabaseService';
import { CacheService } from './cache/CacheService';

export interface Content {
  id: string;
  type: string;
  title: string;
  slug: string;
  content: any;
  status: 'draft' | 'published' | 'archived';
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date | null;
  metadata?: Record<string, any>;
}

export interface ContentVersion {
  id: string;
  contentId: string;
  version: number;
  data: any;
  authorId: string;
  createdAt: Date;
  comment?: string | null;
}

export interface CreateContentInput {
  type: string;
  title: string;
  slug: string;
  content: any;
  authorId: string;
  status?: 'draft' | 'published';
  metadata?: Record<string, any>;
}

export interface UpdateContentInput {
  title?: string;
  slug?: string;
  content?: any;
  status?: 'draft' | 'published' | 'archived';
  metadata?: Record<string, any>;
}

export interface SearchQuery {
  query?: string;
  type?: string;
  status?: string;
  authorId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export interface FilterCriteria {
  type?: string;
  status?: string;
  authorId?: string;
  tags?: string[];
  categories?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

export class ContentManager {
  constructor(
    private database: DatabaseService,
    private cache: CacheService,
    private events: EventBus
  ) {}

  /**
   * Create new content
   */
  async create(input: CreateContentInput): Promise<Content> {
    try {
      // Validate input
      this.validateContentInput(input);

      // Check if slug is unique
      await this.ensureSlugUnique(input.slug);

      const content: Content = {
        id: this.generateId(),
        type: input.type,
        title: input.title,
        slug: input.slug,
        content: input.content,
        status: input.status || 'draft',
        authorId: input.authorId,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: input.status === 'published' ? new Date() : null,
        metadata: input.metadata || {}
      };

      // Save to database
      await this.database.saveContent(content);

      // Create initial version
      await this.createVersion(content.id, content, input.authorId, 'Initial version');

      // Clear cache
      await this.cache.invalidateContentCache(content.id);

      // Emit event
      await this.events.emit(CMS_EVENTS.CONTENT_CREATED, {
        id: content.id,
        type: content.type,
        slug: content.slug,
        authorId: content.authorId
      });

      return content;
    } catch (error) {
      await this.events.emit(CMS_EVENTS.ERROR, {
        operation: 'content:create',
        error: error instanceof Error ? error.message : String(error),
        input
      });
      throw error;
    }
  }

  /**
   * Get content by ID
   */
  async getById(id: string): Promise<Content | null> {
    try {
      // Try cache first
      const cached = await this.cache.getContent(id);
      if (cached) {
        return cached;
      }

      // Load from database
      const content = await this.database.getContentById(id);
      if (content) {
        // Cache for future requests
        await this.cache.setContent(content);
      }

      return content;
    } catch (error) {
      await this.events.emit(CMS_EVENTS.ERROR, {
        operation: 'content:getById',
        error: error instanceof Error ? error.message : String(error),
        id
      });
      throw error;
    }
  }

  /**
   * Get content by slug
   */
  async getBySlug(slug: string): Promise<Content | null> {
    try {
      // Try cache first
      const cached = await this.cache.getContentBySlug(slug);
      if (cached) {
        return cached;
      }

      // Load from database
      const content = await this.database.getContentBySlug(slug);
      if (content) {
        // Cache for future requests
        await this.cache.setContent(content);
      }

      return content;
    } catch (error) {
      await this.events.emit(CMS_EVENTS.ERROR, {
        operation: 'content:getBySlug',
        error: error instanceof Error ? error.message : String(error),
        slug
      });
      throw error;
    }
  }

  /**
   * Update content
   */
  async update(id: string, input: UpdateContentInput, authorId: string): Promise<Content> {
    try {
      const existingContent = await this.getById(id);
      if (!existingContent) {
        throw new Error(`Content with ID ${id} not found`);
      }

      // Check if slug change requires uniqueness check
      if (input.slug && input.slug !== existingContent.slug) {
        await this.ensureSlugUnique(input.slug, id);
      }

      const updatedContent: Content = {
        ...existingContent,
        ...input,
        updatedAt: new Date(),
        publishedAt: input.status === 'published' && !existingContent.publishedAt
          ? new Date()
          : existingContent.publishedAt || null
      };

      // Create version before update
      await this.createVersion(id, existingContent, authorId, 'Content updated');

      // Save to database
      await this.database.updateContent(id, updatedContent);

      // Clear cache
      await this.cache.invalidateContentCache(id);

      // Emit event
      await this.events.emit(CMS_EVENTS.CONTENT_UPDATED, {
        id,
        changes: Object.keys(input),
        authorId
      });

      return updatedContent;
    } catch (error) {
      await this.events.emit(CMS_EVENTS.ERROR, {
        operation: 'content:update',
        error: error instanceof Error ? error.message : String(error),
        id,
        input
      });
      throw error;
    }
  }

  /**
   * Delete content
   */
  async delete(id: string, authorId: string): Promise<void> {
    try {
      const content = await this.getById(id);
      if (!content) {
        throw new Error(`Content with ID ${id} not found`);
      }

      // Delete from database
      await this.database.deleteContent(id);

      // Clear cache
      await this.cache.invalidateContentCache(id);

      // Emit event
      await this.events.emit(CMS_EVENTS.CONTENT_DELETED, {
        id,
        type: content.type,
        slug: content.slug,
        authorId
      });
    } catch (error) {
      await this.events.emit(CMS_EVENTS.ERROR, {
        operation: 'content:delete',
        error: error instanceof Error ? error.message : String(error),
        id
      });
      throw error;
    }
  }

  /**
   * Publish content
   */
  async publish(id: string, authorId: string): Promise<Content> {
    return this.update(id, { status: 'published' }, authorId);
  }

  /**
   * Unpublish content
   */
  async unpublish(id: string, authorId: string): Promise<Content> {
    return this.update(id, { status: 'draft' }, authorId);
  }

  /**
   * Search content
   */
  async search(query: SearchQuery): Promise<{ items: Content[]; total: number }> {
    try {
      const cacheKey = `search:${JSON.stringify(query)}`;
      const cached = await this.cache.get(cacheKey);

      if (cached) {
        return cached;
      }

      const result = await this.database.searchContent(query);

      // Cache search results
      await this.cache.set(cacheKey, result, { ttl: 300 }); // 5 minutes

      return result;
    } catch (error) {
      await this.events.emit(CMS_EVENTS.ERROR, {
        operation: 'content:search',
        error: error instanceof Error ? error.message : String(error),
        query
      });
      throw error;
    }
  }

  /**
   * Filter content
   */
  async filter(criteria: FilterCriteria): Promise<Content[]> {
    try {
      const cacheKey = `filter:${JSON.stringify(criteria)}`;
      const cached = await this.cache.get(cacheKey);

      if (cached) {
        return cached;
      }

      const result = await this.database.filterContent(criteria);

      // Cache filter results
      await this.cache.set(cacheKey, result, { ttl: 300 }); // 5 minutes

      return result;
    } catch (error) {
      await this.events.emit(CMS_EVENTS.ERROR, {
        operation: 'content:filter',
        error: error instanceof Error ? error.message : String(error),
        criteria
      });
      throw error;
    }
  }

  /**
   * Get content versions
   */
  async getVersions(contentId: string): Promise<ContentVersion[]> {
    try {
      return await this.database.getContentVersions(contentId);
    } catch (error) {
      await this.events.emit(CMS_EVENTS.ERROR, {
        operation: 'content:getVersions',
        error: error instanceof Error ? error.message : String(error),
        contentId
      });
      throw error;
    }
  }

  /**
   * Revert to specific version
   */
  async revertToVersion(contentId: string, versionId: string, authorId: string): Promise<Content> {
    try {
      const version = await this.database.getContentVersion(versionId);
      if (!version || version.contentId !== contentId) {
        throw new Error('Version not found or does not belong to this content');
      }

      const content = await this.getById(contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      // Create version of current state before revert
      await this.createVersion(contentId, content, authorId, 'Before revert');

      // Revert to version
      const revertedContent: Content = {
        ...content,
        ...version.data,
        updatedAt: new Date()
      };

      await this.database.updateContent(contentId, revertedContent);
      await this.cache.invalidateContentCache(contentId);

      // Create version after revert
      await this.createVersion(contentId, revertedContent, authorId, `Reverted to version ${version.version}`);

      await this.events.emit(CMS_EVENTS.CONTENT_UPDATED, {
        id: contentId,
        action: 'revert',
        versionId,
        authorId
      });

      return revertedContent;
    } catch (error) {
      await this.events.emit(CMS_EVENTS.ERROR, {
        operation: 'content:revertToVersion',
        error: error instanceof Error ? error.message : String(error),
        contentId,
        versionId
      });
      throw error;
    }
  }

  /**
   * Create content version
   */
  private async createVersion(
    contentId: string,
    content: Content,
    authorId: string,
    comment?: string
  ): Promise<void> {
    try {
      const version: ContentVersion = {
        id: this.generateId(),
        contentId,
        version: await this.getNextVersionNumber(contentId),
        data: {
          title: content.title,
          slug: content.slug,
          content: content.content,
          status: content.status,
          metadata: content.metadata
        },
        authorId,
        createdAt: new Date(),
        comment: comment || null
      };

      await this.database.saveContentVersion(version);
    } catch (error) {
      console.error('Failed to create content version:', error);
      // Don't throw - versioning failure shouldn't break main operation
    }
  }

  /**
   * Get next version number for content
   */
  private async getNextVersionNumber(contentId: string): Promise<number> {
    const versions = await this.database.getContentVersions(contentId);
    return versions.length + 1;
  }

  /**
   * Validate content input
   */
  private validateContentInput(input: CreateContentInput): void {
    if (!input.title || input.title.trim().length === 0) {
      throw new Error('Title is required');
    }

    if (!input.slug || input.slug.trim().length === 0) {
      throw new Error('Slug is required');
    }

    if (!input.type || input.type.trim().length === 0) {
      throw new Error('Content type is required');
    }

    if (!input.authorId) {
      throw new Error('Author ID is required');
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(input.slug)) {
      throw new Error('Slug can only contain lowercase letters, numbers, and hyphens');
    }
  }

  /**
   * Ensure slug uniqueness
   */
  private async ensureSlugUnique(slug: string, excludeId?: string): Promise<void> {
    const existing = await this.database.getContentBySlug(slug);
    if (existing && existing.id !== excludeId) {
      throw new Error(`Content with slug "${slug}" already exists`);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `cnt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
