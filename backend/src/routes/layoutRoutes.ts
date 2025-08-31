import { Router, Request, Response } from 'express'
import { supabasePublic, supabaseAdmin, createSupabaseClientForUser } from '../supabaseClient'
import type { TablesInsert, TablesUpdate, Json } from '@my-forum/db-types'
import { authMiddleware } from '../middleware/authMiddleware'
import { isAdmin } from '../middleware/isAdminMiddleware'
import { isValidPlacement } from '../blockRegistry'
import { LayoutService } from '../services/layoutService'
import {
  createBlockSchema,
  updateBlockSchema,
  bulkUpdatePositionsSchema,
  validateRequest
} from '../validation/schemas'
import { z } from 'zod'

const router = Router()

// GET /api/layout/admin/:pageIdentifier - админ: все блоки в иерархической структуре
router.get(
  '/admin/:pageIdentifier',
  authMiddleware,
  isAdmin,
  async (req: Request<{ pageIdentifier: string }>, res: Response) => {
    try {
      const { pageIdentifier } = req.params

      // Получаем page_id по slug (pageIdentifier) используя supabaseAdmin (обходит RLS)
      const { data: pageData, error: pageError } = await supabaseAdmin
        .from('pages')
        .select('id')
        .eq('slug', pageIdentifier)
        .single()

      if (pageError || !pageData) {
        return res.status(404).json({ error: 'Page not found' })
      }

      // Используем сервис без токена - он работает с supabaseAdmin
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

      const blocks = await LayoutService.getPublicBlockTreeForPage(pageData.id)

      if (blocks === null) {
        return res.status(500).json({ error: 'Failed to fetch layout blocks' })
      }

      // Блоки уже отфильтрованы в сервисе (только опубликованные)

      return res.status(200).json({ pageId: pageData.id, blocks })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// POST /api/layout - админ: создать блок
router.post(
  '/',
  authMiddleware,
  isAdmin,
  validateRequest(createBlockSchema),
  async (req: Request, res: Response) => {
    try {
      const validatedBody = req.validatedBody;

      // Валидация иерархии блоков
      const isValid = await isValidPlacement(
        validatedBody.block_type,
        validatedBody.parent_block_id,
        validatedBody.slot
      );
      if (!isValid) {
        return res.status(400).json({
          error: 'Недопустимое размещение блока',
          details: 'Блок данного типа не может быть размещен в указанном родительском блоке или слоте'
        })
      }

      console.log('Creating block:', {
        page_id: validatedBody.page_id,
        block_type: validatedBody.block_type,
        parent_block_id: validatedBody.parent_block_id,
        slot: validatedBody.slot
      });

      const blockData = {
        page_id: validatedBody.page_id,
        block_type: validatedBody.block_type,
        content: validatedBody.content,
        metadata: validatedBody.metadata,
        position: validatedBody.position,
        status: validatedBody.status,
        parent_block_id: validatedBody.parent_block_id,
        slot: validatedBody.slot
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
  authMiddleware,
  isAdmin,
  async (req: Request<{ blockId: string }>, res: Response) => {
    try {
      const blockIdSchema = z.string().uuid();
      const blockId = blockIdSchema.parse(req.params.blockId);

      const validatedBody = updateBlockSchema.parse(req.body);
      const updates = validatedBody;

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

      const data = await LayoutService.updateBlock(req.params.blockId, updates as any)

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
  authMiddleware,
  isAdmin,
  async (req: Request<{ blockId: string }>, res: Response) => {
    try {
      const blockIdSchema = z.string().uuid();
      const blockId = blockIdSchema.parse(req.params.blockId);

      const success = await LayoutService.deleteBlock(blockId)

      if (!success) {
        return res.status(404).json({ error: 'Block not found or failed to delete' })
      }

      return res.status(200).json({ deleted: true, id: req.params.blockId })
    } catch {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// GET /api/layout/debug - отладка: информация о пользователе
router.get(
  '/debug',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      console.log('Debug endpoint called');
      console.log('User from auth:', req.user);
      console.log('Is admin:', req.isAdmin);

      // Проверим профиль пользователя в базе данных
      if (req.user?.id) {
        const { data: profile, error } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', req.user.id)
          .single();

        console.log('Profile from database:', profile);
        console.log('Profile error:', error);

        return res.status(200).json({
          user: req.user,
          isAdmin: req.isAdmin,
          profile,
          profileError: error
        });
      }

      return res.status(200).json({
        user: req.user,
        isAdmin: req.isAdmin
      });
    } catch (error) {
      console.error('Debug endpoint error:', error);
      return res.status(500).json({ error: 'Debug endpoint failed', details: error });
    }
  }
);

export default router

// PUT /api/layout/positions - админ: массовое обновление позиций (bulk)
router.put(
  '/positions',
  authMiddleware,
  isAdmin,
  validateRequest(bulkUpdatePositionsSchema),
  async (req: Request, res: Response) => {
    try {
      const updates = req.validatedBody;

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
        // Элементы уже провалидированы схемой, поэтому дополнительная проверка не нужна
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
  authMiddleware,
  isAdmin,
  async (req: Request<{ pageIdentifier: string }>, res: Response) => {
    try {
      const pageIdentifierSchema = z.string().min(1).max(255);
      const pageIdentifier = pageIdentifierSchema.parse(req.params.pageIdentifier);

      // Получаем page_id по slug используя supabaseAdmin (обходит RLS)
      const { data: pageData, error: pageError } = await supabaseAdmin
        .from('pages')
        .select('id')
        .eq('slug', pageIdentifier)
        .single()

      if (pageError || !pageData) {
        return res.status(404).json({ error: 'Page not found' })
      }

      // Получаем дерево блоков для создания снимка с помощью supabaseAdmin
      const blocks = await LayoutService.getBlockTreeForPage(pageData.id)

      if (blocks === null) {
        return res.status(500).json({ error: 'Failed to read layout for snapshot' })
      }

      const snapshot = blocks as unknown as Json
      const { data, error } = await supabaseAdmin
        .from('layout_revisions')
        .insert({
          page_id: pageData.id,
          page_identifier: pageIdentifier,
          snapshot,
          created_by: (req.user as any)?.id ?? null
        })
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
  authMiddleware,
  isAdmin,
  async (req: Request<{ pageIdentifier: string }>, res: Response) => {
    try {
      const pageIdentifierSchema = z.string().min(1).max(255);
      const pageIdentifier = pageIdentifierSchema.parse(req.params.pageIdentifier);

      // Получаем page_id по slug (pageIdentifier)
      const { data: pageData, error: pageError } = await supabaseAdmin
        .from('pages')
        .select('id')
        .eq('slug', pageIdentifier)
        .single();

      if (pageError || !pageData) {
        return res.status(404).json({ error: 'Page not found' });
      }

      const { data, error } = await supabaseAdmin
        .from('layout_revisions')
        .select('*')
        .eq('page_id', pageData.id)
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
  authMiddleware,
  isAdmin,
  async (req: Request<{ pageIdentifier: string; revisionId: string }>, res: Response) => {
    try {
      const pageIdentifierSchema = z.string().min(1).max(255);
      const revisionIdSchema = z.string().uuid();

      const pageIdentifier = pageIdentifierSchema.parse(req.params.pageIdentifier);
      const revisionId = revisionIdSchema.parse(req.params.revisionId);

      // Получаем page_id по slug
      const { data: pageData, error: pageError } = await supabaseAdmin
        .from('pages')
        .select('id')
        .eq('slug', pageIdentifier)
        .single()

      if (pageError || !pageData) {
        return res.status(404).json({ error: 'Page not found' })
      }

      // RPC-вызов закомментирован, так как процедуры revert_layout_to_revision может не быть в БД
      // try {
      //   const { error: rpcError } = await supabaseAdmin.rpc('revert_layout_to_revision', {
      //     p_page_id: pageData.id,
      //     p_revision_id: revisionId
      //   })
      //   if (!rpcError) {
      //     return res.status(200).json({ reverted: true })
      //   }
      //   // eslint-disable-next-line no-console
      //   console.warn('revert_layout_to_revision RPC failed, fallback to iterative revert:', rpcError)
      // } catch {
      //   // eslint-disable-next-line no-console
      //   console.warn('revert_layout_to_revision RPC not available, fallback to iterative revert')
      // }

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

      // TODO: Восстановление блоков из snapshot временно отключено
      // Функция для рекурсивного восстановления блоков из дерева
      /*
      const restoreBlocksFromTree = async (blocks: any[], parentId: string | null = null): Promise<void> => {
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
      const snapshot = Array.isArray(rev.snapshot) ? rev.snapshot : []
      await restoreBlocksFromTree(snapshot)
      */

      // Временная заглушка для восстановления ревизии
      return res.status(501).json({ error: 'Revision restore functionality is temporarily disabled' })
    } catch (error) {
      console.error('Revert error:', error)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)