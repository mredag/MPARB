---
inclusion: fileMatch
fileMatchPattern: 'workflows/sender_*.json'
---

# API Integration Standards

## Core API Integration Principles

### 1. Retry Logic
All external API calls must implement retry logic:

```javascript
// Required retry configuration
retryOnFail: true,
maxTries: 3,
waitBetweenTries: 2000,  // 2 seconds, exponential backoff
continueOnFail: true     // Continue workflow even if API fails
```

### 2. Timeout Configuration
Set appropriate timeouts for all API calls:

```javascript
// HTTP Request timeout settings
timeout: 30000,  // 30 seconds for external APIs
```

### 3. Error Handling
Implement comprehensive error handling:

```javascript
// Check for API errors in response
if (apiResponse.error) {
  outcome = 'failed';
  errorMessage = apiResponse.error.message || 'API call failed';
} else if (apiResponse.json && apiResponse.json.error) {
  outcome = 'failed';
  errorMessage = apiResponse.json.error.message || 'API returned error';
}
```

## Platform-Specific API Standards

### Meta APIs (Instagram & WhatsApp)

#### Authentication
```javascript
// Use Bearer token authentication
headers: {
  'Authorization': 'Bearer {{ $env.FB_PAGE_TOKEN }}',  // Instagram
  'Authorization': 'Bearer {{ $env.WA_PERMANENT_TOKEN }}', // WhatsApp
  'Content-Type': 'application/json'
}
```

#### Rate Limiting
- Instagram: 200 requests per hour per user
- WhatsApp: 1000 requests per second
- Implement exponential backoff for rate limit errors

#### Error Codes
Handle specific Meta API error codes:
- 190: Invalid access token
- 100: Invalid parameter
- 613: Rate limit exceeded

### Google Business Profile API

#### Authentication
```javascript
// Use OAuth 2.0 Bearer token
headers: {
  'Authorization': 'Bearer {{ $env.GOOGLE_ACCESS_TOKEN }}',
  'Content-Type': 'application/json'
}
```

#### Rate Limiting
- 1000 requests per 100 seconds per user
- Implement proper quota management

#### Error Handling
Handle Google API specific errors:
- 401: Authentication required
- 403: Insufficient permissions
- 429: Rate limit exceeded

### OpenAI API

#### Authentication
```javascript
// Use API key authentication
headers: {
  'Authorization': 'Bearer {{ $env.OPENAI_API_KEY }}',
  'Content-Type': 'application/json'
}
```

#### Rate Limiting
- Monitor token usage and costs
- Implement fallback responses for API failures
- Use appropriate model for cost optimization

#### Error Handling
```javascript
// OpenAI specific error handling
if (openaiResponse.error) {
  // Log error and use fallback response
  const fallbackResponse = {
    language: 'tr',
    sentiment: 'Neutral',
    intent: 'Other',
    reply_text: 'Teşekkür ederiz, mesajınızı aldık. En kısa sürede size dönüş yapacağız.',
    fallback: true
  };
}
```

## Response Validation

### 1. Status Code Validation
Always check HTTP status codes:

```javascript
// Validate successful response
if (response.status >= 200 && response.status < 300) {
  // Success
} else {
  // Handle error based on status code
}
```

### 2. Response Structure Validation
Validate expected response structure:

```javascript
// Check for required fields in response
if (response.data && response.data.id) {
  // Valid response
} else {
  // Invalid response structure
}
```

### 3. Data Type Validation
Ensure response data types match expectations:

```javascript
// Validate data types
if (typeof response.data.id === 'string' && 
    typeof response.data.success === 'boolean') {
  // Valid data types
}
```

## Webhook Security

### 1. Token Verification
Always verify webhook tokens:

```javascript
// Verify Meta webhook token
if (payload.query['hub.verify_token'] === process.env.META_VERIFY_TOKEN) {
  // Valid token
} else {
  // Invalid token - return 401
}
```

### 2. Signature Validation
Implement signature validation where available:

```javascript
// Validate webhook signature (example for Meta)
const signature = request.headers['x-hub-signature-256'];
const expectedSignature = crypto
  .createHmac('sha256', process.env.APP_SECRET)
  .update(request.body)
  .digest('hex');
```

### 3. Request Validation
Validate incoming webhook requests:

```javascript
// Check required fields
if (!payload.entry || !Array.isArray(payload.entry)) {
  // Invalid webhook payload
  return { error: 'Invalid payload structure' };
}
```

## Performance Optimization

### 1. Connection Pooling
Use connection pooling for database operations:

```javascript
// PostgreSQL connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,  // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 2. Caching Strategy
Implement caching for frequently accessed data:

```javascript
// Cache API responses where appropriate
const cacheKey = `template_${platform}_${language}_${intent}`;
const cachedResponse = await cache.get(cacheKey);
```

### 3. Batch Operations
Use batch operations where possible:

```javascript
// Batch database inserts
const batchInsert = messages.map(msg => ({
  platform: msg.platform,
  correlation_id: msg.correlation_id,
  // ... other fields
}));
```

## Monitoring and Logging

### 1. API Call Logging
Log all API calls with relevant details:

```javascript
console.log('API Call:', {
  url: request.url,
  method: request.method,
  correlation_id: correlationId,
  timestamp: new Date().toISOString(),
  response_time: responseTime
});
```

### 2. Error Logging
Comprehensive error logging:

```javascript
console.error('API Error:', {
  error: error.message,
  correlation_id: correlationId,
  api_endpoint: request.url,
  status_code: error.response?.status,
  response_data: error.response?.data
});
```

### 3. Performance Metrics
Track API performance metrics:

```javascript
// Track response times
const startTime = Date.now();
// ... API call
const responseTime = Date.now() - startTime;

// Log performance metrics
console.log('Performance:', {
  api: 'instagram_send_message',
  response_time_ms: responseTime,
  correlation_id: correlationId
});
```

## Security Best Practices

### 1. API Key Management
- Store API keys in environment variables only
- Never log API keys or tokens
- Rotate keys regularly
- Use least privilege access

### 2. Data Sanitization
Sanitize all input data:

```javascript
// Sanitize user input
const sanitizedText = userInput
  .replace(/[<>]/g, '')  // Remove HTML tags
  .substring(0, 500);    // Limit length
```

### 3. HTTPS Only
- Always use HTTPS for API calls
- Validate SSL certificates
- Use secure webhook endpoints

## Testing API Integrations

### 1. Mock API Responses
Create mock responses for testing:

```javascript
// Mock successful response
const mockResponse = {
  status: 200,
  data: {
    id: 'test_message_id',
    success: true
  }
};
```

### 2. Error Scenario Testing
Test all error scenarios:

```javascript
// Test rate limit handling
// Test authentication failures
// Test network timeouts
// Test invalid responses
```

### 3. Load Testing
Test API integrations under load:

```javascript
// Simulate concurrent API calls
// Test rate limit handling
// Validate performance under load
```

## API Documentation Requirements

### 1. Endpoint Documentation
Document all API endpoints used:

```markdown
## Instagram Send Message API
- **URL**: `https://graph.facebook.com/v17.0/me/messages`
- **Method**: POST
- **Authentication**: Bearer token
- **Rate Limit**: 200 requests/hour
- **Timeout**: 30 seconds
```

### 2. Error Code Documentation
Document all possible error codes and handling:

```markdown
## Error Codes
- **190**: Invalid access token - Refresh token
- **100**: Invalid parameter - Check request format
- **613**: Rate limit exceeded - Implement backoff
```

### 3. Response Format Documentation
Document expected response formats:

```markdown
## Response Format
```json
{
  "id": "message_id",
  "success": true,
  "timestamp": "2023-01-01T00:00:00Z"
}
```