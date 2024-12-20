-- Drop existing policies if they exist
DO $$ 
BEGIN
    -- Drop policies if they exist
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.conversations;
    DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.conversations;
    DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.conversations;
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.daily_analytics;
    DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.daily_analytics;
    DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.daily_analytics;
    DROP POLICY IF EXISTS "Enable all access for service role" ON public.conversations;
    DROP POLICY IF EXISTS "Allow admin read access" ON public.users;
    DROP POLICY IF EXISTS "Allow admin read access" ON public.conversations;
    DROP POLICY IF EXISTS "Allow service write access" ON public.conversations;
    DROP POLICY IF EXISTS "Allow admin read access" ON public.daily_analytics;
END $$;

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Enable read access for authenticated users" ON public.users
    FOR SELECT
    TO authenticated
    USING (auth.jwt() IS NOT NULL);

-- Create policies for conversations table
CREATE POLICY "Enable read access for authenticated users" ON public.conversations
    FOR SELECT
    TO authenticated
    USING (auth.jwt() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON public.conversations
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON public.conversations
    FOR UPDATE
    TO authenticated
    USING (auth.jwt() IS NOT NULL)
    WITH CHECK (auth.jwt() IS NOT NULL);

-- Create policies for daily_analytics table
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
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.daily_analytics TO authenticated;