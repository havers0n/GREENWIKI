import { Router, Request, Response } from 'express'
import { supabasePublic, supabaseAdmin } from '../supabaseClient'
import type { TablesInsert, TablesUpdate, Json } from '@my-forum/db-types'
import { isAdmin } from '../middleware/authMiddleware'
import { isValidPlacement } from '../blockRegistry'

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
        .select('id, block_type, content, metadata, page_identifier, position, status, parent_block_id, slot')
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
        .select('id, block_type, content, metadata, page_identifier, position, status, parent_block_id, slot')
        .eq('page_identifier', pageIdentifier)
        .eq('status', 'published')
        .order('position', { ascending: true })

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch layout blocks' })
      }

      return res.status(200).json({ data: data ?? [] })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// POST /api/layout - админ: создать блок
router.post(
  '/',
  // isAdmin, // Временно отключена проверка admin для отладки
  async (req: Request<{}, {}, TablesInsert<'layout_blocks'>>, res: Response) => {
    try {
      console.log('POST /api/layout called with body:', req.body);
      const { page_identifier, block_type, content, metadata, position, status, parent_block_id, slot } = req.body

      if (!page_identifier || !block_type) {
        return res
          .status(400)
          .json({ error: 'page_identifier and block_type are required' })
      }
      if (content !== undefined && typeof content !== 'object') {
        return res.status(400).json({ error: 'content must be a JSON object' })
      }

      // Валидация иерархии блоков (временно отключена для отладки DnD)
      // const isValid = await isValidPlacement(block_type, parent_block_id || null, slot || null)
      // if (!isValid) {
      //   return res.status(400).json({
      //     error: 'Недопустимое размещение блока',
      //     details: 'Блок данного типа не может быть размещен в указанном родительском блоке или слоте'
      //   })
      // }

      console.log('Creating block:', { page_identifier, block_type, parent_block_id, slot })

      const payload: TablesInsert<'layout_blocks'> = {
        page_identifier,
        block_type,
        content: (content as Json | undefined) ?? {},
        metadata: (metadata as Json | undefined) ?? {},
        position: typeof position === 'number' ? position : 0,
        status: status || 'published',
        parent_block_id: parent_block_id || null,
        slot: slot || null
      }

      console.log('Final payload for database:', payload)

      const { data, error } = await supabaseAdmin
        .from('layout_blocks')
        .insert(payload)
        .select('*')
        .single()

      console.log('Database response:', { data, error })

      if (error) {
        console.error('Database error details:', error)
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
        'metadata',
        'position',
        'status',
        'parent_block_id',
        'slot'
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
        const parentBlockId = updates.parent_block_id !== undefined ? updates.parent_block_id : undefined
        const slot = updates.slot !== undefined ? updates.slot : undefined

        // Если parent_block_id не был передан в обновлении, нам нужно получить текущее значение
        let actualParentBlockId: string | null = null
        if (parentBlockId === undefined) {
          const { data: blockWithParent } = await supabaseAdmin
            .from('layout_blocks')
            .select('parent_block_id')
            .eq('id', req.params.blockId)
            .single()
          actualParentBlockId = blockWithParent?.parent_block_id || null
        } else {
          actualParentBlockId = parentBlockId
        }

        const isValid = await isValidPlacement(blockType, actualParentBlockId, slot || null)
        if (!isValid) {
          return res.status(400).json({
            error: 'Недопустимое размещение блока',
            details: 'Блок данного типа не может быть размещен в указанном родительском блоке или слоте'
          })
        }
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
      const { data: blocks, error: selectError } = await supabaseAdmin
        .from('layout_blocks')
        .select('id, block_type, content, position, status, parent_block_id, slot')
        .eq('page_identifier', pageIdentifier)
        .order('position', { ascending: true })

      if (selectError) {
        return res.status(500).json({ error: 'Failed to read layout for snapshot' })
      }

      const snapshot = Array.isArray(blocks) ? blocks : []
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

      // Сначала пробуем RPC для атомарности
      try {
        const { error: rpcError } = await supabaseAdmin.rpc('revert_layout_to_revision', {
          p_page_identifier: pageIdentifier,
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

      const snapshot: Array<{ id?: string; block_type?: string; content?: Json; position?: number; status?: string; parent_block_id?: string | null; slot?: string | null }>
        = Array.isArray(rev.snapshot) ? rev.snapshot as any : (rev.snapshot?.blocks as any) || []

      // Удаляем текущие блоки страницы
      const { error: delError } = await supabaseAdmin
        .from('layout_blocks')
        .delete()
        .eq('page_identifier', pageIdentifier)
      if (delError) {
        return res.status(400).json({ error: 'Failed to clear current layout', details: delError.message })
      }

      // Вставляем из снимка
      for (const item of snapshot) {
        if (!item?.block_type) continue
        const insertPayload: TablesInsert<'layout_blocks'> = {
          id: item.id, // ВАЖНО: сохранить исходный ID для восстановления связей
          page_identifier: pageIdentifier,
          block_type: item.block_type,
          content: (item.content as Json | undefined) ?? {},
          position: typeof item.position === 'number' ? item.position : 0,
          status: (item.status as any) || 'draft',
          parent_block_id: item.parent_block_id || null, // ДОБАВИТЬ
          slot: item.slot || null                      // ДОБАВИТЬ
        }
        const { error: insError } = await supabaseAdmin
          .from('layout_blocks')
          .insert(insertPayload)
        if (insError) {
          return res.status(400).json({ error: 'Failed to insert block from snapshot', details: insError.message })
        }
      }

      return res.status(200).json({ reverted: true })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)