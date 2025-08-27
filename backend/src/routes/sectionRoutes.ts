import { Router, Request, Response } from 'express'
import { supabasePublic, supabaseAdmin } from '../supabaseClient'
import type { TablesInsert, TablesUpdate } from '@my-forum/db-types'
import { isAdmin } from '../middleware/authMiddleware'

const router = Router()

// GET /api/sections/by-category/:categoryId - публично: секции по категории по position
router.get(
  '/by-category/:categoryId',
  async (req: Request<{ categoryId: string }>, res: Response) => {
    try {
      const categoryIdNum = Number(req.params.categoryId)
      if (!Number.isInteger(categoryIdNum)) {
        return res.status(400).json({ error: 'Invalid categoryId' })
      }

      // Демо-данные для демонстрации работы
      const demoSections = [
        {
          id: 1,
          category_id: categoryIdNum,
          name: 'Установка игры',
          description: 'Инструкции по установке',
          icon_svg: '<svg>install</svg>',
          position: 1,
          external_url: 'https://example.com/install',
          page_id: null,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          category_id: categoryIdNum,
          name: 'Дополнительное ПО',
          description: 'Рекомендуемое ПО',
          icon_svg: '<svg>software</svg>',
          position: 2,
          external_url: 'https://example.com/software',
          page_id: null,
          created_at: new Date().toISOString()
        }
      ]

      return res.status(200).json({ data: demoSections })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// POST /api/sections/ - админ: создать секцию
router.post(
  '/',
  isAdmin,
  async (req: Request<{}, {}, TablesInsert<'sections'>>, res: Response) => {
    try {
      const {
        name,
        description,
        position,
        icon_svg,
        category_id,
        page_id,
        external_url
      } = req.body

      if (!name || typeof category_id !== 'number') {
        return res.status(400).json({ error: 'name and category_id are required' })
      }

      const hasPage = page_id !== undefined && page_id !== null
      const hasUrl = external_url !== undefined && external_url !== null

      if (hasPage === hasUrl) {
        return res
          .status(400)
          .json({ error: 'Exactly one of page_id or external_url must be provided' })
      }
      if (hasUrl && typeof external_url !== 'string') {
        return res.status(400).json({ error: 'external_url must be a string' })
      }
      if (hasUrl && !/^https?:\/\//i.test(external_url as string)) {
        return res
          .status(400)
          .json({ error: 'external_url must start with http:// or https://' })
      }

      const payload: TablesInsert<'sections'> = {
        name,
        description: description ?? null,
        position: typeof position === 'number' ? position : 0,
        icon_svg: icon_svg ?? null,
        category_id,
        page_id: hasPage ? (page_id as number) : null,
        external_url: hasUrl ? (external_url as string) : null
      }

      const { data, error } = await supabaseAdmin
        .from('sections')
        .insert(payload)
        .select('*')
        .single()

      if (error) {
        return res
          .status(400)
          .json({ error: 'Failed to create section', details: error.message })
      }
      return res.status(201).json({ data })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// PUT /api/sections/:sectionId - админ: обновить секцию
router.put(
  '/:sectionId',
  isAdmin,
  async (
    req: Request<{ sectionId: string }, {}, Partial<TablesUpdate<'sections'>>>,
    res: Response
  ) => {
    try {
      const sectionIdNum = Number(req.params.sectionId)
      if (!Number.isInteger(sectionIdNum)) {
        return res.status(400).json({ error: 'Invalid sectionId' })
      }

      const allowed: Array<keyof TablesUpdate<'sections'>> = [
        'name',
        'description',
        'position',
        'icon_svg',
        'category_id',
        'page_id',
        'external_url'
      ]
      const body = req.body ?? {}
      const updates: Partial<TablesUpdate<'sections'>> = {}

      for (const key of allowed) {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
          updates[key] = body[key]
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No fields to update' })
      }

      // Валидация XOR для page_id и external_url, если переданы
      const hasPage = Object.prototype.hasOwnProperty.call(updates, 'page_id') ? updates.page_id !== null : undefined
      const hasUrl = Object.prototype.hasOwnProperty.call(updates, 'external_url') ? updates.external_url !== null : undefined

      if (hasPage !== undefined && hasUrl !== undefined && hasPage === hasUrl) {
        return res
          .status(400)
          .json({ error: 'Exactly one of page_id or external_url must be provided' })
      }
      if (updates.external_url !== undefined) {
        if (updates.external_url !== null && typeof updates.external_url !== 'string') {
          return res.status(400).json({ error: 'external_url must be a string' })
        }
        if (updates.external_url && !/^https?:\/\//i.test(updates.external_url)) {
          return res
            .status(400)
            .json({ error: 'external_url must start with http:// or https://' })
        }
      }

      const { data, error } = await supabaseAdmin
        .from('sections')
        .update(updates)
        .eq('id', sectionIdNum)
        .select('*')
        .single()

      if (error && (error as { code?: string }).code === 'PGRST116') {
        return res.status(404).json({ error: 'Section not found' })
      }
      if (error) {
        return res
          .status(400)
          .json({ error: 'Failed to update section', details: error.message })
      }
      if (!data) {
        return res.status(404).json({ error: 'Section not found' })
      }

      return res.status(200).json({ data })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// DELETE /api/sections/:sectionId - админ: удалить секцию
router.delete(
  '/:sectionId',
  isAdmin,
  async (req: Request<{ sectionId: string }>, res: Response) => {
    try {
      const sectionIdNum = Number(req.params.sectionId)
      if (!Number.isInteger(sectionIdNum)) {
        return res.status(400).json({ error: 'Invalid sectionId' })
      }

      const { data, error } = await supabaseAdmin
        .from('sections')
        .delete()
        .eq('id', sectionIdNum)
        .select('id')
        .single()

      if (error && (error as { code?: string }).code === 'PGRST116') {
        return res.status(404).json({ error: 'Section not found' })
      }
      if (error) {
        return res
          .status(400)
          .json({ error: 'Failed to delete section', details: error.message })
      }

      return res.status(200).json({ deleted: true, id: data?.id })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

export default router
