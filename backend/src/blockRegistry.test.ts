/**
 * Unit-тесты для функций валидации блоков на бэкенде
 */

import { describe, it, expect, vi } from 'vitest'
import { isValidPlacement, getBlockSpec, isContainerBlock, BLOCK_REGISTRY } from './blockRegistry'
import { supabaseAdmin } from './supabaseClient'

// Мокаем supabaseAdmin
vi.mock('./supabaseClient', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}))

describe('Block Registry Backend Validation', () => {
  describe('getBlockSpec', () => {
    it('should return block spec for valid block type', () => {
      const spec = getBlockSpec('container_section')
      expect(spec).toBeDefined()
      expect(spec?.type).toBe('container_section')
      expect(spec?.allowedChildren).toBeDefined()
      expect(spec?.allowedSlots).toBeDefined()
    })

    it('should return null for invalid block type', () => {
      const spec = getBlockSpec('nonexistent_block')
      expect(spec).toBeNull()
    })
  })

  describe('isContainerBlock', () => {
    it('should return true for container blocks', () => {
      expect(isContainerBlock('container_section')).toBe(true)
    })

    it('should return false for atomic blocks', () => {
      expect(isContainerBlock('heading')).toBe(false)
      expect(isContainerBlock('paragraph')).toBe(false)
      expect(isContainerBlock('single_image')).toBe(false)
    })
  })

  describe('isValidPlacement', () => {
    it('should allow root blocks (parentBlockId is null)', async () => {
      const result = await isValidPlacement('heading', null)
      expect(result).toBe(true)
    })

    it('should validate valid parent-child combinations', async () => {
      // Мокаем успешный ответ от базы данных
      const mockSupabase = vi.mocked(supabaseAdmin)
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { block_type: 'container_section' },
              error: null
            }))
          }))
        }))
      } as any)

      const result = await isValidPlacement('heading', 'container-id', 'column1')
      expect(result).toBe(true)
    })

    it('should reject invalid parent-child combinations', async () => {
      // Мокаем ответ с типом блока, который не позволяет детей
      const mockSupabase = vi.mocked(supabaseAdmin)
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { block_type: 'paragraph' },
              error: null
            }))
          }))
        }))
      } as any)

      const result = await isValidPlacement('heading', 'paragraph-id')
      expect(result).toBe(false)
    })

    it('should reject invalid slots', async () => {
      // Мокаем ответ с container_section
      const mockSupabase = vi.mocked(supabaseAdmin)
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { block_type: 'container_section' },
              error: null
            }))
          }))
        }))
      } as any)

      const result = await isValidPlacement('heading', 'container-id', 'invalid_slot')
      expect(result).toBe(false)
    })

    it('should handle database errors gracefully', async () => {
      // Мокаем ошибку базы данных
      const mockSupabase = vi.mocked(supabaseAdmin)
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Block not found' }
            }))
          }))
        }))
      } as any)

      const result = await isValidPlacement('heading', 'nonexistent-id')
      expect(result).toBe(false)
    })

    it('should handle unknown parent block types', async () => {
      // Мокаем ответ с неизвестным типом блока
      const mockSupabase = vi.mocked(supabaseAdmin)
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { block_type: 'unknown_type' },
              error: null
            }))
          }))
        }))
      } as any)

      const result = await isValidPlacement('heading', 'unknown-id')
      expect(result).toBe(false)
    })
  })

  describe('BLOCK_REGISTRY structure', () => {
    it('should contain all expected block types', () => {
      const expectedBlocks = [
        'heading', 'paragraph', 'single_image', 'single_button', 'spacer',
        'header', 'categories_section', 'controls_section', 'button_group',
        'properties_section', 'animations_section', 'changelog_section',
        'container_section'
      ]

      for (const blockType of expectedBlocks) {
        expect(BLOCK_REGISTRY[blockType]).toBeDefined()
        expect(BLOCK_REGISTRY[blockType].type).toBe(blockType)
      }
    })

    it('should have correct allowedChildren for container_section', () => {
      const container = BLOCK_REGISTRY.container_section
      expect(container.allowedChildren).toBeDefined()
      expect(container.allowedChildren).toContain('heading')
      expect(container.allowedChildren).toContain('paragraph')
      expect(container.allowedChildren).toContain('single_image')
      expect(container.allowedChildren).toContain('single_button')
      expect(container.allowedChildren).toContain('spacer')
    })

    it('should have correct allowedSlots for container_section', () => {
      const container = BLOCK_REGISTRY.container_section
      expect(container.allowedSlots).toBeDefined()
      expect(container.allowedSlots).toContain('column1')
      expect(container.allowedSlots).toContain('column2')
      expect(container.allowedSlots).toContain('column3')
    })

    it('should not have allowedChildren for atomic blocks', () => {
      const atomicBlocks = ['heading', 'paragraph', 'single_image', 'single_button', 'spacer']

      for (const blockType of atomicBlocks) {
        const block = BLOCK_REGISTRY[blockType]
        expect(block.allowedChildren).toBeUndefined()
        expect(block.allowedSlots).toBeUndefined()
      }
    })
  })
})
