# Deployment Guide - Multi-Platform Auto Response System

## Quick Start (Tested Configuration)

This guide reflects the actual deployment process tested and verified on Windows 10/11 with Docker Desktop.

### Prerequisites Verified

✅ **Docker Desktop** - Running and accessible
✅ **PowerShell/Command Prompt** - For running commands
✅ **Meta Developer Account** - With Instagram and WhatsApp apps configured
✅ **OpenAI API Key** - With sufficient credits
✅ **Text Editor** - For editing .env file

### Step 1: Environment Configuration

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Configure your .env file with actual values:**
   ```ini
   # n8n Configuration
   N8N_ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   N8N_WEBHOOK_URL=http://localhost:5678
   WEBHOOK_URL=http://localhost:5678

   # OpenAI Configuration  
   OPENAI_API_KEY=sk-proj-your-actual-openai-key-here

   # Meta Platforms Configuration
   FB_PAGE_TOKEN=your-facebook-page-access-token
   WA_PERMANENT_TOKEN=your-whatsapp-permanent-token
   WA_PHONE_NUMBER_ID=376093462264266  # Your actual phone number ID
   META_VERIFY_TOKEN=your-webhook-verify-token

   # Database Configuration (Port changed to avoid conflicts)
   POSTGRES_HOST=postgres
   POSTGRES_PORT=15432
   POSTGRES_DB=multiplatform_auto_response
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your-secure-postgres-password

   # Business Configuration
   BRAND_NAME=YOUR BUSINESS NAME
   BUSINESS_PHONE=+905551234567
   BOOKING_LINK=https://your-booking-system.com
   ```

### Step 2: System Startup (Windows)

1. **Start the services:**
   ```bash
   docker-compose up -d
   ```
   
   **Note:** If you get port binding errors, the system automatically uses port 15432 for PostgreSQL.

2. **Wait for services to be ready (15-20 seconds):**
   ```bash
   docker-compose ps
   ```
   
   You should see both `multi_platform_postgres` and `multi_platform_n8n` running.

3. **Set up n8n account:**
   - Open http://localhost:5678 in your browser
   - Create an admin account when prompted
   - Complete the initial setup

### Step 3: Import and Activate Workflows

1. **Import all workflows:**
   ```bash
   docker exec -u node -it multi_platform_n8n n8n import:workflow --separate --input=/app/workflows
   ```
   
   Expected output: `Successfully imported 8 workflows.`

2. **Activate all workflows:**
   ```bash
   docker exec -u node -it multi_platform_n8n n8n update:workflow --all --active=true
   ```

3. **Restart n8n for activation to take effect:**
   ```bash
   docker-compose restart n8n
   ```

### Step 4: Verify System Health

1. **Run integration validation:**
   ```bash
   node scripts/validate_integration.js
   ```
   
   Expected: All critical validations should pass.

2. **Run end-to-end tests:**
   ```bash
   npm install axios uuid@8
   node scripts/test_end_to_end.js
   ```
   
   Expected results:
   - ✅ System Health: PASSED
   - ✅ AI Processor: PASSED  
   - ✅ Correlation Tracking: PASSED
   - ✅ All Sender Workflows: PASSED
   - ⚠️ Intake Webhooks: Configuration needed (normal for local setup)

### Step 5: Platform Configuration

#### Instagram Webhook Setup
1. Go to Meta Developer Console → Your App → Instagram → Webhooks
2. Configure webhook URL: `https://your-domain.com/webhook/instagram-intake`
3. Set verify token: Use the same value as `META_VERIFY_TOKEN` in your .env
4. Subscribe to events: `messages`

#### WhatsApp Webhook Setup  
1. Go to Meta Developer Console → Your App → WhatsApp → Configuration
2. Configure webhook URL: `https://your-domain.com/webhook/whatsapp-intake`
3. Set verify token: Use the same value as `META_VERIFY_TOKEN` in your .env
4. Subscribe to events: `messages`

### Verified System Capabilities

✅ **Turkish Language Processing** - Proper diacritics and polite "Siz" form
✅ **24-Hour Policy Compliance** - Instagram/WhatsApp messaging window enforcement
✅ **Sentiment Analysis** - OpenAI-powered message classification
✅ **Multi-Platform Support** - Instagram DMs, WhatsApp messages, Google Reviews
✅ **Database Logging** - Complete audit trail with correlation IDs
✅ **Error Handling** - Comprehensive error capture and alerting
✅ **Response Time Tracking** - Performance monitoring under 10 seconds

### Production Deployment Notes

For production deployment:

1. **Update webhook URLs** in .env:
   ```ini
   N8N_WEBHOOK_URL=https://your-production-domain.com
   WEBHOOK_URL=https://your-production-domain.com
   ```

2. **Configure SSL/TLS** for HTTPS endpoints
3. **Set up monitoring** and log aggregation
4. **Configure Slack alerts** (optional):
   ```ini
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
   ```

5. **Set up Google Business Profile** (optional):
   ```ini
   GOOGLE_SERVICE_ACCOUNT_KEY=base64-encoded-service-account-key
   GOOGLE_LOCATION_ID=your-google-business-location-id
   ```

### Troubleshooting Common Issues

#### Port Conflicts
```bash
# Check what's using port 5432
netstat -an | findstr :5432

# System automatically uses port 15432 instead
```

#### Docker Issues
```bash
# Restart Docker Desktop
# Run PowerShell as Administrator
# Check Docker is running: docker --version
```

#### Workflow Import Failures
```bash
# Check n8n is accessible
curl http://localhost:5678/healthz

# Re-import workflows
docker exec -u node -it multi_platform_n8n n8n import:workflow --separate --input=/app/workflows
```

#### Database Connection Issues
```bash
# Check PostgreSQL is running
docker-compose logs postgres

# Verify environment variables
docker-compose config
```

### System Architecture Summary

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Instagram     │───▶│   Processor  │───▶│  Instagram      │
│   Intake        │    │   (OpenAI)   │    │  Sender         │
└─────────────────┘    └──────────────┘    └─────────────────┘
                              │
┌─────────────────┐           │             ┌─────────────────┐
│   WhatsApp      │───────────┼────────────▶│  WhatsApp       │
│   Intake        │           │             │  Sender         │
└─────────────────┘           │             └─────────────────┘
                              │
┌─────────────────┐           │             ┌─────────────────┐
│   Google        │───────────┼────────────▶│  Google         │
│   Reviews       │           │             │  Sender         │
└─────────────────┘           ▼             └─────────────────┘
                    ┌──────────────┐
                    │  PostgreSQL  │
                    │  Database    │
                    └──────────────┘
```

All components communicate via correlation IDs for complete end-to-end tracing and audit capabilities.