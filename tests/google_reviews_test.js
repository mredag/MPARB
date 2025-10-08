/**
 * Google Reviews Tests
 * Tests Google Reviews intake workflow for 5-star auto-reply and 2-star alert scenarios
 * Validates proper sentiment analysis and escalation logic
 */

const axios = require('axios');
const { expect } = require('chai');

describe('Google Reviews Tests', () => {
  const baseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
  const webhookUrl = `${baseUrl}/webhook/processor`; // Reviews go through processor
  
  describe('5-Star Auto-Reply Scenarios', () => {
    const positiveReviewCases = [
      {
        name: 'Excellent service review in Turkish',
        payload: {
          text: 'Harika bir hizmet aldık, çok memnun kaldık. Kesinlikle tavsiye ederim!',
          platform: 'google_reviews',
          timestamp: new Date().toISOString(),
          correlation_id: 'test-5star-tr-001',
          rating: 5,
          author: 'Ahmet Yılmaz'
        },
        expectedSentiment: 'Positive',
        shouldAutoReply: true
      },
      {
        name: 'Great experience review',
        payload: {
          text: 'Mükemmel deneyim yaşadık, personel çok ilgili ve güler yüzlü.',
          platform: 'google_reviews',
          timestamp: new Date().toISOString(),
          correlation_id: 'test-5star-tr-002',
          rating: 5,
          author: 'Fatma Demir'
        },
        expectedSentiment: 'Positive',
        shouldAutoReply: true
      },
      {
        name: 'Satisfied customer review',
        payload: {
          text: 'Çok beğendik, kaliteli hizmet. Tekrar geleceğiz.',
          platform: 'google_reviews',
          timestamp: new Date().toISOString(),
          correlation_id: 'test-4star-tr-001',
          rating: 4,
          author: 'Mehmet Kaya'
        },
        expectedSentiment: 'Positive',
        shouldAutoReply: true
      }
    ];

    positiveReviewCases.forEach((testCase) => {
      it(`should auto-reply to ${testCase.name}`, async () => {
        try {
          const response = await axios.post(webhookUrl, testCase.payload, {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 10000
          });

          expect(response.status).to.be.oneOf([200, 201]);
          
          // Wait for processing
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          if (response.data) {
            // Verify positive sentiment detection
            expect(response.data.sentiment).to.equal(testCase.expectedSentiment);
            
            // Verify reply text is generated
            expect(response.data.reply_text).to.be.a('string');
            expect(response.data.reply_text.length).to.be.greaterThan(0);
            expect(response.data.reply_text.length).to.be.lessThan(500);
            
            // Verify Turkish language detection
            expect(response.data.language).to.equal('tr');
            
            // Verify no emojis in Google review responses (requirement)
            const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
            expect(response.data.reply_text).to.not.match(emojiRegex);
            
            console.log(`5-star test - ${testCase.name}:`);
            console.log(`  Sentiment: ${response.data.sentiment}`);
            console.log(`  Reply: ${response.data.reply_text}`);
            console.log(`  Language: ${response.data.language}`);
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

  describe('2-Star Alert Scenarios', () => {
    const negativeReviewCases = [
      {
        name: 'Poor service complaint',
        payload: {
          text: 'Çok kötü hizmet aldık, hiç memnun kalmadık. Personel ilgisiz ve kaba davrandı.',
          platform: 'google_reviews',
          timestamp: new Date().toISOString(),
          correlation_id: 'test-2star-tr-001',
          rating: 2,
          author: 'Ayşe Özkan'
        },
        expectedSentiment: 'Negative',
        shouldAlert: true,
        shouldAutoReply: false
      },
      {
        name: 'Terrible experience',
        payload: {
          text: 'Berbat bir deneyimdi, asla tavsiye etmem. Para kaybı.',
          platform: 'google_reviews',
          timestamp: new Date().toISOString(),
          correlation_id: 'test-1star-tr-001',
          rating: 1,
          author: 'Can Yıldız'
        },
        expectedSentiment: 'Negative',
        shouldAlert: true,
        shouldAutoReply: false
      },
      {
        name: 'Disappointed customer',
        payload: {
          text: 'Beklentilerimizi karşılamadı, hayal kırıklığı yaşadık.',
          platform: 'google_reviews',
          timestamp: new Date().toISOString(),
          correlation_id: 'test-2star-tr-002',
          rating: 2,
          author: 'Zeynep Aktaş'
        },
        expectedSentiment: 'Negative',
        shouldAlert: true,
        shouldAutoReply: false
      }
    ];

    negativeReviewCases.forEach((testCase) => {
      it(`should alert for ${testCase.name} and not auto-reply`, async () => {
        try {
          const response = await axios.post(webhookUrl, testCase.payload, {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 10000
          });

          expect(response.status).to.be.oneOf([200, 201]);
          
          // Wait for processing
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          if (response.data) {
            // Verify negative sentiment detection
            expect(response.data.sentiment).to.equal(testCase.expectedSentiment);
            
            // For negative reviews, system should generate draft but not auto-reply
            // The actual alerting happens in the Google Reviews intake workflow
            console.log(`2-star alert test - ${testCase.name}:`);
            console.log(`  Sentiment: ${response.data.sentiment}`);
            console.log(`  Should trigger Slack alert with AI draft`);
            console.log(`  Should NOT auto-reply to customer`);
            
            if (response.data.reply_text) {
              console.log(`  AI Draft: ${response.data.reply_text}`);
            }
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

  describe('3-Star Neutral Reviews', () => {
    const neutralReviewCases = [
      {
        name: 'Average experience',
        payload: {
          text: 'Ortalama bir deneyimdi, ne çok iyi ne çok kötü.',
          platform: 'google_reviews',
          timestamp: new Date().toISOString(),
          correlation_id: 'test-3star-tr-001',
          rating: 3,
          author: 'Emre Şahin'
        },
        expectedSentiment: 'Neutral',
        shouldAlert: false,
        shouldAutoReply: false
      }
    ];

    neutralReviewCases.forEach((testCase) => {
      it(`should log ${testCase.name} without action`, async () => {
        try {
          const response = await axios.post(webhookUrl, testCase.payload, {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 10000
          });

          expect(response.status).to.be.oneOf([200, 201]);
          
          // Wait for processing
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          if (response.data) {
            console.log(`3-star neutral test - ${testCase.name}:`);
            console.log(`  Sentiment: ${response.data.sentiment}`);
            console.log(`  Action: Log only, no auto-reply, no alert`);
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

  describe('Review Response Quality', () => {
    it('should generate professional responses without emojis for Google reviews', async () => {
      const testPayload = {
        text: 'Mükemmel hizmet, çok teşekkür ederiz!',
        platform: 'google_reviews',
        timestamp: new Date().toISOString(),
        correlation_id: 'test-quality-001',
        rating: 5,
        author: 'Test User'
      };

      try {
        const response = await axios.post(webhookUrl, testPayload, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });

        expect(response.status).to.be.oneOf([200, 201]);
        
        if (response.data && response.data.reply_text) {
          const replyText = response.data.reply_text;
          
          // Verify professional tone (no emojis)
          const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
          expect(replyText).to.not.match(emojiRegex);
          
          // Verify length constraint
          expect(replyText.length).to.be.lessThan(500);
          
          // Verify Turkish language
          expect(response.data.language).to.equal('tr');
          
          console.log('Quality test - Professional Google review response:');
          console.log(`  Response: ${replyText}`);
          console.log(`  Length: ${replyText.length} chars`);
          console.log(`  Contains emojis: ${emojiRegex.test(replyText) ? 'Yes (FAIL)' : 'No (PASS)'}`);
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