-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.conversations (
    id TEXT PRIMARY KEY,
    chatbot_id TEXT NOT NULL,
    source TEXT NOT NULL,
    whatsapp_number TEXT,
    customer TEXT,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    min_score FLOAT,
    form_submission JSONB,
    country TEXT,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.daily_analytics (
    id TEXT PRIMARY KEY,
    chatbot_id TEXT NOT NULL,
    date DATE NOT NULL,
    total_conversations INTEGER NOT NULL DEFAULT 0,
    total_messages INTEGER NOT NULL DEFAULT 0,
    source_distribution JSONB NOT NULL DEFAULT '{}'::jsonb,
    avg_response_time_ms FLOAT NOT NULL DEFAULT 0,
    avg_conversation_length FLOAT NOT NULL DEFAULT 0,
    messages_by_hour JSONB NOT NULL DEFAULT '{}'::jsonb,
    bounce_rate FLOAT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(chatbot_id, date)
);

-- Add new columns to conversations table if they don't exist
DO $$ 
BEGIN
    -- Add min_score column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'conversations' AND column_name = 'min_score') THEN
        ALTER TABLE public.conversations ADD COLUMN min_score FLOAT;
    END IF;

    -- Add form_submission column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'conversations' AND column_name = 'form_submission') THEN
        ALTER TABLE public.conversations ADD COLUMN form_submission JSONB;
    END IF;

    -- Add country column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'conversations' AND column_name = 'country') THEN
        ALTER TABLE public.conversations ADD COLUMN country TEXT;
    END IF;

    -- Add last_message_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'conversations' AND column_name = 'last_message_at') THEN
        ALTER TABLE public.conversations ADD COLUMN last_message_at TIMESTAMPTZ;
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;

-- Create or replace indexes
DROP INDEX IF EXISTS idx_conversations_chatbot_id;
DROP INDEX IF EXISTS idx_conversations_created_at;
DROP INDEX IF EXISTS idx_conversations_source;
DROP INDEX IF EXISTS idx_daily_analytics_chatbot_id_date;

CREATE INDEX idx_conversations_chatbot_id ON public.conversations(chatbot_id);
CREATE INDEX idx_conversations_created_at ON public.conversations(created_at);
CREATE INDEX idx_conversations_source ON public.conversations(source);
CREATE INDEX idx_daily_analytics_chatbot_id_date ON public.daily_analytics(chatbot_id, date);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create or replace triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
DROP TRIGGER IF EXISTS update_daily_analytics_updated_at ON public.daily_analytics;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_analytics_updated_at
    BEFORE UPDATE ON public.daily_analytics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow admin read access" ON public.users;
DROP POLICY IF EXISTS "Allow admin read access" ON public.conversations;
DROP POLICY IF EXISTS "Allow service write access" ON public.conversations;
DROP POLICY IF EXISTS "Allow admin read access" ON public.daily_analytics;

-- Disable RLS for service role
ALTER TABLE public.conversations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin-only access
CREATE POLICY "Allow admin read access" ON public.users
    FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'email' LIKE '%@your-company.com');

-- Policies for conversations table
CREATE POLICY "Allow admin read access" ON public.conversations
    FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'email' LIKE '%@your-company.com');

CREATE POLICY "Allow service write access" ON public.conversations
    FOR ALL  -- This covers INSERT, UPDATE, and DELETE
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow admin read access" ON public.daily_analytics
    FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'email' LIKE '%@your-company.com');

-- Grant permissions
GRANT ALL ON public.conversations TO service_role;  -- Grant all permissions to service role
GRANT SELECT ON public.conversations TO authenticated;  -- Read-only for authenticated users
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.daily_analytics TO authenticated;
  