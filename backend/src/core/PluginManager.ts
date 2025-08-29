import { EventBus, CMS_EVENTS } from './events/EventBus';

export interface Plugin {
  name: string;
  version: string;
  description: string;
  author?: string;
  dependencies?: string[];
  hooks: PluginHooks;
  onLoad?(): Promise<void>;
  onUnload?(): Promise<void>;
  onError?(error: Error): Promise<void>;
}

export interface PluginHooks {
  // Content hooks
  onContentCreate?: (content: any) => Promise<any>;
  onContentUpdate?: (content: any) => Promise<any>;
  onContentDelete?: (content: any) => Promise<any>;
  onContentPublish?: (content: any) => Promise<any>;

  // User hooks
  onUserCreate?: (user: any) => Promise<any>;
  onUserUpdate?: (user: any) => Promise<any>;
  onUserDelete?: (user: any) => Promise<any>;
  onUserLogin?: (user: any) => Promise<any>;

  // Template hooks
  onTemplateRender?: (template: any, context: any) => Promise<string>;

  // API hooks
  onApiRequest?: (request: any) => Promise<any>;
  onApiResponse?: (response: any) => Promise<any>;
  onApiError?: (error: any) => Promise<any>;

  // Admin hooks
  onAdminPanelLoad?: (context: any) => Promise<void>;

  // System hooks
  onSystemStart?: () => Promise<void>;
  onSystemStop?: () => Promise<void>;
}

export interface PluginInfo {
  name: string;
  version: string;
  description: string;
  isActive: boolean;
  loadedAt?: Date;
  error?: string;
}

export class PluginManager {
  private plugins = new Map<string, Plugin>();
  private activePlugins = new Set<string>();
  private pluginInfo = new Map<string, PluginInfo>();

  constructor(private events: EventBus) {
    this.setupEventListeners();
  }

  /**
   * Register a plugin
   */
  async register(plugin: Plugin): Promise<void> {
    try {
      // Validate plugin
      this.validatePlugin(plugin);

      // Check dependencies
      await this.checkDependencies(plugin);

      // Register plugin
      this.plugins.set(plugin.name, plugin);

      // Create plugin info
      this.pluginInfo.set(plugin.name, {
        name: plugin.name,
        version: plugin.version,
        description: plugin.description,
        isActive: false
      });

      console.log(`🔌 Plugin registered: ${plugin.name} v${plugin.version}`);
    } catch (error) {
      console.error(`❌ Failed to register plugin ${plugin.name}:`, error);
      throw error;
    }
  }

  /**
   * Load and activate a plugin
   */
  async loadPlugin(pluginName: string): Promise<void> {
    try {
      const plugin = this.plugins.get(pluginName);
      if (!plugin) {
        throw new Error(`Plugin ${pluginName} not found`);
      }

      // Call onLoad hook if exists
      if (plugin.onLoad) {
        await plugin.onLoad();
      }

      // Activate plugin
      this.activePlugins.add(pluginName);

      // Update plugin info
      const info = this.pluginInfo.get(pluginName)!;
      this.pluginInfo.set(pluginName, {
        ...info,
        isActive: true,
        loadedAt: new Date(),
        error: undefined
      });

      // Emit event
      await this.events.emit(CMS_EVENTS.PLUGIN_LOADED, {
        name: plugin.name,
        version: plugin.version,
        description: plugin.description
      });

      console.log(`✅ Plugin loaded: ${pluginName}`);
    } catch (error) {
      // Update plugin info with error
      const info = this.pluginInfo.get(pluginName);
      if (info) {
        this.pluginInfo.set(pluginName, {
          ...info,
          error: error.message
        });
      }

      // Call onError hook if exists
      const plugin = this.plugins.get(pluginName);
      if (plugin?.onError) {
        try {
          await plugin.onError(error);
        } catch (hookError) {
          console.error(`Plugin ${pluginName} onError hook failed:`, hookError);
        }
      }

      await this.events.emit(CMS_EVENTS.PLUGIN_ERROR, {
        name: pluginName,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Unload a plugin
   */
  async unloadPlugin(pluginName: string): Promise<void> {
    try {
      const plugin = this.plugins.get(pluginName);
      if (!plugin) {
        throw new Error(`Plugin ${pluginName} not found`);
      }

      // Call onUnload hook if exists
      if (plugin.onUnload) {
        await plugin.onUnload();
      }

      // Deactivate plugin
      this.activePlugins.delete(pluginName);

      // Update plugin info
      const info = this.pluginInfo.get(pluginName)!;
      this.pluginInfo.set(pluginName, {
        ...info,
        isActive: false,
        loadedAt: undefined
      });

      // Emit event
      await this.events.emit(CMS_EVENTS.PLUGIN_UNLOADED, {
        name: plugin.name,
        version: plugin.version
      });

      console.log(`🛑 Plugin unloaded: ${pluginName}`);
    } catch (error) {
      console.error(`❌ Failed to unload plugin ${pluginName}:`, error);
      throw error;
    }
  }

  /**
   * Load multiple plugins
   */
  async loadEnabledPlugins(pluginNames: string[]): Promise<void> {
    const results = await Promise.allSettled(
      pluginNames.map(name => this.loadPlugin(name))
    );

    const failed = results.filter(result => result.status === 'rejected');
    if (failed.length > 0) {
      console.warn(`⚠️  ${failed.length} plugins failed to load`);
    }

    const successful = results.filter(result => result.status === 'fulfilled');
    console.log(`✅ ${successful.length} plugins loaded successfully`);
  }

  /**
   * Unload all plugins
   */
  async unloadAllPlugins(): Promise<void> {
    const unloadPromises = Array.from(this.activePlugins)
      .map(name => this.unloadPlugin(name));

    await Promise.allSettled(unloadPromises);
    this.activePlugins.clear();
  }

  /**
   * Execute plugin hooks
   */
  async executeHooks<T>(
    hookName: keyof PluginHooks,
    data: T,
    filter?: (plugin: Plugin) => boolean
  ): Promise<T> {
    let result = data;

    for (const pluginName of this.activePlugins) {
      const plugin = this.plugins.get(pluginName);
      if (!plugin) continue;

      // Apply filter if provided
      if (filter && !filter(plugin)) continue;

      const hook = plugin.hooks[hookName];
      if (typeof hook === 'function') {
        try {
          result = await hook(result);
        } catch (error) {
          console.error(`Plugin ${pluginName} hook ${hookName} failed:`, error);

          // Call onError hook if exists
          if (plugin.onError) {
            try {
              await plugin.onError(error);
            } catch (hookError) {
              console.error(`Plugin ${pluginName} onError hook failed:`, hookError);
            }
          }
        }
      }
    }

    return result;
  }

  /**
   * Get plugin by name
   */
  getPlugin(name: string): Plugin | null {
    return this.plugins.get(name) || null;
  }

  /**
   * Get all registered plugins
   */
  getRegisteredPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get all loaded plugins
   */
  getLoadedPlugins(): Plugin[] {
    return Array.from(this.activePlugins)
      .map(name => this.plugins.get(name))
      .filter(Boolean) as Plugin[];
  }

  /**
   * Get plugin info
   */
  getPluginInfo(name: string): PluginInfo | null {
    return this.pluginInfo.get(name) || null;
  }

  /**
   * Get all plugin info
   */
  getAllPluginInfo(): PluginInfo[] {
    return Array.from(this.pluginInfo.values());
  }

  /**
   * Check if plugin is active
   */
  isPluginActive(name: string): boolean {
    return this.activePlugins.has(name);
  }

  /**
   * Validate plugin structure
   */
  private validatePlugin(plugin: Plugin): void {
    if (!plugin.name || typeof plugin.name !== 'string') {
      throw new Error('Plugin must have a valid name');
    }

    if (!plugin.version || typeof plugin.version !== 'string') {
      throw new Error('Plugin must have a valid version');
    }

    if (!plugin.description || typeof plugin.description !== 'string') {
      throw new Error('Plugin must have a description');
    }

    if (!plugin.hooks || typeof plugin.hooks !== 'object') {
      throw new Error('Plugin must have hooks object');
    }

    // Check for name conflicts
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin with name "${plugin.name}" already exists`);
    }
  }

  /**
   * Check plugin dependencies
   */
  private async checkDependencies(plugin: Plugin): Promise<void> {
    if (!plugin.dependencies) return;

    for (const dependency of plugin.dependencies) {
      if (!this.plugins.has(dependency)) {
        throw new Error(`Plugin ${plugin.name} requires dependency: ${dependency}`);
      }

      if (!this.isPluginActive(dependency)) {
        console.warn(`⚠️  Dependency ${dependency} is not active for plugin ${plugin.name}`);
      }
    }
  }

  /**
   * Setup event listeners for plugin lifecycle
   */
  private setupEventListeners(): void {
    // Listen for system events and forward to plugins
    this.events.on(CMS_EVENTS.CMS_INITIALIZED, async () => {
      await this.executeHooks('onSystemStart');
    });

    this.events.on(CMS_EVENTS.CMS_SHUTDOWN, async () => {
      await this.executeHooks('onSystemStop');
    });

    // Listen for content events
    this.events.on(CMS_EVENTS.CONTENT_CREATED, async (data) => {
      await this.executeHooks('onContentCreate', data);
    });

    this.events.on(CMS_EVENTS.CONTENT_UPDATED, async (data) => {
      await this.executeHooks('onContentUpdate', data);
    });

    this.events.on(CMS_EVENTS.CONTENT_DELETED, async (data) => {
      await this.executeHooks('onContentDelete', data);
    });

    this.events.on(CMS_EVENTS.CONTENT_PUBLISHED, async (data) => {
      await this.executeHooks('onContentPublish', data);
    });

    // Listen for user events
    this.events.on(CMS_EVENTS.USER_CREATED, async (data) => {
      await this.executeHooks('onUserCreate', data);
    });

    this.events.on(CMS_EVENTS.USER_UPDATED, async (data) => {
      await this.executeHooks('onUserUpdate', data);
    });

    this.events.on(CMS_EVENTS.USER_DELETED, async (data) => {
      await this.executeHooks('onUserDelete', data);
    });

    this.events.on(CMS_EVENTS.USER_LOGIN, async (data) => {
      await this.executeHooks('onUserLogin', data);
    });

    // Listen for API events
    this.events.on(CMS_EVENTS.API_REQUEST, async (data) => {
      await this.executeHooks('onApiRequest', data);
    });

    this.events.on(CMS_EVENTS.API_RESPONSE, async (data) => {
      await this.executeHooks('onApiResponse', data);
    });

    this.events.on(CMS_EVENTS.API_ERROR, async (data) => {
      await this.executeHooks('onApiError', data);
    });
  }
}

// Example plugin implementation
export class ExamplePlugin implements Plugin {
  name = 'example-plugin';
  version = '1.0.0';
  description = 'Example plugin demonstrating plugin architecture';
  author = 'CMS Team';

  hooks: PluginHooks = {
    onContentCreate: async (content) => {
      console.log(`📝 Example plugin: Content created - ${content.title}`);
      return content;
    },

    onUserLogin: async (user) => {
      console.log(`👤 Example plugin: User logged in - ${user.email}`);
      return user;
    },

    onSystemStart: async () => {
      console.log('🚀 Example plugin: System started');
    },

    onSystemStop: async () => {
      console.log('🛑 Example plugin: System stopped');
    }
  };

  async onLoad(): Promise<void> {
    console.log('🔌 Example plugin loaded');
  }

  async onUnload(): Promise<void> {
    console.log('🔌 Example plugin unloaded');
  }

  async onError(error: Error): Promise<void> {
    console.error('❌ Example plugin error:', error);
  }
}
