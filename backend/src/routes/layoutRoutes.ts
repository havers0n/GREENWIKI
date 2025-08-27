import { Router, Request, Response } from 'express'
import { supabasePublic, supabaseAdmin } from '../supabaseClient'
import type { TablesInsert, TablesUpdate, Json } from '@my-forum/db-types'
import { isAdmin } from '../middleware/authMiddleware'

const router = Router()

// GET /api/layout/admin/:pageIdentifier - админ: все блоки
router.get(
  '/admin/:pageIdentifier',
  isAdmin,
  async (req: Request<{ pageIdentifier: string }>, res: Response) => {
    try {
      const { pageIdentifier } = req.params
      const { data, error } = await supabaseAdmin
        .from('layout_blocks')
        .select('*')
        .eq('page_identifier', pageIdentifier)
        .order('position', { ascending: true })

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch layout blocks' })
      }
      return res.status(200).json({ data })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// GET /api/layout/:pageIdentifier - публично: опубликованные блоки
router.get(
  '/:pageIdentifier',
  async (req: Request<{ pageIdentifier: string }>, res: Response) => {
    try {
      const { pageIdentifier } = req.params
      const { data, error } = await supabasePublic
        .from('layout_blocks')
        .select('*')
        .eq('page_identifier', pageIdentifier)
        .eq('status', 'published')
        .order('position', { ascending: true })

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch layout blocks' })
      }
      return res.status(200).json({ data })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// POST /api/layout - админ: создать блок
router.post(
  '/',
  isAdmin,
  async (req: Request<{}, {}, TablesInsert<'layout_blocks'>>, res: Response) => {
    try {
      const { page_identifier, block_type, content, position, status } = req.body

      if (!page_identifier || !block_type) {
        return res
          .status(400)
          .json({ error: 'page_identifier and block_type are required' })
      }
      if (content !== undefined && typeof content !== 'object') {
        return res.status(400).json({ error: 'content must be a JSON object' })
      }

      const payload: TablesInsert<'layout_blocks'> = {
        page_identifier,
        block_type,
        content: (content as Json | undefined) ?? {},
        position: typeof position === 'number' ? position : 0,
        status: status || 'published'
      }

      const { data, error } = await supabaseAdmin
        .from('layout_blocks')
        .insert(payload)
        .select('*')
        .single()

      if (error) {
        return res
          .status(400)
          .json({ error: 'Failed to create block', details: error.message })
      }
      return res.status(201).json({ data })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// PUT /api/layout/:blockId - админ: обновить блок
router.put(
  '/:blockId',
  isAdmin,
  async (
    req: Request<{ blockId: string }, {}, Partial<TablesUpdate<'layout_blocks'>>>,
    res: Response
  ) => {
    try {
      const allowed: Array<keyof TablesUpdate<'layout_blocks'>> = [
        'page_identifier',
        'block_type',
        'content',
        'position',
        'status'
      ]
      const body = req.body ?? {}
      const updates: Partial<TablesUpdate<'layout_blocks'>> = {}

      for (const key of allowed) {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
          updates[key] = body[key]
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No fields to update' })
      }
      if (updates.content !== undefined && typeof updates.content !== 'object') {
        return res.status(400).json({ error: 'content must be a JSON object' })
      }

      const { data, error } = await supabaseAdmin
        .from('layout_blocks')
        .update(updates)
        .eq('id', req.params.blockId)
        .select('*')
        .single()

      if (error && (error as { code?: string }).code === 'PGRST116') {
        return res.status(404).json({ error: 'Block not found' })
      }
      if (error) {
        return res
          .status(400)
          .json({ error: 'Failed to update block', details: error.message })
      }
      if (!data) {
        return res.status(404).json({ error: 'Block not found' })
      }

      return res.status(200).json({ data })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// DELETE /api/layout/:blockId - админ: удалить блок
router.delete(
  '/:blockId',
  isAdmin,
  async (req: Request<{ blockId: string }>, res: Response) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('layout_blocks')
        .delete()
        .eq('id', req.params.blockId)
        .select('id')
        .single()

      if (error && (error as { code?: string }).code === 'PGRST116') {
        return res.status(404).json({ error: 'Block not found' })
      }
      if (error) {
        return res
          .status(400)
          .json({ error: 'Failed to delete block', details: error.message })
      }

      return res.status(200).json({ deleted: true, id: data?.id })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

export default router
