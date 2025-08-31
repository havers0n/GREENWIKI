# Blocks Catalog - CMC System

## Overview

**Block Library**: Comprehensive catalog of all content blocks in the CMC system
**Architecture**: Atomic Design + FSD (Feature-Sliced Design)
**Categories**: Atomic blocks (basic), Layout blocks (containers), Complex blocks (composite)
**Registry**: Centralized validation via `blockRegistry.ts`

## Block Categories Summary

| Category | Count | Description | Container Support |
|----------|-------|-------------|-------------------|
| Atomic | 9+ | Basic content blocks (text, image, button) | ❌ No |
| Layout | 14+ | Container and positioning blocks | ✅ Yes |
| Complex | TBD | Multi-component composite blocks | ✅ Yes |

## Atomic Blocks Catalog

### Heading Block
**Type**: `heading`
**Path**: `frontend/src/blocks/atomic/HeadingBlock/`
**Purpose**: Text headings with configurable levels and styling

**Props Schema**:
```typescript
interface HeadingBlockProps {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  align?: 'left' | 'center' | 'right';
  metadata?: {
    spacing?: SpacingConfig;
    textColor?: string;
    customClassName?: string;
  };
}
```

**Features**:
- ✅ 6 heading levels (H1-H6)
- ✅ Text alignment options
- ✅ Custom spacing and colors
- ✅ DnD support
- ✅ Editor integration

**Serialization Format**:
```json
{
  "id": "heading-123",
  "block_type": "heading",
  "content": {
    "text": "Welcome to CMC",
    "level": 1,
    "align": "center"
  },
  "metadata": {
    "spacing": { "marginBottom": "2rem" },
    "textColor": "#1f2937"
  }
}
```

**Dependencies**:
- `@my-forum/ui` - Typography components
- `@dnd-kit/core` - Drag and drop
- `clsx` - Conditional classes

**Test Coverage**: ❌ None
**Schema Validation**: ❌ None

### Paragraph Block
**Type**: `text`
**Path**: `frontend/src/blocks/atomic/ParagraphBlock/`
**Purpose**: Rich text content with formatting options

**Props Schema**:
```typescript
interface ParagraphBlockProps {
  text: string;
  metadata?: {
    fontSize?: string;
    lineHeight?: string;
    textColor?: string;
    backgroundColor?: string;
    customClassName?: string;
  };
}
```

**Features**:
- ✅ Rich text editing
- ✅ Font size and color options
- ✅ Background styling
- ✅ DnD support

**Serialization Format**:
```json
{
  "id": "paragraph-456",
  "block_type": "text",
  "content": {
    "text": "<p>This is a paragraph with <strong>bold</strong> text.</p>"
  },
  "metadata": {
    "fontSize": "1.125rem",
    "lineHeight": "1.75"
  }
}
```

**Security Concerns**: ⚠️ HTML content requires sanitization
**Test Coverage**: ❌ None
**Schema Validation**: ❌ None

### Image Block
**Type**: `single_image`
**Path**: `frontend/src/blocks/atomic/ImageBlock/`
**Purpose**: Single image display with responsive behavior

**Props Schema**:
```typescript
interface ImageBlockProps {
  imageUrl: string;
  altText: string;
  metadata?: {
    width?: string;
    height?: string;
    objectFit?: 'cover' | 'contain' | 'fill';
    borderRadius?: string;
    customClassName?: string;
  };
}
```

**Features**:
- ✅ Image URL input
- ✅ Alt text for accessibility
- ✅ Responsive sizing
- ✅ Object fit options
- ✅ DnD support

**Serialization Format**:
```json
{
  "id": "image-789",
  "block_type": "single_image",
  "content": {
    "imageUrl": "https://example.com/image.jpg",
    "altText": "Descriptive alt text"
  },
  "metadata": {
    "width": "100%",
    "height": "auto",
    "objectFit": "cover"
  }
}
```

**Security Concerns**: ⚠️ Image URLs need validation
**Test Coverage**: ❌ None
**Schema Validation**: ❌ None

### Button Block
**Type**: `single_button`
**Path**: `frontend/src/blocks/atomic/ButtonBlock/`
**Purpose**: Interactive button with link and styling options

**Props Schema**:
```typescript
interface ButtonBlockProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  link?: string;
  linkTarget?: '_blank' | '_self';
  metadata?: {
    spacing?: SpacingConfig;
    borderRadius?: string;
    customClassName?: string;
  };
}
```

**Features**:
- ✅ 4 button variants
- ✅ 3 size options
- ✅ Link with target options
- ✅ Custom styling
- ✅ DnD support

**Serialization Format**:
```json
{
  "id": "button-101",
  "block_type": "single_button",
  "content": {
    "text": "Click Me",
    "variant": "primary",
    "size": "md",
    "link": "/contact",
    "linkTarget": "_self"
  },
  "metadata": {
    "spacing": { "marginTop": "1rem" },
    "borderRadius": "0.5rem"
  }
}
```

**Test Coverage**: ❌ None
**Schema Validation**: ❌ None

### Spacer Block
**Type**: `spacer`
**Path**: `frontend/src/blocks/atomic/SpacerBlock/`
**Purpose**: Vertical spacing element for layout control

**Props Schema**:
```typescript
interface SpacerBlockProps {
  height?: string;
  customHeight?: string;
  metadata?: {
    backgroundColor?: string;
    customClassName?: string;
  };
}
```

**Features**:
- ✅ Fixed height options
- ✅ Custom height input
- ✅ Optional background
- ✅ DnD support

**Serialization Format**:
```json
{
  "id": "spacer-202",
  "block_type": "spacer",
  "content": {
    "height": "2rem",
    "customHeight": ""
  },
  "metadata": {
    "backgroundColor": "transparent"
  }
}
```

**Test Coverage**: ❌ None
**Schema Validation**: ❌ None

## Layout Blocks Catalog

### Container Section Block
**Type**: `container_section`
**Path**: `frontend/src/widgets/ContainerSection/`
**Purpose**: Flexible container with layout options

**Container Properties**:
- ✅ Accepts all atomic blocks
- ✅ Dynamic slot allocation
- ✅ Layout direction control
- ✅ Gap and padding options

**Allowed Children**:
```typescript
const allowedChildren = [
  'button_group',
  'categories_section',
  'controls_section',
  'properties_section',
  'animations_section',
  'changelog_section',
  'heading',
  'paragraph',
  'single_image',
  'single_button',
  'spacer',
  'tabs_block',
  'accordion_block'
];
```

**Props Schema**:
```typescript
interface ContainerSectionProps {
  layout?: 'vertical' | 'horizontal';
  gap?: 'none' | 'small' | 'medium' | 'large';
  padding?: 'none' | 'small' | 'medium' | 'large';
  maxWidth?: string;
  backgroundColor?: string;
  children: BlockNode[];
}
```

**Serialization Format**:
```json
{
  "id": "container-303",
  "block_type": "container_section",
  "content": {
    "layout": "vertical",
    "gap": "medium",
    "padding": "large",
    "maxWidth": "1200px",
    "backgroundColor": "#ffffff"
  },
  "children": [...]
}
```

**Test Coverage**: ❌ None
**Schema Validation**: ❌ None

### Columns Block
**Type**: `columns`
**Path**: `frontend/src/blocks/layout/ColumnsBlock/`
**Purpose**: Multi-column layout container

**Container Properties**:
- ✅ 2-3 column layouts
- ✅ Responsive behavior
- ✅ Gap control
- ✅ Equal/unequal column widths

**Props Schema**:
```typescript
interface ColumnsBlockProps {
  layout: '2-col' | '3-col' | '2-col-wide-left' | '2-col-wide-right';
  gap?: 'small' | 'medium' | 'large';
  children: BlockNode[];
}
```

**Serialization Format**:
```json
{
  "id": "columns-404",
  "block_type": "columns",
  "content": {
    "layout": "2-col",
    "gap": "medium"
  },
  "children": [...]
}
```

**Test Coverage**: ❌ None
**Schema Validation**: ❌ None

## Complex Blocks (Planned)

### Tabs Block
**Type**: `tabs_block`
**Purpose**: Tabbed content interface
**Status**: Planned

**Features** (Planned):
- ✅ Dynamic tab creation
- ✅ Tab reordering
- ✅ Content per tab
- ✅ Accessibility support

### Accordion Block
**Type**: `accordion_block`
**Purpose**: Collapsible content sections
**Status**: Planned

**Features** (Planned):
- ✅ Multiple sections
- ✅ Expand/collapse behavior
- ✅ Section reordering
- ✅ Single/multiple expansion modes

## Block Registry Configuration

### Registry Structure
```typescript
// backend/src/blockRegistry.ts
export const BLOCK_REGISTRY: Record<string, BlockSpec> = {
  // Atomic blocks
  heading: { type: 'heading' },
  paragraph: { type: 'paragraph' },
  single_image: { type: 'single_image' },
  single_button: { type: 'single_button' },
  spacer: { type: 'spacer' },

  // Container blocks
  container_section: {
    type: 'container_section',
    allowedChildren: [...],
    allowedSlots: ['column1', 'column2', 'column3']
  },

  // Dynamic blocks
  tabs_block: {
    type: 'tabs_block',
    allowedChildren: [...]
    // allowedSlots generated dynamically
  }
};
```

### Block Validation Logic

**Placement Validation**:
```typescript
export async function isValidPlacement(
  childType: string,
  parentBlockId: string | null,
  slot?: string | null
): Promise<boolean> {
  // 1. Check if child type is allowed
  // 2. Validate slot existence
  // 3. Check parent container capabilities
  // 4. Return validation result
}
```

## Block Development Guidelines

### File Structure Standard
```
BlockName/
├── index.ts                 # Exports
├── types/
│   └── index.ts            # TypeScript definitions
├── ui/
│   ├── BlockName.tsx       # Main component
│   ├── BlockNameEditor.tsx # Editor interface
│   └── BlockNamePreview.tsx # Preview component
├── model/
│   ├── useBlockNameLogic.ts # Business logic hook
│   └── useBlockNameStyles.ts # Styling hook
├── README.md               # Documentation
└── example.tsx            # Usage example
```

### Required Block Interface
```typescript
interface BlockComponent {
  // Unique identifier
  id: string;

  // Block type for registry
  block_type: string;

  // Block content (varies by type)
  content: BlockContent;

  // Metadata for styling
  metadata?: BlockMetadata;

  // DnD and positioning
  position: number;
  parent_block_id?: string;
  slot?: string;
}
```

### Block Props Standard
```typescript
interface BaseBlockProps {
  // Core identification
  blockId?: string;

  // Editor mode
  editorMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;

  // Update handling
  onUpdateBlock?: (block: BlockNode) => void;

  // DnD support
  dragRef?: RefObject<HTMLElement>;
  dragListeners?: DragListeners;
}
```

## Block Schema Validation (Required)

### Zod Schema Template
```typescript
import { z } from 'zod';

// Base schemas
export const blockIdSchema = z.string().uuid();
export const blockTypeSchema = z.string().min(1).max(100);

// Content schemas
export const headingContentSchema = z.object({
  text: z.string().min(1).max(200),
  level: z.number().int().min(1).max(6),
  align: z.enum(['left', 'center', 'right']).optional()
});

// Metadata schemas
export const spacingSchema = z.object({
  marginTop: z.string().optional(),
  marginRight: z.string().optional(),
  marginBottom: z.string().optional(),
  marginLeft: z.string().optional()
});

// Complete block schema
export const headingBlockSchema = z.object({
  id: blockIdSchema,
  block_type: z.literal('heading'),
  content: headingContentSchema,
  metadata: z.object({
    spacing: spacingSchema.optional(),
    textColor: z.string().optional()
  }).optional()
});
```

## Block Testing Requirements

### Unit Test Template
```typescript
describe('HeadingBlock', () => {
  it('should render heading text', () => {
    render(<HeadingBlock text="Test Heading" level={1} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Heading');
  });

  it('should handle selection in editor mode', () => {
    const onSelect = jest.fn();
    render(
      <HeadingBlock
        text="Test"
        editorMode={true}
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByText('Test'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('should validate schema correctly', () => {
    const validData = { text: 'Valid', level: 1 };
    expect(headingBlockSchema.safeParse(validData).success).toBe(true);

    const invalidData = { text: '', level: 7 };
    expect(headingBlockSchema.safeParse(invalidData).success).toBe(false);
  });
});
```

### Integration Test Template
```typescript
describe('Block DnD Integration', () => {
  it('should handle drag from library to canvas', async () => {
    // Setup DnD context
    // Simulate drag operation
    // Verify block creation
    // Check position and parent assignment
  });
});
```

## Block Performance Guidelines

### Rendering Optimization
- ✅ Use `React.memo` for block components
- ✅ Implement proper dependency arrays in hooks
- ✅ Use `useMemo` for expensive calculations
- ✅ Avoid unnecessary re-renders

### Bundle Size Management
- ✅ Lazy load block editors
- ✅ Code split complex block types
- ✅ Tree shake unused features
- ✅ Optimize asset loading

### Memory Management
- ✅ Clean up event listeners
- ✅ Dispose of DOM references
- ✅ Implement proper cleanup in effects
- ✅ Monitor memory usage in development

## Block Accessibility Requirements

### ARIA Implementation
```typescript
// Block wrapper with proper ARIA
<div
  role="region"
  aria-label={`${blockType} block`}
  aria-selected={isSelected}
  tabIndex={editorMode ? 0 : -1}
  onKeyDown={handleKeyDown}
>
  {/* Block content */}
</div>
```

### Keyboard Navigation
- ✅ Tab navigation between blocks
- ✅ Arrow keys for movement
- ✅ Enter/Space for selection
- ✅ Escape to deselect

### Screen Reader Support
- ✅ Proper heading hierarchy
- ✅ Descriptive labels
- ✅ Live regions for updates
- ✅ Focus management

## Block Migration Strategy

### Schema Versioning
```typescript
interface BlockVersion {
  version: string;
  migration: (data: any) => any;
}

const blockMigrations: Record<string, BlockVersion[]> = {
  heading: [
    {
      version: '1.0.0',
      migration: (data) => ({ ...data, migrated: true })
    }
  ]
};
```

### Backward Compatibility
- ✅ Support legacy block formats
- ✅ Automatic migration on load
- ✅ Fallback rendering for unknown types
- ✅ Version tracking in database

## Conclusion

The block library provides a solid foundation for the CMC system with well-structured components and comprehensive features. However, critical gaps in testing, validation, and performance optimization need immediate attention.

**Current Block Health**: 🟡 MODERATE
**Critical Gaps**: Schema validation, test coverage, performance optimization
**Estimated Improvement Time**: 4-6 weeks
**Required Resources**: 2-3 developers (1 frontend, 1 QA)

**Priority Improvements**:
1. **Schema Validation**: Implement Zod schemas for all blocks
2. **Test Coverage**: Add comprehensive unit and integration tests
3. **Performance**: Optimize rendering and bundle size
4. **Security**: Add input sanitization and validation
5. **Accessibility**: Implement WCAG compliance

The block catalog serves as a comprehensive reference for development and maintenance of the CMC system's content management capabilities.
