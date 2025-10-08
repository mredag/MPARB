# Multi-Platform Auto Response System

A production-ready automated customer service system that handles Instagram DMs, WhatsApp messages, and Google Reviews using n8n orchestration, OpenAI for intelligent responses, and PostgreSQL for comprehensive logging.

## Features

- **Multi-Platform Support**: Instagram DMs, WhatsApp Cloud API, Google Business Profile Reviews
- **AI-Powered Responses**: OpenAI integration for sentiment analysis and contextual replies
- **Turkish-First**: Default Turkish responses with proper diacritics and polite tone
- **Policy Compliance**: Respects Meta's 24-hour messaging policy
- **Comprehensive Logging**: PostgreSQL database with correlation tracking
- **Error Handling**: Centralized error management with Slack alerts
- **One-Command Deployment**: Complete system setup with Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- API keys for OpenAI, Meta platforms, and Google Business Profile
- Slack webhook URL (optional, for alerts)

### Installation

1. **Clone and configure environment**:
   ```bash
   git clone <repository-url>
   cd multi-platform-auto-response
   cp .env.example .env
   ```

2. **Edit `.env` file** with your API keys and configuration:
   ```bash
   # Required: Update these values
   N8N_ENCRYPTION_KEY=your_32_character_encryption_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   FB_PAGE_TOKEN=your_facebook_page_access_token_here
   WA_PERMANENT_TOKEN=your_whatsapp_permanent_token_here
   META_VERIFY_TOKEN=your_meta_webhook_verify_token_here
   
   # Optional: For Google Reviews
   GOOGLE_SERVICE_ACCOUNT_KEY=path_to_your_service_account_json_file
   GOOGLE_LOCATION_ID=your_google_business_location_id
   
   # Optional: For Slack alerts
   SLACK_WEBHOOK_URL=your_slack_webhook_url_for_alerts
   ```

   > **Heads-up**: Legacy `FB_VERIFY_TOKEN` and `WA_VERIFY_TOKEN` entries are deprecated and ignored—configure only `META_VERIFY_TOKEN` for Meta webhook verification.

3. **Start the system**:
   ```bash
   make up && make import && make activate
   ```

4. **Access n8n interface**:
   - Open http://localhost:5678 in your browser
   - Create admin account on first visit
   - All workflows will be imported and activated automatically

## Webhook URLs

After starting the system, configure these webhook URLs in your platform settings:

### Instagram Webhooks
- **URL**: `https://your-n8n-instance.com/webhook/instagram-intake`
- **Verify Token**: Use `META_VERIFY_TOKEN` from your .env file
- **Events**: `messages`, `messaging_postbacks`
- **Configure in**: Meta Developer Console > Instagram > Webhooks

### WhatsApp Webhooks  
- **URL**: `https://your-n8n-instance.com/webhook/whatsapp-intake`
- **Verify Token**: Use `META_VERIFY_TOKEN` from your .env file
- **Events**: `messages`
- **Configure in**: Meta Developer Console > WhatsApp > Webhooks

### Google Business Profile
- **Method**: Uses scheduled polling (5-minute intervals)
- **No webhook URL configuration needed**
- **Configure**: Google Business Profile API credentials in n8n

### Internal Webhook URLs (for reference)
- **Processor**: `https://your-n8n-instance.com/webhook/processor`
- **Instagram Sender**: `https://your-n8n-instance.com/webhook/sender-instagram`
- **WhatsApp Sender**: `https://your-n8n-instance.com/webhook/sender-whatsapp`
- **Google Business Profile Sender**: `https://your-n8n-instance.com/webhook/sender-gbp`

> **Note**: Replace `your-n8n-instance.com` with your actual n8n instance URL. For local development, use `http://localhost:5678`.

## Available Commands

```bash
make help        # Show all available commands
make up          # Start all services (PostgreSQL and n8n)
make down        # Stop all services
make import      # Import all n8n workflows
make activate    # Activate all imported workflows
make logs        # Show logs from all services
make psql        # Connect to PostgreSQL database
make backup      # Backup database and workflows
make test        # Run test suite
make clean       # Clean up containers and volumes
```

## System Architecture

```
External Platforms → Intake Workflows → Central Processor → Sender Workflows → External Platforms
                                    ↓
                              PostgreSQL Logging
                                    ↓
                              Error Handler → Slack Alerts
```

### Workflow Overview

1. **Intake Workflows**: Platform-specific webhooks that normalize incoming data
2. **Central Processor**: AI-powered analysis using OpenAI for sentiment and response generation
3. **Sender Workflows**: Platform-specific API calls to send responses
4. **Error Handler**: Centralized error logging and Slack notifications

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `N8N_ENCRYPTION_KEY` | Yes | 32-character encryption key for n8n |
| `OPENAI_API_KEY` | Yes | OpenAI API key for AI processing |
| `FB_PAGE_TOKEN` | Yes | Facebook Page Access Token |
| `WA_PERMANENT_TOKEN` | Yes | WhatsApp Business Cloud API Token |
| `META_VERIFY_TOKEN` | Yes | Webhook verification token |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | No | Path to Google service account JSON |
| `SLACK_WEBHOOK_URL` | No | Slack webhook for error alerts |

### Database Schema

The system automatically creates three main tables:

- **messages**: Logs all incoming messages and responses
- **reviews**: Logs Google Business Profile reviews and responses  
- **errors**: Centralized error logging with correlation tracking

## Platform-Specific Behavior

### Instagram DMs
- **24-Hour Policy**: Only responds to messages within 24 hours
- **Outside Policy**: Sends Slack alert, no auto-response
- **Response Type**: Free-form text messages

### WhatsApp Messages
- **Within 24 Hours**: Free-form text responses
- **Outside 24 Hours**: Pre-approved message templates only
- **Session Tracking**: Automatic session age calculation

### Google Reviews
- **4-5 Stars**: Automatic positive response
- **3 Stars**: Log only, no response
- **1-2 Stars**: Slack alert with AI-generated draft, no auto-response

## Monitoring and Logging

### Database Logging
All interactions are logged with:
- Platform identification
- Sentiment analysis results
- Response times and outcomes
- Correlation IDs for end-to-end tracking

### Error Handling
- Automatic retry logic (3 attempts with exponential backoff)
- Centralized error logging to PostgreSQL
- Slack alerts for critical failures
- Correlation ID tracking for debugging

### Performance Monitoring
- Target: 10 concurrent messages
- Response time: <10 seconds median end-to-end
- Database performance tracking

## Troubleshooting

### Common Issues

1. **Services won't start**:
   ```bash
   # Check if .env file exists and is configured
   ls -la .env
   # Check Docker Compose logs
   make logs
   ```

2. **Webhooks not receiving data**:
   - Verify webhook URLs are publicly accessible
   - Check verify tokens match platform configuration
   - Review n8n workflow execution logs

3. **Database connection issues**:
   ```bash
   # Test database connection
   make psql
   # Check PostgreSQL logs
   docker-compose logs postgres
   ```

4. **Workflows not importing**:
   ```bash
   # Re-run import process
   make import
   # Check n8n logs
   docker-compose logs n8n
   ```

### Logs and Debugging

```bash
# View all service logs
make logs

# Connect to database for debugging
make psql

# Check specific workflow execution in n8n UI
# Navigate to http://localhost:5678 → Executions
```

## Development

### For Developers and AI Agents

This project includes comprehensive development standards and guidelines:

- **[Developer Guide](docs/AGENTS.md)** - Complete guide for developers and AI agents
- **[Integration Summary](docs/INTEGRATION_SUMMARY.md)** - System integration details
- **[Environment Variables](docs/ENV_VARS.md)** - Complete environment configuration
- **[Product Requirements](docs/PRD.md)** - Business logic and requirements

### Development Standards (Steering Files)

The `.kiro/steering/` directory contains development standards that are automatically applied:

- **[Project Overview](.kiro/steering/project-overview.md)** - System architecture and principles
- **[Workflow Standards](.kiro/steering/workflow-standards.md)** - Workflow development requirements
- **[Turkish Language Standards](.kiro/steering/turkish-language-standards.md)** - Language compliance rules
- **[Database Standards](.kiro/steering/database-standards.md)** - Database design and performance
- **[API Integration Standards](.kiro/steering/api-integration-standards.md)** - API integration best practices
- **[Testing Standards](.kiro/steering/testing-standards.md)** - Comprehensive testing requirements

### Quick Development Tasks

#### Adding New Templates
Edit `templates/templates.json` to add new response templates:

```json
{
  "platform": {
    "language_code": {
      "template_type": "Response text with {variables}"
    }
  }
}
```

#### Modifying Workflows
1. Edit JSON files in `workflows/` directory
2. Run `make import` to update n8n
3. Activate workflows with `make activate`
4. Validate changes: `node scripts/validate_integration.js`

#### Testing and Validation
```bash
# Validate system integration
node scripts/validate_integration.js

# Run end-to-end tests
node scripts/test_end_to_end.js

# Run platform-specific tests
npm test
npm run test:instagram
npm run test:whatsapp
npm run test:google

# Final integration check
node scripts/final_integration_check.js
```

### Development Workflow

1. **Setup Development Environment**:
   ```bash
   make up && make import && make activate
   ```

2. **Make Changes** following the steering standards

3. **Validate Changes**:
   ```bash
   node scripts/validate_integration.js
   ```

4. **Test Changes**:
   ```bash
   npm test
   node scripts/test_end_to_end.js
   ```

5. **Deploy Changes**:
   ```bash
   make import && make activate
   ```

## Security Considerations

- All API keys stored in environment variables only
- No secrets embedded in workflow JSON files
- n8n credentials system for secure storage
- PostgreSQL with proper user permissions
- Webhook verify tokens for platform security

## Documentation

### Complete Documentation Suite

- **[README.md](README.md)** - This file, system overview and quick start
- **[Developer Guide](docs/AGENTS.md)** - Comprehensive guide for developers and AI agents
- **[Integration Summary](docs/INTEGRATION_SUMMARY.md)** - Complete system integration details
- **[Product Requirements](docs/PRD.md)** - Business logic and feature requirements
- **[Environment Variables](docs/ENV_VARS.md)** - Complete environment configuration reference

### Development Standards

- **[Project Overview](.kiro/steering/project-overview.md)** - System architecture and design principles
- **[Workflow Standards](.kiro/steering/workflow-standards.md)** - Workflow development requirements
- **[Turkish Language Standards](.kiro/steering/turkish-language-standards.md)** - Language compliance and quality
- **[Database Standards](.kiro/steering/database-standards.md)** - Database design and performance guidelines
- **[API Integration Standards](.kiro/steering/api-integration-standards.md)** - API integration best practices
- **[Testing Standards](.kiro/steering/testing-standards.md)** - Comprehensive testing requirements

### Validation and Testing Scripts

- **[Integration Validation](scripts/validate_integration.js)** - Complete system validation
- **[End-to-End Testing](scripts/test_end_to_end.js)** - Full system testing
- **[Final Integration Check](scripts/final_integration_check.js)** - Deployment readiness verification

## Support

### Getting Help

1. **Start with Documentation**:
   - [Developer Guide](docs/AGENTS.md) for comprehensive information
   - [Integration Summary](docs/INTEGRATION_SUMMARY.md) for technical details
   - [Troubleshooting section](#troubleshooting) above

2. **System Diagnostics**:
   ```bash
   # Validate system integration
   node scripts/validate_integration.js
   
   # Check system health
   node scripts/final_integration_check.js
   
   # View system logs
   make logs
   ```

3. **Debug Specific Issues**:
   - Review n8n execution logs at http://localhost:5678 → Executions
   - Check database logs with `make psql`
   - Use correlation IDs for end-to-end tracing

4. **Development Support**:
   - Follow [Development Standards](.kiro/steering/) for consistent code quality
   - Use [Testing Standards](.kiro/steering/testing-standards.md) for validation
   - Reference [API Integration Standards](.kiro/steering/api-integration-standards.md) for external APIs

## Contributing

### Development Guidelines

1. **Follow Standards**: All development must follow the standards in `.kiro/steering/`
2. **Test Changes**: Use validation scripts before committing
3. **Document Updates**: Update relevant documentation for changes
4. **Correlation Tracking**: Ensure all workflows include correlation_id tracking
5. **Turkish Compliance**: Follow Turkish language standards for responses

### Quality Assurance

- All changes must pass `node scripts/validate_integration.js`
- Integration tests must pass with `node scripts/test_end_to_end.js`
- Follow database standards for schema changes
- Implement proper error handling and retry logic
- Include comprehensive logging and monitoring

## License

MIT License - See LICENSE file for details