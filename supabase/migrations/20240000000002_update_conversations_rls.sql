-- First, disable RLS
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.conversations;
DROP POLICY IF EXISTS "Enable insert for service role" ON public.conversations;
DROP POLICY IF EXISTS "Enable update for service role" ON public.conversations;

-- Create a policy for service role access (using is_service_role())
CREATE POLICY "Service role access" ON public.conversations
    FOR ALL
    USING (auth.jwt() IS NOT NULL)
    WITH CHECK (auth.jwt() IS NOT NULL);

-- Grant permissions
GRANT ALL ON public.conversations TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;

-- Re-enable RLS but allow service role to bypass
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations FORCE ROW LEVEL SECURITY;