-- Storage bucket policies for 'image' bucket
-- Run this in Supabase SQL Editor to allow authenticated users to upload images

-- First, ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('image', 'image', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to read images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload to image bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from image bucket" ON storage.objects;

-- Policy 1: Allow authenticated users to INSERT (upload) to image bucket
CREATE POLICY "Allow authenticated upload to image bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'image');

-- Policy 2: Allow public to SELECT (read) from image bucket
CREATE POLICY "Allow public read from image bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'image');

-- Policy 3: Allow authenticated users to UPDATE their own objects
CREATE POLICY "Allow authenticated update in image bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'image')
WITH CHECK (bucket_id = 'image');

-- Policy 4: Allow authenticated users to DELETE their own objects
CREATE POLICY "Allow authenticated delete in image bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'image');

-- Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%image%'
ORDER BY policyname;
