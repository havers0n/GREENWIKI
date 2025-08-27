import { Router, Request, Response } from 'express'
import { supabasePublic, supabaseAdmin } from '../supabaseClient'
import type { TablesInsert, TablesUpdate } from '@my-forum/db-types'
import { isAdmin } from '../middleware/authMiddleware'

const router = Router()

// GET /api/pages/admin - админ: все страницы (включая черновики)
router.get('/admin', isAdmin, async (_req: Request, res: Response) => {
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
router.get('/', async (_req: Request, res: Response) => {
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
})

// POST /api/pages - админ: создать страницу
router.post(
  '/',
  isAdmin,
  async (req: Request<{}, {}, TablesInsert<'pages'>>, res: Response) => {
    try {
      const { title, slug, content, status, author_id } = req.body

      if (!title || !slug) {
        return res.status(400).json({ error: 'title and slug are required' })
      }

      const payload: TablesInsert<'pages'> = {
        title,
        slug,
        content: content ?? null,
        status: status || 'draft',
        author_id: (author_id as string | undefined) ?? req.user?.id ?? null
      }

      const { data, error } = await supabaseAdmin
        .from('pages')
        .insert(payload)
        .select('*')
        .single()

      if (error) {
        return res
          .status(400)
          .json({ error: 'Failed to create page', details: error.message })
      }
      return res.status(201).json({ data })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// PUT /api/pages/:pageId - админ: обновить страницу
router.put(
  '/:pageId',
  isAdmin,
  async (
    req: Request<{ pageId: string }, {}, Partial<TablesUpdate<'pages'>>>,
    res: Response
  ) => {
    try {
      const pageIdNum = Number(req.params.pageId)
      if (!Number.isInteger(pageIdNum)) {
        return res.status(400).json({ error: 'Invalid pageId' })
      }

      const allowed: Array<keyof TablesUpdate<'pages'>> = [
        'title',
        'slug',
        'content',
        'status',
        'author_id'
      ]
      const body = req.body ?? {}
      const updates: Partial<TablesUpdate<'pages'>> = {}

      for (const key of allowed) {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
          updates[key] = body[key]
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No fields to update' })
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
        return res
          .status(400)
          .json({ error: 'Failed to update page', details: error.message })
      }
      if (!data) {
        return res.status(404).json({ error: 'Page not found' })
      }

      return res.status(200).json({ data })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// DELETE /api/pages/:pageId - админ: удалить страницу
router.delete(
  '/:pageId',
  isAdmin,
  async (req: Request<{ pageId: string }>, res: Response) => {
    try {
      const pageIdNum = Number(req.params.pageId)
      if (!Number.isInteger(pageIdNum)) {
        return res.status(400).json({ error: 'Invalid pageId' })
      }

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
        return res
          .status(400)
          .json({ error: 'Failed to delete page', details: error.message })
      }

      return res.status(200).json({ deleted: true, id: data?.id })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

export default router
