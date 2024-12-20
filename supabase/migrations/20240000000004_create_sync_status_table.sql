-- Create sync_status table
CREATE TABLE IF NOT EXISTS public.sync_status (
    chatbot_id text PRIMARY KEY,
    last_synced_at timestamptz DEFAULT now(),
    last_sync_count integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sync_status ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow service role full access" ON public.sync_status
    FOR ALL
    USING (auth.jwt() IS NOT NULL)
    WITH CHECK (auth.jwt() IS NOT NULL);

-- Grant permissions
GRANT ALL ON public.sync_status TO service_role;
GRANT SELECT ON public.sync_status TO authenticated; 