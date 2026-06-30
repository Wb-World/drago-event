-- ── DATABASE SETUP FOR DRAGO EVENT ──

-- Create the bookings table if not exists
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seat_number INT NOT NULL,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    proof_image_url TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- ── RLS POLICIES FOR BOOKINGS ──

-- Policy: Allow anyone to view seat bookings (necessary for loading seat availability)
CREATE POLICY "Allow public select access on bookings" 
ON public.bookings
FOR SELECT 
TO public 
USING (true);

-- Policy: Allow public to insert new seat bookings
CREATE POLICY "Allow public insert access on bookings" 
ON public.bookings
FOR INSERT 
TO public 
WITH CHECK (true);

-- Policy: Allow public to update bookings (required for admin actions/approval if client updates it)
CREATE POLICY "Allow public update access on bookings" 
ON public.bookings
FOR UPDATE 
TO public 
USING (true);

-- ── STORAGE BUCKET CONFIGURATION FOR PROOFS ──

-- Create storage bucket for proof uploads (if not already existing)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('proofs', 'proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public read of files inside the 'proofs' bucket
CREATE POLICY "Allow public read of proofs" 
ON storage.objects
FOR SELECT 
TO public 
USING (bucket_id = 'proofs');

-- Policy: Allow public uploads inside the 'proofs' bucket
CREATE POLICY "Allow public upload of proofs" 
ON storage.objects
FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'proofs');

-- Policy: Allow public to update proof images (upsert support)
CREATE POLICY "Allow public update of proofs" 
ON storage.objects
FOR UPDATE 
TO public 
USING (bucket_id = 'proofs');
