-- Drop existing table if it exists
DROP TABLE IF EXISTS public.daily_analytics;

-- Create daily_analytics table with correct structure
CREATE TABLE public.daily_analytics (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    chatbot_id text NOT NULL,
    date date NOT NULL,
    total_conversations integer DEFAULT 0,
    total_messages integer DEFAULT 0,
    source_distribution jsonb DEFAULT '{}'::jsonb,
    avg_response_time_ms integer DEFAULT 0,
    engagement_rate numeric DEFAULT 0,
    response_time_distribution jsonb DEFAULT '{"fast": 0, "medium": 0, "slow": 0}'::jsonb,
    conversation_length_distribution jsonb DEFAULT '{"short": 0, "medium": 0, "long": 0}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(chatbot_id, date)
);

-- Add RLS policies
ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.daily_analytics
    FOR SELECT
    TO authenticated
    USING (auth.jwt() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON public.daily_analytics
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON public.daily_analytics
    FOR UPDATE
    TO authenticated
    USING (auth.jwt() IS NOT NULL)
    WITH CHECK (auth.jwt() IS NOT NULL);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.daily_analytics TO authenticated; 