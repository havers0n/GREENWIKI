# Database & RLS Audit - CMC System

## Overview

**Database**: Supabase (PostgreSQL 15+)
**Schema**: Hierarchical block system with RLS
**Security**: Row Level Security with role-based access
**Performance**: Indexed queries with JSONB support

## Database Schema Analysis

### Core Tables Structure

**Pages Table**:
```sql
CREATE TABLE public.pages (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    author_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);
```

**Layout Blocks Table** (Critical):
```sql
CREATE TABLE public.layout_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_identifier TEXT NOT NULL,
    block_type TEXT NOT NULL,
    content JSONB,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    position INTEGER,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    parent_block_id UUID REFERENCES public.layout_blocks(id),
    slot TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);
```

**Strengths**:
- ✅ Proper foreign key relationships
- ✅ JSONB for flexible content storage
- ✅ Hierarchical structure with parent/child relationships
- ✅ Status-based content management

### Schema Design Issues

#### 🔴 P0-001: Missing Indexes for Critical Queries
**Current Indexes**:
```sql
CREATE INDEX idx_layout_blocks_page_identifier ON public.layout_blocks(page_identifier);
CREATE INDEX idx_layout_blocks_position ON public.layout_blocks(page_identifier, position);
CREATE INDEX idx_layout_blocks_parent ON public.layout_blocks(parent_block_id, position);
```

**Missing Critical Indexes**:
- ❌ **No composite index** for `(page_identifier, status, position)`
- ❌ **No index on block_type** for filtering operations
- ❌ **No GIN index on content JSONB** for content searches
- ❌ **No partial indexes** for published content only

**Impact**: Slow queries, high database load, poor user experience

#### 🟠 P1-002: No Data Partitioning Strategy
**Current Issues**:
- All blocks in single table regardless of page
- No time-based partitioning for old content
- No archive strategy for deleted content
- Potential table bloat with large content

**Impact**: Performance degradation over time, large backup sizes

### RLS Policies Analysis

#### Current RLS Implementation

**Admin-Only Policies**:
```sql
CREATE POLICY "Admins can manage pages" ON public.pages FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
    OR auth.role() = 'service_role'
);
```

**Critical Security Issues**:

#### 🔴 P0-003: Insufficient User Profile Validation
**Current Problem**:
```sql
-- Policy depends on profiles table existence
WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
```

**Attack Vectors**:
- ❌ **Profile table injection**: If profiles table is compromised
- ❌ **Role manipulation**: No validation of role values
- ❌ **Missing profile creation**: New users can't access anything
- ❌ **Service role bypass**: No additional service role validation

#### 🔴 P0-004: No Public Content Access Policies
**Missing Policies**:
- ❌ **No public read access** for published content
- ❌ **No anonymous access** for published pages
- ❌ **No content filtering** based on publication status
- ❌ **No rate limiting** at database level

**Impact**: Published content inaccessible to public users

#### 🟠 P1-005: Missing Granular Permissions
**Current State**:
- Flat permission model (admin vs nothing)
- No content creator permissions
- No editor vs admin distinction
- No content ownership validation

**Impact**: Over-privileged access, no content ownership

## Database Performance Issues

### Query Performance Analysis

#### Critical Slow Queries

**Block Tree Building** (N+1 Problem):
```sql
-- Current implementation causes multiple queries
SELECT * FROM layout_blocks WHERE page_identifier = $1 AND parent_block_id IS NULL;
-- Then for each child:
SELECT * FROM layout_blocks WHERE parent_block_id = $1;
```

**Optimization Required**:
```sql
-- Single query with recursive CTE
WITH RECURSIVE block_tree AS (
    SELECT *, 0 as depth, ARRAY[id] as path
    FROM layout_blocks
    WHERE page_identifier = $1 AND parent_block_id IS NULL

    UNION ALL

    SELECT lb.*, bt.depth + 1, bt.path || lb.id
    FROM layout_blocks lb
    JOIN block_tree bt ON lb.parent_block_id = bt.id
)
SELECT * FROM block_tree ORDER BY path, position;
```

#### Missing Query Optimizations

**Required Indexes**:
```sql
-- Performance indexes
CREATE INDEX CONCURRENTLY idx_layout_blocks_page_status_position
ON public.layout_blocks(page_identifier, status, position)
WHERE status = 'published';

CREATE INDEX CONCURRENTLY idx_layout_blocks_block_type
ON public.layout_blocks(block_type);

-- JSONB indexes for content searching
CREATE INDEX CONCURRENTLY idx_layout_blocks_content_gin
ON public.layout_blocks USING gin(content);

-- Partial indexes for active content
CREATE INDEX CONCURRENTLY idx_layout_blocks_active
ON public.layout_blocks(page_identifier, position)
WHERE status = 'published' AND updated_at > NOW() - INTERVAL '30 days';
```

## Data Integrity Issues

### Constraint Analysis

#### Missing Constraints

**Required Constraints**:
- ❌ **No unique constraint** on `(page_identifier, position)` for ordering
- ❌ **No check constraint** on `block_type` values (should reference registry)
- ❌ **No foreign key validation** for `page_identifier` (no pages table reference)
- ❌ **No JSON schema validation** at database level

**Impact**: Data corruption, invalid block types, orphaned records

### Data Validation Gaps

#### JSONB Content Validation

**Current State**:
- JSONB accepts any structure
- No database-level validation
- Application-only validation
- Potential data corruption

**Required Solution**:
```sql
-- JSON schema validation (PostgreSQL 12+)
ALTER TABLE layout_blocks
ADD CONSTRAINT validate_block_content
CHECK (jsonb_matches_schema('block_content_schema', content));
```

## Migration & Schema Evolution

### Current Migration State

**Migration Issues**:
- ❌ **No migration system**: Schema changes manual
- ❌ **No version tracking**: No schema versioning
- ❌ **No rollback strategy**: Breaking changes can't be reverted
- ❌ **No data migration**: Schema changes lose data

**Impact**: Risky deployments, data loss, rollback complexity

### Required Migration System

**Flyway/Liquibase Alternative**:
```sql
-- Versioned migrations
V001__create_initial_schema.sql
V002__add_content_indexes.sql
V003__add_rls_policies.sql
V004__add_block_validation.sql
```

## Security Vulnerabilities

### RLS Bypass Vulnerabilities

#### 🔴 P0-006: Service Role Security Gap
**Current Policy**:
```sql
OR auth.role() = 'service_role'
```

**Issues**:
- ❌ **No service key validation**: Any service_role claim bypasses RLS
- ❌ **No IP restrictions**: Service role can be used from anywhere
- ❌ **No audit logging**: Service role usage not tracked
- ❌ **No token expiration**: Service tokens never expire

#### 🔴 P0-007: Profile Table Dependency
**Attack Scenario**:
```sql
-- If profiles table is compromised, attacker can:
1. Insert malicious profile with admin role
2. Access all data via RLS bypass
3. Modify system-critical content
```

**Impact**: Complete system compromise through profile table injection

### Data Exposure Risks

#### Sensitive Data Handling

**Current Issues**:
- ❌ **No data classification**: All data treated equally
- ❌ **No encryption**: Sensitive content stored in plain JSONB
- ❌ **No PII handling**: User data not properly protected
- ❌ **No audit trail**: No change tracking for sensitive operations

## Backup & Recovery Issues

### Backup Strategy Gaps

**Current State**:
- ❌ **No automated backups**: Manual backup process
- ❌ **No backup validation**: No restore testing
- ❌ **No point-in-time recovery**: No WAL archiving
- ❌ **No backup encryption**: Unencrypted backups

**Impact**: Data loss risk, no disaster recovery

## Performance Monitoring

### Missing Performance Insights

**Required Monitoring**:
- ❌ **No query performance tracking**: No slow query log
- ❌ **No index usage statistics**: No index hit tracking
- ❌ **No table bloat monitoring**: No autovacuum monitoring
- ❌ **No connection pool monitoring**: No connection tracking

## Recommendations

### Immediate Actions (Week 1-2)

1. **Fix Critical RLS Vulnerabilities**
   - Implement proper service role validation
   - Add public content access policies
   - Fix profile table dependency issues
   - Add comprehensive audit logging

2. **Add Critical Database Indexes**
   - Create composite indexes for common queries
   - Add JSONB GIN indexes for content searching
   - Implement partial indexes for published content
   - Add performance monitoring indexes

3. **Implement Data Validation**
   - Add database-level constraints
   - Implement JSON schema validation
   - Add foreign key validations
   - Create data integrity checks

### Short-term (Month 1)

1. **Schema Migration System**
   - Implement versioned migrations
   - Add rollback capabilities
   - Create data migration scripts
   - Implement schema validation

2. **Security Hardening**
   - Implement proper service role security
   - Add data encryption for sensitive content
   - Implement audit logging for all changes
   - Add rate limiting at database level

3. **Performance Optimization**
   - Optimize N+1 query problems
   - Implement query result caching
   - Add database connection pooling
   - Implement read replicas for public content

### Medium-term (Month 2-3)

1. **Advanced Security Features**
   - Implement data classification
   - Add PII handling and encryption
   - Implement row-level audit logging
   - Add anomaly detection

2. **Scalability Improvements**
   - Implement table partitioning
   - Add database sharding strategy
   - Implement archiving for old content
   - Add horizontal scaling support

3. **Monitoring & Observability**
   - Implement comprehensive performance monitoring
   - Add automated backup validation
   - Implement disaster recovery procedures
   - Add capacity planning metrics

## Database Security Assessment

### Current Risk Level: 🔴 CRITICAL

**Critical Vulnerabilities**:
- 4 P0 security issues in RLS implementation
- Complete data exposure possible through profile table compromise
- No public content access policies
- Service role security gaps

### Required Security Controls

**Immediate Implementation**:
```sql
-- Secure RLS policies with proper validation
CREATE POLICY "Secure admin access" ON public.layout_blocks FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
        AND profiles.status = 'active'  -- Add status validation
    )
    AND auth.jwt()->>'role' != 'service_role'  -- Explicit service role exclusion
);

-- Public content access for published items
CREATE POLICY "Public read published content" ON public.layout_blocks FOR SELECT USING (
    status = 'published'
    AND page_identifier IN (
        SELECT slug FROM public.pages WHERE status = 'published'
    )
);
```

## Performance Optimization Roadmap

### Week 1-2: Critical Performance Fixes
- [ ] Add missing composite indexes
- [ ] Optimize N+1 query problems
- [ ] Implement query result caching
- [ ] Add database connection monitoring

### Month 1: Query Optimization
- [ ] Implement recursive CTE for tree queries
- [ ] Add GIN indexes for JSONB content
- [ ] Optimize pagination queries
- [ ] Implement database query monitoring

### Month 2-3: Advanced Optimization
- [ ] Implement read replicas
- [ ] Add database partitioning
- [ ] Implement archiving strategy
- [ ] Add performance regression testing

## Conclusion

The database schema shows good hierarchical design but has critical RLS security vulnerabilities and significant performance issues. The lack of proper indexing, missing public access policies, and security gaps in service role handling represent immediate risks to system security and performance.

**Overall Assessment**: 🔴 CRITICAL RISK
**Critical Issues**: 7 (4 P0, 3 P1)
**Estimated Fix Time**: 3-4 weeks
**Required Resources**: 2 developers (DBA + Security expert)

**Priority Matrix**:
- **Security**: 🔴 URGENT (RLS bypass, service role security)
- **Performance**: 🔴 URGENT (missing indexes, N+1 queries)
- **Data Integrity**: 🟠 HIGH (constraints, validation)
- **Scalability**: 🟡 MEDIUM (partitioning, optimization)
