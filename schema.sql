-- ====================================================================
-- DocToSheet AI: Production PostgreSQL / Supabase / Neon Schema
-- ====================================================================

-- 1. Users Table (Stores authentication, subscription tier & BYOK Gemini API key)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password_hash VARCHAR(255),
    is_pro BOOLEAN DEFAULT FALSE,
    pro_plan VARCHAR(64),
    pro_token VARCHAR(128),
    credits_used INTEGER DEFAULT 0,
    max_free_credits INTEGER DEFAULT 2,
    custom_api_key TEXT,
    stripe_customer_id VARCHAR(128),
    stripe_subscription_id VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Conversions Table (Stores structured spreadsheets, CSV/XLS data, and extraction metadata)
CREATE TABLE IF NOT EXISTS conversions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    document_type VARCHAR(64) NOT NULL,
    file_name VARCHAR(255),
    rows_count INTEGER DEFAULT 0,
    total_amount NUMERIC(15, 2),
    columns_json JSONB NOT NULL,
    rows_json JSONB NOT NULL,
    engine VARCHAR(64),
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_conversions_user_id ON conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_conversions_created_at ON conversions(created_at DESC);

-- Row Level Security (RLS) Policies (For Supabase / Postgres Auth)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;

-- Allow users to only view and update their own records
CREATE POLICY "Users can manage own record" ON users
    FOR ALL USING (id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can manage own conversions" ON conversions
    FOR ALL USING (user_id = current_setting('app.current_user_id', true));
