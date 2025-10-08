# Essential Testing Suite

This directory contains the essential testing suite for the multi-platform auto response system. The tests validate the core functionality across Instagram DMs, WhatsApp messages, and Google Reviews.

## Test Coverage

### 1. Instagram DM Tests (`instagram_dm_test.js`)
- **Turkish Diacritics Validation**: Tests proper handling of Turkish characters (ğ, ü, ı, ş, ç, ö)
- **Polite Form Usage**: Validates use of "Siz" form and polite Turkish language
- **24-Hour Policy**: Tests rejection of messages older than 24 hours
- **Response Quality**: Ensures responses are under 500 characters

### 2. WhatsApp Session Tests (`whatsapp_session_test.js`)
- **Inside 24-Hour Session**: Tests free text mode for recent messages
- **Outside 24-Hour Session**: Tests template mode for old messages
- **Session Age Calculation**: Validates proper boundary detection
- **Template Validation**: Ensures approved Turkish templates are used

### 3. Google Reviews Tests (`google_reviews_test.js`)
- **5-Star Auto-Reply**: Tests automatic responses for positive reviews
- **2-Star Alert Scenarios**: Tests Slack alerting for negative reviews
- **3-Star Neutral Handling**: Tests log-only behavior for neutral reviews
- **Professional Tone**: Validates no emojis in Google review responses

## Requirements Coverage

- **Requirement 10.1**: Turkish Instagram DM test with proper diacritics validation ✓
- **Requirement 10.2**: WhatsApp tests for inside and outside 24-hour session modes ✓
- **Requirement 10.3**: Google Review tests for 5-star auto-reply and 2-star alert scenarios ✓

## Setup and Running Tests

### Prerequisites
1. Ensure the main system is running:
   ```bash
   make up && make import && make activate
   ```

2. Install test dependencies:
   ```bash
   cd tests
   npm install
   ```

### Environment Variables
Set the following environment variable if n8n is running on a different port:
```bash
export N8N_BASE_URL=http://localhost:5678
```

### Running Tests

#### Run All Tests
```bash
npm test
```

#### Run Individual Test Suites
```bash
# Instagram DM tests
npm run test:instagram

# WhatsApp session tests  
npm run test:whatsapp

# Google Reviews tests
npm run test:google
```

#### Watch Mode (for development)
```bash
npm run test:watch
```

## Test Structure

Each test file follows this pattern:
1. **Setup**: Configure webhook URLs and test data
2. **Test Cases**: Multiple scenarios with expected outcomes
3. **Validation**: Verify responses meet requirements
4. **Error Handling**: Graceful handling when services are offline

## Expected Behavior

### Successful Tests
- All webhooks accept test payloads (200/201 status)
- Turkish responses contain proper diacritics
- Session modes are correctly determined
- Sentiment analysis works accurately
- Response length limits are respected

### Service Offline
- Tests gracefully skip when n8n service is not running
- Warning messages indicate service unavailability
- No false failures due to connection issues

## Test Data

All test cases use:
- **Turkish Language**: Proper diacritics and cultural context
- **Realistic Scenarios**: Common customer interactions
- **Edge Cases**: Boundary conditions (exactly 24 hours, etc.)
- **Compliance**: Meta policy adherence

## Debugging

To debug test failures:
1. Check n8n service status: `make logs`
2. Verify webhook URLs are accessible
3. Review test output for specific error messages
4. Check database logs for data persistence issues

## Integration with CI/CD

These tests can be integrated into automated pipelines:
```bash
# In CI environment
docker-compose up -d
sleep 30  # Wait for services to start
cd tests && npm install && npm test
```