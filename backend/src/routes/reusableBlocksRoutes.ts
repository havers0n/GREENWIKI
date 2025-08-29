import { Router, Request, Response } from 'express'
import { supabaseAdmin } from '../supabaseClient'
import type { Json } from '@my-forum/db-types'
import { isAdmin } from '../middleware/authMiddleware'
import { ReusableBlocksService } from '../services/reusableBlocksService'

const router = Router()

// Интерфейсы для запросов
interface CreateReusableBlockRequest {
  name: string
  description?: string
  category?: string
  tags?: string[]
  sourceBlockIds: string[]
  rootBlockId: string
}

interface InstantiateBlockRequest {
  pageIdentifier: string
  parentBlockId?: string
  slot?: string
  position?: number
  overrides?: Record<string, Json>
}

interface UpdateOverridesRequest {
  overrides: Record<string, Json>
}

// POST /api/reusable-blocks - Создание нового переиспользуемого блока
router.post('/', isAdmin, async (req: Request<{}, any, CreateReusableBlockRequest>, res: Response) => {
  try {
    const { name, description, category, tags, sourceBlockIds, rootBlockId } = req.body

    // Валидация обязательных полей
    if (!name || !sourceBlockIds || sourceBlockIds.length === 0 || !rootBlockId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, sourceBlockIds, rootBlockId'
      })
    }

    // Проверяем, что rootBlockId находится в sourceBlockIds
    if (!sourceBlockIds.includes(rootBlockId)) {
      return res.status(400).json({
        success: false,
        error: 'rootBlockId must be included in sourceBlockIds'
      })
    }

    // Создаем переиспользуемый блок
    const result = await ReusableBlocksService.createReusableBlock({
      name,
      description,
      category,
      tags,
      sourceBlockIds,
      rootBlockId,
      createdBy: req.user?.id // Предполагаем, что middleware устанавливает req.user
    })

    if (!result) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create reusable block'
      })
    }

    return res.status(201).json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error creating reusable block:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// GET /api/reusable-blocks - Получение списка переиспользуемых блоков
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      category,
      search,
      tags,
      limit,
      offset,
      sortBy,
      sortOrder
    } = req.query

    // Парсим параметры
    const params = {
      category: typeof category === 'string' ? category : undefined,
      search: typeof search === 'string' ? search : undefined,
      tags: typeof tags === 'string' ? tags.split(',') : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
      sortBy: typeof sortBy === 'string' ? sortBy : undefined,
      sortOrder: (typeof sortOrder === 'string' && ['asc', 'desc'].includes(sortOrder))
        ? sortOrder as 'asc' | 'desc'
        : undefined
    }

    const result = await ReusableBlocksService.getReusableBlocks(params)

    return res.status(200).json({
      success: true,
      data: {
        items: result.items,
        total: result.total,
        hasMore: (params.offset || 0) + (params.limit || 50) < result.total
      }
    })
  } catch (error) {
    console.error('Error fetching reusable blocks:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// GET /api/reusable-blocks/:id - Получение конкретного переиспользуемого блока
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params

    const { data: reusableBlock, error } = await supabaseAdmin
      .from('reusable_blocks')
      .select(`
        *,
        content:reusable_block_content(*)
      `)
      .eq('id', id)
      .single()

    if (error || !reusableBlock) {
      return res.status(404).json({
        success: false,
        error: 'Reusable block not found'
      })
    }

    // Получаем статистику использования
    const { count: usageCount } = await supabaseAdmin
      .from('block_instances')
      .select('*', { count: 'exact', head: true })
      .eq('reusable_block_id', id)

    return res.status(200).json({
      success: true,
      data: {
        ...reusableBlock,
        usage_count: usageCount || 0
      }
    })
  } catch (error) {
    console.error('Error fetching reusable block:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// PUT /api/reusable-blocks/:id - Обновление метаданных переиспользуемого блока
router.put('/:id', isAdmin, async (req: Request<{ id: string }, any, Partial<CreateReusableBlockRequest>>, res: Response) => {
  try {
    const { id } = req.params
    const { name, description, category, tags } = req.body

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (tags !== undefined) updateData.tags = tags

    const { data: updatedBlock, error } = await supabaseAdmin
      .from('reusable_blocks')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        content:reusable_block_content(*)
      `)
      .single()

    if (error || !updatedBlock) {
      return res.status(404).json({
        success: false,
        error: 'Reusable block not found or update failed'
      })
    }

    return res.status(200).json({
      success: true,
      data: updatedBlock
    })
  } catch (error) {
    console.error('Error updating reusable block:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// DELETE /api/reusable-blocks/:id - Удаление переиспользуемого блока
router.delete('/:id', isAdmin, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params

    const success = await ReusableBlocksService.deleteReusableBlock(id)

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Reusable block not found or deletion failed'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Reusable block deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting reusable block:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// POST /api/reusable-blocks/:id/instantiate - Создание экземпляра переиспользуемого блока
router.post('/:id/instantiate', async (req: Request<{ id: string }, any, InstantiateBlockRequest>, res: Response) => {
  try {
    const { id } = req.params
    const { pageIdentifier, parentBlockId, slot, position, overrides } = req.body

    // Валидация обязательных полей
    if (!pageIdentifier) {
      return res.status(400).json({
        success: false,
        error: 'pageIdentifier is required'
      })
    }

    // Получаем page_id по pageIdentifier (slug)
    const { data: pageData, error: pageError } = await supabaseAdmin
      .from('pages')
      .select('id')
      .eq('slug', pageIdentifier)
      .single()

    if (pageError || !pageData) {
      return res.status(404).json({
        success: false,
        error: 'Page not found'
      })
    }

    // Создаем экземпляр
    const result = await ReusableBlocksService.instantiateBlock({
      reusableBlockId: id,
      pageId: pageData.id,
      parentBlockId: parentBlockId || null,
      slot: slot || null,
      position: position || 0,
      overrides: overrides || {}
    })

    if (!result) {
      return res.status(500).json({
        success: false,
        error: 'Failed to instantiate reusable block'
      })
    }

    return res.status(201).json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error instantiating reusable block:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// PUT /api/block-instances/:instanceId/overrides - Обновление overrides для экземпляра
router.put('/instances/:instanceId/overrides', async (req: Request<{ instanceId: string }, any, UpdateOverridesRequest>, res: Response) => {
  try {
    const { instanceId } = req.params
    const { overrides } = req.body

    // Валидация
    if (!overrides || typeof overrides !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Valid overrides object is required'
      })
    }

    const success = await ReusableBlocksService.updateInstanceOverrides(instanceId, overrides)

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Block instance not found or update failed'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Overrides updated successfully'
    })
  } catch (error) {
    console.error('Error updating instance overrides:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// GET /api/reusable-blocks/categories - Получение списка доступных категорий
router.get('/categories/list', async (_req: Request, res: Response) => {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('reusable_blocks')
      .select('category')
      .not('category', 'is', null)

    if (error) {
      console.error('Error fetching categories:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch categories'
      })
    }

    // Получаем уникальные категории
    const uniqueCategories = [...new Set(categories.map(c => c.category))]

    return res.status(200).json({
      success: true,
      data: uniqueCategories
    })
  } catch (error) {
    console.error('Error in categories endpoint:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

export default router
