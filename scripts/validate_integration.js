#!/usr/bin/env node

/**
 * System Integration Validation Script
 * 
 * This script validates the complete system integration by:
 * 1. Verifying all workflow webhook connections
 * 2. Testing correlation_id tracking across all workflow steps
 * 3. Validating database logging and error handling integration
 * 4. Printing final webhook URLs for platform configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Multi-Platform Auto Response System Integration Validation\n');

// Workflow files to validate
const workflows = [
  'instagram_intake.json',
  'whatsapp_intake.json', 
  'google_reviews_intake.json',
  'processor.json',
  'sender_instagram.json',
  'sender_whatsapp.json',
  'sender_gbp.json',
  'error_handler.json'
];

// Expected webhook endpoints
const expectedWebhooks = {
  'instagram_intake.json': '/webhook/instagram-intake',
  'whatsapp_intake.json': '/webhook/whatsapp-intake',
  'processor.json': '/webhook/processor',
  'sender_instagram.json': '/webhook/sender-instagram',
  'sender_whatsapp.json': '/webhook/sender-whatsapp',
  'sender_gbp.json': '/webhook/sender-gbp'
};

// Expected webhook calls between workflows
const expectedConnections = {
  'instagram_intake.json': ['/webhook/processor'],
  'whatsapp_intake.json': ['/webhook/processor'],
  'google_reviews_intake.json': ['/webhook/processor'],
  'processor.json': ['/webhook/sender-instagram', '/webhook/sender-whatsapp', '/webhook/sender-gbp']
};

let validationErrors = [];
let validationWarnings = [];

console.log('📋 Step 1: Validating Workflow Files and Webhook Endpoints\n');

// Validate each workflow file exists and has correct webhook configuration
workflows.forEach(workflowFile => {
  const workflowPath = path.join('workflows', workflowFile);
  
  if (!fs.existsSync(workflowPath)) {
    validationErrors.push(`❌ Missing workflow file: ${workflowFile}`);
    return;
  }
  
  try {
    const workflowContent = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
    
    // Check for webhook nodes
    const webhookNodes = workflowContent.nodes.filter(node => 
      node.type === 'n8n-nodes-base.webhook'
    );
    
    if (expectedWebhooks[workflowFile]) {
      if (webhookNodes.length === 0) {
        validationErrors.push(`❌ ${workflowFile}: No webhook trigger found`);
      } else {
        const webhookPath = webhookNodes[0].parameters.path;
        const expectedPath = expectedWebhooks[workflowFile].replace('/webhook/', '');
        
        if (webhookPath === expectedPath) {
          console.log(`✅ ${workflowFile}: Webhook endpoint /${webhookPath} configured correctly`);
        } else {
          validationErrors.push(`❌ ${workflowFile}: Expected webhook path '${expectedPath}', found '${webhookPath}'`);
        }
      }
    }
    
    // Check for HTTP request nodes that call other workflows
    const httpNodes = workflowContent.nodes.filter(node => 
      node.type === 'n8n-nodes-base.httpRequest' && 
      node.parameters.url && 
      node.parameters.url.includes('/webhook/')
    );
    
    if (expectedConnections[workflowFile]) {
      expectedConnections[workflowFile].forEach(expectedCall => {
        const hasCall = httpNodes.some(node => 
          node.parameters.url.includes(expectedCall)
        );
        
        if (hasCall) {
          console.log(`✅ ${workflowFile}: Calls ${expectedCall} correctly`);
        } else {
          validationErrors.push(`❌ ${workflowFile}: Missing call to ${expectedCall}`);
        }
      });
    }
    
  } catch (error) {
    validationErrors.push(`❌ ${workflowFile}: Invalid JSON format - ${error.message}`);
  }
});

console.log('\n📋 Step 2: Validating Correlation ID Tracking\n');

// Check correlation_id usage in workflows
workflows.forEach(workflowFile => {
  const workflowPath = path.join('workflows', workflowFile);
  
  if (!fs.existsSync(workflowPath)) return;
  
  try {
    const workflowContent = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
    
    // Check for correlation_id in HTTP requests
    const httpNodes = workflowContent.nodes.filter(node => 
      node.type === 'n8n-nodes-base.httpRequest'
    );
    
    let hasCorrelationTracking = false;
    
    httpNodes.forEach(node => {
      const params = node.parameters;
      
      // Check headers for correlation ID
      if (params.headerParameters && params.headerParameters.parameters) {
        const hasCorrelationHeader = params.headerParameters.parameters.some(header => 
          header.name === 'x-correlation-id' || 
          header.value && header.value.includes('correlation_id')
        );
        if (hasCorrelationHeader) hasCorrelationTracking = true;
      }
      
      // Check body parameters for correlation ID
      if (params.bodyParameters && params.bodyParameters.parameters) {
        const hasCorrelationBody = params.bodyParameters.parameters.some(param => 
          param.name === 'correlation_id'
        );
        if (hasCorrelationBody) hasCorrelationTracking = true;
      }
    });
    
    // Check for correlation_id in database operations
    const dbNodes = workflowContent.nodes.filter(node => 
      node.type === 'n8n-nodes-base.postgres'
    );
    
    dbNodes.forEach(node => {
      if (node.parameters.columns && node.parameters.columns.value) {
        if (node.parameters.columns.value.correlation_id) {
          hasCorrelationTracking = true;
        }
      }
    });
    
    if (hasCorrelationTracking) {
      console.log(`✅ ${workflowFile}: Correlation ID tracking implemented`);
    } else {
      validationWarnings.push(`⚠️  ${workflowFile}: No correlation ID tracking found`);
    }
    
  } catch (error) {
    // Already handled in step 1
  }
});

console.log('\n📋 Step 3: Validating Database Integration\n');

// Check database schema file
const schemaPath = 'scripts/seed.sql';
if (fs.existsSync(schemaPath)) {
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  // Check for required tables
  const requiredTables = ['messages', 'reviews', 'errors'];
  const requiredColumns = {
    'messages': ['correlation_id', 'platform', 'response_time_ms', 'outcome'],
    'reviews': ['correlation_id', 'review_id', 'response_time_ms', 'outcome'],
    'errors': ['workflow', 'node', 'message', 'payload']
  };
  
  requiredTables.forEach(table => {
    if (schemaContent.includes(`CREATE TABLE IF NOT EXISTS ${table}`) || schemaContent.includes(`CREATE TABLE ${table}`)) {
      console.log(`✅ Database: ${table} table defined`);
      
      requiredColumns[table].forEach(column => {
        if (schemaContent.includes(column)) {
          console.log(`  ✅ Column: ${column}`);
        } else {
          validationErrors.push(`❌ Database: Missing column '${column}' in ${table} table`);
        }
      });
    } else {
      validationErrors.push(`❌ Database: Missing ${table} table definition`);
    }
  });
} else {
  validationErrors.push(`❌ Database: Missing schema file ${schemaPath}`);
}

console.log('\n📋 Step 4: Validating Error Handling Integration\n');

// Check error handler workflow
const errorHandlerPath = 'workflows/error_handler.json';
if (fs.existsSync(errorHandlerPath)) {
  try {
    const errorHandler = JSON.parse(fs.readFileSync(errorHandlerPath, 'utf8'));
    
    // Check for error trigger
    const errorTrigger = errorHandler.nodes.find(node => 
      node.type === 'n8n-nodes-base.errorTrigger'
    );
    
    if (errorTrigger) {
      console.log('✅ Error Handler: Error trigger configured');
    } else {
      validationErrors.push('❌ Error Handler: Missing error trigger');
    }
    
    // Check for database logging
    const dbLogging = errorHandler.nodes.find(node => 
      node.type === 'n8n-nodes-base.postgres' && 
      node.parameters.table && 
      node.parameters.table.value === 'errors'
    );
    
    if (dbLogging) {
      console.log('✅ Error Handler: Database logging configured');
    } else {
      validationErrors.push('❌ Error Handler: Missing database error logging');
    }
    
    // Check for Slack alerting
    const slackAlert = errorHandler.nodes.find(node => 
      node.type === 'n8n-nodes-base.httpRequest' && 
      node.parameters.url && 
      node.parameters.url.includes('SLACK_WEBHOOK_URL')
    );
    
    if (slackAlert) {
      console.log('✅ Error Handler: Slack alerting configured');
    } else {
      validationWarnings.push('⚠️  Error Handler: No Slack alerting found');
    }
    
  } catch (error) {
    validationErrors.push(`❌ Error Handler: Invalid JSON format - ${error.message}`);
  }
} else {
  validationErrors.push('❌ Error Handler: Missing error_handler.json');
}

console.log('\n📋 Step 5: Environment Configuration Validation\n');

// Check environment variables documentation
const envDocsPath = 'docs/ENV_VARS.md';
if (fs.existsSync(envDocsPath)) {
  const envDocs = fs.readFileSync(envDocsPath, 'utf8');
  
  const requiredEnvVars = [
    'N8N_WEBHOOK_URL',
    'META_VERIFY_TOKEN',
    'FB_PAGE_TOKEN',
    'WA_PERMANENT_TOKEN',
    'WA_PHONE_NUMBER_ID',
    'OPENAI_API_KEY',
    'POSTGRES_HOST',
    'POSTGRES_DB',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (envDocs.includes(envVar)) {
      console.log(`✅ Environment: ${envVar} documented`);
    } else {
      validationWarnings.push(`⚠️  Environment: ${envVar} not documented`);
    }
  });
} else {
  validationWarnings.push('⚠️  Environment: Missing ENV_VARS.md documentation');
}

console.log('\n🌐 Final Webhook URLs for Platform Configuration\n');

// Print webhook URLs that need to be configured in external platforms
const baseUrl = process.env.N8N_WEBHOOK_URL || 'https://your-n8n-instance.com';

console.log('📱 Instagram Webhook URL:');
console.log(`   ${baseUrl}/webhook/instagram-intake`);
console.log('   Configure this URL in Meta Developer Console > Instagram > Webhooks\n');

console.log('📱 WhatsApp Webhook URL:');
console.log(`   ${baseUrl}/webhook/whatsapp-intake`);
console.log('   Configure this URL in Meta Developer Console > WhatsApp > Webhooks\n');

console.log('⭐ Google Business Profile:');
console.log('   Uses scheduled polling (5-minute intervals)');
console.log('   No webhook URL configuration needed\n');

console.log('🔧 Internal Webhook URLs (for reference):');
console.log(`   Processor: ${baseUrl}/webhook/processor`);
console.log(`   Instagram Sender: ${baseUrl}/webhook/sender-instagram`);
console.log(`   WhatsApp Sender: ${baseUrl}/webhook/sender-whatsapp`);
console.log(`   Google Business Profile Sender: ${baseUrl}/webhook/sender-gbp\n`);

// Summary
console.log('📊 Validation Summary\n');

if (validationErrors.length === 0) {
  console.log('✅ All critical validations passed!');
} else {
  console.log(`❌ Found ${validationErrors.length} critical error(s):`);
  validationErrors.forEach(error => console.log(`   ${error}`));
}

if (validationWarnings.length > 0) {
  console.log(`\n⚠️  Found ${validationWarnings.length} warning(s):`);
  validationWarnings.forEach(warning => console.log(`   ${warning}`));
}

console.log('\n🚀 Next Steps:');
console.log('1. Start the system: make up && make import && make activate');
console.log('2. Configure webhook URLs in platform developer consoles');
console.log('3. Run integration tests: npm test');
console.log('4. Monitor logs: make logs');

// Exit with appropriate code
process.exit(validationErrors.length > 0 ? 1 : 0);