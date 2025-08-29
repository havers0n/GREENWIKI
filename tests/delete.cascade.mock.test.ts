/**
 * Тесты для каскадного удаления блоков
 *
 * КРИТИЧНАЯ ПРОБЛЕМА:
 * При удалении контейнера НЕ удаляются дочерние блоки
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { supabaseAdmin } from '../backend/src/supabaseClient'
import type { Database } from '@my-forum/db-types'

type LayoutBlock = Database['public']['Tables']['layout_blocks']['Row']

describe('Delete Cascade - Critical Issue', () => {
  const testPageIdentifier = 'test-cascade-page'

  beforeEach(async () => {
    // Очистка тестовых данных
    await supabaseAdmin.from('layout_blocks').delete().eq('page_identifier', testPageIdentifier)
  })

  afterEach(async () => {
    // Очистка после тестов
    await supabaseAdmin.from('layout_blocks').delete().eq('page_identifier', testPageIdentifier)
  })

  describe('CRITICAL: Current delete does not cascade', () => {
    it('should FAIL: deleting container leaves orphaned children', async () => {
      // Создаем структуру: контейнер + дочерние блоки
      const containerId = 'container-for-cascade-test'
      const child1Id = 'child-1-cascade-test'
      const child2Id = 'child-2-cascade-test'

      const testBlocks: Array<Partial<LayoutBlock>> = [
        {
          id: containerId,
          page_identifier: testPageIdentifier,
          block_type: 'container_section',
          content: { title: 'Test Container' },
          position: 1,
          status: 'draft',
          parent_block_id: null,
          slot: null
        },
        {
          id: child1Id,
          page_identifier: testPageIdentifier,
          block_type: 'heading',
          content: { text: 'Child Heading', level: 2 },
          position: 1,
          status: 'draft',
          parent_block_id: containerId,
          slot: 'column1'
        },
        {
          id: child2Id,
          page_identifier: testPageIdentifier,
          block_type: 'paragraph',
          content: { text: 'Child paragraph' },
          position: 2,
          status: 'draft',
          parent_block_id: containerId,
          slot: 'column1'
        }
      ]

      // Вставляем тестовые блоки
      for (const block of testBlocks) {
        const { error } = await supabaseAdmin
          .from('layout_blocks')
          .insert(block as any)
        if (error) throw error
      }

      // Проверяем, что все блоки созданы
      const { data: beforeDelete, error: beforeError } = await supabaseAdmin
        .from('layout_blocks')
        .select('*')
        .eq('page_identifier', testPageIdentifier)

      if (beforeError) throw beforeError
      expect(beforeDelete).toHaveLength(3)

      // УДАЛЯЕМ ТОЛЬКО КОНТЕЙНЕР (текущая реализация)
      const { error: deleteError } = await supabaseAdmin
        .from('layout_blocks')
        .delete()
        .eq('id', containerId)

      if (deleteError) throw deleteError

      // Проверяем результат
      const { data: afterDelete, error: afterError } = await supabaseAdmin
        .from('layout_blocks')
        .select('*')
        .eq('page_identifier', testPageIdentifier)

      if (afterError) throw afterError

      // КРИТИЧНО: Дочерние блоки остались (проблема!)
      expect(afterDelete).toHaveLength(2) // Контейнер удален, но дети остались

      // Дети стали сиротами
      for (const block of afterDelete!) {
        expect(block.id).not.toBe(containerId) // Контейнер удален
        expect(block.parent_block_id).toBe(containerId) // Но ссылка на него осталась!
      }
    })

    it('should PASS: proper cascade delete removes all children', async () => {
      // Создаем структуру
      const containerId = 'container-cascade-fixed'
      const child1Id = 'child-1-cascade-fixed'
      const child2Id = 'child-2-cascade-fixed'

      const testBlocks: Array<Partial<LayoutBlock>> = [
        {
          id: containerId,
          page_identifier: testPageIdentifier,
          block_type: 'container_section',
          content: { title: 'Test Container' },
          position: 1,
          status: 'draft',
          parent_block_id: null,
          slot: null
        },
        {
          id: child1Id,
          page_identifier: testPageIdentifier,
          block_type: 'heading',
          content: { text: 'Child Heading', level: 2 },
          position: 1,
          status: 'draft',
          parent_block_id: containerId,
          slot: 'column1'
        },
        {
          id: child2Id,
          page_identifier: testPageIdentifier,
          block_type: 'paragraph',
          content: { text: 'Child paragraph' },
          position: 2,
          status: 'draft',
          parent_block_id: containerId,
          slot: 'column1'
        }
      ]

      // Вставляем блоки
      for (const block of testBlocks) {
        const { error } = await supabaseAdmin
          .from('layout_blocks')
          .insert(block as any)
        if (error) throw error
      }

      // РЕКУРСИВНОЕ УДАЛЕНИЕ (исправленная реализация)
      await deleteBlockWithChildren(containerId)

      // Проверяем результат
      const { data: afterDelete, error: afterError } = await supabaseAdmin
        .from('layout_blocks')
        .select('*')
        .eq('page_identifier', testPageIdentifier)

      if (afterError) throw afterError

      // Все блоки удалены
      expect(afterDelete).toHaveLength(0)
    })
  })

  describe('Complex nested structure cascade', () => {
    it('should handle deeply nested structures', async () => {
      // Создаем глубокую вложенность:
      // container1
      //   ├── container2
      //   │   └── heading
      //   └── paragraph

      const structure = {
        container1: { id: 'c1', parent: null, slot: null },
        container2: { id: 'c2', parent: 'c1', slot: 'column1' },
        heading: { id: 'h1', parent: 'c2', slot: 'column1' },
        paragraph: { id: 'p1', parent: 'c1', slot: 'column2' }
      }

      // Вставляем блоки
      const blocksToInsert = [
        {
          id: structure.container1.id,
          page_identifier: testPageIdentifier,
          block_type: 'container_section',
          content: { title: 'Outer Container' },
          position: 1,
          status: 'draft',
          parent_block_id: structure.container1.parent,
          slot: structure.container1.slot
        },
        {
          id: structure.container2.id,
          page_identifier: testPageIdentifier,
          block_type: 'container_section',
          content: { title: 'Inner Container' },
          position: 1,
          status: 'draft',
          parent_block_id: structure.container2.parent,
          slot: structure.container2.slot
        },
        {
          id: structure.heading.id,
          page_identifier: testPageIdentifier,
          block_type: 'heading',
          content: { text: 'Deep Heading' },
          position: 1,
          status: 'draft',
          parent_block_id: structure.heading.parent,
          slot: structure.heading.slot
        },
        {
          id: structure.paragraph.id,
          page_identifier: testPageIdentifier,
          block_type: 'paragraph',
          content: { text: 'Outer paragraph' },
          position: 1,
          status: 'draft',
          parent_block_id: structure.paragraph.parent,
          slot: structure.paragraph.slot
        }
      ]

      for (const block of blocksToInsert) {
        const { error } = await supabaseAdmin
          .from('layout_blocks')
          .insert(block)
        if (error) throw error
      }

      // Удаляем внешний контейнер
      await deleteBlockWithChildren(structure.container1.id)

      // Проверяем, что все блоки удалены
      const { data: remaining, error } = await supabaseAdmin
        .from('layout_blocks')
        .select('*')
        .eq('page_identifier', testPageIdentifier)

      if (error) throw error
      expect(remaining).toHaveLength(0)
    })
  })

  describe('Mock tests for cascade logic', () => {
    it('should identify all descendants correctly', () => {
      const blocks = [
        { id: '1', parent_block_id: null },
        { id: '2', parent_block_id: '1' },
        { id: '3', parent_block_id: '2' },
        { id: '4', parent_block_id: '1' },
        { id: '5', parent_block_id: null }
      ]

      const findDescendants = (parentId: string): string[] => {
        const children = blocks.filter(b => b.parent_block_id === parentId)
        const descendants: string[] = []

        for (const child of children) {
          descendants.push(child.id)
          descendants.push(...findDescendants(child.id))
        }

        return descendants
      }

      const descendantsOf1 = findDescendants('1')
      expect(descendantsOf1).toEqual(['2', '3', '4']) // 2 и 4 - прямые дети, 3 - ребенок 2

      const descendantsOf2 = findDescendants('2')
      expect(descendantsOf2).toEqual(['3'])
    })

    it('should handle circular references safely', () => {
      // Тест на защиту от бесконечной рекурсии
      const blocks = [
        { id: '1', parent_block_id: '3' }, // 1 ссылается на 3
        { id: '2', parent_block_id: '1' }, // 2 ссылается на 1
        { id: '3', parent_block_id: '2' }  // 3 ссылается на 2 (цикл!)
      ]

      const findDescendantsSafe = (parentId: string, visited = new Set<string>()): string[] => {
        if (visited.has(parentId)) return [] // Предотвращаем бесконечную рекурсию

        visited.add(parentId)
        const children = blocks.filter(b => b.parent_block_id === parentId)
        const descendants: string[] = []

        for (const child of children) {
          descendants.push(child.id)
          descendants.push(...findDescendantsSafe(child.id, visited))
        }

        return descendants
      }

      // При циклических ссылках функция не должна зависать
      const descendants = findDescendantsSafe('1')
      expect(descendants.length).toBeGreaterThanOrEqual(0) // Не зависает
    })
  })
})

// Вспомогательная функция для каскадного удаления
async function deleteBlockWithChildren(blockId: string): Promise<void> {
  // Находим всех потомков
  const descendants = await findAllDescendants(blockId)

  // Удаляем всех потомков (включая текущий блок)
  if (descendants.length > 0) {
    const { error } = await supabaseAdmin
      .from('layout_blocks')
      .delete()
      .in('id', descendants)

    if (error) throw error
  }
}

async function findAllDescendants(parentId: string): Promise<string[]> {
  const { data: children, error } = await supabaseAdmin
    .from('layout_blocks')
    .select('id')
    .eq('parent_block_id', parentId)

  if (error) throw error
  if (!children || children.length === 0) return [parentId]

  const descendants = [parentId] // Включаем текущий блок

  for (const child of children) {
    const childDescendants = await findAllDescendants(child.id)
    descendants.push(...childDescendants)
  }

  return descendants
}

// Моки для тестирования без БД
export const mockCascadeTests = {
  simpleCascade: {
    input: {
      blocks: [
        { id: 'parent', parent_block_id: null },
        { id: 'child1', parent_block_id: 'parent' },
        { id: 'child2', parent_block_id: 'parent' }
      ],
      deleteBlockId: 'parent'
    },
    expectedDeleted: ['parent', 'child1', 'child2']
  },

  nestedCascade: {
    input: {
      blocks: [
        { id: 'grandparent', parent_block_id: null },
        { id: 'parent', parent_block_id: 'grandparent' },
        { id: 'child', parent_block_id: 'parent' }
      ],
      deleteBlockId: 'grandparent'
    },
    expectedDeleted: ['grandparent', 'parent', 'child']
  },

  noCascade: {
    input: {
      blocks: [
        { id: 'block1', parent_block_id: null },
        { id: 'block2', parent_block_id: null }
      ],
      deleteBlockId: 'block1'
    },
    expectedDeleted: ['block1'],
    expectedRemaining: ['block2']
  }
}
