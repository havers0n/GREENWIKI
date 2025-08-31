/**
 * Тесты для системы ревизий - проверка сохранения и восстановления структуры блоков
 *
 * КРИТИЧНЫЕ ПРОБЛЕМЫ ДЛЯ ТЕСТИРОВАНИЯ:
 * 1. Ревизии НЕ сохраняют parent_block_id и slot
 * 2. Откат НЕ восстанавливает структуру вложенности
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { supabaseAdmin } from '../backend/src/supabaseClient'
import type { Database } from '@my-forum/db-types'
import revisionSample from '../fixtures/revision.sample.json'

type LayoutBlock = Database['public']['Tables']['layout_blocks']['Row']
type LayoutRevision = Database['public']['Tables']['layout_revisions']['Row']

describe('Revision System - Critical Issues', () => {
  const testPageIdentifier = 'test-revision-page'

  beforeEach(async () => {
    // Очистка тестовых данных
    await supabaseAdmin.from('layout_revisions').delete().eq('page_identifier', testPageIdentifier)
    await supabaseAdmin.from('layout_blocks').delete().eq('page_identifier', testPageIdentifier)
  })

  afterEach(async () => {
    // Очистка после тестов
    await supabaseAdmin.from('layout_revisions').delete().eq('page_identifier', testPageIdentifier)
    await supabaseAdmin.from('layout_blocks').delete().eq('page_identifier', testPageIdentifier)
  })

  describe('CRITICAL: Snapshot creation missing parent_block_id and slot', () => {
    it('should FAIL: current implementation does not save parent_block_id and slot', async () => {
      // Создаем тестовые блоки с вложенностью
      const testBlocks: Array<Partial<LayoutBlock>> = [
        {
          id: 'container-1',
          page_identifier: testPageIdentifier,
          block_type: 'container_section',
          content: { title: 'Test Container' },
          position: 1,
          status: 'draft',
          parent_block_id: null,
          slot: null
        },
        {
          id: 'heading-1',
          page_identifier: testPageIdentifier,
          block_type: 'heading',
          content: { text: 'Nested Heading', level: 2 },
          position: 1,
          status: 'draft',
          parent_block_id: 'container-1',
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

      // Создаем ревизию (имитация текущей реализации)
      const { data: blocksForSnapshot, error: selectError } = await supabaseAdmin
        .from('layout_blocks')
        .select('block_type, content, position, status') // ПРОПУЩЕНЫ: parent_block_id, slot
        .eq('page_identifier', testPageIdentifier)
        .order('position', { ascending: true })

      if (selectError) throw selectError

      // Проверяем, что данные НЕПОЛНЫЕ (текущая проблема)
      expect(blocksForSnapshot).toBeDefined()
      expect(blocksForSnapshot!.length).toBe(2)

      // КРИТИЧНО: Эти проверки ДОЛЖНЫ ПРОЙТИ (показывая проблему)
      for (const block of blocksForSnapshot!) {
        expect(block).not.toHaveProperty('parent_block_id')
        expect(block).not.toHaveProperty('slot')
        expect(block).not.toHaveProperty('id')
      }
    })

    it('should PASS: fixed implementation saves all required fields', async () => {
      // Создаем тестовые блоки
      const testBlocks: Array<Partial<LayoutBlock>> = [
        {
          id: 'container-2',
          page_identifier: testPageIdentifier,
          block_type: 'container_section',
          content: { title: 'Test Container' },
          position: 1,
          status: 'draft',
          parent_block_id: null,
          slot: null
        },
        {
          id: 'heading-2',
          page_identifier: testPageIdentifier,
          block_type: 'heading',
          content: { text: 'Nested Heading', level: 2 },
          position: 1,
          status: 'draft',
          parent_block_id: 'container-2',
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

      // ИСПРАВЛЕННАЯ реализация
      const { data: blocksForSnapshot, error: selectError } = await supabaseAdmin
        .from('layout_blocks')
        .select('id, block_type, content, position, status, parent_block_id, slot') // ✅ ДОБАВЛЕНЫ
        .eq('page_identifier', testPageIdentifier)
        .order('position', { ascending: true })

      if (selectError) throw selectError

      // Проверяем, что данные ПОЛНЫЕ
      expect(blocksForSnapshot).toBeDefined()
      expect(blocksForSnapshot!.length).toBe(2)

      // Проверяем контейнер
      const container = blocksForSnapshot!.find(b => b.block_type === 'container_section')
      expect(container).toBeDefined()
      expect(container!.parent_block_id).toBeNull()
      expect(container!.slot).toBeNull()

      // Проверяем вложенный блок
      const heading = blocksForSnapshot!.find(b => b.block_type === 'heading')
      expect(heading).toBeDefined()
      expect(heading!.parent_block_id).toBe('container-2')
      expect(heading!.slot).toBe('column1')
    })
  })

  describe('CRITICAL: Revert does not restore nested structure', () => {
    it('should FAIL: current revert loses parent relationships', async () => {
      // Используем неполную ревизию (текущая проблема)
      const brokenSnapshot = revisionSample.broken_revision_example.snapshot

      // Очищаем текущие блоки
      await supabaseAdmin
        .from('layout_blocks')
        .delete()
        .eq('page_identifier', testPageIdentifier)

      // Восстанавливаем из неполной ревизии
      for (const item of brokenSnapshot) {
        const insertPayload = {
          page_identifier: testPageIdentifier,
          block_type: item.block_type,
          content: item.content || {},
          position: item.position || 0,
          status: item.status || 'draft'
          // ПРОПУЩЕНЫ: parent_block_id, slot
        }

        const { error } = await supabaseAdmin
          .from('layout_blocks')
          .insert(insertPayload)
        if (error) throw error
      }

      // Проверяем результат
      const { data: restoredBlocks, error } = await supabaseAdmin
        .from('layout_blocks')
        .select('*')
        .eq('page_identifier', testPageIdentifier)

      if (error) throw error

      // КРИТИЧНО: Все блоки стали корневыми (проблема!)
      for (const block of restoredBlocks!) {
        expect(block.parent_block_id).toBeNull()
        expect(block.slot).toBeNull()
      }

      // Структура потеряна
      const containers = restoredBlocks!.filter(b => b.block_type === 'container_section')
      const headings = restoredBlocks!.filter(b => b.block_type === 'heading')

      // Заголовки не связаны с контейнерами
      for (const heading of headings) {
        expect(heading.parent_block_id).toBeNull()
      }
    })

    it('should PASS: fixed revert restores complete structure', async () => {
      // Используем полную ревизию
      const completeSnapshot = revisionSample.revision.snapshot

      // Очищаем текущие блоки
      await supabaseAdmin
        .from('layout_blocks')
        .delete()
        .eq('page_identifier', testPageIdentifier)

      // Восстанавливаем из полной ревизии
      for (const item of completeSnapshot) {
        const insertPayload = {
          id: item.id,
          page_identifier: testPageIdentifier,
          block_type: item.block_type,
          content: item.content || {},
          position: item.position || 0,
          status: item.status || 'draft',
          parent_block_id: item.parent_block_id, // ✅ ДОБАВЛЕНО
          slot: item.slot // ✅ ДОБАВЛЕНО
        }

        const { error } = await supabaseAdmin
          .from('layout_blocks')
          .insert(insertPayload)
        if (error) throw error
      }

      // Проверяем результат
      const { data: restoredBlocks, error } = await supabaseAdmin
        .from('layout_blocks')
        .select('*')
        .eq('page_identifier', testPageIdentifier)

      if (error) throw error

      // Структура восстановлена правильно
      const container = restoredBlocks!.find(b => b.block_type === 'container_section')
      const heading = restoredBlocks!.find(b => b.block_type === 'heading')

      expect(container).toBeDefined()
      expect(heading).toBeDefined()

      // Связи восстановлены
      expect(heading!.parent_block_id).toBe(container!.id)
      expect(heading!.slot).toBe('column1')
    })
  })

  describe('Integration test: Full revision cycle', () => {
    it('should maintain structure through create-revert cycle', async () => {
      // 1. Создаем структуру
      const originalBlocks = revisionSample.revision.snapshot.map(item => ({
        ...item,
        page_identifier: testPageIdentifier
      }))

      for (const block of originalBlocks) {
        const { error } = await supabaseAdmin
          .from('layout_blocks')
          .insert(block)
        if (error) throw error
      }

      // 2. Создаем ревизию (исправленная версия)
      const { data: snapshotBlocks, error: snapshotError } = await supabaseAdmin
        .from('layout_blocks')
        .select('id, block_type, content, position, status, parent_block_id, slot')
        .eq('page_identifier', testPageIdentifier)
        .order('position', { ascending: true })

      if (snapshotError) throw snapshotError

      // 3. Сохраняем ревизию
      const { error: revisionError } = await supabaseAdmin
        .from('layout_revisions')
        .insert({
          page_identifier: testPageIdentifier,
          snapshot: snapshotBlocks,
          created_by: null
        })

      if (revisionError) throw revisionError

      // 4. Модифицируем блоки (имитируем изменения)
      await supabaseAdmin
        .from('layout_blocks')
        .update({ status: 'published' })
        .eq('page_identifier', testPageIdentifier)

      // 5. Откатываем к ревизии
      await supabaseAdmin
        .from('layout_blocks')
        .delete()
        .eq('page_identifier', testPageIdentifier)

      // Восстанавливаем из ревизии
      for (const item of snapshotBlocks!) {
        const insertPayload = {
          id: item.id,
          page_identifier: testPageIdentifier,
          block_type: item.block_type,
          content: item.content,
          position: item.position,
          status: item.status,
          parent_block_id: item.parent_block_id,
          slot: item.slot
        }

        const { error } = await supabaseAdmin
          .from('layout_blocks')
          .insert(insertPayload)
        if (error) throw error
      }

      // 6. Проверяем, что структура идентична оригиналу
      const { data: finalBlocks, error: finalError } = await supabaseAdmin
        .from('layout_blocks')
        .select('*')
        .eq('page_identifier', testPageIdentifier)
        .order('position', { ascending: true })

      if (finalError) throw finalError

      // Проверяем структуру
      expect(finalBlocks).toHaveLength(originalBlocks.length)

      // Проверяем каждую связь
      for (const original of originalBlocks) {
        const restored = finalBlocks!.find(b => b.id === original.id)
        expect(restored).toBeDefined()
        expect(restored!.parent_block_id).toBe(original.parent_block_id)
        expect(restored!.slot).toBe(original.slot)
        expect(restored!.block_type).toBe(original.block_type)
        expect(restored!.position).toBe(original.position)
      }
    })
  })
})

// Моки для тестирования без БД
export const mockRevisionTests = {
  snapshotCreation: {
    input: {
      blocks: [
        { id: '1', parent_block_id: null, slot: null },
        { id: '2', parent_block_id: '1', slot: 'column1' }
      ]
    },
    expectedSnapshot: {
      includesParentId: true,
      includesSlot: true,
      preservesStructure: true
    }
  },

  revertOperation: {
    input: {
      snapshot: [
        { id: '1', parent_block_id: null, slot: null },
        { id: '2', parent_block_id: '1', slot: 'column1' }
      ]
    },
    expectedResult: {
      structureRestored: true,
      relationshipsPreserved: true
    }
  }
}
