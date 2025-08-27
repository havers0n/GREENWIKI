import { Router, Request, Response } from 'express'
import { supabasePublic, supabaseAdmin } from '../supabaseClient'
import type { TablesInsert, TablesUpdate } from '@my-forum/db-types'
import { isAdmin } from '../middleware/authMiddleware'

const router = Router()

// GET /api/categories/ - публично: все категории по position
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabasePublic
      .from('categories')
      .select('*')
      .order('position', { ascending: true })

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch categories' })
    }
    return res.status(200).json({ data })
  } catch {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

// POST /api/categories/ - админ: создать категорию
router.post(
  '/',
  isAdmin,
  async (req: Request<{}, {}, TablesInsert<'categories'>>, res: Response) => {
    try {
      const { name, slug, position, icon_svg } = req.body

      if (!name || !slug) {
        return res.status(400).json({ error: 'name and slug are required' })
      }

      const payload: TablesInsert<'categories'> = {
        name,
        slug,
        position: typeof position === 'number' ? position : 0,
        icon_svg: icon_svg ?? null
      }

      const { data, error } = await supabaseAdmin
        .from('categories')
        .insert(payload)
        .select('*')
        .single()

      if (error) {
        return res
          .status(400)
          .json({ error: 'Failed to create category', details: error.message })
      }
      return res.status(201).json({ data })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// PUT /api/categories/:categoryId - админ: обновить категорию
router.put(
  '/:categoryId',
  isAdmin,
  async (
    req: Request<{ categoryId: string }, {}, Partial<TablesUpdate<'categories'>>>,
    res: Response
  ) => {
    try {
      const categoryIdNum = Number(req.params.categoryId)
      if (!Number.isInteger(categoryIdNum)) {
        return res.status(400).json({ error: 'Invalid categoryId' })
      }

      const allowed: Array<keyof TablesUpdate<'categories'>> = [
        'name',
        'slug',
        'position',
        'icon_svg'
      ]
      const body = req.body ?? {}
      const updates: Partial<TablesUpdate<'categories'>> = {}

      for (const key of allowed) {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
          updates[key] = body[key]
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No fields to update' })
      }

      const { data, error } = await supabaseAdmin
        .from('categories')
        .update(updates)
        .eq('id', categoryIdNum)
        .select('*')
        .single()

      if (error && (error as { code?: string }).code === 'PGRST116') {
        return res.status(404).json({ error: 'Category not found' })
      }
      if (error) {
        return res
          .status(400)
          .json({ error: 'Failed to update category', details: error.message })
      }
      if (!data) {
        return res.status(404).json({ error: 'Category not found' })
      }

      return res.status(200).json({ data })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// DELETE /api/categories/:categoryId - админ: удалить категорию
router.delete(
  '/:categoryId',
  isAdmin,
  async (req: Request<{ categoryId: string }>, res: Response) => {
    try {
      const categoryIdNum = Number(req.params.categoryId)
      if (!Number.isInteger(categoryIdNum)) {
        return res.status(400).json({ error: 'Invalid categoryId' })
      }

      const { data, error } = await supabaseAdmin
        .from('categories')
        .delete()
        .eq('id', categoryIdNum)
        .select('id')
        .single()

      if (error && (error as { code?: string }).code === 'PGRST116') {
        return res.status(404).json({ error: 'Category not found' })
      }
      if (error) {
        return res
          .status(400)
          .json({ error: 'Failed to delete category', details: error.message })
      }

      return res.status(200).json({ deleted: true, id: data?.id })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

export default router
