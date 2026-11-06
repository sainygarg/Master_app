-- ==============================================================================
-- SAINY GARG MASTER APPLICATION: ORDER TO DELIVERY DATABASE SCHEMA
-- PostgreSQL / Supabase Schema Definition
-- Tables: orders, order_stage_history, vendors, customers, users, transporters, karigars, departments, tat_config
-- ==============================================================================

-- 1. DROP EXISTING ORDER-TO-DELIVERY & MASTER TABLES IF RE-CREATING
DROP TABLE IF EXISTS order_stage_history CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS transporters CASCADE;
DROP TABLE IF EXISTS karigars CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS tat_config CASCADE;

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. HELPER FUNCTION: AUTO-UPDATE updated_at TIMESTAMP
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 3. TABLE: orders (Core Order to Delivery entity)
-- ------------------------------------------------------------------------------
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,                         -- e.g. 'SG-1021'
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

CREATE TRIGGER update_orders_modtime
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE INDEX idx_orders_client_name ON orders(client_name);
CREATE INDEX idx_orders_mobile ON orders(mobile);
CREATE INDEX idx_orders_stage ON orders(current_stage_id);
CREATE INDEX idx_orders_created_by ON orders(created_by_user_id);
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date);

-- ------------------------------------------------------------------------------
-- 4. TABLE: order_stage_history (Audit Trail for Stage Transitions)
-- ------------------------------------------------------------------------------
CREATE TABLE order_stage_history (
    id BIGSERIAL PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    stage_id VARCHAR(100) NOT NULL,
    stage_name VARCHAR(255) NOT NULL,
    action VARCHAR(255),
    actor VARCHAR(255),
    notes TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_stage_hist_order_id ON order_stage_history(order_id);
CREATE INDEX idx_order_stage_hist_stage ON order_stage_history(stage_id);

-- ------------------------------------------------------------------------------
-- 5. TABLE: vendors
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
-- 6. TABLE: customers
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
-- 7. TABLE: users (System Accounts & RBAC Permissions)
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
-- 8. TABLE: transporters
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
-- 9. TABLE: karigars
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
-- 10. TABLE: departments
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
-- 11. TABLE: tat_config
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
-- 12. ROW LEVEL SECURITY (RLS) & OPEN ACCESS POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE karigars ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tat_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for order_stage_history" ON order_stage_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for vendors" ON vendors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for transporters" ON transporters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for karigars" ON karigars FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for departments" ON departments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for tat_config" ON tat_config FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 13. SEED ROOT ADMINISTRATOR ONLY (No dummy/hardcoded data)
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

