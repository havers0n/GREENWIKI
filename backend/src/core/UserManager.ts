import { EventBus, CMS_EVENTS } from './events/EventBus';
import { DatabaseService } from './database/DatabaseService';
import { CacheService } from './cache/CacheService';

export interface User {
  id: string;
  email: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role: 'admin' | 'editor' | 'author' | 'viewer';
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface CreateUserInput {
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  password: string;
  role?: 'admin' | 'editor' | 'author' | 'viewer';
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateUserInput {
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'editor' | 'author' | 'viewer';
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface UserPermissions {
  canCreateContent: boolean;
  canEditContent: boolean;
  canDeleteContent: boolean;
  canPublishContent: boolean;
  canManageUsers: boolean;
  canManagePlugins: boolean;
  canViewAnalytics: boolean;
}

export class UserManager {
  constructor(
    private database: DatabaseService,
    private cache: CacheService,
    private events: EventBus
  ) {}

  /**
   * Create new user
   */
  async create(input: CreateUserInput): Promise<User> {
    try {
      // Validate input
      this.validateUserInput(input);

      // Check if email is unique
      await this.ensureEmailUnique(input.email);

      // Check if username is unique (if provided)
      if (input.username) {
        await this.ensureUsernameUnique(input.username);
      }

      const user: User = {
        id: this.generateId(),
        email: input.email.toLowerCase(),
        username: input.username || null,
        firstName: input.firstName || null,
        lastName: input.lastName || null,
        role: input.role || 'viewer',
        isActive: input.isActive !== false,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: input.metadata || {}
      };

      // Hash password
      const passwordHash = await this.hashPassword(input.password);

      // Save to database
      await this.database.saveUser(user, passwordHash);

      // Clear user cache
      await this.cache.invalidateUserCache(user.id);

      // Emit event
      await this.events.emit(CMS_EVENTS.USER_CREATED, {
        id: user.id,
        email: user.email,
        role: user.role
      });

      return user;
    } catch (error) {
      await this.events.emit(CMS_EVENTS.ERROR, {
        operation: 'user:create',
        error: error instanceof Error ? error.message : String(error),
        input: { ...input, password: '[REDACTED]' }
      });
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User | null> {
    try {
      // Try cache first
      const cached = await this.cache.getUser(id);
      if (cached) {
        return cached;
      }

      // Load from database
      const user = await this.database.getUserById(id);
      if (user) {
        // Cache for future requests
        await this.cache.setUser(user);
      }

      return user;
    } catch (error) {
      await this.events.emit(CMS_EVENTS.ERROR, {
        operation: 'user:getById',
        error: error instanceof Error ? error.message : String(error),
        id
      });
      throw error;
    }
  }

  /**
   * Get user by email
   */
  async getByEmail(email: string): Promise<User | null> {
    try {
      return await this.database.getUserByEmail(email.toLowerCase());
    } catch (error) {
      await this.events.emit(CMS_EVENTS.ERROR, {
        operation: 'user:getByEmail',
        error: error instanceof Error ? error.message : String(error),
        email
      });
      throw error;
    }
  }

  /**
   * Update user
   */
  async update(id: string, input: UpdateUserInput): Promise<User> {
    try {
      const existingUser = await this.getById(id);
      if (!existingUser) {
        throw new Error(`User with ID ${id} not found`);
      }

      // Check username uniqueness if changing
      if (input.username && input.username !== existingUser.username) {
        await this.ensureUsernameUnique(input.username, id);
      }

      const updatedUser: User = {
        ...existingUser,
        ...input,
        updatedAt: new Date()
      };

      // Save to database
      await this.database.updateUser(id, updatedUser);

      // Clear cache
      await this.cache.invalidateUserCache(id);

      // Emit event
      await this.events.emit(CMS_EVENTS.USER_UPDATED, {
        id,
        changes: Object.keys(input)
      });

      return updatedUser;
    } catch (error) {
      await this.events.emit(CMS_EVENTS.ERROR, {
        operation: 'user:update',
        error: error instanceof Error ? error.message : String(error),
        id,
        input
      });
      throw error;
    }
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    try {
      const user = await this.getById(id);
      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }

      // Delete from database
      await this.database.deleteUser(id);

      // Clear cache
      await this.cache.invalidateUserCache(id);

      // Emit event
      await this.events.emit(CMS_EVENTS.USER_DELETED, {
        id,
        email: user.email
      });
    } catch (error) {
      await this.events.emit(CMS_EVENTS.ERROR, {
        operation: 'user:delete',
        error: error instanceof Error ? error.message : String(error),
        id
      });
      throw error;
    }
  }

  /**
   * Authenticate user
   */
  async authenticate(email: string, password: string): Promise<{ user: User; token: string } | null> {
    try {
      const user = await this.getByEmail(email);
      if (!user || !user.isActive) {
        return null;
      }

      const isValidPassword = await this.verifyPassword(password, await this.database.getUserPasswordHash(user.id));
      if (!isValidPassword) {
        return null;
      }

      // Update last login
      await this.database.updateUserLastLogin(user.id);

      // Generate JWT token
      const token = this.generateToken(user);

      // Emit event
      await this.events.emit(CMS_EVENTS.USER_LOGIN, {
        id: user.id,
        email: user.email
      });

      return { user, token };
    } catch (error) {
      await this.events.emit(CMS_EVENTS.ERROR, {
        operation: 'user:authenticate',
        error: error instanceof Error ? error.message : String(error),
        email
      });
      throw error;
    }
  }

  /**
   * Get user permissions
   */
  getPermissions(user: User): UserPermissions {
    const permissions: UserPermissions = {
      canCreateContent: false,
      canEditContent: false,
      canDeleteContent: false,
      canPublishContent: false,
      canManageUsers: false,
      canManagePlugins: false,
      canViewAnalytics: false
    };

    switch (user.role) {
      case 'admin':
        permissions.canCreateContent = true;
        permissions.canEditContent = true;
        permissions.canDeleteContent = true;
        permissions.canPublishContent = true;
        permissions.canManageUsers = true;
        permissions.canManagePlugins = true;
        permissions.canViewAnalytics = true;
        break;

      case 'editor':
        permissions.canCreateContent = true;
        permissions.canEditContent = true;
        permissions.canDeleteContent = false;
        permissions.canPublishContent = true;
        permissions.canManageUsers = false;
        permissions.canManagePlugins = false;
        permissions.canViewAnalytics = true;
        break;

      case 'author':
        permissions.canCreateContent = true;
        permissions.canEditContent = true;
        permissions.canDeleteContent = false;
        permissions.canPublishContent = false;
        permissions.canManageUsers = false;
        permissions.canManagePlugins = false;
        permissions.canViewAnalytics = false;
        break;

      case 'viewer':
      default:
        // No permissions for viewers
        break;
    }

    return permissions;
  }

  /**
   * List users with pagination
   */
  async list(options: {
    limit?: number;
    offset?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
  } = {}): Promise<{ users: User[]; total: number }> {
    try {
      const cacheKey = `users:list:${JSON.stringify(options)}`;
      const cached = await this.cache.get(cacheKey);

      if (cached) {
        return cached;
      }

      const result = await this.database.listUsers(options);

      // Cache results
      await this.cache.set(cacheKey, result, { ttl: 300 }); // 5 minutes

      return result;
    } catch (error) {
      await this.events.emit(CMS_EVENTS.ERROR, {
        operation: 'user:list',
        error: error instanceof Error ? error.message : String(error),
        options
      });
      throw error;
    }
  }

  /**
   * Validate user input
   */
  private validateUserInput(input: CreateUserInput): void {
    if (!input.email || !input.email.includes('@')) {
      throw new Error('Valid email is required');
    }

    if (!input.password || input.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    if (input.username && input.username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }

    const validRoles = ['admin', 'editor', 'author', 'viewer'];
    if (input.role && !validRoles.includes(input.role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }
  }

  /**
   * Ensure email uniqueness
   */
  private async ensureEmailUnique(email: string, excludeId?: string): Promise<void> {
    const existing = await this.database.getUserByEmail(email.toLowerCase());
    if (existing && existing.id !== excludeId) {
      throw new Error(`User with email "${email}" already exists`);
    }
  }

  /**
   * Ensure username uniqueness
   */
  private async ensureUsernameUnique(username: string, excludeId?: string): Promise<void> {
    const existing = await this.database.getUserByUsername(username);
    if (existing && existing.id !== excludeId) {
      throw new Error(`User with username "${username}" already exists`);
    }
  }

  /**
   * Hash password
   */
  private async hashPassword(password: string): Promise<string> {
    // In real implementation, use bcrypt or argon2
    // For now, using simple hash (replace with proper implementation)
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  /**
   * Verify password
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    // In real implementation, use bcrypt.compare
    const crypto = await import('crypto');
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    return hashedPassword === hash;
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: User): string {
    // In real implementation, use proper JWT library
    // For now, returning a simple token (replace with proper implementation)
    const crypto = require('crypto');
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      iat: Date.now()
    };
    return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
