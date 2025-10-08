---
inclusion: always
---

# Multi-Platform Auto Response System - Project Overview

## System Architecture

This is a production-ready automated customer service system that handles Instagram DMs, WhatsApp messages, and Google Business Profile reviews using n8n orchestration, OpenAI for intelligent responses, and PostgreSQL for comprehensive logging.

### Core Components

1. **Intake Workflows** - Platform-specific webhooks that normalize incoming data
2. **Central Processor** - AI-powered analysis using OpenAI for sentiment and response generation
3. **Sender Workflows** - Platform-specific API calls to send responses
4. **Error Handler** - Centralized error logging and Slack notifications
5. **Database Layer** - PostgreSQL with comprehensive logging and correlation tracking

### Key Design Principles

- **Turkish-First**: Default Turkish responses with proper diacritics and polite "Siz" form
- **Policy Compliance**: Respects Meta's 24-hour messaging policy for Instagram/WhatsApp
- **Correlation Tracking**: Every message flow has a unique correlation_id for end-to-end tracing
- **Error Resilience**: Comprehensive error handling with automatic retries and alerting
- **Scalable Architecture**: Designed to handle 10 concurrent messages with <10 second response times

### Platform-Specific Behavior

**Instagram DMs:**
- 24-hour policy enforcement (no responses outside window)
- Free-form text responses
- Slack alerts for policy violations

**WhatsApp Messages:**
- Within 24 hours: Free-form text responses
- Outside 24 hours: Pre-approved message templates only
- Automatic session age calculation

**Google Reviews:**
- 4-5 stars: Automatic positive response
- 3 stars: Log only, no response
- 1-2 stars: Slack alert with AI-generated draft, no auto-response

### Development Standards

- All workflows must include correlation_id tracking
- Database operations must log response times and outcomes
- Error handling must include Slack alerting for critical failures
- Turkish responses must use proper diacritics and polite tone
- All API calls must include retry logic (3 attempts with exponential backoff)
- Response length must be under 500 characters for all platforms