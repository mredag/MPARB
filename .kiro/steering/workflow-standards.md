---
inclusion: fileMatch
fileMatchPattern: 'workflows/*.json'
---

# Workflow Development Standards

## CONTEXT FIRST - UNDERSTAND BEFORE CODING

Before modifying any workflow:
1. **LIST ALL WORKFLOW FILES** in the target directory
2. **IDENTIFY DEPENDENCIES** between workflows (intake → processor → sender)
3. **UNDERSTAND DATA FLOW** and correlation_id tracking
4. **CHECK EXISTING PATTERNS** for consistency

### Windows Development Environment Notes
- Use Docker CLI commands instead of make commands: `docker-compose up -d`
- Import workflows via n8n CLI: `docker exec -u node -it multi_platform_n8n n8n import:workflow --separate --input=/app/workflows`
- Activate workflows: `docker exec -u node -it multi_platform_n8n n8n update:workflow --all --active=true`
- Always restart n8n after activation: `docker-compose restart n8n`

## CHALLENGE THE REQUEST - EDGE CASES FIRST

Ask these questions for every workflow change:
- **INPUTS**: What data format does this workflow expect?
- **OUTPUTS**: What does the next workflow need?
- **CONSTRAINTS**: Rate limits, 24-hour policies, API quotas?
- **EDGE CASES**: Network failures, invalid data, API errors?
- **CORRELATION**: How is end-to-end tracking maintained?

## HOLD THE STANDARD - EVERY WORKFLOW MUST HAVE

### Non-Negotiable Requirements

### 1. Correlation ID Tracking (MANDATORY)
**EVERY WORKFLOW MUST IMPLEMENT** correlation_id tracking - NO EXCEPTIONS:

```javascript
// REQUIRED: Generate correlation_id in intake workflows
correlation_id: require('crypto').randomUUID()

// REQUIRED: Pass correlation_id in ALL HTTP requests
headers: {
  'x-correlation-id': '={{ $json.correlation_id }}',
  'Content-Type': 'application/json'
}

// REQUIRED: Include in ALL database operations
correlation_id: '={{ $json.correlation_id }}'

// REQUIRED: Log correlation_id for debugging
console.log('Processing message:', {
  correlation_id: $json.correlation_id,
  platform: $json.platform,
  timestamp: new Date().toISOString()
});
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

### 3. Error Handling (BULLETPROOF)
**THINK THROUGH ALL FAILURE SCENARIOS** before implementing:

```javascript
// REQUIRED: Retry configuration for ALL external API calls
retryOnFail: true,
maxTries: 3,
waitBetweenTries: 2000,  // Exponential backoff
continueOnFail: true     // Don't break the workflow

// REQUIRED: Comprehensive error logging
if (apiResponse.error) {
  console.error('API Error:', {
    error: apiResponse.error.message,
    correlation_id: $json.correlation_id,
    api_endpoint: 'specific_endpoint',
    retry_attempt: $node.context.retryCount || 0,
    timestamp: new Date().toISOString()
  });
}

// REQUIRED: Fallback responses for critical failures
const fallbackResponse = {
  language: 'tr',
  sentiment: 'Neutral', 
  intent: 'Other',
  reply_text: 'Teşekkür ederiz, mesajınızı aldık. En kısa sürede size dönüş yapacağız.',
  fallback: true,
  correlation_id: $json.correlation_id
};
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
- Must validate webhook tokens using `META_VERIFY_TOKEN` for both Instagram and WhatsApp
- Must configure webhook nodes with `httpMethod: "GET,POST"` to accept both verification and message processing
- Must normalize platform-specific data
- Must generate correlation_id
- Must check policy compliance (24-hour rule for Instagram/WhatsApp)
- Must call processor workflow with standardized payload

**Webhook Configuration:**
```json
{
  "parameters": {
    "path": "instagram-intake",
    "httpMethod": "GET,POST",  // REQUIRED: Accept both GET and POST
    "options": {}
  }
}
```

**Token Validation Logic:**
```javascript
// REQUIRED: Use META_VERIFY_TOKEN for both Instagram and WhatsApp
// GET requests (webhook verification): Check hub.verify_token
// POST requests (message processing): Skip token validation
const isValidToken = $method === 'GET' && $json.query && $json.query['hub.mode'] === 'subscribe' 
  ? ($json.query['hub.verify_token'] || $env.META_VERIFY_TOKEN) === $env.META_VERIFY_TOKEN
  : true; // Allow POST requests without token validation
```

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