-- ============================================================================
-- CLEANUP SCRIPT: REMOVE UNREQUIRED LEGACY TABLE
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/cagibmportrxcvoerutv/sql
-- ============================================================================

-- All data has been safely verified in:
-- - master_design (92 records)
-- - master_karigar (9 records)
-- - master_department (7 records)
-- - master_vendor, master_customer, master_transporter, master_tat

-- Drop the old unified legacy table
DROP TABLE IF EXISTS public.order_delivery_masters CASCADE;
