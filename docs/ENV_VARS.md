# Environment Variables Documentation

This document describes all environment variables required for the Multi-Platform Auto Response System. All variables should be configured in your `.env` file before starting the system.

## Required Environment Variables

### Database Configuration

#### `POSTGRES_DB`

- **Description**: PostgreSQL database name
- **Required**: Yes
- **Default**: `autoresponse`
- **Example**: `POSTGRES_DB=autoresponse`

#### `POSTGRES_USER`

- **Description**: PostgreSQL username
- **Required**: Yes
- **Default**: `postgres`
- **Example**: `POSTGRES_USER=postgres`

#### `POSTGRES_PASSWORD`

- **Description**: PostgreSQL password
- **Required**: Yes
- **Security**: High - Database access credential
- **Example**: `POSTGRES_PASSWORD=your_secure_password_here`

### n8n Configuration

#### `N8N_ENCRYPTION_KEY`

- **Description**: Encryption key for n8n credential storage
- **Required**: Yes
- **Security**: Critical - Protects all stored credentials
- **Format**: 32-character random string
- **Example**: `N8N_ENCRYPTION_KEY=your_32_character_encryption_key_here`
- **Generation**: Use `openssl rand -hex 16` to generate

#### `N8N_WEBHOOK_URL`

- **Description**: Publicly reachable base URL n8n uses when generating webhook endpoints and callback URLs
- **Required**: Yes
- **Default**: `http://localhost:5678`
- **Example**: `N8N_WEBHOOK_URL=https://n8n.example.com`
- **Notes**: Should match the externally accessible address of your n8n instance (including protocol and port). Keep it in sync with `WEBHOOK_URL` so webhook executions use the correct hostname.

#### `WEBHOOK_URL`

- **Description**: Base URL that n8n advertises for incoming webhook executions
- **Required**: Yes (for production deployments behind a reverse proxy)
- **Default**: `http://localhost:5678`
- **Example**: `WEBHOOK_URL=https://n8n.example.com`
- **Notes**: Use the same value as `N8N_WEBHOOK_URL` to prevent DNS resolution mismatches during cross-workflow HTTP requests.

### OpenAI Integration

#### `OPENAI_API_KEY`

- **Description**: OpenAI API key for GPT-based message processing
- **Required**: Yes
- **Security**: High - API access credential
- **Format**: `sk-...` (OpenAI API key format)
- **Example**: `OPENAI_API_KEY=sk-your_openai_api_key_here`

### Meta Platform Integration

#### `FB_PAGE_TOKEN`

- **Description**: Facebook Page Access Token for Instagram messaging
- **Required**: Yes (for Instagram functionality)
- **Security**: High - Platform API credential
- **Scope**: `pages_messaging`, `pages_show_list`
- **Example**: `FB_PAGE_TOKEN=your_facebook_page_token_here`

#### `FB_VERIFY_TOKEN`

- **Description**: Webhook verification token for Facebook/Instagram
- **Required**: Yes (for Instagram functionality)
- **Security**: Medium - Webhook validation
- **Format**: Custom string (you define this)
- **Example**: `FB_VERIFY_TOKEN=your_custom_verify_token`

#### `WA_PERMANENT_TOKEN`

- **Description**: WhatsApp Business Cloud API permanent access token
- **Required**: Yes (for WhatsApp functionality)
- **Security**: High - Platform API credential
- **Format**: WhatsApp Business API token format
- **Example**: `WA_PERMANENT_TOKEN=your_whatsapp_permanent_token`

#### `WA_PHONE_NUMBER_ID`

- **Description**: WhatsApp Business phone number ID
- **Required**: Yes (for WhatsApp functionality)
- **Security**: Low - Public identifier
- **Example**: `WA_PHONE_NUMBER_ID=1234567890123456`

#### `WA_VERIFY_TOKEN`

- **Description**: Webhook verification token for WhatsApp
- **Required**: Yes (for WhatsApp functionality)
- **Security**: Medium - Webhook validation
- **Format**: Custom string (you define this)
- **Example**: `WA_VERIFY_TOKEN=your_whatsapp_verify_token`

### Google Business Profile Integration

#### `GOOGLE_SERVICE_ACCOUNT_KEY`

- **Description**: Google Service Account JSON key for Business Profile API
- **Required**: Yes (for Google Reviews functionality)
- **Security**: Critical - Service account credential
- **Format**: Base64-encoded JSON service account key
- **Example**: `GOOGLE_SERVICE_ACCOUNT_KEY=eyJ0eXBlIjoi...` (base64 encoded)

#### `GOOGLE_LOCATION_ID`

- **Description**: Google Business Profile location ID
- **Required**: Yes (for Google Reviews functionality)
- **Security**: Low - Public identifier
- **Example**: `GOOGLE_LOCATION_ID=your_google_location_id`

### Monitoring and Alerting

#### `SLACK_WEBHOOK_URL`

- **Description**: Slack webhook URL for error alerts and escalations
- **Required**: Optional (recommended for production)
- **Security**: Medium - Notification endpoint
- **Format**: `https://hooks.slack.com/services/...`
- **Example**: `SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK`

### Business Configuration

#### `BRAND_NAME`

- **Description**: Business/brand name used in response templates
- **Required**: Yes
- **Security**: Low - Public information
- **Example**: `BRAND_NAME=Your Business Name`

#### `BUSINESS_PHONE`

- **Description**: Business phone number for customer contact
- **Required**: Optional
- **Security**: Low - Public information
- **Format**: International format recommended
- **Example**: `BUSINESS_PHONE=+905551234567`

#### `BOOKING_LINK`

- **Description**: Online booking system URL
- **Required**: Optional
- **Security**: Low - Public information
- **Example**: `BOOKING_LINK=https://your-booking-system.com`

## Environment Variable Security Levels

### Critical Security Variables

These variables provide access to core system functions and must be kept secure:

- `N8N_ENCRYPTION_KEY`
- `GOOGLE_SERVICE_ACCOUNT_KEY`

### High Security Variables

These variables provide API access and should be protected:

- `POSTGRES_PASSWORD`
- `OPENAI_API_KEY`
- `FB_PAGE_TOKEN`
- `WA_PERMANENT_TOKEN`

### Medium Security Variables

These variables are used for webhook validation:

- `FB_VERIFY_TOKEN`
- `WA_VERIFY_TOKEN`
- `SLACK_WEBHOOK_URL`

### Low Security Variables

These variables contain public or non-sensitive information:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `WA_PHONE_NUMBER_ID`
- `GOOGLE_LOCATION_ID`
- `BRAND_NAME`
- `BUSINESS_PHONE`
- `BOOKING_LINK`

## Configuration Setup

### 1. Copy Environment Template

```bash
cp .env.example .env
```

### 2. Configure Required Variables

Edit the `.env` file and set all required variables for your deployment:

```bash
# Database
POSTGRES_DB=autoresponse
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here

# n8n
N8N_ENCRYPTION_KEY=your_32_character_encryption_key_here

# OpenAI
OPENAI_API_KEY=sk-your_openai_api_key_here

# Meta Platforms (Instagram/WhatsApp)
FB_PAGE_TOKEN=your_facebook_page_token_here
FB_VERIFY_TOKEN=your_custom_verify_token
WA_PERMANENT_TOKEN=your_whatsapp_permanent_token
WA_PHONE_NUMBER_ID=1234567890123456
WA_VERIFY_TOKEN=your_whatsapp_verify_token

# Google Business Profile
GOOGLE_SERVICE_ACCOUNT_KEY=eyJ0eXBlIjoi...
GOOGLE_LOCATION_ID=your_google_location_id

# Monitoring (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Business Configuration
BRAND_NAME=Your Business Name
BUSINESS_PHONE=+905551234567
BOOKING_LINK=https://your-booking-system.com
```

### 3. Validate Configuration

Run the system startup to validate all environment variables are properly configured:

```bash
make up
```

## Platform-Specific Setup Instructions

### Instagram Configuration

1. Create Facebook App and get Page Access Token
2. Set up webhook endpoint with `FB_VERIFY_TOKEN`
3. Subscribe to `messages` webhook events
4. Configure webhook URL: `https://your-domain.com/webhook/instagram-intake`

### WhatsApp Configuration

1. Set up WhatsApp Business Cloud API
2. Get permanent access token and phone number ID
3. Configure webhook with `WA_VERIFY_TOKEN`
4. Configure webhook URL: `https://your-domain.com/webhook/whatsapp-intake`

### Google Business Profile Configuration

1. Create Google Cloud Project and enable Business Profile API
2. Create Service Account and download JSON key
3. Base64 encode the JSON key for `GOOGLE_SERVICE_ACCOUNT_KEY`
4. Get your Google Business Profile location ID

### Slack Configuration (Optional)

1. Create Slack App in your workspace
2. Enable Incoming Webhooks
3. Create webhook URL for your desired channel
4. Set `SLACK_WEBHOOK_URL` environment variable

## Security Best Practices

### Environment File Security

- Never commit `.env` files to version control
- Use `.env.example` as a template without real values
- Restrict file permissions: `chmod 600 .env`
- Use different credentials for development and production

### Credential Rotation

- Rotate API keys regularly (quarterly recommended)
- Update `N8N_ENCRYPTION_KEY` during major updates
- Monitor API usage for unauthorized access
- Use separate credentials for different environments

### Access Control

- Limit database access to application only
- Use least-privilege principle for all API tokens
- Monitor webhook endpoint access logs
- Implement IP whitelisting where possible

## Troubleshooting

### Common Issues

#### Missing Environment Variables

**Error**: `Environment variable X is not set`
**Solution**: Check `.env` file and ensure all required variables are configured

#### Invalid API Credentials

**Error**: `401 Unauthorized` or `403 Forbidden`
**Solution**: Verify API tokens are valid and have required permissions

#### Database Connection Issues

**Error**: `Connection refused` or `Authentication failed`
**Solution**: Check PostgreSQL credentials and ensure database is running

#### Webhook Verification Failures

**Error**: `Webhook verification failed`
**Solution**: Ensure verify tokens match between platform configuration and environment variables

### Validation Commands

#### Test Database Connection

```bash
make psql
```

#### Check n8n Status

```bash
docker-compose logs n8n
```

#### Validate Environment Variables

```bash
docker-compose config
```
