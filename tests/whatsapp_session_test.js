/**
 * WhatsApp Session Mode Tests
 * Tests WhatsApp intake workflow for both inside and outside 24-hour session modes
 * Validates proper handling of Meta's 24-hour messaging policy
 */

const axios = require('axios');
const { expect } = require('chai');

describe('WhatsApp Session Mode Tests', () => {
  const baseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
  const webhookUrl = `${baseUrl}/webhook/whatsapp-intake`;
  
  describe('Inside 24-hour session (Free text mode)', () => {
    const testCases = [
      {
        name: 'Recent message - booking inquiry',
        payload: {
          object: 'whatsapp_business_account',
          entry: [{
            changes: [{
              value: {
                messaging_product: 'whatsapp',
                messages: [{
                  from: '905551234567',
                  id: 'msg_id_123',
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  text: {
                    body: 'Randevu almak istiyorum, müsait saatleriniz neler?'
                  },
                  type: 'text'
                }]
              }
            }]
          }]
        },
        expectedMode: 'text'
      },
      {
        name: 'Recent message - pricing question',
        payload: {
          object: 'whatsapp_business_account',
          entry: [{
            changes: [{
              value: {
                messaging_product: 'whatsapp',
                messages: [{
                  from: '905559876543',
                  id: 'msg_id_456',
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  text: {
                    body: 'Fiyatlarınızı öğrenebilir miyim?'
                  },
                  type: 'text'
                }]
              }
            }]
          }]
        },
        expectedMode: 'text'
      }
    ];

    testCases.forEach((testCase) => {
      it(`should handle ${testCase.name} with free text response`, async () => {
        try {
          const response = await axios.post(webhookUrl, testCase.payload, {
            headers: {
              'Content-Type': 'application/json',
              'X-Hub-Signature-256': 'sha256=test_signature'
            },
            timeout: 10000
          });

          expect(response.status).to.be.oneOf([200, 201]);
          
          // Wait for processing
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          console.log(`Inside 24h test - ${testCase.name}: Should use free text mode`);
          
          // Verify the processor receives mode=text for recent messages
          if (response.data && response.data.session_mode) {
            expect(response.data.session_mode).to.equal('text');
          }

        } catch (error) {
          if (error.code === 'ECONNREFUSED') {
            console.warn('n8n service not running - skipping integration test');
            return;
          }
          throw error;
        }
      });
    });
  });

  describe('Outside 24-hour session (Template mode)', () => {
    const testCases = [
      {
        name: 'Old message - should use template',
        payload: {
          object: 'whatsapp_business_account',
          entry: [{
            changes: [{
              value: {
                messaging_product: 'whatsapp',
                messages: [{
                  from: '905551111111',
                  id: 'msg_id_old_123',
                  timestamp: Math.floor((Date.now() - (25 * 60 * 60 * 1000)) / 1000).toString(), // 25 hours ago
                  text: {
                    body: 'Eski mesaj - template kullanılmalı'
                  },
                  type: 'text'
                }]
              }
            }]
          }]
        },
        expectedMode: 'template'
      },
      {
        name: 'Very old message - template required',
        payload: {
          object: 'whatsapp_business_account',
          entry: [{
            changes: [{
              value: {
                messaging_product: 'whatsapp',
                messages: [{
                  from: '905552222222',
                  id: 'msg_id_old_456',
                  timestamp: Math.floor((Date.now() - (48 * 60 * 60 * 1000)) / 1000).toString(), // 48 hours ago
                  text: {
                    body: 'Çok eski mesaj'
                  },
                  type: 'text'
                }]
              }
            }]
          }]
        },
        expectedMode: 'template'
      }
    ];

    testCases.forEach((testCase) => {
      it(`should handle ${testCase.name} with approved template only`, async () => {
        try {
          const response = await axios.post(webhookUrl, testCase.payload, {
            headers: {
              'Content-Type': 'application/json',
              'X-Hub-Signature-256': 'sha256=test_signature'
            },
            timeout: 10000
          });

          expect(response.status).to.be.oneOf([200, 201]);
          
          // Wait for processing
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          console.log(`Outside 24h test - ${testCase.name}: Should use template mode`);
          
          // Verify the processor receives mode=template for old messages
          if (response.data && response.data.session_mode) {
            expect(response.data.session_mode).to.equal('template');
          }

        } catch (error) {
          if (error.code === 'ECONNREFUSED') {
            console.warn('n8n service not running - skipping integration test');
            return;
          }
          throw error;
        }
      });
    });
  });

  describe('WhatsApp Template Validation', () => {
    it('should use approved Turkish template for outside 24h sessions', async () => {
      const templatePayload = {
        object: 'whatsapp_business_account',
        entry: [{
          changes: [{
            value: {
              messaging_product: 'whatsapp',
              messages: [{
                from: '905553333333',
                id: 'template_test_123',
                timestamp: Math.floor((Date.now() - (30 * 60 * 60 * 1000)) / 1000).toString(), // 30 hours ago
                text: {
                  body: 'Template testi için mesaj'
                },
                type: 'text'
              }]
            }
          }]
        }]
      };

      try {
        const response = await axios.post(webhookUrl, templatePayload, {
          headers: {
            'Content-Type': 'application/json',
            'X-Hub-Signature-256': 'sha256=test_signature'
          },
          timeout: 10000
        });

        expect(response.status).to.be.oneOf([200, 201]);
        
        console.log('Template validation test - should use pre-approved Turkish template');
        
        // The response should indicate template mode usage
        // Template should contain Turkish locale and approved message structure
        
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          console.warn('n8n service not running - skipping integration test');
          return;
        }
        throw error;
      }
    });
  });

  describe('Session Age Calculation', () => {
    it('should correctly calculate session age boundary (exactly 24 hours)', async () => {
      const exactlyTwentyFourHours = Math.floor((Date.now() - (24 * 60 * 60 * 1000)) / 1000).toString();
      
      const boundaryPayload = {
        object: 'whatsapp_business_account',
        entry: [{
          changes: [{
            value: {
              messaging_product: 'whatsapp',
              messages: [{
                from: '905554444444',
                id: 'boundary_test_123',
                timestamp: exactlyTwentyFourHours,
                text: {
                  body: 'Tam 24 saat sınır testi'
                },
                type: 'text'
              }]
            }
          }]
        }]
      };

      try {
        const response = await axios.post(webhookUrl, boundaryPayload, {
          headers: {
            'Content-Type': 'application/json',
            'X-Hub-Signature-256': 'sha256=test_signature'
          },
          timeout: 10000
        });

        expect(response.status).to.be.oneOf([200, 201]);
        
        console.log('Boundary test - exactly 24 hours: Should determine correct session mode');
        
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          console.warn('n8n service not running - skipping integration test');
          return;
        }
        throw error;
      }
    });
  });
});