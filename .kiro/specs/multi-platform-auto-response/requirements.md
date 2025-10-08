# Requirements Document

## Introduction

This document outlines the requirements for a production-ready multi-platform auto response system that handles Instagram DMs, Google Reviews, and WhatsApp Cloud API messages. The system uses n8n for orchestration, OpenAI for natural language processing, PostgreSQL for logging, and operates with Turkish as the default language and tone. The system must respect platform-specific policies (especially Meta's 24-hour rule) and provide comprehensive monitoring and reporting capabilities.

## Requirements

### Requirement 1

**User Story:** As a business owner, I want an automated system that responds to customer messages across Instagram, WhatsApp, and Google Reviews, so that I can provide timely customer service without manual intervention.

#### Acceptance Criteria

1. WHEN a message is received on Instagram DM within 24 hours THEN the system SHALL process and respond
2. WHEN an Instagram DM is older than 24 hours THEN the system SHALL alert Slack and NOT auto-reply
3. WHEN a message is received on WhatsApp within 24 hours THEN the system SHALL respond with free text
4. WHEN a WhatsApp message is outside 24 hours THEN the system SHALL use approved templates only
5. WHEN a Google Review is posted THEN the system SHALL analyze sentiment and respond appropriately or escalate negative reviews
6. WHEN any platform receives a message THEN the system SHALL log the interaction in PostgreSQL with correlation tracking

### Requirement 2

**User Story:** As a system administrator, I want the entire system to be deployable with a single command, so that I can quickly set up and maintain the infrastructure.

#### Acceptance Criteria

1. WHEN running `make up && make import && make activate` THEN the system SHALL start all services and import all workflows
2. WHEN the system starts THEN Docker Compose SHALL launch PostgreSQL and n8n services (Metabase optional, Redis for later)
3. WHEN workflows are imported THEN all n8n workflows SHALL be activated and ready to receive webhooks
4. WHEN the system is running THEN all webhook URLs SHALL be displayed for manual platform configuration

### Requirement 3

**User Story:** As a customer service manager, I want all responses to be in Turkish by default with proper tone and diacritics, so that customers receive culturally appropriate communication.

#### Acceptance Criteria

1. WHEN generating responses THEN the system SHALL use Turkish by default with polite "Siz" and proper diacritics
2. WHEN another language is detected THEN the system SHALL reply in that language
3. WHEN creating templates THEN the system SHALL include Turkish-first entries with appropriate business tone

### Requirement 4

**User Story:** As a compliance officer, I want the system to respect Meta's 24-hour messaging policy, so that we avoid policy violations and account restrictions.

#### Acceptance Criteria

1. WHEN an Instagram message is older than 24 hours THEN the system SHALL send a Slack alert and NOT auto-respond
2. WHEN a WhatsApp session is within 24 hours THEN the system SHALL send free-form text responses
3. WHEN a WhatsApp session is outside 24 hours THEN the system SHALL only send approved message templates
4. WHEN policy violations are detected THEN the system SHALL log the incident and alert administrators

### Requirement 5

**User Story:** As a data analyst, I want comprehensive logging of all interactions, so that I can monitor system performance and customer satisfaction.

#### Acceptance Criteria

1. WHEN any message is processed THEN the system SHALL store platform, sender, language, sentiment, intent, response time, and outcome
2. WHEN reviews are processed THEN the system SHALL log review details, rating, sentiment, and response actions
3. WHEN errors occur THEN the system SHALL log workflow, node, message, and payload details

### Requirement 6

**User Story:** As an AI operations manager, I want intelligent message processing using OpenAI, so that responses are contextually appropriate and helpful.

#### Acceptance Criteria

1. WHEN a message is received THEN one OpenAI call SHALL return sentiment, intent, and a reply under 500 characters
2. WHEN processing Google Reviews THEN responses SHALL avoid emojis and maintain professional tone
3. WHEN generating responses THEN the system SHALL select appropriate templates based on platform, sentiment, and intent

### Requirement 7

**User Story:** As a business operator, I want automated escalation for negative feedback, so that critical issues receive immediate attention.

#### Acceptance Criteria

1. WHEN a Google Review has rating ≤ 2 OR negative sentiment THEN the system SHALL send Slack alert with AI draft
2. WHEN escalation occurs THEN the system SHALL include correlation ID for tracking

### Requirement 8

**User Story:** As a DevOps engineer, I want robust error handling and monitoring, so that system issues are quickly identified and resolved.

#### Acceptance Criteria

1. WHEN any workflow error occurs THEN the system SHALL insert into errors table and alert Slack
2. WHEN Slack webhook is configured THEN the system SHALL send error alerts to designated channel

### Requirement 9

**User Story:** As a system integrator, I want secure configuration management, so that API keys and sensitive data are properly protected.

#### Acceptance Criteria

1. WHEN the system starts THEN all secrets SHALL be loaded from environment variables only
2. WHEN workflows are exported THEN no secrets SHALL be embedded in JSON files
3. WHEN configuration is needed THEN the system SHALL prompt for required environment variables
4. WHEN credentials are used THEN they SHALL be stored in n8n's credential system securely

### Requirement 10

**User Story:** As a quality assurance engineer, I want essential testing capabilities, so that I can verify system functionality before deployment.

#### Acceptance Criteria

1. WHEN Turkish IG DM test runs THEN the system SHALL respond with proper diacritics and polite tone
2. WHEN WhatsApp tests run THEN the system SHALL verify both inside and outside 24-hour modes
3. WHEN Google Review tests run THEN the system SHALL verify 5-star auto-reply and 2-star escalation