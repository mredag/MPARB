---
inclusion: always
---

# Multi-Platform Auto Response System - Project Overview

## CONTEXT FIRST - UNDERSTAND THIS SYSTEM

Before working on ANY component:
1. **SYSTEM ARCHITECTURE**: n8n workflows → PostgreSQL logging → External APIs
2. **CORE DEPENDENCIES**: OpenAI, Meta APIs, Google Business Profile, PostgreSQL, Slack
3. **KEY PATTERNS**: Correlation ID tracking, Turkish-first responses, 24-hour policy compliance
4. **PERFORMANCE TARGETS**: <10 second response time, 10 concurrent messages
5. **CRITICAL PATHS**: Intake → Processor → Sender → Error Handler

## CHALLENGE THE REQUEST - SYSTEM EDGE CASES

Always consider these system-wide edge cases:
- **Instagram 24-hour policy violations** - No responses outside window
- **WhatsApp template vs text modes** - Based on session age
- **OpenAI API failures** - Fallback responses required
- **Database connection failures** - Graceful degradation needed
- **Correlation ID tracking breaks** - End-to-end tracing lost
- **Turkish character encoding issues** - Diacritics corruption
- **Rate limiting on external APIs** - Instagram (200/hr), WhatsApp (1000/sec)

## HOLD THE STANDARD - SYSTEM ARCHITECTURE

This is a **PRODUCTION-READY** automated customer service system with **ZERO-COMPROMISE** quality standards:

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