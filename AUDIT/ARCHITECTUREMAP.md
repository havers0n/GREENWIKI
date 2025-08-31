# Architecture Map - CMC System Audit

## Project Overview

**Technology Stack:**
- **Frontend**: React 19, TypeScript, Vite, Redux Toolkit, React Router v7
- **Backend**: Node.js, Express, TypeScript, Supabase, Redis, Zod validation
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Architecture**: Feature-Sliced Design (FSD) + Monorepo (pnpm workspaces)
- **UI**: TailwindCSS + Custom Design System (@my-forum/ui)
- **Build**: Vite (frontend), TypeScript (backend)
- **Testing**: Vitest, Jest, React Testing Library, Storybook
- **Deployment**: Supabase (hosting), Vercel/Netlify potential

## Architecture Layers (FSD)

### App Layer (`frontend/src/app/`)
**Purpose**: Application composition and configuration
**Components**:
- `providers/` - React context providers (theme, auth, store)
- `styles/` - Global styles and CSS variables
- `App.tsx` - Root component with routing

**Current State**: ✅ Well-structured with proper provider composition

### Widgets Layer (`frontend/src/widgets/`)
**Purpose**: Composite UI components combining features
**Structure**:
```
widgets/
├── OnboardingTutorial/ - Complex onboarding flow
├── [72 widgets total] - Various composite components
```

**Analysis**: Large number of widgets suggests good componentization but potential over-fragmentation

### Features Layer (`frontend/src/features/`)
**Purpose**: Business logic and feature-specific components
**Structure**:
```
features/
├── [40 features] - Business features implementation
```

**Analysis**: Need detailed analysis of feature boundaries and cross-dependencies

### Entities Layer (`frontend/src/entities/`)
**Purpose**: Business entities and their models
**Structure**:
```
entities/
├── [16 entities] - Data models and entity-specific logic
```

**Analysis**: Core business logic layer - critical for data consistency

### Shared Layer (`frontend/src/shared/`)
**Purpose**: Reusable utilities, types, and components
**Structure**:
```
shared/
├── [31 shared modules] - Utilities, types, common components
```

## Data Flow Architecture

### Frontend State Management
- **Primary**: Redux Toolkit + Redux Persist
- **Local**: React Query for server state
- **Forms**: React Hook Form with Zod validation
- **Drag & Drop**: @dnd-kit ecosystem

### Backend Architecture
- **API**: Express.js with middleware stack
- **Validation**: Zod schemas
- **Caching**: Redis integration
- **Auth**: Supabase authentication
- **Database**: Supabase client with RLS

## Block Library Architecture

### Block Categories
- **Atomic Blocks** (`blocks/atomic/`): Basic components (buttons, inputs, etc.)
- **Layout Blocks** (`blocks/layout/`): Layout containers and grids
- **Complex Blocks**: Composite blocks combining multiple atomic/layout blocks

### Block Registry System
- **Location**: `backend/src/blockRegistry.ts`
- **Purpose**: Centralized block registration and validation
- **Features**: Schema validation, serialization, metadata management

## Database Schema (Supabase)

### Core Tables
- **Pages**: CMS page structure
- **Blocks**: Reusable content blocks
- **Layouts**: Page layout templates
- **Sections**: Page sections
- **Categories**: Content categorization
- **Users**: Authentication and permissions

### Relationships
- Pages → Sections (1:many)
- Sections → Blocks (1:many)
- Blocks → Categories (many:many)

## API Architecture

### REST Endpoints
```
/api/pages - Page management
/api/blocks - Block CRUD operations
/api/layouts - Layout templates
/api/sections - Section management
/api/categories - Category management
```

### Middleware Stack
- Authentication (Supabase)
- Authorization (custom middleware)
- Caching (Redis)
- Rate limiting
- Error handling
- Logging

## Security Architecture

### Authentication
- **Provider**: Supabase Auth
- **Methods**: Email/password, OAuth providers
- **Session**: JWT tokens with refresh

### Authorization
- **RLS**: PostgreSQL Row Level Security
- **Middleware**: `isAdminMiddleware.ts`
- **Policies**: Per-table security policies

### Data Protection
- **Input Validation**: Zod schemas
- **XSS Protection**: DOMPurify integration
- **CSRF**: Supabase built-in protection

## Performance Architecture

### Frontend Optimization
- **Build**: Vite with code splitting
- **Bundle Analysis**: rollup-plugin-visualizer
- **Lazy Loading**: React.lazy for routes and components
- **Caching**: Service worker + HTTP caching

### Backend Optimization
- **Caching**: Redis for API responses
- **Database**: Supabase query optimization
- **Assets**: CDN integration potential

## Deployment Architecture

### Development
- **Local**: pnpm dev (concurrent frontend/backend)
- **Database**: Supabase local or cloud
- **Hot Reload**: Vite HMR + ts-node-dev

### Production
- **Frontend**: Vercel/Netlify static hosting
- **Backend**: Serverless functions or containerized
- **Database**: Supabase cloud
- **CDN**: Built-in with hosting providers

## Monorepo Structure

### Workspace Dependencies
```
my-forum (root)
├── backend (@my-forum/backend)
├── frontend
└── packages/
    ├── @my-forum/db-types
    └── @my-forum/ui
```

### Dependency Flow
- `frontend` → `@my-forum/ui`, `@my-forum/db-types`
- `backend` → `@my-forum/db-types`
- `@my-forum/ui` → independent
- `@my-forum/db-types` → generated from Supabase

## Critical Architecture Issues

### 1. FSD Layer Violations
**Evidence**: Cross-layer imports potential
**Impact**: Tight coupling, difficult testing
**Priority**: P1

### 2. Block Registry Coupling
**Evidence**: Block rendering logic mixed with storage schema
**Impact**: Changes require coordinated updates
**Priority**: P1

### 3. State Management Complexity
**Evidence**: Redux + React Query + local state
**Impact**: Potential state synchronization issues
**Priority**: P2

### 4. Bundle Size Optimization
**Evidence**: Large number of widgets and features
**Impact**: Slow initial load times
**Priority**: P2

## Architecture Recommendations

### Short-term (1-2 weeks)
1. Implement import layer validation
2. Extract block adapter pattern
3. Consolidate state management strategy
4. Add bundle size monitoring

### Medium-term (1-3 months)
1. Implement micro-frontend architecture
2. Add comprehensive error boundaries
3. Optimize database queries with indexes
4. Implement proper caching strategy

### Long-term (3-6 months)
1. Consider migrating to Next.js for SSR
2. Implement proper CI/CD pipeline
3. Add comprehensive monitoring
4. Consider GraphQL for complex queries
