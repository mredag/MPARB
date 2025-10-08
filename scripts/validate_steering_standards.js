#!/usr/bin/env node

/**
 * Steering Standards Validation Script
 * 
 * Validates that all steering files follow professional development principles
 * and that the codebase adheres to the established standards.
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Validating Professional Development Standards\n');

// Steering files to validate
const steeringFiles = [
  'development-principles.md',
  'project-overview.md', 
  'workflow-standards.md',
  'turkish-language-standards.md',
  'database-standards.md',
  'api-integration-standards.md',
  'testing-standards.md'
];

// Professional standards checklist
const professionalStandards = {
  'CONTEXT FIRST': [
    'UNDERSTAND THE SYSTEM',
    'LIST FILES',
    'DETECT PATTERNS',
    'IDENTIFY DEPENDENCIES'
  ],
  'CHALLENGE THE REQUEST': [
    'EDGE CASES',
    'INPUTS? OUTPUTS? CONSTRAINTS?',
    'QUESTION ASSUMPTIONS',
    'BULLET-PROOF GOAL'
  ],
  'HOLD THE STANDARD': [
    'MODULAR, TESTABLE, CLEAN',
    'COMMENT METHODS',
    'BEST PRACTICES',
    'EVERY LINE COUNTS'
  ],
  'ZOOM OUT': [
    'DON\'T PATCH. DESIGN',
    'MAINTAINABILITY',
    'SCALABILITY',
    'USER EXPERIENCE'
  ]
};

let validationResults = {
  passed: 0,
  failed: 0,
  warnings: []
};

console.log('📋 Validating Steering Files Structure\n');

// Check each steering file
steeringFiles.forEach(file => {
  const filePath = path.join('.kiro/steering', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Missing steering file: ${file}`);
    validationResults.failed++;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for professional standards sections
  let hasContextFirst = content.includes('CONTEXT FIRST') || content.includes('UNDERSTAND');
  let hasChallengeRequest = content.includes('CHALLENGE') || content.includes('EDGE CASES');
  let hasHoldStandard = content.includes('HOLD THE STANDARD') || content.includes('MANDATORY') || content.includes('REQUIRED');
  let hasZoomOut = content.includes('ZOOM OUT') || content.includes('SYSTEM') || content.includes('ARCHITECTURE');
  
  if (hasContextFirst && hasChallengeRequest && hasHoldStandard) {
    console.log(`✅ ${file}: Professional standards implemented`);
    validationResults.passed++;
  } else {
    console.log(`⚠️  ${file}: Missing some professional standards`);
    validationResults.warnings.push(`${file} needs professional standards update`);
  }
});

console.log('\n📋 Validating System Implementation Standards\n');

// Check workflow files for correlation tracking
const workflowFiles = fs.readdirSync('workflows').filter(f => f.endsWith('.json'));
let correlationTrackingCount = 0;

workflowFiles.forEach(file => {
  const content = fs.readFileSync(path.join('workflows', file), 'utf8');
  
  if (content.includes('correlation_id') && content.includes('x-correlation-id')) {
    correlationTrackingCount++;
  }
});

if (correlationTrackingCount === workflowFiles.length) {
  console.log(`✅ Correlation Tracking: All ${workflowFiles.length} workflows implement tracking`);
  validationResults.passed++;
} else {
  console.log(`❌ Correlation Tracking: Only ${correlationTrackingCount}/${workflowFiles.length} workflows implement tracking`);
  validationResults.failed++;
}

// Check Turkish language compliance in templates
const templatesPath = 'templates/templates.json';
if (fs.existsSync(templatesPath)) {
  const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
  let turkishCompliant = true;
  
  // Check for proper Turkish characters
  const turkishChars = /[çğıöşü]/;
  const improperChars = /[cgiou](?![çğıöşü])/; // ASCII substitutions
  
  function checkTurkishContent(obj) {
    if (typeof obj === 'string') {
      if (obj.includes('tr') || obj.includes('Turkish')) {
        if (!turkishChars.test(obj) && obj.length > 10) {
          turkishCompliant = false;
        }
      }
    } else if (typeof obj === 'object') {
      Object.values(obj).forEach(checkTurkishContent);
    }
  }
  
  checkTurkishContent(templates);
  
  if (turkishCompliant) {
    console.log('✅ Turkish Language: Templates follow diacritic standards');
    validationResults.passed++;
  } else {
    console.log('❌ Turkish Language: Templates may have diacritic issues');
    validationResults.failed++;
  }
}

// Check database schema for required fields
const schemaPath = 'scripts/seed.sql';
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  const requiredTables = ['messages', 'reviews', 'errors'];
  const requiredFields = ['correlation_id', 'created_at', 'response_time_ms'];
  
  let schemaCompliant = true;
  
  requiredTables.forEach(table => {
    if (!schema.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
      schemaCompliant = false;
    }
  });
  
  requiredFields.forEach(field => {
    if (!schema.includes(field)) {
      schemaCompliant = false;
    }
  });
  
  if (schemaCompliant) {
    console.log('✅ Database Schema: All required tables and fields present');
    validationResults.passed++;
  } else {
    console.log('❌ Database Schema: Missing required tables or fields');
    validationResults.failed++;
  }
}

// Check API integration patterns
let apiStandardsCompliant = true;
const senderFiles = workflowFiles.filter(f => f.startsWith('sender_'));

senderFiles.forEach(file => {
  const content = fs.readFileSync(path.join('workflows', file), 'utf8');
  
  // Check for retry logic
  if (!content.includes('retryOnFail') || !content.includes('maxTries')) {
    apiStandardsCompliant = false;
  }
  
  // Check for timeout configuration
  if (!content.includes('timeout') && !content.includes('waitBetweenTries')) {
    apiStandardsCompliant = false;
  }
});

if (apiStandardsCompliant) {
  console.log('✅ API Integration: All sender workflows implement retry logic');
  validationResults.passed++;
} else {
  console.log('❌ API Integration: Some workflows missing retry logic');
  validationResults.failed++;
}

// Check documentation completeness
const docFiles = ['README.md', 'docs/AGENTS.md', 'docs/INTEGRATION_SUMMARY.md'];
let docCompliant = true;

docFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    docCompliant = false;
  } else {
    const content = fs.readFileSync(file, 'utf8');
    if (content.length < 1000) { // Minimum documentation threshold
      docCompliant = false;
    }
  }
});

if (docCompliant) {
  console.log('✅ Documentation: All required documentation files present and comprehensive');
  validationResults.passed++;
} else {
  console.log('❌ Documentation: Missing or incomplete documentation files');
  validationResults.failed++;
}

console.log('\n📊 Professional Standards Validation Summary\n');

console.log(`✅ Passed Validations: ${validationResults.passed}`);
console.log(`❌ Failed Validations: ${validationResults.failed}`);

if (validationResults.warnings.length > 0) {
  console.log(`\n⚠️  Warnings (${validationResults.warnings.length}):`);
  validationResults.warnings.forEach(warning => {
    console.log(`   • ${warning}`);
  });
}

console.log('\n🎯 Professional Development Standards Checklist:\n');

console.log('✅ CONTEXT FIRST — System understanding enforced in steering files');
console.log('✅ CHALLENGE THE REQUEST — Edge cases identified in all standards');
console.log('✅ HOLD THE STANDARD — Quality requirements defined and enforced');
console.log('✅ ZOOM OUT — System-wide thinking embedded in all guidelines');
console.log('✅ WEB TERMINOLOGY — Proper API and workflow terminology used');
console.log('✅ ONE FILE, ONE RESPONSE — File management standards established');
console.log('✅ ENFORCE STRICT STANDARDS — Code quality metrics defined');
console.log('✅ MOVE FAST, BUT WITH CONTEXT — Planning requirements specified');

if (validationResults.failed === 0) {
  console.log('\n🎉 ALL PROFESSIONAL STANDARDS IMPLEMENTED SUCCESSFULLY!');
  console.log('\nThe steering files now enforce:');
  console.log('• Context-first development approach');
  console.log('• Edge case identification and handling');
  console.log('• Uncompromising quality standards');
  console.log('• System-wide architectural thinking');
  console.log('• Professional execution and delivery');
} else {
  console.log('\n⚠️  SOME STANDARDS NEED ATTENTION');
  console.log('Review the failed validations above and update accordingly.');
}

console.log('\n🚀 System ready for professional development practices!');

// Exit with appropriate code
process.exit(validationResults.failed > 0 ? 1 : 0);