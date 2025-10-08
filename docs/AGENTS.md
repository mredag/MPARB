# Developer Guide for Multi-Platform Auto Response System

## Overview

This guide is for developers and AI agents working on the multi-platform auto response system. It provides comprehensive information about the system architecture, development standards, and best practices.

## Quick Start for New Developers

### 1. System Understanding
Before making any changes, familiarize yourself with:

- **README.md** - Complete system overview and setup instructions
- **docs/PRD.md** - Product requirements and business logic
- **docs/INTEGRATION_SUMMARY.md** - System integration details
- **.kiro/steering/** - Development standards and guidelines

### 2. Development Environment Setup

```bash
# Clone and setup
git clone <repository-url>
cd multi-platform-auto-response
cp .env.example .env

# Configure environment variables (see docs/ENV_VARS.md)
# Start development environment
make up && make import && make activate

# Verify system health
node scripts/validate_integration.js
```

### 3. Testing Your Changes

```bash
# Run integration validation
node scripts/validate_integration.js

# Run end-to-end tests
node scripts/test_end_to_end.js

# Run platform-specific tests
npm test
```

## System Architecture Deep Dive

### Core Components

1. **Intake Workflows** (`workflows/*_intake.json`)
   - Handle platform-specific webhooks
   - Normalize incoming data
   - Generate correlation IDs
   - Enforce policy compliance

2. **Central Processor** (`workflows/processor.json`)
   - AI-powered sentiment analysis
   - Intent detection
   - Response generation
   - Platform routing

3. **Sender Workflows** (`workflows/sender_*.json`)
   - Platform-specific API calls
   - Response delivery
   - Outcome logging

4. **Error Handler** (`workflows/error_handler.json`)
   - Centralized error capture
   - Database logging
   - Slack alerting

5. **Database Layer** (`scripts/seed.sql`)
   - PostgreSQL with comprehensive logging
   - Correlation tracking
   - Performance optimization

### Data Flow

```
External Platform → Intake Workflow → Processor → Sender Workflow → External Platform
                                   ↓
                            Database Logging
                                   ↓
                            Error Handler → Slack Alerts
```

## Development Standards

### 1. Correlation ID Tracking
**CRITICAL**: Every workflow must implement correlation_id tracking for end-to-end traceability.

```javascript
// Generate in intake workflows
correlation_id: require('crypto').randomUUID()

// Pass in HTTP requests
headers: {
  'x-correlation-id': '={{ $json.correlation_id }}'
}

// Log in database operations
correlation_id: '={{ $json.correlation_id }}'
```

### 2. Error Handling
All workflows must include comprehensive error handling:

```javascript
// Retry configuration
retryOnFail: true,
maxTries: 3,
waitBetweenTries: 2000,
continueOnFail: true
```

### 3. Database Logging
Log all operations with required fields:
- `correlation_id` (UUID)
- `response_time_ms` (calculated)
- `outcome` ('sent', 'failed', 'escalated', 'logged_only')

### 4. Turkish Language Standards
- Use proper diacritics (ç, ğ, ı, ö, ş, ü)
- Always use polite "Siz" form
- Keep responses under 500 characters
- Platform-appropriate tone and emoji usage

## Common Development Tasks

### Adding a New Platform

1. **Create Intake Workflow**
   ```bash
   cp workflows/instagram_intake.json workflows/new_platform_intake.json
   # Modify webhook path and normalization logic
   ```

2. **Update Processor Workflow**
   - Add platform routing logic
   - Update platform-specific response generation

3. **Create Sender Workflow**
   ```bash
   cp workflows/sender_instagram.json workflows/sender_new_platform.json
   # Implement platform-specific API calls
   ```

4. **Update Database Schema**
   - Add platform to CHECK constraints
   - Create platform-specific tables if needed

5. **Add Tests**
   - Create platform-specific test file
   - Update integration tests

### Modifying Response Templates

1. **Edit Templates** (`templates/templates.json`)
   ```json
   {
     "platform": {
       "language_code": {
         "intent_type": "Response text with {variables}"
       }
     }
   }
   ```

2. **Update Processor Logic**
   - Modify template selection logic
   - Update variable substitution

3. **Test Changes**
   ```bash
   # Test specific platform
   npm run test:platform
   
   # Validate Turkish language standards
   node scripts/validate_turkish.js
   ```

### Adding New AI Capabilities

1. **Update OpenAI Prompts** (in `workflows/processor.json`)
   - Modify system prompt for new capabilities
   - Update response parsing logic

2. **Add New Intent Types**
   - Update intent detection logic
   - Add corresponding response templates
   - Update database schema if needed

3. **Test AI Changes**
   ```bash
   # Test AI processing
   node scripts/test_ai_processing.js
   
   # Validate response quality
   npm run test:ai
   ```

## Debugging and Troubleshooting

### 1. Correlation ID Tracing
Use correlation IDs to trace message flows:

```sql
-- Find all records for a specific message flow
SELECT 
    'messages' as table_name, created_at, platform, outcome 
FROM messages WHERE correlation_id = 'your-correlation-id'
UNION ALL
SELECT 
    'errors' as table_name, created_at, workflow, message 
FROM errors WHERE payload->>'correlation_id' = 'your-correlation-id'
ORDER BY created_at;
```

### 2. Common Issues

**Webhook Not Receiving Data:**
- Check webhook URLs in platform consoles
- Verify n8n service is running and accessible
- Validate verify tokens match

**Messages Not Being Sent:**
- Check API tokens and permissions
- Review sender workflow configurations
- Check error logs for API failures

**Database Connection Issues:**
- Verify PostgreSQL service is running
- Check connection credentials
- Ensure database schema is created

**OpenAI API Failures:**
- Check API key validity
- Monitor rate limits and quotas
- Review prompt configurations

### 3. Monitoring and Logs

```bash
# System logs
make logs

# Database access
make psql

# n8n workflow executions
# Navigate to http://localhost:5678 → Executions

# Integration validation
node scripts/validate_integration.js
```

## Performance Optimization

### 1. Database Performance
- Use indexed columns in WHERE clauses
- Implement proper pagination
- Monitor query execution times
- Regular VACUUM and ANALYZE operations

### 2. Workflow Performance
- Minimize HTTP request timeouts
- Use efficient data transformations
- Implement proper caching where applicable
- Monitor response times and optimize bottlenecks

### 3. API Rate Limiting
- Implement proper retry logic
- Monitor API usage quotas
- Use exponential backoff for retries
- Cache responses where appropriate

## Security Best Practices

### 1. API Keys and Secrets
- Store all secrets in environment variables
- Never commit secrets to version control
- Use n8n credentials system for secure storage
- Rotate keys regularly

### 2. Webhook Security
- Always validate webhook tokens
- Use HTTPS for all webhook endpoints
- Implement proper CORS policies
- Log and monitor webhook access

### 3. Database Security
- Use parameterized queries
- Limit database user permissions
- Encrypt sensitive data at rest
- Regular security audits

## Testing Strategy

### 1. Unit Tests
- Test individual workflow components
- Mock external API calls
- Validate data transformations
- Test error handling scenarios

### 2. Integration Tests
- Test complete message flows
- Validate webhook endpoints
- Test database operations
- Verify correlation ID tracking

### 3. Performance Tests
- Load testing with concurrent messages
- Response time validation
- Database performance under load
- API rate limit testing

## Deployment and Maintenance

### 1. Deployment Process
```bash
# Production deployment
make up
make import
make activate

# Verify deployment
node scripts/validate_integration.js
node scripts/test_end_to_end.js
```

### 2. Monitoring
- Set up alerts for critical failures
- Monitor response times and success rates
- Track API usage and costs
- Regular database maintenance

### 3. Backup and Recovery
- Daily automated backups
- Test restore procedures
- Document recovery processes
- Maintain disaster recovery plan

## Contributing Guidelines

### 1. Code Standards
- Follow existing code patterns
- Include comprehensive error handling
- Add appropriate logging and monitoring
- Update documentation for changes

### 2. Testing Requirements
- All changes must include tests
- Integration tests must pass
- Performance impact must be evaluated
- Security implications must be considered

### 3. Review Process
- All changes require code review
- Integration validation must pass
- Documentation must be updated
- Deployment plan must be provided

## Support and Resources

### Documentation
- **README.md** - System overview and setup
- **docs/PRD.md** - Product requirements
- **docs/INTEGRATION_SUMMARY.md** - Integration details
- **docs/ENV_VARS.md** - Environment variables
- **.kiro/steering/** - Development standards

### Tools and Scripts
- **scripts/validate_integration.js** - System validation
- **scripts/test_end_to_end.js** - End-to-end testing
- **scripts/final_integration_check.js** - Integration verification
- **tests/** - Platform-specific test suites

### Getting Help
1. Check existing documentation
2. Review system logs and error messages
3. Use correlation IDs for debugging
4. Test changes in development environment
5. Validate with integration tests

## Future Development Roadmap

### Planned Features
- Additional platform integrations
- Advanced AI capabilities
- Enhanced monitoring and analytics
- Multi-language support expansion
- Performance optimizations

### Technical Debt
- Workflow code refactoring
- Database optimization
- Test coverage improvements
- Documentation updates
- Security enhancements

This guide should be updated as the system evolves. Always refer to the latest version for current development standards and practices.