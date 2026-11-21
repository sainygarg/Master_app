// ============================================================================
// SQL SCHEMA FOR SUPABASE (Designs & Storage Bucket Setup)
// Execute this in the Supabase SQL Editor:
// https://supabase.com/dashboard/project/cagibmportrxcvoerutv/sql
// ============================================================================

-- 1. Ensure the order_delivery_masters table exists
CREATE TABLE IF NOT EXISTS public.order_delivery_masters (
    id TEXT NOT NULL,
    kind TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (kind, id)
);

-- Index for high-speed queries by kind (e.g. kind = 'design')
CREATE INDEX IF NOT EXISTS idx_order_delivery_masters_kind 
ON public.order_delivery_masters(kind);

-- GIN Index for searching SKU, name, or category inside the jsonb data
CREATE INDEX IF NOT EXISTS idx_order_delivery_masters_data 
ON public.order_delivery_masters USING GIN (data);

-- 2. Create the Public Storage Bucket for High-Res Design Images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'design-assets',
    'design-assets',
    true,
    52428800, -- 50 MB limit per image to support uncompressed high-res couture shots
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/avif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 52428800;

-- 3. Storage Policies (Allow public read & authenticated/anon uploads)
DO $$
BEGIN
    -- Public Read Policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
          AND tablename = 'objects' 
          AND policyname = 'Public Access for Design Assets'
    ) THEN
        CREATE POLICY "Public Access for Design Assets"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'design-assets');
    END IF;

    -- Insert/Upload Policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
          AND tablename = 'objects' 
          AND policyname = 'Allow Uploads to Design Assets'
    ) THEN
        CREATE POLICY "Allow Uploads to Design Assets"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'design-assets');
    END IF;

    -- Update/Delete Policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
          AND tablename = 'objects' 
          AND policyname = 'Allow Updates to Design Assets'
    ) THEN
        CREATE POLICY "Allow Updates to Design Assets"
        ON storage.objects FOR UPDATE
        USING (bucket_id = 'design-assets');
    END IF;
END $$;
