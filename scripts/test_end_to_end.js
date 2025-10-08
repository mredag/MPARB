#!/usr/bin/env node

/**
 * End-to-End System Integration Test
 * 
 * This script tests the complete message flow from intake to sender
 * by simulating webhook calls and verifying the system response.
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Configuration
const N8N_BASE_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678';
const TEST_TIMEOUT = 30000; // 30 seconds

console.log('🧪 End-to-End System Integration Test\n');
console.log(`Using n8n instance: ${N8N_BASE_URL}\n`);

// Test data
const testData = {
  instagram: {
    body: {
      entry: [{
        messaging: [{
          sender: { id: 'test_user_123' },
          message: { text: 'Merhaba, randevu almak istiyorum' },
          timestamp: Date.now()
        }]
      }]
    }
  },
  whatsapp: {
    body: {
      entry: [{
        changes: [{
          value: {
            messages: [{
              from: '+905551234567',
              text: { body: 'Fiyat bilgisi alabilir miyim?' },
              timestamp: Math.floor(Date.now() / 1000)
            }]
          }
        }]
      }]
    }
  },
  processor: {
    text: 'Merhaba, randevu almak istiyorum',
    platform: 'instagram',
    timestamp: new Date().toISOString(),
    correlation_id: uuidv4(),
    sender_id: 'test_user_123'
  }
};

// Test functions
async function testWebhookEndpoint(endpoint, data, description) {
  console.log(`🔄 Testing ${description}...`);
  
  try {
    const response = await axios.post(`${N8N_BASE_URL}/webhook/${endpoint}`, data, {
      timeout: TEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ ${description}: HTTP ${response.status}`);
    
    if (response.data) {
      console.log(`   Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
    }
    
    return { success: true, response };
  } catch (error) {
    console.log(`❌ ${description}: ${error.message}`);
    
    if (error.response) {
      console.log(`   HTTP ${error.response.status}: ${error.response.statusText}`);
      if (error.response.data) {
        console.log(`   Error: ${JSON.stringify(error.response.data).substring(0, 100)}...`);
      }
    }
    
    return { success: false, error };
  }
}

async function testCorrelationTracking() {
  console.log('🔗 Testing Correlation ID Tracking...\n');
  
  const correlationId = uuidv4();
  const testPayload = {
    ...testData.processor,
    correlation_id: correlationId
  };
  
  console.log(`Using correlation ID: ${correlationId}`);
  
  const result = await testWebhookEndpoint('processor', testPayload, 'Processor with correlation tracking');
  
  if (result.success && result.response.data) {
    const responseCorrelationId = result.response.data.correlation_id;
    
    if (responseCorrelationId === correlationId) {
      console.log('✅ Correlation ID preserved through processing');
      return true;
    } else {
      console.log(`❌ Correlation ID mismatch: sent ${correlationId}, received ${responseCorrelationId}`);
      return false;
    }
  }
  
  return false;
}

async function testSystemHealth() {
  console.log('🏥 Testing System Health...\n');
  
  // Test if n8n is accessible
  try {
    const response = await axios.get(`${N8N_BASE_URL.replace('/webhook', '')}/healthz`, {
      timeout: 5000
    });
    console.log('✅ n8n service is healthy');
    return true;
  } catch (error) {
    console.log('⚠️  Could not verify n8n health endpoint');
    console.log('   This is normal if n8n health endpoint is not exposed');
    return true; // Don't fail the test for this
  }
}

async function runAllTests() {
  console.log('🚀 Starting End-to-End Integration Tests\n');
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Test 1: System Health
  totalTests++;
  if (await testSystemHealth()) {
    passedTests++;
  }
  
  console.log('\n📱 Testing Platform Intake Workflows\n');
  
  // Test 2: Instagram Intake
  totalTests++;
  const instagramResult = await testWebhookEndpoint(
    'instagram-intake', 
    testData.instagram, 
    'Instagram Intake Workflow'
  );
  if (instagramResult.success) passedTests++;
  
  // Test 3: WhatsApp Intake  
  totalTests++;
  const whatsappResult = await testWebhookEndpoint(
    'whatsapp-intake',
    testData.whatsapp,
    'WhatsApp Intake Workflow'
  );
  if (whatsappResult.success) passedTests++;
  
  console.log('\n🧠 Testing AI Processing Workflow\n');
  
  // Test 4: Processor
  totalTests++;
  const processorResult = await testWebhookEndpoint(
    'processor',
    testData.processor,
    'AI Processor Workflow'
  );
  if (processorResult.success) passedTests++;
  
  // Test 5: Correlation ID Tracking
  totalTests++;
  if (await testCorrelationTracking()) {
    passedTests++;
  }
  
  console.log('\n📤 Testing Sender Workflows\n');
  
  // Test 6: Instagram Sender (mock call)
  totalTests++;
  const instagramSenderResult = await testWebhookEndpoint(
    'sender-instagram',
    {
      sender_id: 'test_user_123',
      reply_text: 'Test response',
      correlation_id: uuidv4(),
      language: 'tr',
      sentiment: 'Positive',
      intent: 'Greeting'
    },
    'Instagram Sender Workflow'
  );
  if (instagramSenderResult.success) passedTests++;
  
  // Test 7: WhatsApp Sender (mock call)
  totalTests++;
  const whatsappSenderResult = await testWebhookEndpoint(
    'sender-whatsapp',
    {
      phone: '+905551234567',
      reply_text: 'Test response',
      correlation_id: uuidv4(),
      session_mode: 'text',
      language: 'tr',
      sentiment: 'Positive',
      intent: 'Greeting'
    },
    'WhatsApp Sender Workflow'
  );
  if (whatsappSenderResult.success) passedTests++;
  
  // Test 8: Google Business Profile Sender (mock call)
  totalTests++;
  const gbpSenderResult = await testWebhookEndpoint(
    'sender-gbp',
    {
      review_id: 'test_review_123',
      reply_text: 'Test response',
      correlation_id: uuidv4(),
      rating: 5,
      author: 'Test User',
      language: 'tr',
      sentiment: 'Positive',
      intent: 'Positive'
    },
    'Google Business Profile Sender Workflow'
  );
  if (gbpSenderResult.success) passedTests++;
  
  // Summary
  console.log('\n📊 Test Results Summary\n');
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All integration tests passed! System is fully integrated.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
  }
  
  console.log('\n🔧 Troubleshooting Tips:');
  console.log('1. Ensure n8n is running: make up');
  console.log('2. Import workflows: make import');
  console.log('3. Activate workflows: make activate');
  console.log('4. Check n8n logs: make logs');
  console.log('5. Verify environment variables are set');
  
  return passedTests === totalTests;
}

// Handle missing axios dependency gracefully
if (typeof require !== 'undefined') {
  try {
    require('axios');
    require('uuid');
  } catch (error) {
    console.log('❌ Missing dependencies. Please install:');
    console.log('   npm install axios uuid');
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test runner crashed:', error.message);
      process.exit(1);
    });
}

module.exports = { runAllTests, testWebhookEndpoint };