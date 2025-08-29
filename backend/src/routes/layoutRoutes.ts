import { Router, Request, Response } from 'express'
import { supabasePublic, supabaseAdmin } from '../supabaseClient'
import type { TablesInsert, TablesUpdate, Json } from '@my-forum/db-types'
import { isAdmin } from '../middleware/authMiddleware'
import { isValidPlacement } from '../blockRegistry'
import { LayoutService } from '../services/layoutService'

const router = Router()

// GET /api/layout/admin/:pageIdentifier - админ: все блоки в иерархической структуре
router.get(
  '/admin/:pageIdentifier',
  isAdmin,
  async (req: Request<{ pageIdentifier: string }>, res: Response) => {
    try {
      const { pageIdentifier } = req.params

      // Получаем page_id по slug (pageIdentifier)
      const { data: pageData, error: pageError } = await supabaseAdmin
        .from('pages')
        .select('id')
        .eq('slug', pageIdentifier)
        .single()

      if (pageError || !pageData) {
        return res.status(404).json({ error: 'Page not found' })
      }

      const blocks = await LayoutService.getBlockTreeForPage(pageData.id)

      if (blocks === null) {
        return res.status(500).json({ error: 'Failed to fetch layout blocks' })
      }

      return res.status(200).json({ pageId: pageData.id, blocks })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// GET /api/layout/:pageIdentifier - публично: опубликованные блоки в иерархической структуре
router.get(
  '/:pageIdentifier',
  async (req: Request<{ pageIdentifier: string }>, res: Response) => {
    try {
      const { pageIdentifier } = req.params

      // Получаем page_id по slug (pageIdentifier)
      const { data: pageData, error: pageError } = await supabasePublic
        .from('pages')
        .select('id')
        .eq('slug', pageIdentifier)
        .single()

      if (pageError || !pageData) {
        return res.status(404).json({ error: 'Page not found' })
      }

      const blocks = await LayoutService.getBlockTreeForPage(pageData.id)

      if (blocks === null) {
        return res.status(500).json({ error: 'Failed to fetch layout blocks' })
      }

      // Фильтруем только опубликованные блоки (поскольку дерево может содержать черновики)
      const publishedBlocks = blocks.filter(block => block.status === 'published')

      return res.status(200).json({ pageId: pageData.id, blocks: publishedBlocks })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// POST /api/layout - админ: создать блок
router.post(
  '/',
  isAdmin,
  async (req: Request<{}, {}, {
    page_id: number
    block_type: string
    content?: Json | null
    metadata?: Json
    position?: number | null
    status?: string
    parent_block_id?: string | null
    slot?: string | null
  }>, res: Response) => {
    try {
      console.log('POST /api/layout called with body:', req.body);
      const { page_id, block_type, content, metadata, position, status, parent_block_id, slot } = req.body

      if (!page_id || !block_type) {
        return res
          .status(400)
          .json({ error: 'page_id and block_type are required' })
      }
      if (content !== undefined && typeof content !== 'object') {
        return res.status(400).json({ error: 'content must be a JSON object' })
      }

      // Валидация иерархии блоков
      const isValid = await isValidPlacement(block_type, parent_block_id || null, slot || null)
      if (!isValid) {
        return res.status(400).json({
          error: 'Недопустимое размещение блока',
          details: 'Блок данного типа не может быть размещен в указанном родительском блоке или слоте'
        })
      }

      console.log('Creating block:', { page_id, block_type, parent_block_id, slot })

      const blockData = {
        page_id,
        block_type,
        content: (content as Json | undefined) ?? {},
        metadata: (metadata as Json | undefined) ?? {},
        position: typeof position === 'number' ? position : 0,
        status: status || 'published',
        parent_block_id: parent_block_id || null,
        slot: slot || null
      }

      console.log('Block data for service:', blockData)

      const data = await LayoutService.createBlock(blockData)

      console.log('Service response:', data)

      if (!data) {
        return res.status(400).json({ error: 'Failed to create block' })
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
    req: Request<{ blockId: string }, {}, {
      page_id?: number
      block_type?: string
      content?: Json | null
      metadata?: Json
      position?: number | null
      status?: string
      parent_block_id?: string | null
      slot?: string | null
    }>,
    res: Response
  ) => {
    try {
      const allowed = [
        'page_id',
        'block_type',
        'content',
        'metadata',
        'position',
        'status',
        'parent_block_id',
        'slot'
      ]
      const body = req.body ?? {}
      const updates: any = {}

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
      if (updates.metadata !== undefined && typeof updates.metadata !== 'object') {
        return res.status(400).json({ error: 'metadata must be a JSON object' })
      }

      // Валидация иерархии блоков, если изменяются parent_block_id, slot или block_type
      if (updates.parent_block_id !== undefined || updates.slot !== undefined || updates.block_type !== undefined) {
        // Получаем текущий блок для получения актуального block_type
        const { data: currentBlock, error: fetchError } = await supabaseAdmin
          .from('layout_blocks')
          .select('block_type')
          .eq('id', req.params.blockId)
          .single()

        if (fetchError) {
          return res.status(404).json({ error: 'Block not found' })
        }

        const blockType = updates.block_type || currentBlock.block_type
        const parentBlockId = updates.parent_block_id
        const slot = updates.slot

        const isValid = await isValidPlacement(blockType, parentBlockId || null, slot || null)
        if (!isValid) {
          return res.status(400).json({
            error: 'Недопустимое размещение блока',
            details: 'Блок данного типа не может быть размещен в указанном родительском блоке или слоте'
          })
        }
      }

      const data = await LayoutService.updateBlock(req.params.blockId, updates)

      if (!data) {
        return res.status(404).json({ error: 'Block not found' })
      }

      return res.status(200).json({ data })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// DELETE /api/layout/:blockId - админ: удалить блок и все дочерние элементы (каскадное удаление)
router.delete(
  '/:blockId',
  isAdmin,
  async (req: Request<{ blockId: string }>, res: Response) => {
    try {
      const success = await LayoutService.deleteBlock(req.params.blockId)

      if (!success) {
        return res.status(404).json({ error: 'Block not found or failed to delete' })
      }

      return res.status(200).json({ deleted: true, id: req.params.blockId })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

export default router

// PUT /api/layout/positions - админ: массовое обновление позиций (bulk)
router.put(
  '/positions',
  isAdmin,
  async (req: Request<{}, {}, Array<{ id: string; position: number }>>, res: Response) => {
    try {
      const updates = Array.isArray(req.body) ? req.body : []
      if (!updates.length) {
        return res.status(400).json({ error: 'Empty updates payload' })
      }

      // Попытка вызвать RPC для атомарного обновления, если функция существует
      try {
        const { error: rpcError } = await supabaseAdmin.rpc('bulk_update_layout_positions', {
          updates: updates as unknown as Json
        })
        if (!rpcError) {
          return res.status(200).json({ updated: updates.length, failed: 0 })
        }
        // если RPC вернул ошибку — падаем на фолбэк ниже
        // eslint-disable-next-line no-console
        console.warn('bulk_update_layout_positions RPC failed, fallback to iterative updates:', rpcError)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('bulk_update_layout_positions RPC not available, fallback to iterative updates')
      }

      // Фолбэк: поштучные обновления (неатомарно)
      const failed: Array<{ id: string; error: string }> = []
      for (const u of updates) {
        if (!u || typeof u.id !== 'string' || typeof u.position !== 'number') {
          failed.push({ id: String(u?.id ?? 'unknown'), error: 'Invalid payload item' })
          continue
        }
        const { error } = await supabaseAdmin
          .from('layout_blocks')
          .update({ position: u.position })
          .eq('id', u.id)
        if (error) {
          failed.push({ id: u.id, error: error.message })
        }
      }

      if (failed.length > 0) {
        return res.status(207).json({ updated: updates.length - failed.length, failed })
      }
      return res.status(200).json({ updated: updates.length, failed: 0 })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// POST /api/layout/:pageIdentifier/revisions - админ: создать ревизию (снимок текущей раскладки)
router.post(
  '/:pageIdentifier/revisions',
  isAdmin,
  async (req: Request<{ pageIdentifier: string }>, res: Response) => {
    try {
      const { pageIdentifier } = req.params

      // Получаем page_id по slug
      const { data: pageData, error: pageError } = await supabaseAdmin
        .from('pages')
        .select('id')
        .eq('slug', pageIdentifier)
        .single()

      if (pageError || !pageData) {
        return res.status(404).json({ error: 'Page not found' })
      }

      // Получаем дерево блоков для создания снимка
      const blocks = await LayoutService.getBlockTreeForPage(pageData.id)

      if (blocks === null) {
        return res.status(500).json({ error: 'Failed to read layout for snapshot' })
      }

      const snapshot = blocks
      const { data, error } = await supabaseAdmin
        .from('layout_revisions')
        .insert({ page_identifier: pageIdentifier, snapshot, created_by: (req.user as any)?.id ?? null })
        .select('*')
        .single()

      if (error) {
        return res.status(400).json({ error: 'Failed to create revision', details: error.message })
      }
      return res.status(201).json({ data })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// GET /api/layout/:pageIdentifier/revisions - админ: список ревизий
router.get(
  '/:pageIdentifier/revisions',
  isAdmin,
  async (req: Request<{ pageIdentifier: string }>, res: Response) => {
    try {
      const { pageIdentifier } = req.params
      const { data, error } = await supabaseAdmin
        .from('layout_revisions')
        .select('*')
        .eq('page_identifier', pageIdentifier)
        .order('created_at', { ascending: false })

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch revisions' })
      }
      return res.status(200).json({ data: data ?? [] })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// POST /api/layout/:pageIdentifier/revisions/:revisionId/revert - админ: откат к ревизии
router.post(
  '/:pageIdentifier/revisions/:revisionId/revert',
  isAdmin,
  async (req: Request<{ pageIdentifier: string; revisionId: string }>, res: Response) => {
    try {
      const { pageIdentifier, revisionId } = req.params

      // Получаем page_id по slug
      const { data: pageData, error: pageError } = await supabaseAdmin
        .from('pages')
        .select('id')
        .eq('slug', pageIdentifier)
        .single()

      if (pageError || !pageData) {
        return res.status(404).json({ error: 'Page not found' })
      }

      // Сначала пробуем RPC для атомарности
      try {
        const { error: rpcError } = await supabaseAdmin.rpc('revert_layout_to_revision', {
          p_page_id: pageData.id,
          p_revision_id: revisionId
        })
        if (!rpcError) {
          return res.status(200).json({ reverted: true })
        }
        // eslint-disable-next-line no-console
        console.warn('revert_layout_to_revision RPC failed, fallback to iterative revert:', rpcError)
      } catch {
        // eslint-disable-next-line no-console
        console.warn('revert_layout_to_revision RPC not available, fallback to iterative revert')
      }

      // Фолбэк: неатомарный откат
      const { data: rev, error: revError } = await supabaseAdmin
        .from('layout_revisions')
        .select('*')
        .eq('id', revisionId)
        .single()

      if (revError || !rev) {
        return res.status(404).json({ error: 'Revision not found' })
      }

      // Удаляем текущие блоки страницы
      const { error: delError } = await supabaseAdmin
        .from('layout_blocks')
        .delete()
        .eq('page_id', pageData.id)
      if (delError) {
        return res.status(400).json({ error: 'Failed to clear current layout', details: delError.message })
      }

      // Функция для рекурсивного восстановления блоков из дерева
      const restoreBlocksFromTree = async (blocks: BlockNode[], parentId: string | null = null): Promise<void> => {
        for (const block of blocks) {
          if (!block?.block_type) continue

          const insertPayload = {
            id: block.id,
            page_id: pageData.id,
            block_type: block.block_type,
            content: block.content ?? {},
            metadata: block.metadata ?? {},
            position: typeof block.position === 'number' ? block.position : 0,
            status: block.status || 'draft',
            parent_block_id: parentId,
            slot: block.slot || null,
            depth: block.depth || 0
          }

          const { error: insError } = await supabaseAdmin
            .from('layout_blocks')
            .insert(insertPayload)

          if (insError) {
            throw new Error(`Failed to insert block from snapshot: ${insError.message}`)
          }

          // Рекурсивно восстанавливаем дочерние блоки
          if (block.children && block.children.length > 0) {
            await restoreBlocksFromTree(block.children, block.id)
          }
        }
      }

      // Восстанавливаем блоки из дерева snapshot
      const snapshot = Array.isArray(rev.snapshot) ? rev.snapshot as BlockNode[] : []
      await restoreBlocksFromTree(snapshot)

      return res.status(200).json({ reverted: true })
    } catch (error) {
      console.error('Revert error:', error)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)