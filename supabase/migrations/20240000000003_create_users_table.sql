-- Drop existing table if it exists
DROP TABLE IF EXISTS public.users;

-- Create users table with correct column names
CREATE TABLE IF NOT EXISTS public.users (
    id text PRIMARY KEY,
    email text,
    first_name text,
    last_name text,
    image_url text,
    created_at bigint,
    updated_at timestamptz,
    last_sign_in_at timestamptz
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow service role full access" ON public.users
    FOR ALL
    USING (auth.jwt() IS NOT NULL)
    WITH CHECK (auth.jwt() IS NOT NULL);

-- Grant permissions
GRANT ALL ON public.users TO service_role;
GRANT SELECT ON public.users TO authenticated; 