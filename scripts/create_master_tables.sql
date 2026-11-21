-- ============================================================================
-- MASTER TABLES SCHEMA FOR SAINY GARG COUTURE (TRANSACTIONAL WITH AUTO-ROLLBACK)
-- Only strictly required columns. Wrapped in BEGIN...COMMIT transaction.
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/cagibmportrxcvoerutv/sql
-- ============================================================================

BEGIN;

-- 1. DESIGNS MASTER TABLE (Only required columns for couture catalog)
CREATE TABLE IF NOT EXISTS public.master_design (
    id TEXT PRIMARY KEY,
    sku TEXT UNIQUE,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Couture',
    type TEXT,
    color TEXT,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. VENDORS MASTER TABLE
CREATE TABLE IF NOT EXISTS public.master_vendor (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    address TEXT,
    gst_no TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CUSTOMERS MASTER TABLE
CREATE TABLE IF NOT EXISTS public.master_customer (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    city TEXT,
    address TEXT,
    gst_no TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. DEPARTMENTS MASTER TABLE
CREATE TABLE IF NOT EXISTS public.master_department (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. STAGE TAT MASTER TABLE (Strictly Order to Delivery stages)
CREATE TABLE IF NOT EXISTS public.master_tat (
    id TEXT PRIMARY KEY,
    module_name TEXT NOT NULL DEFAULT 'Order to Delivery',
    stage_id TEXT,
    stage_name TEXT NOT NULL,
    stage_index INT,
    tat_type TEXT DEFAULT 'Days',
    time_value NUMERIC DEFAULT 2,
    assigned_person TEXT,
    assigned_person_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TRANSPORTERS MASTER TABLE
CREATE TABLE IF NOT EXISTS public.master_transporter (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. KARIGARS MASTER TABLE
CREATE TABLE IF NOT EXISTS public.master_karigar (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    status TEXT DEFAULT 'Active (On Duty)',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.master_design ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_vendor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_department ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_tat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_transporter ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_karigar ENABLE ROW LEVEL SECURITY;

-- POLICIES (Full CRUD access for authenticated and anonymous app users)
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT unnest(ARRAY[
            'master_design',
            'master_vendor',
            'master_customer',
            'master_department',
            'master_tat',
            'master_transporter',
            'master_karigar'
        ])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public access on %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Public access on %I" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl, tbl);
    END LOOP;
END $$;

-- If any statement fails above, PostgreSQL will automatically ROLLBACK everything.
-- Otherwise, commit the changes atomically.
COMMIT;
