import { supabaseAdmin } from '../supabaseClient'
import type { Tables, Json } from '@my-forum/db-types'

// Тип для узла дерева блоков
export interface BlockNode extends Omit<Tables<'layout_blocks'>, 'parent_block_id'> {
  children?: BlockNode[]
}

// Сервис для работы с иерархической структурой блоков
export class LayoutService {
  /**
   * Получает дерево блоков для страницы используя RPC функцию get_page_blocks_tree_admin
   * @param pageId - ID страницы
   * @returns Promise<BlockNode[] | null> - дерево блоков или null если ошибка
   */
  static async getBlockTreeForPage(pageId: number): Promise<BlockNode[] | null> {
    try {
      const { data, error } = await supabaseAdmin.rpc('get_page_blocks_tree_admin', {
        p_page_id: pageId
      })

      if (error) {
        console.error('Error fetching block tree:', error)
        return null
      }

      // Функция get_page_blocks_tree_admin возвращает Json, но мы ожидаем массив BlockNode
      // Если функция возвращает уже готовое дерево, просто возвращаем его
      // Если возвращает плоский массив, нужно будет преобразовать в дерево
      if (data && Array.isArray(data)) {
        return data as BlockNode[]
      }

      console.warn('Unexpected data format from get_page_blocks_tree_admin:', data)
      return null
    } catch (err) {
      console.error('Unexpected error in getBlockTreeForPage:', err)
      return null
    }
  }

  /**
   * Создает новый блок и пересчитывает depth для него и всех дочерних элементов
   * @param blockData - данные для создания блока
   * @returns Promise<BlockNode | null> - созданный блок или null если ошибка
   */
  static async createBlock(blockData: {
    page_id: number
    block_type: string
    content?: Json | null
    metadata?: Json
    position?: number | null
    status?: string
    parent_block_id?: string | null
    slot?: string | null
  }): Promise<BlockNode | null> {
    try {
      // Вычисляем depth для нового блока
      let depth = 0
      if (blockData.parent_block_id) {
        // Получаем depth родительского блока
        const { data: parentBlock } = await supabaseAdmin
          .from('layout_blocks')
          .select('depth')
          .eq('id', blockData.parent_block_id)
          .single()

        if (parentBlock) {
          depth = parentBlock.depth + 1
        }
      }

      const payload = {
        ...blockData,
        depth,
        content: blockData.content ?? {},
        metadata: blockData.metadata ?? {},
        position: blockData.position ?? 0,
        status: blockData.status ?? 'published',
        parent_block_id: blockData.parent_block_id ?? null,
        slot: blockData.slot ?? null
      }

      const { data, error } = await supabaseAdmin
        .from('layout_blocks')
        .insert(payload)
        .select('*')
        .single()

      if (error) {
        console.error('Error creating block:', error)
        return null
      }

      return data as BlockNode
    } catch (err) {
      console.error('Unexpected error in createBlock:', err)
      return null
    }
  }

  /**
   * Обновляет блок и пересчитывает depth если изменился parent_block_id
   * @param blockId - ID блока для обновления
   * @param updates - данные для обновления
   * @returns Promise<BlockNode | null> - обновленный блок или null если ошибка
   */
  static async updateBlock(
    blockId: string,
    updates: {
      page_id?: number
      block_type?: string
      content?: Json | null
      metadata?: Json
      position?: number | null
      status?: string
      parent_block_id?: string | null
      slot?: string | null
    }
  ): Promise<BlockNode | null> {
    try {
      // Проверяем, изменился ли parent_block_id
      const needsDepthRecalculation = updates.parent_block_id !== undefined

      if (needsDepthRecalculation) {
        // Вычисляем новый depth
        let newDepth = 0
        if (updates.parent_block_id) {
          const { data: parentBlock } = await supabaseAdmin
            .from('layout_blocks')
            .select('depth')
            .eq('id', updates.parent_block_id)
            .single()

          if (parentBlock) {
            newDepth = parentBlock.depth + 1
          }
        }

        // Добавляем depth к обновлениям
        updates = { ...updates, depth: newDepth } as any
      }

      const { data, error } = await supabaseAdmin
        .from('layout_blocks')
        .update(updates)
        .eq('id', blockId)
        .select('*')
        .single()

      if (error) {
        console.error('Error updating block:', error)
        return null
      }

      return data as BlockNode
    } catch (err) {
      console.error('Unexpected error in updateBlock:', err)
      return null
    }
  }

  /**
   * Удаляет блок и все его дочерние элементы (каскадное удаление)
   * @param blockId - ID блока для удаления
   * @returns Promise<boolean> - true если удаление успешно, false в случае ошибки
   */
  static async deleteBlock(blockId: string): Promise<boolean> {
    try {
      // Получаем все дочерние блоки для каскадного удаления
      const childBlocks = await this.getAllChildBlocks(blockId)

      // Удаляем все дочерние блоки
      if (childBlocks.length > 0) {
        const childIds = childBlocks.map(block => block.id)
        const { error: childrenError } = await supabaseAdmin
          .from('layout_blocks')
          .delete()
          .in('id', childIds)

        if (childrenError) {
          console.error('Error deleting child blocks:', childrenError)
          return false
        }
      }

      // Удаляем основной блок
      const { error } = await supabaseAdmin
        .from('layout_blocks')
        .delete()
        .eq('id', blockId)

      if (error) {
        console.error('Error deleting block:', error)
        return false
      }

      return true
    } catch (err) {
      console.error('Unexpected error in deleteBlock:', err)
      return false
    }
  }

  /**
   * Рекурсивно получает все дочерние блоки для данного блока
   * @param parentBlockId - ID родительского блока
   * @returns Promise<BlockNode[]> - массив всех дочерних блоков
   */
  private static async getAllChildBlocks(parentBlockId: string): Promise<BlockNode[]> {
    const allChildren: BlockNode[] = []

    // Получаем прямых потомков
    const { data: directChildren, error } = await supabaseAdmin
      .from('layout_blocks')
      .select('*')
      .eq('parent_block_id', parentBlockId)

    if (error || !directChildren) {
      return allChildren
    }

    // Добавляем прямых потомков
    allChildren.push(...directChildren)

    // Рекурсивно получаем потомков для каждого дочернего блока
    for (const child of directChildren) {
      const grandchildren = await this.getAllChildBlocks(child.id)
      allChildren.push(...grandchildren)
    }

    return allChildren
  }
}
