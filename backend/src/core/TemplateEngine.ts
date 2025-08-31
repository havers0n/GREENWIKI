import { EventBus, CMS_EVENTS } from './events/EventBus';
import { DatabaseService } from './database/DatabaseService';
import { CacheService } from './cache/CacheService';

export interface Template {
  id: string;
  name: string;
  description?: string | null;
  type: 'page' | 'component' | 'layout' | 'email';
  content: string;
  variables: TemplateVariable[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  defaultValue?: any;
  description?: string;
}

export interface RenderContext {
  content?: any;
  user?: any;
  site?: any;
  request?: any;
  variables?: Record<string, any>;
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  type: 'page' | 'component' | 'layout' | 'email';
  content: string;
  variables?: TemplateVariable[];
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateTemplateInput {
  name?: string;
  description?: string;
  content?: string;
  variables?: TemplateVariable[];
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export class TemplateEngine {
  constructor(
    private database: DatabaseService,
    private cache: CacheService,
    private events: EventBus
  ) {}

  /**
   * Create new template
   */
  async create(input: CreateTemplateInput): Promise<Template> {
    try {
      // Validate template content
      this.validateTemplate(input);

      const template: Template = {
        id: this.generateId(),
        name: input.name,
        description: input.description || null,
        type: input.type,
        content: input.content,
        variables: input.variables || [],
        isActive: input.isActive !== false,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: input.metadata || {}
      };

      // Save to database
      await this.database.saveTemplate(template);

      // Clear template cache
      await this.cache.invalidateTemplateCache(template.id);

      // Emit event
      await this.events.emit(CMS_EVENTS.TEMPLATE_CREATED, {
        id: template.id,
        name: template.name,
        type: template.type
      });

      return template;
    } catch (error) {
      await this.events.emit(CMS_EVENTS.ERROR, {
        operation: 'template:create',
        error: error instanceof Error ? error.message : String(error),
        input
      });
      throw error;
    }
  }

  /**
   * Get template by ID
   */
  async getById(id: string): Promise<Template | null> {
    try {
      // Try cache first
      const cached = await this.cache.getTemplate(id);
      if (cached) {
        return cached;
      }

      // Load from database
      const template = await this.database.getTemplateById(id);
      if (template) {
        // Cache for future requests
        await this.cache.setTemplate(template);
      }

      return template;
    } catch (error) {
      await this.events.emit(CMS_EVENTS.ERROR, {
        operation: 'template:getById',
        error: error instanceof Error ? error.message : String(error),
        id
      });
      throw error;
    }
  }

  /**
   * Get template by name
   */
  async getByName(name: string): Promise<Template | null> {
    try {
      return await this.database.getTemplateByName(name);
    } catch (error) {
      await this.events.emit(CMS_EVENTS.ERROR, {
        operation: 'template:getByName',
        error: error instanceof Error ? error.message : String(error),
        name
      });
      throw error;
    }
  }

  /**
   * Update template
   */
  async update(id: string, input: UpdateTemplateInput): Promise<Template> {
    try {
      const existingTemplate = await this.getById(id);
      if (!existingTemplate) {
        throw new Error(`Template with ID ${id} not found`);
      }

      const updatedTemplate: Template = {
        ...existingTemplate,
        ...input,
        updatedAt: new Date()
      };

      // Validate updated template
      this.validateTemplate(updatedTemplate);

      // Save to database
      await this.database.updateTemplate(id, updatedTemplate);

      // Clear cache
      await this.cache.invalidateTemplateCache(id);

      // Emit event
      await this.events.emit(CMS_EVENTS.TEMPLATE_UPDATED, {
        id,
        changes: Object.keys(input)
      });

      return updatedTemplate;
    } catch (error) {
      await this.events.emit(CMS_EVENTS.ERROR, {
        operation: 'template:update',
        error: error instanceof Error ? error.message : String(error),
        id,
        input
      });
      throw error;
    }
  }

  /**
   * Delete template
   */
  async delete(id: string): Promise<void> {
    try {
      const template = await this.getById(id);
      if (!template) {
        throw new Error(`Template with ID ${id} not found`);
      }

      // Delete from database
      await this.database.deleteTemplate(id);

      // Clear cache
      await this.cache.invalidateTemplateCache(id);

      // Emit event
      await this.events.emit(CMS_EVENTS.TEMPLATE_DELETED, {
        id,
        name: template.name
      });
    } catch (error) {
      await this.events.emit(CMS_EVENTS.ERROR, {
        operation: 'template:delete',
        error: error instanceof Error ? error.message : String(error),
        id
      });
      throw error;
    }
  }

  /**
   * Render template with context
   */
  async render(templateId: string, context: RenderContext = {}): Promise<string> {
    try {
      const template = await this.getById(templateId);
      if (!template) {
        throw new Error(`Template with ID ${templateId} not found`);
      }

      if (!template.isActive) {
        throw new Error(`Template ${template.name} is not active`);
      }

      // Validate context variables
      this.validateContext(template, context);

      // Render template
      const rendered = await this.processTemplate(template, context);

      // Emit event
      await this.events.emit('template:rendered', {
        templateId,
        templateName: template.name,
        contextKeys: Object.keys(context)
      });

      return rendered;
    } catch (error) {
      await this.events.emit(CMS_EVENTS.ERROR, {
        operation: 'template:render',
        error: error instanceof Error ? error.message : String(error),
        templateId,
        context
      });
      throw error;
    }
  }

  /**
   * Render template by name
   */
  async renderByName(templateName: string, context: RenderContext = {}): Promise<string> {
    try {
      const template = await this.getByName(templateName);
      if (!template) {
        throw new Error(`Template with name ${templateName} not found`);
      }

      return await this.render(template.id, context);
    } catch (error) {
      await this.events.emit(CMS_EVENTS.ERROR, {
        operation: 'template:renderByName',
        error: error instanceof Error ? error.message : String(error),
        templateName,
        context
      });
      throw error;
    }
  }

  /**
   * List templates
   */
  async list(options: {
    type?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ templates: Template[]; total: number }> {
    try {
      const cacheKey = `templates:list:${JSON.stringify(options)}`;
      const cached = await this.cache.get(cacheKey);

      if (cached) {
        return cached;
      }

      const result = await this.database.listTemplates(options);

      // Cache results
      await this.cache.set(cacheKey, result, { ttl: 300 }); // 5 minutes

      return result;
    } catch (error) {
      await this.events.emit(CMS_EVENTS.ERROR, {
        operation: 'template:list',
        error: error instanceof Error ? error.message : String(error),
        options
      });
      throw error;
    }
  }

  /**
   * Process template with context
   */
  private async processTemplate(template: Template, context: RenderContext): Promise<string> {
    let content = template.content;

    // Simple template processing (replace with more sophisticated engine like Handlebars)
    const variables = {
      ...context.variables,
      content: context.content,
      user: context.user,
      site: context.site,
      request: context.request,
      now: new Date().toISOString(),
      timestamp: Date.now()
    };

    // Replace {{variable}} patterns
    content = content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      if (key in variables && variables[key as keyof typeof variables] !== undefined) {
        return String(variables[key as keyof typeof variables]);
      }
      return match; // Keep original if variable not found
    });

    // Process conditional blocks {{#if condition}}...{{/if}}
    content = this.processConditionals(content, variables);

    // Process loops {{#each items}}...{{/each}}
    content = this.processLoops(content, variables);

    return content;
  }

  /**
   * Process conditional blocks
   */
  private processConditionals(content: string, variables: Record<string, any>): string {
    const conditionalRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;

    return content.replace(conditionalRegex, (match, condition, block) => {
      const value = variables[condition];
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        return block;
      }
      return '';
    });
  }

  /**
   * Process loop blocks
   */
  private processLoops(content: string, variables: Record<string, any>): string {
    const loopRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;

    return content.replace(loopRegex, (match, arrayName, block) => {
      const array = variables[arrayName];
      if (!Array.isArray(array)) {
        return '';
      }

      return array.map(item => {
        let itemBlock = block;
        // Replace {{this}} or {{property}} in the block
        if (typeof item === 'object') {
          Object.keys(item).forEach(key => {
            itemBlock = itemBlock.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), String(item[key]));
          });
        } else {
          itemBlock = itemBlock.replace(/\{\{\s* this\s*\}\}/g, String(item));
        }
        return itemBlock;
      }).join('');
    });
  }

  /**
   * Validate template
   */
  private validateTemplate(template: CreateTemplateInput | Template): void {
    if (!template.name || template.name.trim().length === 0) {
      throw new Error('Template name is required');
    }

    if (!template.content || template.content.trim().length === 0) {
      throw new Error('Template content is required');
    }

    const validTypes = ['page', 'component', 'layout', 'email'];
    if (!validTypes.includes(template.type)) {
      throw new Error(`Invalid template type. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate variable definitions
    if (template.variables) {
      for (const variable of template.variables) {
        if (!variable.name || variable.name.trim().length === 0) {
          throw new Error('Variable name is required');
        }

        const validTypes = ['string', 'number', 'boolean', 'array', 'object'];
        if (!validTypes.includes(variable.type)) {
          throw new Error(`Invalid variable type "${variable.type}". Must be one of: ${validTypes.join(', ')}`);
        }
      }
    }
  }

  /**
   * Validate context variables
   */
  private validateContext(template: Template, context: RenderContext): void {
    const providedVariables = new Set([
      ...Object.keys(context.variables || {}),
      ...(context.content ? ['content'] : []),
      ...(context.user ? ['user'] : []),
      ...(context.site ? ['site'] : []),
      ...(context.request ? ['request'] : [])
    ]);

    // Check required variables
    for (const variable of template.variables) {
      if (variable.required && !providedVariables.has(variable.name)) {
        if (variable.defaultValue === undefined) {
          throw new Error(`Required variable "${variable.name}" is missing`);
        }
      }
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
