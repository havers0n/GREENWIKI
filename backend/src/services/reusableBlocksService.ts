import { supabaseAdmin } from '../supabaseClient'
import type { Tables, TablesInsert, TablesUpdate, Json } from '@my-forum/db-types'
import { cacheService } from './cacheService'

// Расширенные типы для работы с переиспользуемыми блоками
export interface ReusableBlockWithContent extends Tables<'reusable_blocks'> {
  content?: Tables<'reusable_block_content'>
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

      // Получаем дерево блоков для создания snapshot
      const blockTree = await this.getBlockTreeByIds(sourceBlockIds, rootBlockId)
      if (!blockTree) {
        throw new Error('Failed to build block tree from source blocks')
      }

      // Создаем запись в reusable_blocks
      const { data: reusableBlock, error: rbError } = await supabaseAdmin
        .from('reusable_blocks')
        .insert({
          name,
          description,
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
      }

      const { data: content, error: contentError } = await supabaseAdmin
        .from('reusable_block_content')
        .insert({
          reusable_block_id: reusableBlock.id,
          version: 1,
          root_block_id: rootBlockId,
          content_snapshot: contentSnapshot,
          created_by: createdBy || null
        })
        .select()
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

      // Создаем ключ кеша на основе параметров
      const cacheKey = `reusable_blocks:${JSON.stringify({
        category,
        search,
        tags: tags?.sort(), // Сортируем теги для консистентности ключа
        limit,
        offset,
        sortBy,
        sortOrder
      })}`;

      // Проверяем кеш для запросов без поиска (они чаще повторяются)
      if (!search && offset === 0) {
        const cached = await cacheService.get<{ items: ReusableBlockWithContent[], total: number }>(cacheKey, {
          ttl: 600, // 10 минут для списков
          keyPrefix: 'reusable_blocks:',
        });

        if (cached) {
          return cached;
        }
      }

      let query = supabaseAdmin
        .from('reusable_blocks')
        .select(`
          *,
          content:reusable_block_content!inner(*)
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

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching reusable blocks:', error)
        return { items: [], total: 0 }
      }

      // Получаем статистику использования для каждого блока
      const itemsWithUsage = await Promise.all(
        (data || []).map(async (item) => {
          const usageCount = await this.getUsageCount(item.id)
          return {
            ...item,
            usage_count: usageCount
          } as ReusableBlockWithContent
        })
      )

      const result = {
        items: itemsWithUsage,
        total: count || 0
      };

      // Кешируем результат для часто используемых запросов
      if (!search && offset === 0) {
        await cacheService.set(cacheKey, result, {
          ttl: 600, // 10 минут
          keyPrefix: 'reusable_blocks:',
        });
      }

      return result;
    } catch (error) {
      console.error('Error in getReusableBlocks:', error)
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
          parent_block_id: parentBlockId,
          slot,
          position,
          overrides
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
        parentBlockId,
        position,
        slot
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
   * Удаляет переиспользуемый блок и все связанные данные
   */
  static async deleteReusableBlock(reusableBlockId: string): Promise<boolean> {
    try {
      // Каскадное удаление через foreign key constraints
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
   * Получает дерево блоков по их ID
   */
  private static async getBlockTreeByIds(blockIds: string[], rootBlockId: string): Promise<BlockTreeNode[] | null> {
    try {
      // Получаем все блоки из списка
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
            content: block.content,
            metadata: block.metadata,
            position: block.id === rootBlockId ? position : block.position,
            parent_block_id: block.id === rootBlockId ? parentBlockId : newParentId,
            slot: block.id === rootBlockId ? slot : block.slot,
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
   * Получает количество использований переиспользуемого блока
   */
  private static async getUsageCount(reusableBlockId: string): Promise<number> {
    try {
      const { count, error } = await supabaseAdmin
        .from('block_instances')
        .select('*', { count: 'exact', head: true })
        .eq('reusable_block_id', reusableBlockId)

      if (error) {
        console.error('Error getting usage count:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Error in getUsageCount:', error)
      return 0
    }
  }

  /**
   * Увеличивает счетчик использования
   */
  private static async incrementUsageCount(reusableBlockId: string): Promise<void> {
    try {
      const { data: currentBlock } = await supabaseAdmin
        .from('reusable_blocks')
        .select('usage_count')
        .eq('id', reusableBlockId)
        .single()

      if (currentBlock) {
        await supabaseAdmin
          .from('reusable_blocks')
          .update({
            usage_count: (currentBlock.usage_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', reusableBlockId)
      }
    } catch (error) {
      console.error('Error incrementing usage count:', error)
    }
  }
}
