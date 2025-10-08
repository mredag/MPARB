---
inclusion: fileMatch
fileMatchPattern: 'tests/*.js'
---

# Testing Standards and Guidelines

## CONTEXT FIRST - UNDERSTAND THE TESTING ECOSYSTEM

Before writing ANY test:
1. **LIST ALL EXISTING TESTS** and their coverage areas
2. **IDENTIFY CRITICAL PATHS** (correlation tracking, Turkish language, API flows)
3. **UNDERSTAND PERFORMANCE TARGETS** (<10 second response, 10 concurrent messages)
4. **CHECK MOCK DATA PATTERNS** and realistic test scenarios
5. **VERIFY CI/CD INTEGRATION** and automated validation

## CHALLENGE THE REQUEST - TESTING EDGE CASES

Critical questions for test development:
- **FAILURE SCENARIOS**: What happens when OpenAI API is down?
- **BOUNDARY CONDITIONS**: 24-hour policy edge cases, rate limits?
- **DATA INTEGRITY**: Does correlation_id tracking work under load?
- **LANGUAGE COMPLIANCE**: Are Turkish diacritics preserved in all scenarios?
- **PERFORMANCE**: Does the system meet response time targets under stress?

## HOLD THE STANDARD - COMPREHENSIVE TESTING

### Testing Philosophy (NO COMPROMISES)
**ALL CODE CHANGES MUST INCLUDE** comprehensive tests that validate:
- Functional correctness
- Error handling scenarios
- Performance requirements
- Integration points
- Turkish language compliance

## Test Structure

### 1. Test File Organization
```
tests/
├── unit/                    # Unit tests for individual components
├── integration/             # Integration tests for workflow connections
├── performance/             # Performance and load tests
├── language/               # Turkish language validation tests
└── e2e/                    # End-to-end system tests
```

### 2. Test Naming Convention
```javascript
// Format: describe('Component/Feature', () => {
//   it('should do something when condition', () => {

describe('Instagram Intake Workflow', () => {
  it('should generate correlation_id when processing valid message', () => {
    // Test implementation
  });
  
  it('should reject message when outside 24-hour window', () => {
    // Test implementation
  });
});
```

## Required Test Categories

### 1. Unit Tests
Test individual workflow components in isolation:

```javascript
describe('Message Normalization', () => {
  it('should normalize Instagram webhook payload correctly', () => {
    const mockPayload = {
      entry: [{
        messaging: [{
          sender: { id: 'test_user_123' },
          message: { text: 'Merhaba' },
          timestamp: Date.now()
        }]
      }]
    };
    
    const result = normalizeInstagramPayload(mockPayload);
    
    expect(result).to.have.property('correlation_id');
    expect(result.platform).to.equal('instagram');
    expect(result.text).to.equal('Merhaba');
  });
});
```

### 2. Integration Tests
Test workflow connections and data flow:

```javascript
describe('End-to-End Message Flow', () => {
  it('should process Instagram message through complete flow', async () => {
    const correlationId = uuidv4();
    
    // Send to intake workflow
    const intakeResponse = await axios.post('/webhook/instagram-intake', mockInstagramPayload);
    expect(intakeResponse.status).to.equal(200);
    
    // Verify processor was called
    // Verify sender was called
    // Verify database logging
  });
});
```

### 3. Error Handling Tests
Test all error scenarios:

```javascript
describe('Error Handling', () => {
  it('should handle OpenAI API failure gracefully', async () => {
    // Mock OpenAI API failure
    nock('https://api.openai.com')
      .post('/v1/chat/completions')
      .reply(500, { error: 'Internal server error' });
    
    const response = await processMessage(mockMessage);
    
    expect(response.fallback).to.be.true;
    expect(response.reply_text).to.include('Teşekkür ederiz');
  });
});
```

### 4. Performance Tests
Validate performance requirements:

```javascript
describe('Performance Requirements', () => {
  it('should process message within 10 seconds', async () => {
    const startTime = Date.now();
    
    await processMessage(mockMessage);
    
    const responseTime = Date.now() - startTime;
    expect(responseTime).to.be.below(10000); // 10 seconds
  });
  
  it('should handle 10 concurrent messages', async () => {
    const promises = Array(10).fill().map(() => processMessage(mockMessage));
    
    const results = await Promise.all(promises);
    
    results.forEach(result => {
      expect(result.outcome).to.equal('sent');
    });
  });
});
```

### 5. Turkish Language Tests
Validate Turkish language compliance:

```javascript
describe('Turkish Language Compliance', () => {
  it('should use proper Turkish diacritics', () => {
    const response = generateTurkishResponse('greeting');
    
    // Check for proper diacritics
    expect(response).to.match(/[çğıöşü]/); // Contains Turkish characters
    expect(response).to.not.match(/[cgiou](?![çğıöşü])/); // No missing diacritics
  });
  
  it('should use polite "Siz" form', () => {
    const response = generateTurkishResponse('help_offer');
    
    expect(response).to.include('Size');
    expect(response).to.not.include('Sana');
  });
  
  it('should keep response under 500 characters', () => {
    const response = generateTurkishResponse('booking');
    
    expect(response.length).to.be.below(500);
  });
});
```

## Mock Data Standards

### 1. Realistic Test Data
Use realistic test data that matches production scenarios:

```javascript
const mockInstagramMessage = {
  entry: [{
    messaging: [{
      sender: { id: 'instagram_user_12345' },
      message: { text: 'Merhaba, randevu almak istiyorum' },
      timestamp: Date.now()
    }]
  }]
};

const mockWhatsAppMessage = {
  entry: [{
    changes: [{
      value: {
        messages: [{
          from: '+905551234567',
          text: { body: 'Fiyat bilgisi alabilir miyim?' },
          timestamp: Math.floor(Date.now() / 1000)
        }]
      }
    }]
  }]
};
```

### 2. Edge Case Data
Include edge cases in test data:

```javascript
const edgeCases = {
  emptyMessage: { text: '' },
  longMessage: { text: 'A'.repeat(1000) },
  specialCharacters: { text: 'çğıöşü!@#$%^&*()' },
  oldMessage: { timestamp: Date.now() - (25 * 60 * 60 * 1000) } // 25 hours old
};
```

## Test Environment Setup

### 1. Test Database
Use separate test database:

```javascript
// Test database configuration
const testDbConfig = {
  host: process.env.TEST_DB_HOST || 'localhost',
  database: process.env.TEST_DB_NAME || 'test_multiplatform',
  user: process.env.TEST_DB_USER || 'test_user',
  password: process.env.TEST_DB_PASSWORD || 'test_password'
};
```

### 2. Mock External APIs
Mock all external API calls:

```javascript
// Mock OpenAI API
nock('https://api.openai.com')
  .post('/v1/chat/completions')
  .reply(200, {
    choices: [{
      message: {
        content: JSON.stringify({
          language: 'tr',
          sentiment: 'Positive',
          intent: 'Greeting',
          reply_text: 'Merhaba! Size nasıl yardımcı olabilirim?'
        })
      }
    }]
  });

// Mock Meta API
nock('https://graph.facebook.com')
  .post('/v17.0/me/messages')
  .reply(200, { id: 'message_id_123' });
```

### 3. Test Data Cleanup
Clean up test data after each test:

```javascript
afterEach(async () => {
  // Clean up test database
  await db.query('DELETE FROM messages WHERE correlation_id LIKE $1', ['test_%']);
  await db.query('DELETE FROM reviews WHERE correlation_id LIKE $1', ['test_%']);
  await db.query('DELETE FROM errors WHERE payload->\'correlation_id\' LIKE $1', ['test_%']);
});
```

## Continuous Integration Requirements

### 1. Test Automation
All tests must run automatically:

```yaml
# GitHub Actions example
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Run integration tests
        run: npm run test:integration
```

### 2. Test Coverage Requirements
Maintain minimum test coverage:

```javascript
// Coverage requirements
{
  "statements": 80,
  "branches": 75,
  "functions": 80,
  "lines": 80
}
```

### 3. Performance Benchmarks
Track performance metrics:

```javascript
// Performance benchmarks
const performanceRequirements = {
  maxResponseTime: 10000,      // 10 seconds
  maxConcurrentMessages: 10,   // 10 concurrent
  maxDatabaseQueryTime: 1000,  // 1 second
  maxMemoryUsage: 512          // 512 MB
};
```

## Test Documentation

### 1. Test Case Documentation
Document test scenarios:

```markdown
## Test Case: Instagram 24-Hour Policy
**Scenario**: Message received outside 24-hour window
**Expected**: No response sent, Slack alert triggered
**Validation**: 
- No API call to Instagram
- Slack webhook called
- Database logged with outcome 'policy_violation'
```

### 2. Test Data Documentation
Document test data sets:

```markdown
## Test Data Sets
- **valid_instagram_message**: Standard Instagram DM
- **old_instagram_message**: Message older than 24 hours
- **invalid_whatsapp_message**: Malformed WhatsApp payload
- **high_rating_review**: 5-star Google review
- **low_rating_review**: 1-star Google review
```

## Quality Assurance Checklist

### Before Committing Code
- [ ] All tests pass locally
- [ ] New functionality has corresponding tests
- [ ] Error scenarios are tested
- [ ] Turkish language compliance validated
- [ ] Performance requirements met
- [ ] Integration points tested
- [ ] Mock data is realistic
- [ ] Test documentation updated

### Before Deploying
- [ ] All CI/CD tests pass
- [ ] Integration tests pass in staging
- [ ] Performance tests meet benchmarks
- [ ] Error handling tested in staging
- [ ] Database migrations tested
- [ ] Rollback procedures tested

## Test Maintenance

### 1. Regular Test Updates
- Update tests when requirements change
- Refresh mock data to match production
- Update performance benchmarks
- Review and update test coverage

### 2. Test Environment Maintenance
- Keep test database schema in sync
- Update mock API responses
- Refresh test credentials
- Monitor test execution times

### 3. Test Metrics Monitoring
- Track test execution times
- Monitor test failure rates
- Analyze test coverage trends
- Review performance benchmarks

## Common Testing Patterns

### 1. Async Testing
```javascript
describe('Async Operations', () => {
  it('should handle async workflow execution', async () => {
    const result = await executeWorkflow(mockData);
    expect(result).to.have.property('correlation_id');
  });
});
```

### 2. Error Testing
```javascript
describe('Error Scenarios', () => {
  it('should handle network timeout', async () => {
    // Mock network timeout
    const result = await processWithTimeout(mockData, 1); // 1ms timeout
    expect(result.error).to.include('timeout');
  });
});
```

### 3. Database Testing
```javascript
describe('Database Operations', () => {
  it('should insert message record correctly', async () => {
    await insertMessage(mockMessage);
    
    const record = await db.query(
      'SELECT * FROM messages WHERE correlation_id = $1',
      [mockMessage.correlation_id]
    );
    
    expect(record.rows).to.have.length(1);
    expect(record.rows[0].platform).to.equal('instagram');
  });
});
```