import { Router, Request, Response } from 'express'
import { supabasePublic, supabaseAdmin, createSupabaseClientForUser } from '../supabaseClient'
import type { TablesInsert, TablesUpdate } from '@my-forum/db-types'
import { authMiddleware } from '../middleware/authMiddleware'
import { isAdmin } from '../middleware/isAdminMiddleware'
import { cacheMiddleware, cacheHelpers, cacheTags } from '../middleware/cacheMiddleware'
import { createPageSchema, updatePageSchema, validateRequest } from '../validation/schemas'
const z = require('zod')

const router = Router()

// GET /api/pages/admin - админ: все страницы (включая черновики)
router.get('/admin', authMiddleware, isAdmin, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('pages')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch pages' })
    }
    return res.status(200).json({ data: data ?? [] })
  } catch {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

// GET /api/pages - публично: только опубликованные страницы
router.get('/',
  cacheMiddleware({
    ttl: 300, // 5 minutes
    tags: cacheTags.pages(),
    condition: (req) => req.method === 'GET' && !req.query.nocache
  }),
  async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabasePublic
        .from('pages')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: true })

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch pages' })
      }
      return res.status(200).json({ data: data ?? [] })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// POST /api/pages - админ: создать страницу
router.post(
  '/',
  authMiddleware,
  isAdmin,
  validateRequest(createPageSchema),
  async (req: Request, res: Response) => {
    try {
      const validatedBody = req.validatedBody;
      const payload: TablesInsert<'pages'> = {
        title: validatedBody.title,
        slug: validatedBody.slug,
        content: validatedBody.content ?? null,
        status: validatedBody.status,
        author_id: validatedBody.author_id ?? req.user?.id ?? null
      }

      const { data, error } = await supabaseAdmin
        .from('pages')
        .insert(payload)
        .select('*')
        .single()

      if (error) {
        return res.status(400).json({ error: 'Failed to create page' })
      }

      // Invalidate cache for pages
      await cacheHelpers.invalidateTags(['pages']);

      return res.status(201).json({ data })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// PUT /api/pages/:pageId - админ: обновить страницу
router.put(
  '/:pageId',
  authMiddleware,
  isAdmin,
  async (req: Request<{ pageId: string }>, res: Response) => {
    try {
      const pageIdSchema = z.number().int().positive();
      const pageIdNum = pageIdSchema.parse(Number(req.params.pageId));

      const validatedBody = updatePageSchema.parse(req.body);
      const updates: any = {
        ...validatedBody
      };

      if (validatedBody.author_id) {
        updates.author_id = validatedBody.author_id;
      }

      const { data, error } = await supabaseAdmin
        .from('pages')
        .update(updates)
        .eq('id', pageIdNum)
        .select('*')
        .single()

      if (error && (error as { code?: string }).code === 'PGRST116') {
        return res.status(404).json({ error: 'Page not found' })
      }
      if (error) {
        return res.status(400).json({ error: 'Failed to update page' })
      }
      if (!data) {
        return res.status(404).json({ error: 'Page not found' })
      }

      // Invalidate cache for pages (both general and specific page)
      await cacheHelpers.invalidateTags(['pages', `page:${data.id}`]);

      return res.status(200).json({ data })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// DELETE /api/pages/:pageId - админ: удалить страницу
router.delete(
  '/:pageId',
  authMiddleware,
  isAdmin,
  async (req: Request<{ pageId: string }>, res: Response) => {
    try {
      const pageIdSchema = z.number().int().positive();
      const pageIdNum = pageIdSchema.parse(Number(req.params.pageId));

      const { data, error } = await supabaseAdmin
        .from('pages')
        .delete()
        .eq('id', pageIdNum)
        .select('id')
        .single()

      if (error && (error as { code?: string }).code === 'PGRST116') {
        return res.status(404).json({ error: 'Page not found' })
      }
      if (error) {
        return res.status(400).json({ error: 'Failed to delete page' })
      }

      // Invalidate cache for pages (both general and specific page)
      await cacheHelpers.invalidateTags(['pages', `page:${pageIdNum}`]);

      return res.status(200).json({ deleted: true, id: data?.id })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

export default router
