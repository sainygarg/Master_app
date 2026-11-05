-- ==============================================================================
-- MASTER SETTING DATABASE SCHEMA
-- Clean Table Names (No prefixes: vendors, customers, users, transporters, karigars, departments, tat_config)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. DROP ALL EXISTING TABLES (Old prefixed & plain names)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS order_flow_vendors CASCADE;
DROP TABLE IF EXISTS order_flow_customers CASCADE;
DROP TABLE IF EXISTS order_flow_users CASCADE;
DROP TABLE IF EXISTS order_flow_transporters CASCADE;
DROP TABLE IF EXISTS order_flow_karigars CASCADE;
DROP TABLE IF EXISTS order_flow_departments CASCADE;
DROP TABLE IF EXISTS order_flow_tat_config CASCADE;

DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS transporters CASCADE;
DROP TABLE IF EXISTS karigars CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS tat_config CASCADE;

-- ------------------------------------------------------------------------------
-- 2. CREATE HELPER FUNCTION FOR UPDATED_AT TIMESTAMP
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 3. TABLE: vendors
-- ------------------------------------------------------------------------------
CREATE TABLE vendors (
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

CREATE TRIGGER update_vendors_modtime
    BEFORE UPDATE ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE INDEX idx_vendors_name ON vendors(name);
CREATE INDEX idx_vendors_phone ON vendors(phone);

-- ------------------------------------------------------------------------------
-- 4. TABLE: customers
-- ------------------------------------------------------------------------------
CREATE TABLE customers (
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

CREATE TRIGGER update_customers_modtime
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_phone ON customers(phone);

-- ------------------------------------------------------------------------------
-- 5. TABLE: users
-- ------------------------------------------------------------------------------
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'User',
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    allowed_pages JSONB NOT NULL DEFAULT '["dashboard", "orders", "stages"]'::jsonb,
    allowed_stages JSONB NOT NULL DEFAULT '[]'::jsonb,
    avatar_color VARCHAR(50) DEFAULT 'bg-[#5B172E]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_users_modtime
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- ------------------------------------------------------------------------------
-- 6. TABLE: transporters
-- ------------------------------------------------------------------------------
CREATE TABLE transporters (
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

CREATE TRIGGER update_transporters_modtime
    BEFORE UPDATE ON transporters
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE INDEX idx_transporters_name ON transporters(name);
CREATE INDEX idx_transporters_phone ON transporters(phone);

-- ------------------------------------------------------------------------------
-- 7. TABLE: karigars
-- ------------------------------------------------------------------------------
CREATE TABLE karigars (
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

CREATE TRIGGER update_karigars_modtime
    BEFORE UPDATE ON karigars
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE INDEX idx_karigars_name ON karigars(name);
CREATE INDEX idx_karigars_phone ON karigars(phone);

-- ------------------------------------------------------------------------------
-- 8. TABLE: departments
-- ------------------------------------------------------------------------------
CREATE TABLE departments (
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

CREATE TRIGGER update_departments_modtime
    BEFORE UPDATE ON departments
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE INDEX idx_departments_name ON departments(name);
CREATE INDEX idx_departments_code ON departments(code);

-- ------------------------------------------------------------------------------
-- 9. TABLE: tat_config
-- ------------------------------------------------------------------------------
CREATE TABLE tat_config (
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

CREATE TRIGGER update_tat_config_modtime
    BEFORE UPDATE ON tat_config
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE INDEX idx_tat_config_stage_id ON tat_config(stage_id);

-- ------------------------------------------------------------------------------
-- 10. ENABLE ROW LEVEL SECURITY (RLS) & OPEN POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE karigars ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tat_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for vendors" ON vendors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for transporters" ON transporters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for karigars" ON karigars FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for departments" ON departments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for tat_config" ON tat_config FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 11. INSERT ROOT ADMINISTRATOR (Required for initial system login)
-- ------------------------------------------------------------------------------
INSERT INTO users (
    id,
    username,
    password,
    name,
    email,
    phone,
    role,
    is_admin,
    status,
    allowed_pages,
    allowed_stages,
    avatar_color
) VALUES (
    'USR-ADMIN',
    'admin',
    'admin123',
    'Sainy Garg',
    'admin@sainygargcouture.com',
    '',
    'Admin',
    TRUE,
    'Active',
    '["dashboard", "orders", "stages", "settings"]'::jsonb,
    '[
      "material_check",
      "embroidery_marking_cutting",
      "embroidery_sample_approval",
      "full_embroidery",
      "final_cutting_karigar_allotment",
      "stitching_completed",
      "first_qc_alterations_cleared",
      "finishing_final_qc_passed",
      "trial_packing_pickup",
      "final_trial_delivered_return"
    ]'::jsonb,
    'bg-[#5B172E]'
) ON CONFLICT (id) DO NOTHING;

