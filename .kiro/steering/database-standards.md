---
inclusion: fileMatch
fileMatchPattern: 'scripts/seed.sql'
---

# Database Standards and Schema Guidelines

## Core Database Principles

### 1. Correlation ID Tracking
Every table that logs system interactions must include:
- `correlation_id UUID NOT NULL` - For end-to-end request tracing
- Proper indexing on correlation_id for performance

### 2. Timestamp Standards
All tables must include:
- `created_at TIMESTAMP DEFAULT NOW()` - When record was created
- Use ISO 8601 format for all timestamp data
- Store all times in UTC

### 3. Performance Optimization
- Create indexes on frequently queried columns
- Use appropriate data types for optimal storage
- Include constraints for data integrity

## Table Schemas

### Messages Table
For Instagram DMs and WhatsApp messages:

```sql
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('instagram', 'whatsapp')),
    external_id VARCHAR(255),           -- Platform-specific message ID
    sender VARCHAR(255),                -- Phone number or Instagram user ID
    language VARCHAR(10),               -- Language code (tr, en, etc.)
    sentiment VARCHAR(20) CHECK (sentiment IN ('Positive', 'Neutral', 'Negative') OR sentiment IS NULL),
    intent VARCHAR(50),                 -- Detected intent (Greeting, Booking, etc.)
    template_id VARCHAR(100),           -- Template used for response
    response_time_ms INTEGER,           -- Processing time in milliseconds
    outcome VARCHAR(50),                -- 'sent', 'failed', 'escalated'
    created_at TIMESTAMP DEFAULT NOW(),
    correlation_id UUID NOT NULL
);
```

### Reviews Table
For Google Business Profile reviews:

```sql
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id VARCHAR(255) UNIQUE NOT NULL,  -- Google review ID
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    language VARCHAR(10),
    sentiment VARCHAR(20) CHECK (sentiment IN ('Positive', 'Neutral', 'Negative') OR sentiment IS NULL),
    template_id VARCHAR(100),
    response_time_ms INTEGER,
    outcome VARCHAR(50),                -- 'sent', 'failed', 'escalated', 'logged_only'
    created_at TIMESTAMP DEFAULT NOW(),
    correlation_id UUID NOT NULL
);
```

### Errors Table
For centralized error logging:

```sql
CREATE TABLE IF NOT EXISTS errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow VARCHAR(100),              -- Workflow name where error occurred
    node VARCHAR(100),                  -- Specific node that failed
    message TEXT,                       -- Error message
    payload JSONB,                      -- Full error context as JSON
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Required Indexes

### Performance Indexes
```sql
-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_platform ON messages(platform);
CREATE INDEX IF NOT EXISTS idx_messages_correlation_id ON messages(correlation_id);
CREATE INDEX IF NOT EXISTS idx_messages_outcome ON messages(outcome);

-- Reviews table indexes
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_correlation_id ON reviews(correlation_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Errors table indexes
CREATE INDEX IF NOT EXISTS idx_errors_created_at ON errors(created_at);
CREATE INDEX IF NOT EXISTS idx_errors_workflow ON errors(workflow);
```

## Data Integrity Rules

### 1. Platform Validation
- Messages table: platform must be 'instagram' or 'whatsapp'
- Reviews table: rating must be between 1 and 5
- All sentiment values must be 'Positive', 'Neutral', 'Negative', or NULL

### 2. Required Fields
- correlation_id is required for all operational tables
- created_at should always have a default value
- External IDs should be unique where applicable

### 3. Data Types
- Use UUID for all primary keys and correlation IDs
- Use VARCHAR with appropriate length limits
- Use INTEGER for numeric values like ratings and response times
- Use JSONB for flexible data storage (error payloads)

## Query Performance Guidelines

### 1. Efficient Queries
Always use indexed columns in WHERE clauses:

```sql
-- Good: Uses indexed column
SELECT * FROM messages WHERE correlation_id = $1;

-- Good: Uses indexed column with time range
SELECT * FROM messages 
WHERE created_at >= NOW() - INTERVAL '24 hours'
AND platform = 'instagram';
```

### 2. Avoid Full Table Scans
```sql
-- Bad: No index on sender
SELECT * FROM messages WHERE sender LIKE '%user%';

-- Better: Use specific lookups
SELECT * FROM messages WHERE correlation_id = $1;
```

### 3. Pagination for Large Results
```sql
-- Use LIMIT and OFFSET for pagination
SELECT * FROM messages 
ORDER BY created_at DESC 
LIMIT 50 OFFSET 0;
```

## Data Retention Policies

### 1. Log Rotation
- Keep detailed logs for 90 days
- Archive older data for compliance
- Implement automated cleanup procedures

### 2. Error Log Management
- Keep error logs for 30 days minimum
- Archive critical errors for longer periods
- Regular cleanup of resolved errors

## Monitoring and Maintenance

### 1. Performance Monitoring
- Monitor query execution times
- Track table growth rates
- Monitor index usage and effectiveness

### 2. Regular Maintenance
```sql
-- Analyze table statistics
ANALYZE messages;
ANALYZE reviews;
ANALYZE errors;

-- Vacuum tables to reclaim space
VACUUM ANALYZE messages;
```

### 3. Backup Strategy
- Daily automated backups
- Point-in-time recovery capability
- Test restore procedures regularly

## Development Best Practices

### 1. Schema Changes
- Always use migrations for schema changes
- Test migrations on development data first
- Include rollback procedures

### 2. Data Access Patterns
- Use connection pooling for performance
- Implement proper error handling for database operations
- Use transactions for multi-table operations

### 3. Security
- Use parameterized queries to prevent SQL injection
- Limit database user permissions
- Encrypt sensitive data at rest

## Sample Queries for Common Operations

### 1. Message Flow Tracking
```sql
-- Track complete message flow by correlation_id
SELECT 
    m.platform,
    m.sender,
    m.created_at,
    m.response_time_ms,
    m.outcome,
    e.message as error_message
FROM messages m
LEFT JOIN errors e ON e.payload->>'correlation_id' = m.correlation_id::text
WHERE m.correlation_id = $1
ORDER BY m.created_at;
```

### 2. Performance Analytics
```sql
-- Average response times by platform
SELECT 
    platform,
    AVG(response_time_ms) as avg_response_time,
    COUNT(*) as message_count,
    COUNT(CASE WHEN outcome = 'sent' THEN 1 END) as success_count
FROM messages 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY platform;
```

### 3. Error Analysis
```sql
-- Most common errors by workflow
SELECT 
    workflow,
    COUNT(*) as error_count,
    array_agg(DISTINCT message) as error_types
FROM errors 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY workflow
ORDER BY error_count DESC;
```