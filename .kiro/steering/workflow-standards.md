---
inclusion: fileMatch
fileMatchPattern: 'workflows/*.json'
---

# Workflow Development Standards

## Required Components for All Workflows

### 1. Correlation ID Tracking
Every workflow must implement correlation_id tracking:

```javascript
// Generate correlation_id in intake workflows
correlation_id: require('crypto').randomUUID()

// Pass correlation_id in HTTP requests
headers: {
  'x-correlation-id': '={{ $json.correlation_id }}'
}

// Include in database operations
correlation_id: '={{ $json.correlation_id }}'
```

### 2. Database Logging
All workflows must log to appropriate tables:

- **Messages**: Use `messages` table for Instagram/WhatsApp
- **Reviews**: Use `reviews` table for Google Business Profile
- **Errors**: Use `errors` table for all error logging

Required fields:
- `correlation_id` (UUID)
- `response_time_ms` (calculated from start time)
- `outcome` ('sent', 'failed', 'escalated', 'logged_only')

### 3. Error Handling
Implement comprehensive error handling:

```javascript
// Retry configuration
retryOnFail: true,
maxTries: 3,
waitBetweenTries: 2000,
continueOnFail: true
```

### 4. Response Time Tracking
Calculate and log response times:

```javascript
// Record start time
const startTime = Date.now();

// Calculate response time
const responseTimeMs = Date.now() - startTime;
```

## Workflow-Specific Standards

### Intake Workflows
- Must validate webhook tokens
- Must normalize platform-specific data
- Must generate correlation_id
- Must check policy compliance (24-hour rule for Instagram/WhatsApp)
- Must call processor workflow with standardized payload

### Processor Workflow
- Must analyze sentiment and intent using OpenAI
- Must generate appropriate responses under 500 characters
- Must route to correct sender workflow based on platform
- Must handle OpenAI API failures gracefully with fallback responses

### Sender Workflows
- Must implement platform-specific API calls
- Must handle different message types (text, template)
- Must update database with outcome and response time
- Must log errors and send Slack alerts for failures

### Error Handler Workflow
- Must capture all workflow errors
- Must log to errors table with full context
- Must send Slack alerts for critical failures
- Must include correlation_id for traceability

## Code Quality Standards

### JavaScript Code Nodes
- Use proper error handling with try/catch blocks
- Include descriptive console.log statements for debugging
- Return structured data with consistent field names
- Validate input data before processing

### HTTP Request Nodes
- Always include timeout settings
- Use proper authentication headers
- Include correlation_id in headers when calling internal workflows
- Handle both success and error responses

### Database Nodes
- Use parameterized queries to prevent SQL injection
- Include proper error handling for connection failures
- Use appropriate indexes for performance
- Handle duplicate key conflicts gracefully

## Testing Requirements

All workflows must be testable with:
- Mock data for development
- Integration tests for API endpoints
- Error scenario testing
- Performance testing under load

## Documentation Requirements

Each workflow must include:
- Clear node naming and descriptions
- Inline comments in code nodes
- Error handling documentation
- API endpoint documentation
- Sample payloads for testing