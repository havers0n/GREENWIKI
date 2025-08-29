/**
 * Тесты для валидации иерархии блоков
 *
 * ПРОБЛЕМЫ ДЛЯ ТЕСТИРОВАНИЯ:
 * 1. Отсутствие проверки allowedChildren при вставке через API
 * 2. Возможность создания некорректных комбинаций блоков
 */

import { describe, it, expect } from 'vitest'
import { blockRegistry } from '../frontend/src/shared/config/blockRegistry'

describe('Hierarchy Validation - Missing Business Rules', () => {
  describe('Block registry structure validation', () => {
    it('should have proper allowedChildren for container blocks', () => {
      const containerSection = blockRegistry.container_section

      expect(containerSection).toBeDefined()
      expect(containerSection.allowedChildren).toBeDefined()
      expect(Array.isArray(containerSection.allowedChildren)).toBe(true)
      expect(containerSection.allowedChildren!.length).toBeGreaterThan(0)
    })

    it('should have proper allowedSlots for container blocks', () => {
      const containerSection = blockRegistry.container_section

      expect(containerSection.allowedSlots).toBeDefined()
      expect(Array.isArray(containerSection.allowedSlots)).toBe(true)
      expect(containerSection.allowedSlots).toContain('column1')
      expect(containerSection.allowedSlots).toContain('column2')
    })

    it('should not have allowedChildren for atomic blocks', () => {
      const atomicBlocks = [
        'heading', 'paragraph', 'single_image', 'single_button', 'spacer'
      ]

      for (const blockType of atomicBlocks) {
        const block = blockRegistry[blockType]
        expect(block).toBeDefined()
        expect(block.allowedChildren).toBeUndefined()
        expect(block.allowedSlots).toBeUndefined()
      }
    })
  })

  describe('CRITICAL: Missing validation in API', () => {
    it('should FAIL: current API allows invalid parent-child combinations', () => {
      // Тестируем, что НЕТ валидации при вставке

      // Попытка вставить контейнер внутрь параграфа (некорректно)
      const invalidCombination = {
        parentType: 'paragraph', // Атомарный блок
        childType: 'container_section', // Контейнер
        expectedAllowed: false
      }

      // Проверяем реестр (что показывает правильность)
      const parentBlock = blockRegistry[invalidCombination.parentType]
      const isAllowed = parentBlock?.allowedChildren?.includes(invalidCombination.childType) ?? false

      // Должен быть false (некорректная комбинация)
      expect(isAllowed).toBe(false)

      // НО в API такая вставка ПРОЙДЕТ без проверки!
      // Это критическая проблема
    })

    it('should validate allowed combinations correctly', () => {
      const validCombinations = [
        { parent: 'container_section', child: 'heading', expected: true },
        { parent: 'container_section', child: 'paragraph', expected: true },
        { parent: 'container_section', child: 'single_image', expected: true },
        { parent: 'paragraph', child: 'heading', expected: false },
        { parent: 'heading', child: 'container_section', expected: false }
      ]

      for (const combo of validCombinations) {
        const parentBlock = blockRegistry[combo.parent]
        const isAllowed = parentBlock?.allowedChildren?.includes(combo.child) ?? false
        expect(isAllowed).toBe(combo.expected)
      }
    })
  })

  describe('Mock validation functions', () => {
    const validateBlockPlacement = (parentType: string, childType: string, slot?: string): boolean => {
      const parentBlock = blockRegistry[parentType]

      // Проверяем, что родитель существует
      if (!parentBlock) return false

      // Проверяем, что ребенок разрешен
      if (!parentBlock.allowedChildren?.includes(childType)) return false

      // Проверяем слот, если указан
      if (slot && !parentBlock.allowedSlots?.includes(slot)) return false

      return true
    }

    const validateBlockStructure = (blocks: Array<{ id: string; type: string; parentId?: string; slot?: string }>): {
      valid: boolean
      errors: string[]
    } => {
      const errors: string[] = []

      for (const block of blocks) {
        if (block.parentId) {
          // Находим родительский блок
          const parent = blocks.find(b => b.id === block.parentId)
          if (!parent) {
            errors.push(`Block ${block.id}: parent ${block.parentId} not found`)
            continue
          }

          // Проверяем допустимость комбинации
          if (!validateBlockPlacement(parent.type, block.type, block.slot)) {
            errors.push(`Block ${block.id}: invalid placement in ${parent.type}`)
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors
      }
    }

    it('should validate correct block placement', () => {
      expect(validateBlockPlacement('container_section', 'heading', 'column1')).toBe(true)
      expect(validateBlockPlacement('container_section', 'paragraph', 'column2')).toBe(true)
      expect(validateBlockPlacement('container_section', 'single_image')).toBe(true)
    })

    it('should reject invalid block placement', () => {
      expect(validateBlockPlacement('paragraph', 'heading')).toBe(false)
      expect(validateBlockPlacement('heading', 'container_section')).toBe(false)
      expect(validateBlockPlacement('container_section', 'nonexistent_block')).toBe(false)
    })

    it('should validate slot constraints', () => {
      expect(validateBlockPlacement('container_section', 'heading', 'invalid_slot')).toBe(false)
      expect(validateBlockPlacement('container_section', 'heading', 'column1')).toBe(true)
      expect(validateBlockPlacement('container_section', 'heading', 'column2')).toBe(true)
      expect(validateBlockPlacement('container_section', 'heading', 'column3')).toBe(true)
    })

    it('should validate complete page structure', () => {
      const validStructure = [
        { id: 'root', type: 'header', parentId: undefined },
        { id: 'container', type: 'container_section', parentId: undefined },
        { id: 'heading', type: 'heading', parentId: 'container', slot: 'column1' },
        { id: 'paragraph', type: 'paragraph', parentId: 'container', slot: 'column1' }
      ]

      const result = validateBlockStructure(validStructure)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect invalid page structure', () => {
      const invalidStructure = [
        { id: 'container', type: 'container_section', parentId: undefined },
        { id: 'bad_child', type: 'container_section', parentId: 'container', slot: 'column1' } // Контейнер в контейнере
      ]

      const result = validateBlockStructure(invalidStructure)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Block bad_child: invalid placement in container_section')
    })

    it('should handle missing parent references', () => {
      const brokenStructure = [
        { id: 'orphan', type: 'heading', parentId: 'nonexistent' }
      ]

      const result = validateBlockStructure(brokenStructure)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Block orphan: parent nonexistent not found')
    })
  })

  describe('Integration scenarios', () => {
    it('should validate complex nested structure', () => {
      // Тестируем глубокую вложенность (если бы она была разрешена)
      const complexStructure = [
        { id: 'page', type: 'container_section', parentId: undefined },
        { id: 'section1', type: 'container_section', parentId: 'page', slot: 'column1' },
        { id: 'content1', type: 'heading', parentId: 'section1', slot: 'column1' },
        { id: 'content2', type: 'paragraph', parentId: 'section1', slot: 'column1' }
      ]

      // В текущей реализации контейнер в контейнере не разрешен
      const result = validateBlockStructure(complexStructure)

      // Должен быть невалиден, так как container_section не может быть ребенком container_section
      expect(result.valid).toBe(false)
    })

    it('should validate real-world page layout', () => {
      // Типичная структура страницы
      const pageLayout = [
        { id: 'header', type: 'header', parentId: undefined },
        { id: 'main', type: 'container_section', parentId: undefined },
        { id: 'hero', type: 'heading', parentId: 'main', slot: 'column1' },
        { id: 'description', type: 'paragraph', parentId: 'main', slot: 'column1' },
        { id: 'sidebar', type: 'categories_section', parentId: 'main', slot: 'column2' },
        { id: 'footer', type: 'spacer', parentId: undefined }
      ]

      const result = validateBlockStructure(pageLayout)
      expect(result.valid).toBe(true)
    })
  })
})

// Моки для тестирования API валидации
export const mockValidationTests = {
  apiInsertValidation: {
    description: 'Тест валидации при вставке блока через API',
    scenarios: [
      {
        name: 'Valid insertion',
        payload: {
          page_identifier: 'test',
          block_type: 'heading',
          parent_block_id: 'container-1',
          slot: 'column1'
        },
        expectedValid: true
      },
      {
        name: 'Invalid parent type',
        payload: {
          page_identifier: 'test',
          block_type: 'heading',
          parent_block_id: 'paragraph-1', // Параграф не может иметь детей
          slot: 'column1'
        },
        expectedValid: false,
        expectedError: 'Parent block does not allow children'
      },
      {
        name: 'Invalid slot',
        payload: {
          page_identifier: 'test',
          block_type: 'heading',
          parent_block_id: 'container-1',
          slot: 'invalid_slot'
        },
        expectedValid: false,
        expectedError: 'Invalid slot for parent block type'
      }
    ]
  },

  databaseConstraints: {
    description: 'Тест ограничений на уровне БД',
    scenarios: [
      {
        name: 'Foreign key constraint',
        action: 'Insert block with non-existent parent_block_id',
        expectedError: 'foreign key constraint violation'
      },
      {
        name: 'Check constraint',
        action: 'Insert block with invalid status',
        expectedError: 'check constraint violation'
      }
    ]
  }
}
