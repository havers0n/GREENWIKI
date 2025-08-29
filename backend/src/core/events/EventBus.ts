export interface EventData {
  [key: string]: any;
}

export interface EventHandler<T = EventData> {
  (data: T): Promise<void> | void;
}

export interface EventSubscription {
  event: string;
  handler: EventHandler;
  priority: number;
  once: boolean;
  id: string;
}

export class EventBus {
  private subscriptions = new Map<string, EventSubscription[]>();
  private middleware: EventHandler[] = [];
  private isProcessing = false;
  private eventQueue: Array<{ event: string; data: EventData }> = [];

  /**
   * Subscribe to an event
   */
  on<T = EventData>(
    event: string,
    handler: EventHandler<T>,
    priority = 0
  ): string {
    const subscription: EventSubscription = {
      event,
      handler: handler as EventHandler,
      priority,
      once: false,
      id: this.generateId()
    };

    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, []);
    }

    const eventSubscriptions = this.subscriptions.get(event)!;
    eventSubscriptions.push(subscription);

    // Sort by priority (higher priority first)
    eventSubscriptions.sort((a, b) => b.priority - a.priority);

    return subscription.id;
  }

  /**
   * Subscribe to an event once (handler will be removed after first call)
   */
  once<T = EventData>(
    event: string,
    handler: EventHandler<T>,
    priority = 0
  ): string {
    const subscription: EventSubscription = {
      event,
      handler: handler as EventHandler,
      priority,
      once: true,
      id: this.generateId()
    };

    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, []);
    }

    const eventSubscriptions = this.subscriptions.get(event)!;
    eventSubscriptions.push(subscription);
    eventSubscriptions.sort((a, b) => b.priority - a.priority);

    return subscription.id;
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, handlerId?: string): void {
    if (!this.subscriptions.has(event)) {
      return;
    }

    const eventSubscriptions = this.subscriptions.get(event)!;

    if (handlerId) {
      // Remove specific handler
      const index = eventSubscriptions.findIndex(sub => sub.id === handlerId);
      if (index !== -1) {
        eventSubscriptions.splice(index, 1);
      }
    } else {
      // Remove all handlers for this event
      this.subscriptions.delete(event);
    }

    // Clean up empty subscription arrays
    if (eventSubscriptions.length === 0) {
      this.subscriptions.delete(event);
    }
  }

  /**
   * Emit an event
   */
  async emit(event: string, data: EventData = {}): Promise<void> {
    // Add to queue if already processing
    if (this.isProcessing) {
      this.eventQueue.push({ event, data });
      return;
    }

    this.isProcessing = true;

    try {
      await this.processEvent(event, data);
    } finally {
      this.isProcessing = false;

      // Process queued events
      while (this.eventQueue.length > 0) {
        const queuedEvent = this.eventQueue.shift()!;
        await this.processEvent(queuedEvent.event, queuedEvent.data);
      }
    }
  }

  /**
   * Add middleware to process all events
   */
  use(middleware: EventHandler): void {
    this.middleware.push(middleware);
  }

  /**
   * Remove middleware
   */
  removeMiddleware(middleware: EventHandler): void {
    const index = this.middleware.indexOf(middleware);
    if (index !== -1) {
      this.middleware.splice(index, 1);
    }
  }

  /**
   * Get all subscriptions for an event
   */
  getSubscriptions(event: string): EventSubscription[] {
    return this.subscriptions.get(event) || [];
  }

  /**
   * Get all event names
   */
  getEventNames(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Clear all subscriptions
   */
  clear(): void {
    this.subscriptions.clear();
    this.middleware = [];
    this.eventQueue = [];
  }

  /**
   * Get statistics
   */
  getStats() {
    const stats = {
      events: 0,
      subscriptions: 0,
      middleware: this.middleware.length,
      queueLength: this.eventQueue.length
    };

    for (const [event, subscriptions] of this.subscriptions) {
      stats.events++;
      stats.subscriptions += subscriptions.length;
    }

    return stats;
  }

  /**
   * Process a single event
   */
  private async processEvent(event: string, data: EventData): Promise<void> {
    // Apply middleware
    for (const middleware of this.middleware) {
      try {
        await middleware({ event, data });
      } catch (error) {
        console.error(`Event middleware error for ${event}:`, error);
      }
    }

    // Get event subscriptions
    const eventSubscriptions = this.subscriptions.get(event);
    if (!eventSubscriptions || eventSubscriptions.length === 0) {
      return;
    }

    // Create a copy to avoid issues with concurrent modifications
    const subscriptions = [...eventSubscriptions];

    // Process subscriptions
    for (const subscription of subscriptions) {
      try {
        await subscription.handler(data);
      } catch (error) {
        console.error(`Event handler error for ${event}:`, error);
      }

      // Remove one-time handlers
      if (subscription.once) {
        this.off(event, subscription.id);
      }
    }
  }

  /**
   * Generate unique ID for subscription
   */
  private generateId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Global event bus instance
export const eventBus = new EventBus();

// Convenience functions
export const on = (event: string, handler: EventHandler, priority = 0) =>
  eventBus.on(event, handler, priority);

export const once = (event: string, handler: EventHandler, priority = 0) =>
  eventBus.once(event, handler, priority);

export const off = (event: string, handlerId?: string) =>
  eventBus.off(event, handlerId);

export const emit = (event: string, data?: EventData) =>
  eventBus.emit(event, data);

// Built-in events
export const CMS_EVENTS = {
  // CMS lifecycle
  CMS_INITIALIZED: 'cms:initialized',
  CMS_SHUTDOWN: 'cms:shutdown',

  // Content events
  CONTENT_CREATED: 'content:created',
  CONTENT_UPDATED: 'content:updated',
  CONTENT_DELETED: 'content:deleted',
  CONTENT_PUBLISHED: 'content:published',
  CONTENT_UNPUBLISHED: 'content:unpublished',

  // User events
  USER_CREATED: 'user:created',
  USER_UPDATED: 'user:updated',
  USER_DELETED: 'user:deleted',
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',

  // Template events
  TEMPLATE_CREATED: 'template:created',
  TEMPLATE_UPDATED: 'template:updated',
  TEMPLATE_DELETED: 'template:deleted',

  // Plugin events
  PLUGIN_LOADED: 'plugin:loaded',
  PLUGIN_UNLOADED: 'plugin:unloaded',
  PLUGIN_ERROR: 'plugin:error',

  // API events
  API_REQUEST: 'api:request',
  API_RESPONSE: 'api:response',
  API_ERROR: 'api:error',

  // Error events
  ERROR: 'error',
  DATABASE_ERROR: 'database:error',
  CACHE_ERROR: 'cache:error'
} as const;
