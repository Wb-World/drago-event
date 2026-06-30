-- Create the app_users table
CREATE TABLE IF NOT EXISTS public.app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    name TEXT,
    email TEXT,
    mobile TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Allow public to select users (needed for login check)
CREATE POLICY "Allow public select access on app_users"
ON public.app_users
FOR SELECT
TO public
USING (true);

-- Allow public to insert new users (needed for registration)
CREATE POLICY "Allow public insert access on app_users"
ON public.app_users
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to update their own profiles
-- (Note: Using true here to simplify the prototype since we aren't using deep Supabase Auth sessions)
CREATE POLICY "Allow public update access on app_users"
ON public.app_users
FOR UPDATE
TO public
USING (true);

-- Remove UNIQUE constraint from seat_number to allow multiple bookings (e.g. rejected ones)
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_seat_number_key;
