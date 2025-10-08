-- Multi-Platform Auto Response System Database Schema
-- This script creates the database schema for logging messages, reviews, and errors
-- It will be automatically executed when PostgreSQL container starts

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Messages table for Instagram DMs and WhatsApp messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('instagram', 'whatsapp')),
    external_id VARCHAR(255),
    sender VARCHAR(255),
    language VARCHAR(10),
    sentiment VARCHAR(20) CHECK (sentiment IN ('Positive', 'Neutral', 'Negative') OR sentiment IS NULL),
    intent VARCHAR(50),
    template_id VARCHAR(100),
    response_time_ms INTEGER,
    outcome VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    correlation_id UUID NOT NULL
);

-- Reviews table for Google Business Profile reviews
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id VARCHAR(255) UNIQUE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    language VARCHAR(10),
    sentiment VARCHAR(20) CHECK (sentiment IN ('Positive', 'Neutral', 'Negative') OR sentiment IS NULL),
    template_id VARCHAR(100),
    response_time_ms INTEGER,
    outcome VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    correlation_id UUID NOT NULL
);

-- Errors table for workflow error logging
CREATE TABLE IF NOT EXISTS errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow VARCHAR(100),
    node VARCHAR(100),
    message TEXT,
    payload JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for messages table
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_platform ON messages(platform);
CREATE INDEX IF NOT EXISTS idx_messages_correlation_id ON messages(correlation_id);

-- Indexes for reviews table  
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_correlation_id ON reviews(correlation_id);

-- Indexes for errors table
CREATE INDEX IF NOT EXISTS idx_errors_created_at ON errors(created_at);

-- Insert some sample data for testing (optional)
-- This data will help verify the schema is working correctly

-- Sample messages
INSERT INTO messages (platform, external_id, sender, language, sentiment, intent, template_id, response_time_ms, outcome, correlation_id) 
VALUES 
    ('instagram', 'ig_msg_001', 'test_user_123', 'tr', 'Positive', 'Greeting', 'instagram_greeting_tr', 1500, 'sent', gen_random_uuid()),
    ('whatsapp', 'wa_msg_001', '+905551234567', 'tr', 'Neutral', 'Booking', 'whatsapp_booking_tr', 2200, 'sent', gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Sample reviews
INSERT INTO reviews (review_id, rating, language, sentiment, template_id, response_time_ms, outcome, correlation_id)
VALUES 
    ('gbp_review_001', 5, 'tr', 'Positive', 'google_positive_tr', 1800, 'sent', gen_random_uuid()),
    ('gbp_review_002', 2, 'tr', 'Negative', NULL, NULL, 'escalated', gen_random_uuid())
ON CONFLICT (review_id) DO NOTHING;

-- Sample error
INSERT INTO errors (workflow, node, message, payload)
VALUES 
    ('instagram_intake', 'webhook_validation', 'Invalid Meta verify token', '{"error": "token_mismatch", "received_token": "invalid"}')
ON CONFLICT DO NOTHING;

-- Display table information
\echo 'Database schema created successfully!'
\echo 'Tables created: messages, reviews, errors'
\echo 'Indexes created for optimal query performance'
\echo 'Sample data inserted for testing'

-- Show table counts
SELECT 'messages' as table_name, COUNT(*) as row_count FROM messages
UNION ALL
SELECT 'reviews' as table_name, COUNT(*) as row_count FROM reviews  
UNION ALL
SELECT 'errors' as table_name, COUNT(*) as row_count FROM errors;