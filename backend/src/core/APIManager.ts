import { CMSEngine } from './engine/CMSEngine';
import { EventBus, CMS_EVENTS } from './events/EventBus';

export interface APIRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  query?: Record<string, any>;
  params?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

export interface APIResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: any;
  duration: number;
}

export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  handler: APIHandler;
  middleware?: APIHandler[];
  description?: string;
  tags?: string[];
}

export interface APIHandler {
  (request: APIRequest, context: APIContext): Promise<APIResponse>;
}

export interface APIContext {
  engine: CMSEngine;
  user?: any;
  permissions: string[];
  metadata: Record<string, any>;
}

export class APIManager {
  private endpoints = new Map<string, APIEndpoint>();
  private middleware: APIHandler[] = [];

  constructor(
    private engine: CMSEngine,
    private events: EventBus
  ) {
    this.setupDefaultEndpoints();
  }

  /**
   * Register API endpoint
   */
  registerEndpoint(endpoint: APIEndpoint): void {
    const key = `${endpoint.method}:${endpoint.path}`;
    this.endpoints.set(key, endpoint);
    console.log(`📡 API endpoint registered: ${endpoint.method} ${endpoint.path}`);
  }

  /**
   * Register API middleware
   */
  registerMiddleware(middleware: APIHandler): void {
    this.middleware.push(middleware);
  }

  /**
   * Handle API request
   */
  async handleRequest(request: APIRequest): Promise<APIResponse> {
    const startTime = Date.now();

    try {
      // Emit request event
      await this.events.emit(CMS_EVENTS.API_REQUEST, {
        method: request.method,
        url: request.url,
        userId: request.userId
      });

      // Find endpoint
      const endpoint = this.findEndpoint(request.method, request.url);
      if (!endpoint) {
        return this.createResponse(404, { error: 'Endpoint not found' });
      }

      // Create context
      const context: APIContext = {
        engine: this.engine,
        user: request.userId ? await this.engine.users.getById(request.userId) : undefined,
        permissions: [],
        metadata: {}
      };

      // Get user permissions if authenticated
      if (context.user) {
        context.permissions = Object.entries(this.engine.users.getPermissions(context.user))
          .filter(([_, allowed]) => allowed)
          .map(([permission]) => permission);
      }

      // Apply global middleware
      let processedRequest = request;
      for (const middleware of this.middleware) {
        const result = await middleware(processedRequest, context);
        if (result.statusCode >= 400) {
          return result;
        }
        // Middleware can modify request
        processedRequest = { ...processedRequest, ...result.body?.modifiedRequest };
      }

      // Apply endpoint middleware
      if (endpoint.middleware) {
        for (const middleware of endpoint.middleware) {
          const result = await middleware(processedRequest, context);
          if (result.statusCode >= 400) {
            return result;
          }
        }
      }

      // Execute endpoint handler
      const response = await endpoint.handler(processedRequest, context);

      // Emit response event
      await this.events.emit(CMS_EVENTS.API_RESPONSE, {
        method: request.method,
        url: request.url,
        statusCode: response.statusCode,
        duration: Date.now() - startTime,
        userId: request.userId
      });

      return response;

    } catch (error) {
      // Emit error event
      await this.events.emit(CMS_EVENTS.API_ERROR, {
        method: request.method,
        url: request.url,
        error: error.message,
        duration: Date.now() - startTime,
        userId: request.userId
      });

      return this.createResponse(500, { error: 'Internal server error' });
    }
  }

  /**
   * Get all registered endpoints
   */
  getEndpoints(): APIEndpoint[] {
    return Array.from(this.endpoints.values());
  }

  /**
   * Find endpoint by method and path
   */
  private findEndpoint(method: string, url: string): APIEndpoint | null {
    // Simple path matching (can be enhanced with proper routing)
    const key = `${method}:${url}`;

    // Direct match
    if (this.endpoints.has(key)) {
      return this.endpoints.get(key)!;
    }

    // Pattern matching for dynamic routes
    for (const [endpointKey, endpoint] of this.endpoints) {
      if (endpointKey.startsWith(`${method}:`)) {
        const pattern = endpoint.path.replace(/:\w+/g, '([^/]+)');
        const regex = new RegExp(`^${pattern}$`);

        if (regex.test(url)) {
          return endpoint;
        }
      }
    }

    return null;
  }

  /**
   * Create standardized response
   */
  private createResponse(statusCode: number, body: any, headers: Record<string, string> = {}): APIResponse {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body,
      duration: 0
    };
  }

  /**
   * Setup default API endpoints
   */
  private setupDefaultEndpoints(): void {
    // Content endpoints
    this.registerEndpoint({
      method: 'GET',
      path: '/api/content',
      handler: this.handleGetContent,
      description: 'Get all content',
      tags: ['content']
    });

    this.registerEndpoint({
      method: 'GET',
      path: '/api/content/:id',
      handler: this.handleGetContentById,
      description: 'Get content by ID',
      tags: ['content']
    });

    this.registerEndpoint({
      method: 'POST',
      path: '/api/content',
      handler: this.handleCreateContent,
      description: 'Create new content',
      tags: ['content']
    });

    this.registerEndpoint({
      method: 'PUT',
      path: '/api/content/:id',
      handler: this.handleUpdateContent,
      description: 'Update content',
      tags: ['content']
    });

    this.registerEndpoint({
      method: 'DELETE',
      path: '/api/content/:id',
      handler: this.handleDeleteContent,
      description: 'Delete content',
      tags: ['content']
    });

    // User endpoints
    this.registerEndpoint({
      method: 'POST',
      path: '/api/auth/login',
      handler: this.handleUserLogin,
      description: 'User login',
      tags: ['auth']
    });

    this.registerEndpoint({
      method: 'GET',
      path: '/api/users',
      handler: this.handleGetUsers,
      description: 'Get users',
      tags: ['users']
    });

    // Template endpoints
    this.registerEndpoint({
      method: 'GET',
      path: '/api/templates',
      handler: this.handleGetTemplates,
      description: 'Get templates',
      tags: ['templates']
    });

    this.registerEndpoint({
      method: 'POST',
      path: '/api/templates/:id/render',
      handler: this.handleRenderTemplate,
      description: 'Render template',
      tags: ['templates']
    });

    console.log(`📡 Registered ${this.endpoints.size} default API endpoints`);
  }

  // Content handlers
  private handleGetContent: APIHandler = async (request, context) => {
    const content = await context.engine.content.search({
      limit: parseInt(request.query?.limit || '10'),
      offset: parseInt(request.query?.offset || '0')
    });

    return this.createResponse(200, content);
  };

  private handleGetContentById: APIHandler = async (request, context) => {
    const { id } = request.params!;
    const content = await context.engine.content.getById(id);

    if (!content) {
      return this.createResponse(404, { error: 'Content not found' });
    }

    return this.createResponse(200, { data: content });
  };

  private handleCreateContent: APIHandler = async (request, context) => {
    if (!context.permissions.includes('canCreateContent')) {
      return this.createResponse(403, { error: 'Insufficient permissions' });
    }

    const content = await context.engine.content.create({
      ...request.body,
      authorId: context.user?.id
    });

    return this.createResponse(201, { data: content });
  };

  private handleUpdateContent: APIHandler = async (request, context) => {
    if (!context.permissions.includes('canEditContent')) {
      return this.createResponse(403, { error: 'Insufficient permissions' });
    }

    const { id } = request.params!;
    const content = await context.engine.content.update(id, request.body, context.user?.id);

    return this.createResponse(200, { data: content });
  };

  private handleDeleteContent: APIHandler = async (request, context) => {
    if (!context.permissions.includes('canDeleteContent')) {
      return this.createResponse(403, { error: 'Insufficient permissions' });
    }

    const { id } = request.params!;
    await context.engine.content.delete(id, context.user?.id);

    return this.createResponse(200, { deleted: true });
  };

  // User handlers
  private handleUserLogin: APIHandler = async (request, context) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return this.createResponse(400, { error: 'Email and password required' });
    }

    const result = await context.engine.users.authenticate(email, password);

    if (!result) {
      return this.createResponse(401, { error: 'Invalid credentials' });
    }

    return this.createResponse(200, {
      user: result.user,
      token: result.token
    });
  };

  private handleGetUsers: APIHandler = async (request, context) => {
    if (!context.permissions.includes('canManageUsers')) {
      return this.createResponse(403, { error: 'Insufficient permissions' });
    }

    const users = await context.engine.users.list({
      limit: parseInt(request.query?.limit || '10'),
      offset: parseInt(request.query?.offset || '0')
    });

    return this.createResponse(200, users);
  };

  // Template handlers
  private handleGetTemplates: APIHandler = async (request, context) => {
    const templates = await context.engine.templates.list({
      limit: parseInt(request.query?.limit || '10'),
      offset: parseInt(request.query?.offset || '0')
    });

    return this.createResponse(200, templates);
  };

  private handleRenderTemplate: APIHandler = async (request, context) => {
    const { id } = request.params!;
    const rendered = await context.engine.templates.render(id, request.body);

    return this.createResponse(200, { html: rendered });
  };
}
