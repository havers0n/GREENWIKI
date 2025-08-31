import { supabaseAdmin } from '../supabaseClient'
import type { Tables, TablesInsert, TablesUpdate, Json } from '@my-forum/db-types'
import { cacheService } from './cacheService'

// Расширенные типы для работы с переиспользуемыми блоками
export interface ReusableBlockWithContent extends Tables<'reusable_blocks'> {
  content?: Tables<'reusable_block_content'> | null
  usage_count?: number
}

export interface BlockTreeNode {
  id: string
  block_type: string
  content: Json | null
  metadata: Json
  position: number | null
  parent_block_id: string | null
  slot: string | null
  children?: BlockTreeNode[]
}

export interface CreateReusableBlockParams {
  name: string
  description?: string
  category?: string
  tags?: string[]
  sourceBlockIds: string[]
  rootBlockId: string
  createdBy?: string
}

export interface InstantiateBlockParams {
  reusableBlockId: string
  pageId: number
  parentBlockId?: string | null
  slot?: string | null
  position?: number
  overrides?: Record<string, Json>
}

export interface BlockInstanceWithBlocks {
  instance: Tables<'block_instances'>
  blocks: BlockTreeNode[]
}

// Сервис для работы с переиспользуемыми блоками
export class ReusableBlocksService {

  /**
   * Создает новый переиспользуемый блок из существующих блоков
   */
  static async createReusableBlock(params: CreateReusableBlockParams): Promise<ReusableBlockWithContent | null> {
    try {
      const { name, description, category = 'general', tags = [], sourceBlockIds, rootBlockId, createdBy } = params

      // Валидация исходных блоков
      if (sourceBlockIds.length === 0) {
        throw new Error('sourceBlockIds cannot be empty')
      }

      // Получаем дерево блоков для создания snapshot используя supabaseAdmin
      const blockTree = await this.getBlockTreeByIds(sourceBlockIds, rootBlockId)
      if (!blockTree) {
        throw new Error('Failed to build block tree from source blocks')
      }

      // Создаем запись в reusable_blocks
      const { data: reusableBlock, error: rbError } = await supabaseAdmin
        .from('reusable_blocks')
        .insert({
          name,
          description: description ?? null,
          category,
          tags,
          created_by: createdBy || null,
          version: 1
        })
        .select()
        .single()

      if (rbError || !reusableBlock) {
        console.error('Error creating reusable block:', rbError)
        return null
      }

      // Создаем snapshot контента
      const contentSnapshot = {
        rootBlockId,
        blocks: blockTree,
        createdAt: new Date().toISOString()
      } as unknown as Json

      const { data: content, error: contentError } = await supabaseAdmin
        .from('reusable_block_content')
        .insert({
          reusable_block_id: reusableBlock.id,
          version: 1,
          content_snapshot: contentSnapshot,
          created_by: createdBy || null,
          comment: null
        })
        .select('*')
        .single()

      if (contentError || !content) {
        console.error('Error creating reusable block content:', contentError)
        // Очистка в случае ошибки
        await supabaseAdmin.from('reusable_blocks').delete().eq('id', reusableBlock.id)
        return null
      }

      return {
        ...reusableBlock,
        content
      }
    } catch (error) {
      console.error('Error in createReusableBlock:', error)
      return null
    }
  }

  /**
   * Получает список переиспользуемых блоков с фильтрами и пагинацией
   * Использует кеширование для оптимизации производительности
   */
  static async getReusableBlocks(params: {
    category?: string
    search?: string
    tags?: string[]
    limit?: number
    offset?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<{ items: ReusableBlockWithContent[], total: number }> {
    console.log('[PERF] Starting getReusableBlocks...');
    const totalStart = performance.now();

    try {
      const {
        category,
        search,
        tags,
        limit = 50,
        offset = 0,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = params

      // --- Замер №1: Создание ключа кеша ---
      const cacheKeyStart = performance.now();
      const cacheKey = `reusable_blocks:${JSON.stringify({
        category,
        search,
        tags: tags?.sort(), // Сортируем теги для консистентности ключа
        limit,
        offset,
        sortBy,
        sortOrder
      })}`;
      const cacheKeyEnd = performance.now();
      console.log(`[PERF] Cache key creation took: ${(cacheKeyEnd - cacheKeyStart).toFixed(2)}ms`);

      // --- Замер №2: Проверка кеша ---
      const cacheCheckStart = performance.now();
      let cachedResult: { items: ReusableBlockWithContent[], total: number } | null = null;

      if (!search && offset === 0) {
        cachedResult = await cacheService.get<{ items: ReusableBlockWithContent[], total: number }>(cacheKey, {
          ttl: 600, // 10 минут для списков
          keyPrefix: 'reusable_blocks:',
        });

        if (cachedResult) {
          const cacheCheckEnd = performance.now();
          console.log(`[PERF] Cache hit! Returning cached data. Cache check took: ${(cacheCheckEnd - cacheCheckStart).toFixed(2)}ms`);
          console.log(`[PERF] Finished getReusableBlocks (cache hit). Total time: ${(cacheCheckEnd - totalStart).toFixed(2)}ms`);
          return cachedResult;
        }
      }

      const cacheCheckEnd = performance.now();
      console.log(`[PERF] Cache check took: ${(cacheCheckEnd - cacheCheckStart).toFixed(2)}ms`);

      // --- Замер №3: Построение запроса ---
      console.log('[PERF] Building Supabase query...');
      const queryBuildStart = performance.now();

      let query = supabaseAdmin
        .from('reusable_blocks')
        .select(`
          id, name, description, category, tags, preview_image_url, version, created_at, created_by, updated_at,
          content:reusable_block_content!inner(id, reusable_block_id, version, content_snapshot, created_at, created_by, comment),
          block_instances!left(count)
        `, { count: 'exact' })

      // Применяем фильтры
      if (category) {
        query = query.eq('category', category)
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      }

      if (tags && tags.length > 0) {
        // Фильтр по тегам - проверяем пересечение массивов
        query = query.overlaps('tags', tags)
      }

      // Сортировка
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Пагинация
      query = query.range(offset, offset + limit - 1)

      const queryBuildEnd = performance.now();
      console.log(`[PERF] Query building took: ${(queryBuildEnd - queryBuildStart).toFixed(2)}ms`);

      // --- Замер №4: Выполнение запроса к Supabase ---
      console.log('[PERF] Executing Supabase query...');
      const dbQueryStart = performance.now();
      const { data, error, count } = await query;
      const dbQueryEnd = performance.now();
      console.log(`[PERF] Supabase query took: ${(dbQueryEnd - dbQueryStart).toFixed(2)}ms`);

      if (error) {
        console.error('[ERROR] Supabase query failed:', error);
        const errorEnd = performance.now();
        console.log(`[PERF] Finished getReusableBlocks (error). Total time: ${(errorEnd - totalStart).toFixed(2)}ms`);
        return { items: [], total: 0 }
      }

      // --- Замер №5: Форматирование данных ---
      console.log('[PERF] Formatting data...');
      const formatStart = performance.now();
      const formattedData = (data || []).map(block => ({
        ...block,
        content: block.content?.[0] || null, // Извлекаем контент из массива
        usage_count: block.block_instances?.[0]?.count || 0, // Извлекаем счетчик из массива
        block_instances: undefined, // Удаляем служебное поле
      }));
      const formatEnd = performance.now();
      console.log(`[PERF] Data formatting took: ${(formatEnd - formatStart).toFixed(2)}ms`);

      const result = {
        items: formattedData,
        total: count || 0
      };

      // --- Замер №6: Кеширование результата ---
      const cacheSetStart = performance.now();
      if (!search && offset === 0) {
        console.log('[PERF] Caching result...');
        await cacheService.set(cacheKey, result, {
          ttl: 600, // 10 минут
          keyPrefix: 'reusable_blocks:',
        });
      }
      const cacheSetEnd = performance.now();
      console.log(`[PERF] Cache set took: ${(cacheSetEnd - cacheSetStart).toFixed(2)}ms`);

      const totalEnd = performance.now();
      console.log(`[PERF] Finished getReusableBlocks. Total time: ${(totalEnd - totalStart).toFixed(2)}ms`);

      return result;
    } catch (error) {
      console.error('[ERROR] Exception in getReusableBlocks:', error);
      const exceptionEnd = performance.now();
      console.log(`[PERF] Finished getReusableBlocks (exception). Total time: ${(exceptionEnd - totalStart).toFixed(2)}ms`);
      return { items: [], total: 0 }
    }
  }

  /**
   * Создает экземпляр переиспользуемого блока на странице
   */
  static async instantiateBlock(params: InstantiateBlockParams): Promise<BlockInstanceWithBlocks | null> {
    try {
      const { reusableBlockId, pageId, parentBlockId, slot, position = 0, overrides = {} } = params

      // Получаем последнюю версию контента переиспользуемого блока
      const { data: content, error: contentError } = await supabaseAdmin
        .from('reusable_block_content')
        .select('*')
        .eq('reusable_block_id', reusableBlockId)
        .order('version', { ascending: false })
        .limit(1)
        .single()

      if (contentError || !content) {
        console.error('Error fetching reusable block content:', contentError)
        return null
      }

      // Создаем запись экземпляра
      const { data: instance, error: instanceError } = await supabaseAdmin
        .from('block_instances')
        .insert({
          reusable_block_id: reusableBlockId,
          page_id: pageId,
          parent_block_id: parentBlockId ?? null,
          slot: slot ?? null,
          position: position ?? null,
          overrides: overrides ?? null
        })
        .select()
        .single()

      if (instanceError || !instance) {
        console.error('Error creating block instance:', instanceError)
        return null
      }

      // Клонируем дерево блоков
      const clonedBlocks = await this.cloneBlockTree(
        content.content_snapshot as any,
        pageId,
        instance.id,
        parentBlockId ?? null,
        position,
        slot ?? null
      )

      if (!clonedBlocks) {
        console.error('Error cloning block tree')
        // Очистка в случае ошибки
        await supabaseAdmin.from('block_instances').delete().eq('id', instance.id)
        return null
      }

      // Обновляем счетчик использования
      await this.incrementUsageCount(reusableBlockId)

      return {
        instance,
        blocks: clonedBlocks
      }
    } catch (error) {
      console.error('Error in instantiateBlock:', error)
      return null
    }
  }

  /**
   * Обновляет overrides для экземпляра
   */
  static async updateInstanceOverrides(instanceId: string, overrides: Record<string, Json>): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('block_instances')
        .update({
          overrides,
          updated_at: new Date().toISOString()
        })
        .eq('id', instanceId)

      if (error) {
        console.error('Error updating instance overrides:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateInstanceOverrides:', error)
      return false
    }
  }

  /**
   * Удаляет переиспользуемый блок и все связанные данные (использует supabaseAdmin)
   */
  static async deleteReusableBlock(reusableBlockId: string): Promise<boolean> {
    try {
      // Каскадное удаление через foreign key constraints используя supabaseAdmin
      const { error } = await supabaseAdmin
        .from('reusable_blocks')
        .delete()
        .eq('id', reusableBlockId)

      if (error) {
        console.error('Error deleting reusable block:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteReusableBlock:', error)
      return false
    }
  }

  // Вспомогательные методы

  /**
   * Получает дерево блоков по их ID (использует supabaseAdmin)
   */
  private static async getBlockTreeByIds(blockIds: string[], rootBlockId: string): Promise<BlockTreeNode[] | null> {
    try {
      // Получаем все блоки из списка используя supabaseAdmin (обходит RLS)
      const { data: blocks, error } = await supabaseAdmin
        .from('layout_blocks')
        .select('*')
        .in('id', blockIds)

      if (error || !blocks) {
        console.error('Error fetching blocks by IDs:', error)
        return null
      }

      // Строим дерево из плоского списка
      const blockMap = new Map<string, BlockTreeNode>()
      const rootBlocks: BlockTreeNode[] = []

      // Создаем узлы
      blocks.forEach(block => {
        const node: BlockTreeNode = {
          id: block.id,
          block_type: block.block_type,
          content: block.content,
          metadata: block.metadata,
          position: block.position,
          parent_block_id: block.parent_block_id,
          slot: block.slot,
          children: []
        }
        blockMap.set(block.id, node)
      })

      // Строим иерархию
      blocks.forEach(block => {
        const node = blockMap.get(block.id)!
        if (block.parent_block_id && blockMap.has(block.parent_block_id)) {
          const parent = blockMap.get(block.parent_block_id)!
          if (!parent.children) parent.children = []
          parent.children.push(node)
        } else if (block.id === rootBlockId) {
          rootBlocks.push(node)
        }
      })

      return rootBlocks
    } catch (error) {
      console.error('Error in getBlockTreeByIds:', error)
      return null
    }
  }

  /**
   * Клонирует дерево блоков с новыми ID
   */
  private static async cloneBlockTree(
    contentSnapshot: { rootBlockId: string, blocks: BlockTreeNode[] },
    pageId: number,
    instanceId: string,
    parentBlockId: string | null,
    position: number,
    slot: string | null
  ): Promise<BlockTreeNode[] | null> {
    try {
      const { blocks, rootBlockId } = contentSnapshot
      const idMapping = new Map<string, string>()
      const clonedBlocks: BlockTreeNode[] = []

      // Рекурсивная функция для клонирования блока и его детей
      const cloneBlock = async (block: BlockTreeNode, newParentId: string | null): Promise<BlockTreeNode | null> => {
        // Генерируем новый ID
        const newId = crypto.randomUUID()

        // Сохраняем маппинг старого ID на новый
        idMapping.set(block.id, newId)

        // Создаем новый блок в БД
        const { data: newBlock, error } = await supabaseAdmin
          .from('layout_blocks')
          .insert({
            id: newId,
            page_id: pageId,
            block_type: block.block_type,
            content: block.content ?? null,
            metadata: block.metadata,
            position: block.id === rootBlockId ? (position ?? null) : (block.position ?? null),
            parent_block_id: block.id === rootBlockId ? (parentBlockId ?? null) : (newParentId ?? null),
            slot: block.id === rootBlockId ? (slot ?? null) : (block.slot ?? null),
            status: 'published',
            instance_id: instanceId,
            depth: 0 // Будет пересчитан позже
          })
          .select()
          .single()

        if (error || !newBlock) {
          console.error('Error creating cloned block:', error)
          return null
        }

        // Создаем узел для ответа
        const clonedNode: BlockTreeNode = {
          id: newId,
          block_type: block.block_type,
          content: block.content,
          metadata: block.metadata,
          position: newBlock.position,
          parent_block_id: newBlock.parent_block_id,
          slot: newBlock.slot,
          children: []
        }

        // Клонируем дочерние блоки
        if (block.children && block.children.length > 0) {
          for (const child of block.children) {
            const clonedChild = await cloneBlock(child, newId)
            if (clonedChild) {
              clonedNode.children!.push(clonedChild)
            }
          }
        }

        return clonedNode
      }

      // Находим корневой блок и начинаем клонирование
      const rootBlock = blocks.find(b => b.id === rootBlockId)
      if (!rootBlock) {
        console.error('Root block not found in content snapshot')
        return null
      }

      const clonedRoot = await cloneBlock(rootBlock, null)
      if (clonedRoot) {
        clonedBlocks.push(clonedRoot)
      }

      // Пересчитываем depth для всех блоков
      await this.recalculateDepths(clonedBlocks)

      return clonedBlocks
    } catch (error) {
      console.error('Error in cloneBlockTree:', error)
      return null
    }
  }

  /**
   * Пересчитывает depth для дерева блоков
   */
  private static async recalculateDepths(blocks: BlockTreeNode[], currentDepth = 0): Promise<void> {
    for (const block of blocks) {
      await supabaseAdmin
        .from('layout_blocks')
        .update({ depth: currentDepth })
        .eq('id', block.id)

      if (block.children && block.children.length > 0) {
        await this.recalculateDepths(block.children, currentDepth + 1)
      }
    }
  }



  /**
   * Увеличивает счетчик использования
   * TODO: Добавить колонку usage_count в таблицу reusable_blocks
   */
  private static async incrementUsageCount(reusableBlockId: string): Promise<void> {
    try {
      // Временно отключаем логику счетчика использования
      // await supabaseAdmin
      //   .from('reusable_blocks')
      //   .update({
      //     updated_at: new Date().toISOString()
      //   })
      //   .eq('id', reusableBlockId)
    } catch (error) {
      console.error('Error incrementing usage count:', error)
    }
  }
}
