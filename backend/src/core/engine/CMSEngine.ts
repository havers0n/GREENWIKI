import { ContentManager } from './ContentManager';
import { UserManager } from './UserManager';
import { TemplateEngine } from './TemplateEngine';
import { PluginManager } from './PluginManager';
import { APIManager } from './APIManager';
import { EventBus } from '../events/EventBus';
import { DatabaseService } from '../database/DatabaseService';
import { CacheService } from '../cache/CacheService';

export interface CMSEngineConfig {
  database: {
    url: string;
    schema?: string;
  };
  cache?: {
    url?: string;
    ttl?: number;
  };
  plugins?: {
    enabled: string[];
    autoLoad: boolean;
  };
  security?: {
    jwtSecret: string;
    jwtExpiresIn: string;
    bcryptRounds: number;
  };
}

export interface CMSContext {
  userId?: string;
  sessionId?: string;
  permissions: string[];
  metadata: Record<string, any>;
}

export class CMSEngine {
  public readonly content: ContentManager;
  public readonly users: UserManager;
  public readonly templates: TemplateEngine;
  public readonly plugins: PluginManager;
  public readonly api: APIManager;
  public readonly events: EventBus;

  private config: CMSEngineConfig;
  private database: DatabaseService;
  private cache: CacheService;
  private initialized = false;

  constructor(config: CMSEngineConfig) {
    this.config = config;

    // Initialize core services
    this.database = new DatabaseService(config.database);
    this.cache = new CacheService(config.cache);
    this.events = new EventBus();

    // Initialize managers
    this.content = new ContentManager(this.database, this.cache, this.events);
    this.users = new UserManager(this.database, this.cache, this.events);
    this.templates = new TemplateEngine(this.database, this.cache, this.events);
    this.plugins = new PluginManager(this.events);
    this.api = new APIManager(this, this.events);

    // Setup event listeners
    this.setupEventListeners();
  }

  /**
   * Initialize the CMS engine
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log('🚀 Initializing CMS Engine...');

      // Initialize database connection
      await this.database.connect();
      console.log('✅ Database connected');

      // Initialize cache
      await this.cache.connect();
      console.log('✅ Cache connected');

      // Load plugins if enabled
      if (this.config.plugins?.autoLoad) {
        await this.plugins.loadEnabledPlugins(this.config.plugins.enabled || []);
        console.log('✅ Plugins loaded');
      }

      // Emit initialization event
      await this.events.emit('cms:initialized', {
        timestamp: new Date().toISOString(),
        config: this.config
      });

      this.initialized = true;
      console.log('🎉 CMS Engine initialized successfully');

    } catch (error) {
      console.error('❌ CMS Engine initialization failed:', error);
      throw error;
    }
  }

  /**
   * Shutdown the CMS engine gracefully
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    try {
      console.log('🛑 Shutting down CMS Engine...');

      // Emit shutdown event
      await this.events.emit('cms:shutdown', {
        timestamp: new Date().toISOString()
      });

      // Unload plugins
      await this.plugins.unloadAllPlugins();

      // Close database connection
      await this.database.disconnect();

      // Close cache connection
      await this.cache.disconnect();

      this.initialized = false;
      console.log('✅ CMS Engine shutdown complete');

    } catch (error) {
      console.error('❌ CMS Engine shutdown error:', error);
      throw error;
    }
  }

  /**
   * Get CMS context for current request
   */
  createContext(userId?: string, sessionId?: string): CMSContext {
    return {
      userId,
      sessionId,
      permissions: [],
      metadata: {}
    };
  }

  /**
   * Check if engine is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get engine configuration
   */
  getConfig(): CMSEngineConfig {
    return { ...this.config };
  }

  /**
   * Get engine status
   */
  async getStatus() {
    return {
      initialized: this.initialized,
      database: {
        connected: await this.database.isConnected(),
        schema: this.config.database.schema
      },
      cache: {
        connected: await this.cache.isConnected(),
        type: this.cache.getType()
      },
      plugins: {
        loaded: this.plugins.getLoadedPlugins().length,
        enabled: this.config.plugins?.enabled?.length || 0
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    };
  }

  /**
   * Setup event listeners for cross-module communication
   */
  private setupEventListeners(): void {
    // Content events
    this.events.on('content:created', async (data) => {
      console.log(`📝 Content created: ${data.id}`);
      await this.cache.invalidateContentCache(data.id);
    });

    this.events.on('content:updated', async (data) => {
      console.log(`📝 Content updated: ${data.id}`);
      await this.cache.invalidateContentCache(data.id);
    });

    this.events.on('content:deleted', async (data) => {
      console.log(`📝 Content deleted: ${data.id}`);
      await this.cache.invalidateContentCache(data.id);
    });

    // User events
    this.events.on('user:created', async (data) => {
      console.log(`👤 User created: ${data.id}`);
      await this.cache.invalidateUserCache(data.id);
    });

    this.events.on('user:updated', async (data) => {
      console.log(`👤 User updated: ${data.id}`);
      await this.cache.invalidateUserCache(data.id);
    });

    // Plugin events
    this.events.on('plugin:loaded', (data) => {
      console.log(`🔌 Plugin loaded: ${data.name} v${data.version}`);
    });

    this.events.on('plugin:unloaded', (data) => {
      console.log(`🔌 Plugin unloaded: ${data.name}`);
    });

    // Error events
    this.events.on('error', (error) => {
      console.error('❌ CMS Engine error:', error);
    });
  }
}

// Export singleton instance
let cmsEngine: CMSEngine | null = null;

export function getCMSEngine(): CMSEngine {
  if (!cmsEngine) {
    throw new Error('CMS Engine not initialized. Call initialize() first.');
  }
  return cmsEngine;
}

export function createCMSEngine(config: CMSEngineConfig): CMSEngine {
  cmsEngine = new CMSEngine(config);
  return cmsEngine;
}
