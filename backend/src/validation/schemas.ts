import { z } from 'zod';

// Базовые схемы для повторяющихся типов
export const jsonSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.record(z.any()),
  z.array(z.any())
]);

export const uuidSchema = z.string().uuid();
export const slugSchema = z.string().min(1).max(200).regex(/^[a-z0-9-]+$/);
export const statusSchema = z.enum(['draft', 'published', 'archived']);

// Схемы для страниц (pages)
export const createPageSchema = z.object({
  title: z.string().min(1).max(255),
  slug: slugSchema,
  content: z.string().optional(),
  status: statusSchema.default('draft'),
  author_id: uuidSchema.optional()
});

export const updatePageSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: slugSchema.optional(),
  content: z.string().optional(),
  status: statusSchema.optional(),
  author_id: uuidSchema.optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

// Схемы для блоков layout (layout_blocks)
export const createBlockSchema = z.object({
  page_id: z.number().int().positive(),
  block_type: z.string().min(1).max(100),
  content: jsonSchema.optional().default({}),
  metadata: jsonSchema.optional().default({}),
  position: z.number().int().min(0).optional().default(0),
  status: statusSchema.default('published'),
  parent_block_id: uuidSchema.optional().nullable(),
  slot: z.string().max(100).optional().nullable()
});

export const updateBlockSchema = z.object({
  page_id: z.number().int().positive().optional(),
  block_type: z.string().min(1).max(100).optional(),
  content: jsonSchema.optional(),
  metadata: jsonSchema.optional(),
  position: z.number().int().min(0).optional(),
  status: statusSchema.optional(),
  parent_block_id: uuidSchema.optional().nullable(),
  slot: z.string().max(100).optional().nullable()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

// Схемы для массового обновления позиций
export const positionUpdateSchema = z.object({
  id: uuidSchema,
  position: z.number().int().min(0)
});

export const bulkUpdatePositionsSchema = z.array(positionUpdateSchema).min(1);

// Схемы для переиспользуемых блоков (reusable_blocks)
export const createReusableBlockSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().min(1).max(100).default('general'),
  preview_image_url: z.string().url().optional(),
  tags: z.array(z.string()).default([])
});

export const updateReusableBlockSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  category: z.string().min(1).max(100).optional(),
  preview_image_url: z.string().url().optional(),
  tags: z.array(z.string()).optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

// Схемы для контента переиспользуемых блоков
export const createReusableBlockContentSchema = z.object({
  reusable_block_id: uuidSchema,
  version: z.number().int().positive(),
  content_snapshot: jsonSchema,
  comment: z.string().optional()
});

// Схемы для шаблонов страниц
export const createPageTemplateSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  blocks: jsonSchema,
  preview_url: z.string().url().optional()
});

export const updatePageTemplateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  blocks: jsonSchema.optional(),
  preview_url: z.string().url().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

// Схемы для категорий
export const createCategorySchema = z.object({
  name: z.string().min(1).max(255),
  slug: slugSchema,
  position: z.number().int().min(0).optional(),
  icon_svg: z.string().optional()
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: slugSchema.optional(),
  position: z.number().int().min(0).optional(),
  icon_svg: z.string().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

// Схемы для секций
export const createSectionSchema = z.object({
  name: z.string().min(1).max(255),
  category_id: z.number().int().positive(),
  description: z.string().optional(),
  external_url: z.string().url().optional(),
  icon_svg: z.string().optional(),
  page_id: z.number().int().positive().optional(),
  position: z.number().int().min(0).optional()
});

export const updateSectionSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  category_id: z.number().int().positive().optional(),
  description: z.string().optional(),
  external_url: z.string().url().optional(),
  icon_svg: z.string().optional(),
  page_id: z.number().int().positive().optional(),
  position: z.number().int().min(0).optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

// Схемы для ревизий layout
export const createLayoutRevisionSchema = z.object({
  page_identifier: z.string().min(1).max(255),
  snapshot: jsonSchema
});

// Расширяем типы Express Request
declare global {
  namespace Express {
    interface Request {
      validatedBody?: any;
      validatedParams?: any;
      validatedQuery?: any;
      user?: {
        id: string;
        role: string;
        username: string | null;
      };
    }
  }
}

// Middleware для валидации
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const validatedData = schema.parse(req.body);
      req.validatedBody = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Вспомогательные функции валидации
export const validateParams = (schema: z.ZodSchema, paramName: string) => {
  return (req: any, res: any, next: any) => {
    try {
      const validatedParam = schema.parse(req.params[paramName]);
      req.validatedParams = { ...req.validatedParams, [paramName]: validatedParam };
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: `Invalid ${paramName} parameter`,
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const validatedQuery = schema.parse(req.query);
      req.validatedQuery = validatedQuery;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Invalid query parameters',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};
