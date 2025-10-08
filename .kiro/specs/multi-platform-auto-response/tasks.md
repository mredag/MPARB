# Implementation Plan

- [x] 1. Set up project structure and environment configuration

  - Create directory structure for workflows, scripts, docs, and templates
  - Create .env.example with all required environment variables
  - Write Makefile with up, down, import, activate, backup, logs, psql, and test commands
  - _Requirements: 2.1, 2.2, 9.1, 9.3_

- [x] 2. Create Docker Compose infrastructure

  - Write docker-compose.yml with PostgreSQL and n8n services
  - Configure PostgreSQL with persistent volume and environment variables
  - Configure n8n with encryption key, database connection, and port exposure
  - Mount repository at stable path for workflow access

  - _Requirements: 2.1, 2.2_

- [x] 3. Implement database schema and seed data

  - Write scripts/seed.sql with messages, reviews, and errors table definitions
  - Add proper indexes on created_at, platform, and correlation_id columns
  - Run via Makefile target for database setup
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 4. Create Turkish response templates

  - Write templates/templates.json with Turkish-first entries using proper diacritics

  - Include templates for Google positive/negative, Instagram greeting, WhatsApp outside 24h
  - Use polite "Siz" form and keep responses concise
  - Add variable placeholders for first_name, brand_name, phone, booking_link
  - _Requirements: 3.1, 3.3_

- [x] 5. Implement Instagram intake workflow

  - Create workflows/instagram_intake.json with webhook trigger at /webhook/instagram-intake
  - Add Meta verify token validation from environment variables
  - Normalize Instagram payload to sender_id, text, timestamp format

  - Insert message record to PostgreSQL with platform="instagram" and correlation_id
  - If older than 24 hours: log only, optional Slack alert, do not send
  - If within 24 hours: call processor webhook with normalized data
  - _Requirements: 1.1, 1.2, 4.1, 4.2, 5.1_

- [x] 6. Implement WhatsApp intake workflow

  - Create workflows/whatsapp_intake.json with webhook trigger at /webhook/whatsapp-intake
  - Add Meta verify token validation from environment variables
  - Normalize WhatsApp payload to phone, text, timestamp format
  - Compute session age: mode=text inside 24h, mode=template outside 24h
  - Insert message record to PostgreSQL with p
    latform="whatsapp"
  - Call processor webhook with mode parameter
  - _Requirements: 1.3, 1.4, 4.1, 4.3, 5.1_

-

- [x] 7. Implement Google Reviews intake workflow

  - Create workflows/google_reviews_intake.json with Google Business Profile trigger (or 5-minute poll if trigger unavailable)
  - Normalize review data to review_id, rating, text, author, timestamp format
  - Insert review record to PostgreSQL with correlation_id
  - For 4-5 stars: call processor webhook with platform="google_reviews"
  - For ≤2 stars: send Slack alert, for 3 stars: log only
  - _Requirements: 1.5, 5.2, 7.1, 7.2_

- [x] 8. Implement central processor workflow

  - Create workflows/processor.json with webhook trigger at /webhook/processor
  - Add single OpenAI Chat node that returns JSON with language, sentiment, intent, reply_text under 500 chars
  - Configure prompt for Turkish by default with proper diacritics, no emojis for Google
  - Add retry logic: 3 attempts at 1s, 2s, 4s intervals, then log and alert

  - Return structured JSON response with all required fields and correlation_id
  - _Requirements: 6.1, 6.2, 3.1, 3.2_

- [x] 9. Implement Instagram sender workflow

  - Create workflows/sender_instagram.json with webhook trigger at /webhook/sender-instagram
  - Add Facebook Graph API v17.0 HTTP request to /me/messages endpoint
  - Use Bearer token authentication from FB_PAGE_TOKEN environment variable
  - Send message with recipient ID, reply text, and messaging_type="RESPONSE" only
  - Update messages table with response_time_ms and outcome="sent"

  - _Requirements: 1.1, 5.1_

- [x] 10. Implement WhatsApp sender workflow

  - Create workflows/sender_whatsapp.json with webhook trigger at /webhook/sender-whatsapp
  - Send free text if mode=text, send approved template if mode=template
  - Use WhatsApp Business Cloud API with WA_PERMANENT_TOKEN authentication
  - Use Turkish locale for template messages
  - Update messages table with response_time_ms and outcome
  - _Requirements: 1.3, 1.4, 4.3, 5.1_

- [x] 11. Implement Google Business Profile sender workflow

  - Create workflows/sender_gbp.json with webhook trigger at /webhook/sender-gbp
  - Add Google Business Profile API integration for reply posting
  - Use service account or OAuth2 credentials for authentication
  - Reply only for 4-5 star reviews in MVP, alert Slack for ≤2 stars, log 3 stars only

  - Update reviews table with response_time_ms and outcome
  - _Requirements: 1.5, 5.2_

- [x] 12. Implement error handling workflow

  - Create workflows/error_handler.json with Error Trigger for all workflow failures
  - Insert error records to PostgreSQL errors table with workflow, node, message, payload
  - Send Slack alerts only for hard failures when SLACK_WEBHOOK_URL is configured
  - Include correlation_id in error logs for traceability
  - _Requirements: 8.1, 8.2_

- [x] 13. Create essential documentation and scripts

  - Create README.md with setup instructions and webhook URL documentation
  - Write scripts/import.sh and scripts/activate.sh for workflow management
  - _Requirements: 2.4, 9.4_

-

- [x] 14. Implement essential testing suite

  - Create Turkish Instagram DM test with proper diacritics validation
  - Write WhatsApp tests for inside and outside 24-hour session modes
  - Add Google Review tests for 5-star auto-reply and 2-star alert scenarios
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 15. Create essential documentation

  - Write docs/PRD.md with product requirements and business logic
  - Write docs/ENV_VARS.md documenting all environment variables
  - _Requirements: 2.4, 9.4_

-

- [x] 16. Wire together complete system integration

  - Ensure all workflows are properly connected via webhook calls
  - Validate correlation_id tracking across all workflow steps

  - Test complete end-to-end message flow from intake to sender
  - Verify database logging and error handling integration
  - Print final webhook URLs for platform configuration
  - _Requirements: 1.6, 5.1, 5.2, 5.3, 8.1_
