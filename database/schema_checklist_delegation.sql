-- ==============================================================================
-- SAINY GARG MASTER APPLICATION: COMPLETE UNIFIED DATABASE SCHEMA
-- PostgreSQL / Supabase Schema Definition
-- Includes all tables, correct column types, triggers, indexes, and permissive RLS
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- HELPER FUNCTION: AUTO-UPDATE updated_at TIMESTAMP
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 1. TABLE: users (Unified Users Table - Compatible with both Systems)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE,
    user_name VARCHAR(200),                              -- Legacy Checklist compatibility
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'User',
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    department VARCHAR(150),
    designation VARCHAR(150),
    reported_by VARCHAR(150),
    user_access VARCHAR(255) DEFAULT 'all',
    can_self_assign BOOLEAN DEFAULT true,
    leave_date DATE,
    leave_end_date DATE,
    profile_image TEXT,
    avatar_color VARCHAR(50) DEFAULT 'bg-[#5B172E]',
    allowed_pages JSONB NOT NULL DEFAULT '["dashboard", "orders", "stages"]'::jsonb,
    allowed_stages JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all needed columns exist on users if table already created
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_name VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(150);
ALTER TABLE users ADD COLUMN IF NOT EXISTS designation VARCHAR(150);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reported_by VARCHAR(150);
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_access VARCHAR(255) DEFAULT 'all';
ALTER TABLE users ADD COLUMN IF NOT EXISTS can_self_assign BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS leave_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS leave_end_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Auto-sync username and user_name
CREATE OR REPLACE FUNCTION sync_user_name_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_name IS NULL OR NEW.user_name = '' THEN
        NEW.user_name = COALESCE(NEW.name, NEW.username);
    END IF;
    IF NEW.username IS NULL OR NEW.username = '' THEN
        NEW.username = NEW.user_name;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_users_names ON users;
CREATE TRIGGER trg_sync_users_names
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_name_fields();

-- ==============================================================================
-- 2. TABLE: checklist (Recurring & single checklist tasks)
-- Note: admin_done is BOOLEAN so Supabase .is('admin_done', false) succeeds!
-- ==============================================================================
CREATE TABLE IF NOT EXISTS checklist (
    id BIGSERIAL PRIMARY KEY,
    task_id VARCHAR(100),
    department VARCHAR(150),
    given_by VARCHAR(150),
    name VARCHAR(200),
    task_description TEXT,
    task_start_date DATE,
    planned_date DATE,
    submission_date TIMESTAMPTZ,
    frequency VARCHAR(50) DEFAULT 'Daily',
    duration VARCHAR(50),
    enable_reminder BOOLEAN DEFAULT false,
    require_attachment BOOLEAN DEFAULT false,
    audio_url TEXT,
    instruction_attachment_url TEXT,
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    admin_done BOOLEAN DEFAULT false,
    remark TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- In case table already exists with VARCHAR admin_done, alter column type
ALTER TABLE checklist ALTER COLUMN admin_done TYPE BOOLEAN USING (
    CASE 
        WHEN admin_done::text ILIKE 'true' OR admin_done::text ILIKE 'yes' OR admin_done::text ILIKE 'done' OR admin_done::text ILIKE 'approved' THEN true 
        ELSE false 
    END
);
ALTER TABLE checklist ALTER COLUMN admin_done SET DEFAULT false;

-- ==============================================================================
-- 3. TABLE: delegation (Delegated tasks)
-- Note: admin_done is BOOLEAN so .is('admin_done', false) and IS FALSE succeed!
-- ==============================================================================
CREATE TABLE IF NOT EXISTS delegation (
    id BIGSERIAL PRIMARY KEY,
    task_id VARCHAR(100),
    department VARCHAR(150),
    given_by VARCHAR(150),
    name VARCHAR(200),
    task_description TEXT,
    task_start_date DATE,
    planned_date DATE,
    submission_date TIMESTAMPTZ,
    frequency VARCHAR(50) DEFAULT 'One Time',
    duration VARCHAR(50),
    enable_reminder BOOLEAN DEFAULT false,
    require_attachment BOOLEAN DEFAULT false,
    audio_url TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    admin_done BOOLEAN DEFAULT false,
    reason TEXT,
    next_extend_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- In case table already exists with VARCHAR admin_done, alter column type
ALTER TABLE delegation ALTER COLUMN admin_done TYPE BOOLEAN USING (
    CASE 
        WHEN admin_done::text ILIKE 'true' OR admin_done::text ILIKE 'yes' OR admin_done::text ILIKE 'done' OR admin_done::text ILIKE 'approved' THEN true 
        ELSE false 
    END
);
ALTER TABLE delegation ALTER COLUMN admin_done SET DEFAULT false;

-- ==============================================================================
-- 4. TABLE: delegation_done (Completed/history for delegations)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS delegation_done (
    id BIGSERIAL PRIMARY KEY,
    task_id VARCHAR(100),
    department VARCHAR(150),
    given_by VARCHAR(150),
    name VARCHAR(200),
    task_description TEXT,
    planned_date DATE,
    submission_date TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'Completed',
    admin_done BOOLEAN DEFAULT true,
    remark TEXT,
    audio_url TEXT,
    attachment_url TEXT,
    completion_time TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. TABLE: maintenance_tasks (Maintenance Schedule module)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS maintenance_tasks (
    id BIGSERIAL PRIMARY KEY,
    task_id VARCHAR(100),
    machine_name VARCHAR(150),
    machine_area VARCHAR(150),
    part_name VARCHAR(255),
    part_area VARCHAR(255),
    name VARCHAR(200),
    given_by VARCHAR(150),
    department VARCHAR(150),
    priority VARCHAR(50) DEFAULT 'Normal',
    task_description TEXT,
    task_start_date TIMESTAMPTZ,
    planned_date DATE,
    submission_date TIMESTAMPTZ,
    duration VARCHAR(50),
    frequency VARCHAR(50) DEFAULT 'one-time',
    status VARCHAR(50) DEFAULT 'Pending',
    admin_done BOOLEAN DEFAULT false,
    enable_reminder BOOLEAN DEFAULT false,
    require_attachment BOOLEAN DEFAULT false,
    audio_url TEXT,
    remarks TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. TABLE: repair_tasks (Repair Tickets module)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS repair_tasks (
    id BIGSERIAL PRIMARY KEY,
    task_id VARCHAR(100),
    machine_name VARCHAR(150),
    machine_area VARCHAR(150),
    part_name VARCHAR(255),
    issue_description TEXT,
    filled_by VARCHAR(150),
    assigned_person VARCHAR(150),
    department VARCHAR(150),
    priority VARCHAR(50) DEFAULT 'Normal',
    status VARCHAR(50) DEFAULT 'Pending',
    admin_done BOOLEAN DEFAULT false,
    audio_url TEXT,
    image_url TEXT,
    submission_date TIMESTAMPTZ,
    solution_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. TABLE: ea_tasks & ea_tasks_done (EA Tasks module)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS ea_tasks (
    id BIGSERIAL PRIMARY KEY,
    task_id VARCHAR(100),
    task_description TEXT,
    doer_name VARCHAR(200),
    given_by VARCHAR(150),
    department VARCHAR(150),
    planned_date DATE,
    submission_date TIMESTAMPTZ,
    priority VARCHAR(50) DEFAULT 'Normal',
    status VARCHAR(50) DEFAULT 'Pending',
    admin_done BOOLEAN DEFAULT false,
    remarks TEXT,
    audio_url TEXT,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ea_tasks_done (
    id BIGSERIAL PRIMARY KEY,
    task_id VARCHAR(100),
    task_description TEXT,
    doer_name VARCHAR(200),
    given_by VARCHAR(150),
    department VARCHAR(150),
    planned_date DATE,
    submission_date TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'done',
    admin_done BOOLEAN DEFAULT false,
    reason TEXT,
    next_extend_date DATE,
    remarks TEXT,
    audio_url TEXT,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. TABLE: holidays & working_day_calender
-- ==============================================================================
CREATE TABLE IF NOT EXISTS holidays (
    id BIGSERIAL PRIMARY KEY,
    holiday_date DATE NOT NULL,
    holiday_name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'Public Holiday',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS working_day_calender (
    id BIGSERIAL PRIMARY KEY,
    working_date DATE NOT NULL,
    reason TEXT,
    created_by VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. TABLE: assign_from & dropdown_options
-- ==============================================================================
CREATE TABLE IF NOT EXISTS assign_from (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    department VARCHAR(150),
    role VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dropdown_options (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(100),
    value VARCHAR(255),
    machine_name VARCHAR(150),
    machine_area VARCHAR(150),
    part_name VARCHAR(150),
    priority VARCHAR(50),
    task_priority VARCHAR(50),
    project_type VARCHAR(100),
    task_status VARCHAR(50),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. TABLE: notifications, user_notifications, whatsapp_logs
-- ==============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    action_url TEXT,
    target_role VARCHAR(100),
    target_user_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_notifications (
    id BIGSERIAL PRIMARY KEY,
    notification_id BIGINT REFERENCES notifications(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_logs (
    id BIGSERIAL PRIMARY KEY,
    recipient_phone VARCHAR(50) NOT NULL,
    recipient_name VARCHAR(150),
    message_content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Sent',
    task_id VARCHAR(100),
    response_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 11. TABLE: orders & order_stage_history (Order to Delivery System)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    mobile VARCHAR(50) NOT NULL,
    city VARCHAR(100),
    design_name VARCHAR(255) NOT NULL,
    size VARCHAR(50) DEFAULT 'Custom',
    delivery_date DATE,
    trial_date DATE,
    current_stage_id VARCHAR(100) NOT NULL DEFAULT 'material_check',
    current_stage_index INTEGER NOT NULL DEFAULT 0,
    created_by_user_id VARCHAR(50),
    created_by_name VARCHAR(255),
    design_images JSONB DEFAULT '[]'::jsonb,
    inspiration_images JSONB DEFAULT '[]'::jsonb,
    measurements JSONB DEFAULT '{}'::jsonb,
    stage_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_stage_history (
    id BIGSERIAL PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    stage_id VARCHAR(100) NOT NULL,
    stage_name VARCHAR(255) NOT NULL,
    action VARCHAR(255),
    actor VARCHAR(255),
    notes TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 12. TABLES: vendors, customers, transporters, karigars, departments, tat_config
-- ==============================================================================
CREATE TABLE IF NOT EXISTS vendors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    contact_person VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    city VARCHAR(100),
    address TEXT,
    gst_no VARCHAR(50),
    rating VARCHAR(50) DEFAULT '⭐⭐⭐⭐⭐ Top Tier',
    terms VARCHAR(100) DEFAULT '15 Days Credit',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    city VARCHAR(100),
    address TEXT,
    category VARCHAR(100) DEFAULT 'VIP Bridal',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transporters (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    service_type VARCHAR(255) DEFAULT 'Priority Air Courier (Express 24-48h)',
    contact_person VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    hub_city VARCHAR(100),
    operating_routes TEXT DEFAULT 'Domestic Metros & Tier 1 Cities',
    tracking_url TEXT,
    avg_transit_time VARCHAR(100) DEFAULT '24-48 Hours',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS karigars (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) DEFAULT 'Senior Stitching Master (Blouses & Bodice Fitting)',
    unit VARCHAR(255) DEFAULT 'Central Atelier - Tailoring Floor 1',
    phone VARCHAR(50) NOT NULL,
    skill_grade VARCHAR(100) DEFAULT 'Grade A+ (Master Artisan)',
    status VARCHAR(50) DEFAULT 'Active (On Duty)',
    daily_capacity VARCHAR(100) DEFAULT '1 Garment / Day',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    head_name VARCHAR(255),
    contact_email VARCHAR(255),
    staff_count INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'Active',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tat_config (
    id VARCHAR(50) PRIMARY KEY,
    stage_id VARCHAR(100) NOT NULL,
    stage_name VARCHAR(255) NOT NULL,
    stage_index INTEGER DEFAULT 1,
    standard_days NUMERIC(5,1) DEFAULT 2,
    standard_hours NUMERIC(6,1) DEFAULT 16,
    buffer_days NUMERIC(5,1) DEFAULT 1,
    max_sla_days NUMERIC(5,1) DEFAULT 3,
    department VARCHAR(255),
    priority VARCHAR(50) DEFAULT 'Normal',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 13. ENABLE ROW LEVEL SECURITY & OPEN ACCESS POLICIES
-- ==============================================================================
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'users', 'checklist', 'delegation', 'delegation_done',
        'maintenance_tasks', 'repair_tasks', 'ea_tasks', 'ea_tasks_done',
        'holidays', 'working_day_calender', 'assign_from', 'dropdown_options',
        'notifications', 'user_notifications', 'whatsapp_logs',
        'orders', 'order_stage_history', 'vendors', 'customers',
        'transporters', 'karigars', 'departments', 'tat_config'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE IF EXISTS %I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I;', 'allow_all_' || tbl, tbl);
        EXECUTE format('CREATE POLICY %I ON %I FOR ALL USING (true) WITH CHECK (true);', 'allow_all_' || tbl, tbl);
    END LOOP;
END $$;

-- ==============================================================================
-- 14. INITIAL ROOT ADMIN SEED
-- ==============================================================================
INSERT INTO users (
    id,
    username,
    user_name,
    password,
    name,
    email,
    role,
    is_admin,
    status,
    allowed_pages,
    avatar_color
) VALUES (
    'USR-ADMIN',
    'admin',
    'Sainy Garg',
    'admin123',
    'Sainy Garg',
    'admin@sainygargcouture.com',
    'Admin',
    TRUE,
    'active',
    '["dashboard", "orders", "stages", "settings"]'::jsonb,
    'bg-[#5B172E]'
) ON CONFLICT (id) DO UPDATE SET
    user_name = EXCLUDED.user_name,
    status = 'active';

-- Seed assign_from with default admin so assign_from warning disappears
INSERT INTO assign_from (name, department, role, status)
SELECT 'Sainy Garg', 'Management', 'Admin', 'Active'
WHERE NOT EXISTS (SELECT 1 FROM assign_from WHERE name = 'Sainy Garg');
