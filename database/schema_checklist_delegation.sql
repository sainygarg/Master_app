-- ==============================================================================
-- SAINY GARG MASTER APPLICATION: CHECKLIST & DELEGATION SYSTEM DATABASE SCHEMA
-- PostgreSQL / Supabase Schema Definition
-- ==============================================================================

-- 1. DROP EXISTING CHECKLIST-DELEGATION TABLES IF RE-CREATING
DROP TABLE IF EXISTS checklist CASCADE;
DROP TABLE IF EXISTS delegation CASCADE;
DROP TABLE IF EXISTS delegation_done CASCADE;
DROP TABLE IF EXISTS holidays CASCADE;
DROP TABLE IF EXISTS working_day_calender CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_notifications CASCADE;
DROP TABLE IF EXISTS assign_from CASCADE;
DROP TABLE IF EXISTS dropdown_options CASCADE;
DROP TABLE IF EXISTS whatsapp_logs CASCADE;

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLE: checklist (Recurring and single checklists)
-- ==============================================================================
CREATE TABLE checklist (
    id BIGSERIAL PRIMARY KEY,
    task_id VARCHAR(100),
    department VARCHAR(150),
    given_by VARCHAR(150),
    name VARCHAR(200),
    task_description TEXT,
    task_start_date DATE,
    planned_date DATE,
    submission_date TIMESTAMP WITH TIME ZONE,
    frequency VARCHAR(50) DEFAULT 'Daily',
    duration VARCHAR(50),
    enable_reminder BOOLEAN DEFAULT false,
    require_attachment BOOLEAN DEFAULT false,
    audio_url TEXT,
    instruction_attachment_url TEXT,
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    admin_done VARCHAR(50) DEFAULT 'Pending',
    remark TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 3. TABLE: delegation (Ad-hoc delegated tasks)
-- ==============================================================================
CREATE TABLE delegation (
    id BIGSERIAL PRIMARY KEY,
    task_id VARCHAR(100),
    department VARCHAR(150),
    given_by VARCHAR(150),
    name VARCHAR(200),
    task_description TEXT,
    task_start_date DATE,
    planned_date DATE,
    submission_date TIMESTAMP WITH TIME ZONE,
    frequency VARCHAR(50) DEFAULT 'One Time',
    duration VARCHAR(50),
    enable_reminder BOOLEAN DEFAULT false,
    require_attachment BOOLEAN DEFAULT false,
    audio_url TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    admin_done VARCHAR(50) DEFAULT 'Pending',
    reason TEXT,
    next_extend_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 4. TABLE: delegation_done (Completed / History for delegations)
-- ==============================================================================
CREATE TABLE delegation_done (
    id BIGSERIAL PRIMARY KEY,
    task_id VARCHAR(100),
    department VARCHAR(150),
    given_by VARCHAR(150),
    name VARCHAR(200),
    task_description TEXT,
    planned_date DATE,
    submission_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'Completed',
    admin_done VARCHAR(50) DEFAULT 'Approved',
    remark TEXT,
    audio_url TEXT,
    attachment_url TEXT,
    completion_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 5. TABLE: holidays (Leave & Holiday Calendar)
-- ==============================================================================
CREATE TABLE holidays (
    id BIGSERIAL PRIMARY KEY,
    holiday_date DATE NOT NULL,
    holiday_name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'Public Holiday',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 6. TABLE: working_day_calender (Working day exemptions / overrides)
-- ==============================================================================
CREATE TABLE working_day_calender (
    id BIGSERIAL PRIMARY KEY,
    working_date DATE NOT NULL,
    reason TEXT,
    created_by VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 7. TABLE: assign_from (List of assignors / delegation managers)
-- ==============================================================================
CREATE TABLE assign_from (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    department VARCHAR(150),
    role VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 8. TABLE: dropdown_options (Dynamic dropdown categories for tasks/checklists)
-- ==============================================================================
CREATE TABLE dropdown_options (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 9. TABLE: notifications & user_notifications (System alerts & broadcasts)
-- ==============================================================================
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    action_url TEXT,
    target_role VARCHAR(100),
    target_user_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_notifications (
    id BIGSERIAL PRIMARY KEY,
    notification_id BIGINT REFERENCES notifications(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 10. TABLE: whatsapp_logs (Automated SMS & WhatsApp communication log)
-- ==============================================================================
CREATE TABLE whatsapp_logs (
    id BIGSERIAL PRIMARY KEY,
    recipient_phone VARCHAR(50) NOT NULL,
    recipient_name VARCHAR(150),
    message_content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Sent',
    task_id VARCHAR(100),
    response_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 11. INDEXES FOR HIGH QUERY EFFICIENCY
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_checklist_task_id ON checklist(task_id);
CREATE INDEX IF NOT EXISTS idx_checklist_planned_date ON checklist(planned_date);
CREATE INDEX IF NOT EXISTS idx_checklist_name ON checklist(name);
CREATE INDEX IF NOT EXISTS idx_checklist_status ON checklist(status);

CREATE INDEX IF NOT EXISTS idx_delegation_task_id ON delegation(task_id);
CREATE INDEX IF NOT EXISTS idx_delegation_planned_date ON delegation(planned_date);
CREATE INDEX IF NOT EXISTS idx_delegation_name ON delegation(name);
CREATE INDEX IF NOT EXISTS idx_delegation_status ON delegation(status);

CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays(holiday_date);
CREATE INDEX IF NOT EXISTS idx_working_calender_date ON working_day_calender(working_date);
CREATE INDEX IF NOT EXISTS idx_user_notif_user ON user_notifications(user_id, is_read);

-- ==============================================================================
-- 12. ENABLE ROW LEVEL SECURITY & PERMISSIVE POLICIES
-- ==============================================================================
ALTER TABLE checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE delegation ENABLE ROW LEVEL SECURITY;
ALTER TABLE delegation_done ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_day_calender ENABLE ROW LEVEL SECURITY;
ALTER TABLE assign_from ENABLE ROW LEVEL SECURITY;
ALTER TABLE dropdown_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checklist_public_all" ON checklist FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "delegation_public_all" ON delegation FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "delegation_done_public_all" ON delegation_done FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "holidays_public_all" ON holidays FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "working_calender_public_all" ON working_day_calender FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "assign_from_public_all" ON assign_from FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dropdown_options_public_all" ON dropdown_options FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "notifications_public_all" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "user_notifications_public_all" ON user_notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "whatsapp_logs_public_all" ON whatsapp_logs FOR ALL USING (true) WITH CHECK (true);

