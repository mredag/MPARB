---
inclusion: always
---

# Development Principles - Professional Standards

## 1. CONTEXT FIRST — NO GUESSWORK

### System Understanding Requirements
- **DO NOT WRITE A SINGLE LINE OF CODE UNTIL YOU UNDERSTAND THE SYSTEM**
- **IMMEDIATELY LIST FILES IN THE TARGET DIRECTORY** when working on any component
- **ASK ONLY THE NECESSARY CLARIFYING QUESTIONS. NO FLUFF.**
- **DETECT AND FOLLOW EXISTING PATTERNS** - Match style, structure, and logic
- **IDENTIFY ENVIRONMENT VARIABLES, CONFIG FILES, AND SYSTEM DEPENDENCIES**

### Multi-Platform Auto Response System Context
- **Core Architecture**: n8n workflows → PostgreSQL logging → External APIs
- **Key Patterns**: Correlation ID tracking, Turkish-first responses, 24-hour policy compliance
- **Environment Dependencies**: OpenAI, Meta APIs, Google Business Profile, PostgreSQL, Slack
- **Configuration Files**: `.env`, `docker-compose.yml`, workflow JSONs, `templates.json`

## 2. CHALLENGE THE REQUEST — DON'T BLINDLY FOLLOW

### Critical Analysis Requirements
- **IDENTIFY EDGE CASES IMMEDIATELY**
- **ASK SPECIFICALLY: WHAT ARE THE INPUTS? OUTPUTS? CONSTRAINTS?**
- **QUESTION EVERYTHING THAT IS VAGUE OR ASSUMED**
- **REFINE THE TASK UNTIL THE GOAL IS BULLET-PROOF**

### System-Specific Edge Cases to Consider
- **Instagram 24-hour policy violations**
- **WhatsApp template vs text message modes**
- **OpenAI API failures and fallback responses**
- **Database connection failures**
- **Correlation ID tracking breaks**
- **Turkish character encoding issues**
- **Rate limiting on external APIs**

## 3. HOLD THE STANDARD — EVERY LINE MUST COUNT

### Code Quality Standards
- **CODE MUST BE MODULAR, TESTABLE, CLEAN**
- **COMMENT METHODS. USE DOCSTRINGS. EXPLAIN LOGIC**
- **SUGGEST BEST PRACTICES IF CURRENT APPROACH IS OUTDATED**
- **IF YOU KNOW A BETTER WAY — SPEAK UP**

### System-Specific Quality Requirements
```javascript
// REQUIRED: All workflows must include correlation_id tracking
correlation_id: require('crypto').randomUUID()

// REQUIRED: All API calls must include retry logic
retryOnFail: true,
maxTries: 3,
waitBetweenTries: 2000,
continueOnFail: true

// REQUIRED: All database operations must log response times
response_time_ms: Date.now() - startTime,
outcome: 'sent' | 'failed' | 'escalated' | 'logged_only'

// REQUIRED: All Turkish responses must use proper diacritics
// ✅ Correct: "Size nasıl yardımcı olabilirim?"
// ❌ Wrong: "Size nasil yardimci olabilirim?"
```

## 4. ZOOM OUT — THINK BIGGER THAN JUST THE FILE

### System Design Principles
- **DON'T PATCH. DESIGN.**
- **THINK ABOUT MAINTAINABILITY, USABILITY, SCALABILITY**
- **CONSIDER ALL COMPONENTS (FRONTEND, BACKEND, DB, USER INTERFACE)**
- **PLAN FOR THE USER EXPERIENCE. NOT JUST THE FUNCTIONALITY**

### Multi-Platform System Considerations
- **Workflow Dependencies**: Intake → Processor → Sender → Error Handler
- **Database Impact**: Every change must consider correlation tracking
- **API Rate Limits**: Instagram (200/hr), WhatsApp (1000/sec), OpenAI (tokens)
- **User Experience**: <10 second response time, proper Turkish language
- **Scalability**: 10 concurrent messages, database performance
- **Monitoring**: Slack alerts, database logging, correlation tracing

## 5. WEB TERMINOLOGY — SPEAK THE RIGHT LANGUAGE

### System-Specific Terminology
- **Workflows**: n8n JSON definitions with nodes and connections
- **Webhooks**: External platform endpoints (`/webhook/instagram-intake`)
- **Correlation Flow**: End-to-end message tracing via UUID
- **Platform Routing**: Instagram → WhatsApp → Google Reviews logic
- **Session Modes**: WhatsApp text vs template based on 24-hour window
- **Sentiment Analysis**: OpenAI classification (Positive/Neutral/Negative)
- **Intent Detection**: Greeting, Booking, Pricing, Complaint, Other

### API Interaction Patterns
```javascript
// Webhook Input Pattern
POST /webhook/instagram-intake
Headers: { 'x-hub-signature': '...', 'content-type': 'application/json' }
Body: { entry: [{ messaging: [{ sender: {}, message: {} }] }] }

// Internal Workflow Communication
POST /webhook/processor
Headers: { 'x-correlation-id': 'uuid', 'content-type': 'application/json' }
Body: { text, platform, timestamp, correlation_id, sender_id }

// External API Calls
POST https://graph.facebook.com/v17.0/me/messages
Headers: { 'Authorization': 'Bearer token', 'content-type': 'application/json' }
Body: { recipient: { id }, message: { text }, messaging_type: 'RESPONSE' }
```

## 6. ONE FILE, ONE RESPONSE

### File Management Rules
- **DO NOT SPLIT FILE RESPONSES**
- **DO NOT RENAME METHODS UNLESS ABSOLUTELY NECESSARY**
- **SEEK APPROVAL ONLY WHEN THE TASK NEEDS CLARITY — OTHERWISE, EXECUTE**

### System File Patterns
- **Workflow Files**: Single JSON per workflow, complete node definitions
- **Script Files**: Single purpose (validate, test, import, activate)
- **Documentation**: Comprehensive but focused (no splitting across files)
- **Configuration**: Environment variables in `.env`, not scattered

## 7. ENFORCE STRICT STANDARDS

### Code Standards
- **CLEAN CODE, CLEAN STRUCTURE**
- **1600 LINES PER FILE MAX**
- **HIGHLIGHT ANY FILE THAT IS GROWING BEYOND CONTROL**
- **USE LINTERS, FORMATTERS. IF THEY'RE MISSING — FLAG IT**

### System-Specific Standards
```javascript
// Workflow Node Naming Convention
"name": "Extract Payload",           // Clear, descriptive
"name": "Calculate Response Metrics", // Action-oriented
"name": "Update Message Record",     // Database operations

// Database Field Standards
correlation_id: UUID NOT NULL        // Always required
created_at: TIMESTAMP DEFAULT NOW()  // Always include
response_time_ms: INTEGER            // Performance tracking
outcome: VARCHAR(50)                 // Status tracking

// Error Handling Standards
try {
  // Main logic
} catch (error) {
  console.error('Specific Error Context:', {
    error: error.message,
    correlation_id: correlationId,
    timestamp: new Date().toISOString()
  });
  // Fallback logic
}
```

## 8. MOVE FAST, BUT WITH CONTEXT

### Execution Planning
**ALWAYS BULLET YOUR PLAN BEFORE EXECUTION:**
- **WHAT YOU'RE DOING**
- **WHY YOU'RE DOING IT**
- **WHAT YOU EXPECT TO CHANGE**

### System Change Impact Analysis
Before any change, consider:
- **Workflow Dependencies**: Will this break the intake → processor → sender flow?
- **Database Schema**: Does this require migration or affect existing queries?
- **API Compatibility**: Will external platforms still work?
- **Correlation Tracking**: Is end-to-end tracing maintained?
- **Turkish Language**: Are language standards preserved?
- **Error Handling**: Are failure scenarios covered?

## ABSOLUTE DO-NOTS

### System-Specific Prohibitions
- **DO NOT CHANGE CORRELATION_ID TRACKING WITHOUT SYSTEM-WIDE UPDATE**
- **DO NOT BREAK 24-HOUR POLICY COMPLIANCE FOR INSTAGRAM/WHATSAPP**
- **DO NOT REMOVE TURKISH DIACRITICS OR CHANGE TO INFORMAL TONE**
- **DO NOT ADD LOGIC THAT DOESN'T NEED TO BE THERE**
- **DO NOT WRAP EVERYTHING IN TRY-CATCH. THINK FIRST**
- **DO NOT SPAM FILES WITH NON-ESSENTIAL COMPONENTS**
- **DO NOT CREATE SIDE EFFECTS WITHOUT MENTIONING THEM**
- **DO NOT MODIFY WEBHOOK ENDPOINTS WITHOUT UPDATING PLATFORM CONFIGS**
- **DO NOT CHANGE DATABASE SCHEMA WITHOUT MIGRATION SCRIPTS**

## SYSTEM STABILITY REQUIREMENTS

### Your Work Isn't Done Until:
- **ALL WORKFLOWS PASS INTEGRATION VALIDATION**: `node scripts/validate_integration.js`
- **END-TO-END TESTS PASS**: `node scripts/test_end_to_end.js`
- **CORRELATION IDS TRACK PROPERLY**: Database queries show complete flow
- **TURKISH LANGUAGE COMPLIANCE**: All responses use proper diacritics and "Siz" form
- **ERROR HANDLING WORKS**: Slack alerts trigger on failures
- **PERFORMANCE MEETS TARGETS**: <10 second response time, 10 concurrent messages

### Cross-System Impact Checklist
- **Database**: Schema changes, query performance, correlation tracking
- **Workflows**: Node connections, error handling, retry logic
- **APIs**: Rate limits, authentication, response formats
- **Monitoring**: Logging, alerting, performance metrics
- **Documentation**: Updated guides, environment variables, webhook URLs

## THINK LIKE A HUMAN

### User Experience Considerations
- **CONSIDER NATURAL BEHAVIOUR**: How do customers actually message businesses?
- **HOW WOULD A USER INTERACT WITH THIS?**: Instagram DM vs WhatsApp vs Review
- **WHAT HAPPENS WHEN SOMETHING FAILS?**: Graceful degradation, helpful errors
- **HOW CAN YOU MAKE THIS FEEL SEAMLESS?**: Fast responses, natural language

### Platform-Specific UX
- **Instagram**: Casual but professional, emojis OK, 24-hour window critical
- **WhatsApp**: Business-focused, no emojis, template vs text modes
- **Google Reviews**: Formal, grateful tone, NO emojis, public visibility

## EXECUTION STANDARDS

### Professional Delivery
- **EXECUTE LIKE A PROFESSIONAL CODER**: Clean, tested, documented code
- **THINK LIKE AN ARCHITECT**: System-wide impact, scalability, maintainability  
- **DELIVER LIKE A LEADER**: Complete solutions, proactive communication, quality assurance

### System Delivery Checklist
1. **Code Quality**: Follows all steering standards
2. **Integration**: Passes validation scripts
3. **Testing**: Comprehensive test coverage
4. **Documentation**: Updated guides and references
5. **Performance**: Meets response time targets
6. **Monitoring**: Proper logging and alerting
7. **Security**: API keys protected, input validation
8. **Compliance**: Turkish language standards, platform policies