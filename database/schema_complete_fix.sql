-- ==============================================================================
-- SAINY GARG MASTER APP  -  COMPLETE, IDEMPOTENT SCHEMA FIX
-- ==============================================================================
-- Purpose : make the REAL Supabase database match every table/column that the
--           React code under src/ reads or writes.  Safe to run many times.
-- How     : paste into Supabase Dashboard > SQL Editor and run once.
-- Rules   : ONLY "CREATE TABLE IF NOT EXISTS", "ADD COLUMN IF NOT EXISTS",
--           "CREATE INDEX IF NOT EXISTS" and a few guarded DO blocks.
--           Nothing is dropped, renamed or re-typed, so existing data is kept.
-- RLS     : the app talks to Supabase with the public ANON key and the other
--           schema files use permissive "allow all" policies (or RLS off).
--           This script therefore adds NO restrictive RLS.  If RLS is enabled
--           on a table in your project and inserts fail, add a permissive
--           policy (see the earlier schema_*.sql files) - not done here on purpose.
-- Ambiguities / conflicts between database/*.sql files and the code are listed
-- next to each table below under "NOTE".
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 0. HELPER: keep users.name / username / user_name (and email/phone aliases) in
--    sync.  Different parts of the app write different alias columns:
--      * Master Hub (GlobalSettigns.jsx) writes user_name only (no name/username)
--      * order-to-delivery userStorage.js writes username + user_name + name
--      * checklist settingApi.createUserApi writes username + name + user_name
--    Older schema files declared name / username NOT NULL, which made the
--    Master Hub insert fail, so those NOT NULLs are relaxed in section 1.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.sync_user_name_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- ::text casts keep this working even if a legacy column (e.g. number) is not text
    NEW.user_name := COALESCE(NULLIF(NEW.user_name::text, ''), NULLIF(NEW.username::text, ''), NULLIF(NEW.name::text, ''));
    NEW.username  := COALESCE(NULLIF(NEW.username::text, ''),  NEW.user_name::text, NULLIF(NEW.name::text, ''));
    NEW.name      := COALESCE(NULLIF(NEW.name::text, ''),      NEW.user_name::text, NEW.username::text);
    NEW.email_id  := COALESCE(NULLIF(NEW.email_id::text, ''),  NULLIF(NEW.email::text, ''));
    NEW.email     := COALESCE(NULLIF(NEW.email::text, ''),     NULLIF(NEW.email_id::text, ''));
    NEW.number    := COALESCE(NULLIF(NEW.number::text, ''),    NULLIF(NEW.mobile::text, ''), NULLIF(NEW.phone::text, ''));
    NEW.mobile    := COALESCE(NULLIF(NEW.mobile::text, ''),    NULLIF(NEW.number::text, ''), NULLIF(NEW.phone::text, ''));
    NEW.phone     := COALESCE(NULLIF(NEW.phone::text, ''),     NULLIF(NEW.number::text, ''), NULLIF(NEW.mobile::text, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 1. users
--    Used by: core/* (CoreDashboard, ProtectedRoute, MasterLayout, GlobalSettigns),
--    checklist redux/api (settingApi, loginApi, assignTaskApi, dashboardApi, ...),
--    pages (LoginPage, Setting, CalendarPage, AllTasks, Dashboard),
--    order-to-delivery/utils/userStorage.js
--    NOTE (conflict): schema_checklist_delegation.sql + order_delivery_users.sql
--    use id as text ('USR-xx', 'CHK-xx'); GlobalSettigns.jsx inserts a NUMERIC id
--    (max(id)+1).  id is kept TEXT here (matches the two newer files).
--    NOTE: column is the case-sensitive quoted "Designation" (code uses
--    r.Designation / payload key Designation).  The lowercase `designation`
--    from schema_checklist_delegation.sql is NOT what the code reads; both are
--    created so neither schema variant breaks.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id          text PRIMARY KEY,
    user_name   text,
    username    text,
    name        text,
    password    text,
    role        text DEFAULT 'user',
    status      text DEFAULT 'active',
    created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS user_name               text;   -- all checklist code filters on this
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username                text;   -- order-to-delivery login, whatsappService
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name                    text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password                text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email                   text;   -- userStorage.js
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_id                text;   -- CoreDashboard, settingApi, GlobalSettigns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone                   text;   -- userStorage.js, createUserApi
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS mobile                  text;   -- userStorage.js, whatsappService
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS number                  text;   -- settingApi, GlobalSettigns, EATask
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS employee_id             text;   -- settingApi, GlobalSettigns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role                    text DEFAULT 'user';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin                boolean DEFAULT false;  -- userStorage.js
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status                  text DEFAULT 'active';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS department              text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "Designation"           text;   -- CoreDashboard, LoginPage, settingApi, userStorage, GlobalSettigns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS designation             text;   -- legacy lowercase variant (unused by code)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS reported_by             text;   -- HOD filters (dashboardApi, checkListApi, ...)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS user_access             text DEFAULT 'all';     -- department access list
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS system_access           text DEFAULT 'all';     -- ProtectedRoute, MasterLayout, GlobalSettigns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS page_access             text;                   -- ProtectedRoute, MasterLayout, GlobalSettigns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS can_self_assign         boolean DEFAULT false;  -- LoginPage, assignTaskApi
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS leave_date              date;                   -- Setting.jsx, assignTaskApi
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS leave_end_date          date;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS remark                  text;                   -- Setting.jsx (leave remark), settingApi
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS dob                     date;                   -- GlobalSettigns.jsx
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_image           text;                   -- layouts, CoreDashboard, notificationApi
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_color            text DEFAULT 'bg-[#5B172E]';  -- userStorage.js
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS allowed_pages           jsonb DEFAULT '["dashboard","orders","stages"]'::jsonb;  -- userStorage.js
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS allowed_stages          jsonb DEFAULT '[]'::jsonb;                                -- userStorage.js
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS allowed_checklist_pages jsonb;                  -- userStorage.js (NULL = legacy row => all pages)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at              timestamptz DEFAULT now();  -- userStorage.fetchUsers orders by it
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at              timestamptz DEFAULT now();

-- Relax NOT NULLs that older schema files put on columns some writers never send.
DO $$
DECLARE c text;
BEGIN
    FOREACH c IN ARRAY ARRAY['name','username','password','email','phone','role','status','allowed_pages','allowed_stages'] LOOP
        BEGIN
            EXECUTE format('ALTER TABLE public.users ALTER COLUMN %I DROP NOT NULL', c);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'users.%: could not drop NOT NULL (%)', c, SQLERRM;
        END;
    END LOOP;
END $$;

DROP TRIGGER IF EXISTS trg_sync_users_names ON public.users;
CREATE TRIGGER trg_sync_users_names
    BEFORE INSERT OR UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.sync_user_name_fields();

CREATE INDEX IF NOT EXISTS idx_users_user_name   ON public.users (user_name);
CREATE INDEX IF NOT EXISTS idx_users_username    ON public.users (username);
CREATE INDEX IF NOT EXISTS idx_users_reported_by ON public.users (reported_by);

-- Checklist login RPC (loginApi.js -> supabase.rpc('secure_login', {input_username,input_password})).
-- Same definition as supabase/order_delivery_users.sql (plain-text passwords).
CREATE OR REPLACE FUNCTION public.secure_login(input_username text, input_password text)
RETURNS SETOF public.users
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.users
  WHERE (lower(username) = lower(input_username) OR lower(user_name) = lower(input_username))
    AND password = input_password
  LIMIT 1;
$$;

-- ==============================================================================
-- 2. checklist
--    Used by: checkListApi.js, quickTaskApi.js, assignTaskApi.js, dashboardApi.js,
--    dashboardSlice.js, AllTasks, Setting, CalendarPage, WorkingDayCalendarPage,
--    HolidayListPage, AdminApprovalPage
--    NOTE (conflict): schema_checklist_delegation.sql gives `status` DEFAULT 'Pending'
--    but the code relies on status IS NULL for "not yet done" (checkListApi
--    .is('status', null)); no default is set here.  planned_date / task_start_date
--    are timestamptz because the code stores ISO times and filters with times.
--    enable_reminder / require_attachment are TEXT ("yes"/"no"; maintenance sends
--    true/false) - the UI handles 'yes' / true / 'true'.
--    task_id: code looks rows up by task_id (not id), never sets it on insert,
--    and upserts with onConflict task_id -> needs a default + UNIQUE (section 15).
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.checklist (
    id          bigserial PRIMARY KEY,
    task_id     text,
    created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS task_id                     text;
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS department                  text;
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS given_by                    text;
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS name                        text;          -- doer
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS task_description            text;
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS task_start_date             timestamptz;
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS planned_date                timestamptz;
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS submission_date             timestamptz;
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS frequency                   text;
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS duration                    text;
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS enable_reminder             text;
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS require_attachment          text;
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS audio_url                   text;
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS instruction_attachment_url  text;          -- assignTaskApi, quickTaskApi
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS instruction_attachment_type text;          -- quickTaskApi.updateChecklistTaskApi
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS image                       text;          -- checkListApi.updateChecklistData, AllTasks
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS image_url                   text;
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS status                      text;          -- NULL = pending (no default!)
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS admin_done                  boolean DEFAULT false;  -- .is('admin_done', false)
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS admin_approval_date          timestamptz;   -- checklist approve
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS admin_approved_by           text;
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS remark                      text;          -- (singular for checklist)
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS remarks                     text;
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS created_at                  timestamptz DEFAULT now();
ALTER TABLE public.checklist ADD COLUMN IF NOT EXISTS updated_at                  timestamptz DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_checklist_name         ON public.checklist (name);
CREATE INDEX IF NOT EXISTS idx_checklist_planned_date ON public.checklist (planned_date);
CREATE INDEX IF NOT EXISTS idx_checklist_submission   ON public.checklist (submission_date);

-- ==============================================================================
-- 3. delegation
--    Used by: assignTaskApi.js, delegationApi.js, quickTaskApi.js, dashboardApi.js,
--    AllTasks.jsx, Setting, CalendarPage, WorkingDayCalendarPage
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.delegation (
    id          bigserial PRIMARY KEY,
    task_id     text,
    created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.delegation ADD COLUMN IF NOT EXISTS task_id                     text;
ALTER TABLE public.delegation ADD COLUMN IF NOT EXISTS department                  text;
ALTER TABLE public.delegation ADD COLUMN IF NOT EXISTS given_by                    text;
ALTER TABLE public.delegation ADD COLUMN IF NOT EXISTS name                        text;
ALTER TABLE public.delegation ADD COLUMN IF NOT EXISTS task_description            text;
ALTER TABLE public.delegation ADD COLUMN IF NOT EXISTS task_start_date             timestamptz;
ALTER TABLE public.delegation ADD COLUMN IF NOT EXISTS planned_date                timestamptz;
ALTER TABLE public.delegation ADD COLUMN IF NOT EXISTS submission_date             timestamptz;
ALTER TABLE public.delegation ADD COLUMN IF NOT EXISTS frequency                   text;
ALTER TABLE public.delegation ADD COLUMN IF NOT EXISTS duration                    text;
ALTER TABLE public.delegation ADD COLUMN IF NOT EXISTS enable_reminder             text;
ALTER TABLE public.delegation ADD COLUMN IF NOT EXISTS require_attachment          text;
ALTER TABLE public.delegation ADD COLUMN IF NOT EXISTS audio_url                   text;
ALTER TABLE public.delegation ADD COLUMN IF NOT EXISTS instruction_attachment_url  text;          -- quickTaskApi.updateDelegationTaskApi
ALTER TABLE public.delegation ADD COLUMN IF NOT EXISTS instruction_attachment_type text;
ALTER TABLE public.delegation ADD COLUMN IF NOT EXISTS image                       text;          -- delegationApi / AllTasks (proof)
ALTER TABLE public.delegation ADD COLUMN IF NOT EXISTS status                      text DEFAULT 'pending';
ALTER TABLE public.delegation ADD COLUMN IF NOT EXISTS admin_done                  boolean DEFAULT false;
ALTER TABLE public.delegation ADD COLUMN IF NOT EXISTS admin_approval_date         timestamptz;   -- delegationApi.updateDelegationDoneStatus
ALTER TABLE public.delegation ADD COLUMN IF NOT EXISTS admin_approved_by           text;
ALTER TABLE public.delegation ADD COLUMN IF NOT EXISTS remarks                     text;
ALTER TABLE public.delegation ADD COLUMN IF NOT EXISTS reason                      text;
ALTER TABLE public.delegation ADD COLUMN IF NOT EXISTS next_extend_date            timestamptz;
ALTER TABLE public.delegation ADD COLUMN IF NOT EXISTS created_at                  timestamptz DEFAULT now();
ALTER TABLE public.delegation ADD COLUMN IF NOT EXISTS updated_at                  timestamptz DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_delegation_name         ON public.delegation (name);
CREATE INDEX IF NOT EXISTS idx_delegation_planned_date ON public.delegation (planned_date);

-- ==============================================================================
-- 4. delegation_done   (delegationApi.js)
--    NOTE: code writes image_url here (but plain `image` on delegation).
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.delegation_done (
    id          bigserial PRIMARY KEY,
    task_id     text,
    created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.delegation_done ADD COLUMN IF NOT EXISTS task_id             text;
ALTER TABLE public.delegation_done ADD COLUMN IF NOT EXISTS status              text;
ALTER TABLE public.delegation_done ADD COLUMN IF NOT EXISTS next_extend_date    timestamptz;
ALTER TABLE public.delegation_done ADD COLUMN IF NOT EXISTS reason              text;
ALTER TABLE public.delegation_done ADD COLUMN IF NOT EXISTS name                text;
ALTER TABLE public.delegation_done ADD COLUMN IF NOT EXISTS task_description    text;
ALTER TABLE public.delegation_done ADD COLUMN IF NOT EXISTS given_by            text;
ALTER TABLE public.delegation_done ADD COLUMN IF NOT EXISTS duration            text;
ALTER TABLE public.delegation_done ADD COLUMN IF NOT EXISTS image_url           text;
ALTER TABLE public.delegation_done ADD COLUMN IF NOT EXISTS audio_url           text;
ALTER TABLE public.delegation_done ADD COLUMN IF NOT EXISTS admin_done          boolean DEFAULT false;
ALTER TABLE public.delegation_done ADD COLUMN IF NOT EXISTS admin_approval_date timestamptz;
ALTER TABLE public.delegation_done ADD COLUMN IF NOT EXISTS admin_approved_by   text;
ALTER TABLE public.delegation_done ADD COLUMN IF NOT EXISTS department          text;
ALTER TABLE public.delegation_done ADD COLUMN IF NOT EXISTS planned_date        timestamptz;
ALTER TABLE public.delegation_done ADD COLUMN IF NOT EXISTS submission_date     timestamptz;
ALTER TABLE public.delegation_done ADD COLUMN IF NOT EXISTS remark              text;
ALTER TABLE public.delegation_done ADD COLUMN IF NOT EXISTS attachment_url      text;
ALTER TABLE public.delegation_done ADD COLUMN IF NOT EXISTS completion_time     timestamptz DEFAULT now();
ALTER TABLE public.delegation_done ADD COLUMN IF NOT EXISTS created_at          timestamptz DEFAULT now();
ALTER TABLE public.delegation_done ADD COLUMN IF NOT EXISTS updated_at          timestamptz DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_delegation_done_task_id ON public.delegation_done (task_id);

-- ==============================================================================
-- 5. maintenance_tasks
--    Used by: maintenanceApi.js, MaintenanceTask.jsx, AllTasks, Setting,
--    CalendarPage, WorkingDayCalendarPage, HolidayListPage, MaintenanceView
--    NOTE (conflict): schema_checklist_delegation.sql has `frequency`; the code
--    uses `freq` everywhere (insert, eq('freq'), update).  Both are created.
--    Proof image is `uploaded_image_url` (not image_url).
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.maintenance_tasks (
    id          bigserial PRIMARY KEY,
    created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS task_id             text;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS department          text;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS name                text;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS given_by            text;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS task_start_date     timestamptz;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS planned_date        timestamptz;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS task_description    text;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS machine_name        text;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS machine_area        text;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS part_name           text;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS part_area           text;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS freq                text;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS frequency           text;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS duration            text;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS priority            text;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS status              text DEFAULT 'Pending';
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS enable_reminder     text;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS require_attachment  text;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS audio_url           text;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS remarks             text;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS image_url           text;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS uploaded_image_url  text;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS submission_date     timestamptz;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS admin_done          boolean DEFAULT false;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS admin_approval_date timestamptz;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS admin_approved_by   text;
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS created_at          timestamptz DEFAULT now();
ALTER TABLE public.maintenance_tasks ADD COLUMN IF NOT EXISTS updated_at          timestamptz DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_name    ON public.maintenance_tasks (name);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_planned ON public.maintenance_tasks (planned_date);

-- ==============================================================================
-- 6. repair_tasks
--    Used by: repairApi.js, RepairTask.jsx, AllTasks (proof -> image_url),
--    Setting, CalendarPage, RepairView
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.repair_tasks (
    id          bigserial PRIMARY KEY,
    created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS task_id              text;
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS filled_by            text;
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS assigned_person      text;
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS machine_name         text;
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS machine_area         text;
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS part_name            text;
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS issue_description    text;
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS audio_url            text;
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS image_url            text;
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS duration             text;
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS attachment           boolean DEFAULT false;
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS department           text;
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS priority             text;
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS status               text DEFAULT 'Pending';
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS part_replaced        text;
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS bill_amount          text;   -- free-form form input
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS remarks              text;
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS vendor_name          text;
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS work_photo_url       text;
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS bill_copy_url        text;
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS solution_description text;
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS submission_date      timestamptz;
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS admin_done           boolean DEFAULT false;
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS admin_approval_date  timestamptz;
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS admin_approved_by    text;
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS created_at           timestamptz DEFAULT now();
ALTER TABLE public.repair_tasks ADD COLUMN IF NOT EXISTS updated_at           timestamptz DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_repair_tasks_status ON public.repair_tasks (status);

-- ==============================================================================
-- 7. ea_tasks / ea_tasks_done   (eaApi.js, EATask.jsx, AllTasks.jsx, EAView.jsx)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ea_tasks (
    id          bigserial PRIMARY KEY,
    task_id     text,
    created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.ea_tasks ADD COLUMN IF NOT EXISTS task_id             text;
ALTER TABLE public.ea_tasks ADD COLUMN IF NOT EXISTS doer_name           text;
ALTER TABLE public.ea_tasks ADD COLUMN IF NOT EXISTS phone_number        text;
ALTER TABLE public.ea_tasks ADD COLUMN IF NOT EXISTS given_by            text;
ALTER TABLE public.ea_tasks ADD COLUMN IF NOT EXISTS department          text;
ALTER TABLE public.ea_tasks ADD COLUMN IF NOT EXISTS task_description    text;
ALTER TABLE public.ea_tasks ADD COLUMN IF NOT EXISTS task_start_date     timestamptz;
ALTER TABLE public.ea_tasks ADD COLUMN IF NOT EXISTS planned_date        timestamptz;
ALTER TABLE public.ea_tasks ADD COLUMN IF NOT EXISTS extended_date       timestamptz;
ALTER TABLE public.ea_tasks ADD COLUMN IF NOT EXISTS submission_date     timestamptz;
ALTER TABLE public.ea_tasks ADD COLUMN IF NOT EXISTS duration            text;
ALTER TABLE public.ea_tasks ADD COLUMN IF NOT EXISTS attachment          boolean DEFAULT false;
ALTER TABLE public.ea_tasks ADD COLUMN IF NOT EXISTS priority            text;
ALTER TABLE public.ea_tasks ADD COLUMN IF NOT EXISTS status              text DEFAULT 'pending';
ALTER TABLE public.ea_tasks ADD COLUMN IF NOT EXISTS admin_done          boolean DEFAULT false;
ALTER TABLE public.ea_tasks ADD COLUMN IF NOT EXISTS admin_approval_date timestamptz;
ALTER TABLE public.ea_tasks ADD COLUMN IF NOT EXISTS admin_approved_by   text;
ALTER TABLE public.ea_tasks ADD COLUMN IF NOT EXISTS remarks             text;
ALTER TABLE public.ea_tasks ADD COLUMN IF NOT EXISTS audio_url           text;
ALTER TABLE public.ea_tasks ADD COLUMN IF NOT EXISTS image_url           text;
ALTER TABLE public.ea_tasks ADD COLUMN IF NOT EXISTS attachment_url      text;
ALTER TABLE public.ea_tasks ADD COLUMN IF NOT EXISTS created_at          timestamptz DEFAULT now();
ALTER TABLE public.ea_tasks ADD COLUMN IF NOT EXISTS updated_at          timestamptz DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_ea_tasks_doer    ON public.ea_tasks (doer_name);
CREATE INDEX IF NOT EXISTS idx_ea_tasks_planned ON public.ea_tasks (planned_date);

CREATE TABLE IF NOT EXISTS public.ea_tasks_done (
    id          bigserial PRIMARY KEY,
    task_id     text,
    created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.ea_tasks_done ADD COLUMN IF NOT EXISTS task_id             text;
ALTER TABLE public.ea_tasks_done ADD COLUMN IF NOT EXISTS doer_name           text;
ALTER TABLE public.ea_tasks_done ADD COLUMN IF NOT EXISTS phone_number        text;
ALTER TABLE public.ea_tasks_done ADD COLUMN IF NOT EXISTS given_by            text;
ALTER TABLE public.ea_tasks_done ADD COLUMN IF NOT EXISTS department          text;
ALTER TABLE public.ea_tasks_done ADD COLUMN IF NOT EXISTS task_description    text;
ALTER TABLE public.ea_tasks_done ADD COLUMN IF NOT EXISTS task_start_date     timestamptz;
ALTER TABLE public.ea_tasks_done ADD COLUMN IF NOT EXISTS planned_date        timestamptz;
ALTER TABLE public.ea_tasks_done ADD COLUMN IF NOT EXISTS submission_date     timestamptz;
ALTER TABLE public.ea_tasks_done ADD COLUMN IF NOT EXISTS next_extend_date    timestamptz;
ALTER TABLE public.ea_tasks_done ADD COLUMN IF NOT EXISTS duration            text;
ALTER TABLE public.ea_tasks_done ADD COLUMN IF NOT EXISTS attachment          boolean DEFAULT false;
ALTER TABLE public.ea_tasks_done ADD COLUMN IF NOT EXISTS status              text DEFAULT 'pending';
ALTER TABLE public.ea_tasks_done ADD COLUMN IF NOT EXISTS admin_done          boolean DEFAULT false;
ALTER TABLE public.ea_tasks_done ADD COLUMN IF NOT EXISTS admin_approval_date timestamptz;
ALTER TABLE public.ea_tasks_done ADD COLUMN IF NOT EXISTS admin_approved_by   text;
ALTER TABLE public.ea_tasks_done ADD COLUMN IF NOT EXISTS reason              text;
ALTER TABLE public.ea_tasks_done ADD COLUMN IF NOT EXISTS remarks             text;
ALTER TABLE public.ea_tasks_done ADD COLUMN IF NOT EXISTS audio_url           text;
ALTER TABLE public.ea_tasks_done ADD COLUMN IF NOT EXISTS image_url           text;
ALTER TABLE public.ea_tasks_done ADD COLUMN IF NOT EXISTS attachment_url      text;
ALTER TABLE public.ea_tasks_done ADD COLUMN IF NOT EXISTS created_at          timestamptz DEFAULT now();
ALTER TABLE public.ea_tasks_done ADD COLUMN IF NOT EXISTS updated_at          timestamptz DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_ea_tasks_done_task_id ON public.ea_tasks_done (task_id);

-- ==============================================================================
-- 8. holidays / working_day_calender
--    holidays: HolidayListPage (insert {holiday_date, holiday_name}), dashboardApi, CalendarPage
--    working_day_calender: HolidayListPage / WorkingDayCalendarPage insert
--      {working_date, day, week_num, month}; `day` holds Hindi weekday names.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.holidays (
    id            bigserial PRIMARY KEY,
    holiday_date  date,
    holiday_name  text,
    created_at    timestamptz DEFAULT now()
);
ALTER TABLE public.holidays ADD COLUMN IF NOT EXISTS holiday_date  date;
ALTER TABLE public.holidays ADD COLUMN IF NOT EXISTS holiday_name  text;
ALTER TABLE public.holidays ADD COLUMN IF NOT EXISTS description   text;
ALTER TABLE public.holidays ADD COLUMN IF NOT EXISTS type          text DEFAULT 'Public Holiday';
ALTER TABLE public.holidays ADD COLUMN IF NOT EXISTS created_at    timestamptz DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_holidays_date ON public.holidays (holiday_date);

CREATE TABLE IF NOT EXISTS public.working_day_calender (
    id            bigserial PRIMARY KEY,
    working_date  date,
    created_at    timestamptz DEFAULT now()
);
ALTER TABLE public.working_day_calender ADD COLUMN IF NOT EXISTS working_date  date;
ALTER TABLE public.working_day_calender ADD COLUMN IF NOT EXISTS day           text;      -- WorkingDayCalendarPage, HolidayListPage
ALTER TABLE public.working_day_calender ADD COLUMN IF NOT EXISTS week_num      integer;   -- ISO week number
ALTER TABLE public.working_day_calender ADD COLUMN IF NOT EXISTS month         integer;   -- 1..12
ALTER TABLE public.working_day_calender ADD COLUMN IF NOT EXISTS reason        text;
ALTER TABLE public.working_day_calender ADD COLUMN IF NOT EXISTS created_by    text;
ALTER TABLE public.working_day_calender ADD COLUMN IF NOT EXISTS created_at    timestamptz DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_working_day_calender_date ON public.working_day_calender (working_date);

-- ==============================================================================
-- 9. departments / assign_from / dropdown_options   (settingApi.js, assignTaskApi.js,
--    dashboardApi.js, dashboardSlice.js, GlobalSettigns.jsx)
--    NOTE (conflict): schema_checklist_delegation.sql and schema_masters.sql define
--    departments with a VARCHAR PK and no default, but createDepartmentApi inserts
--    {name, given_by} with NO id -> a default is added in section 14.  The column
--    given_by (used by createDepartmentApi / fetchDepartmentDataApi) did not exist.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.departments (
    id          text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name        text,
    created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS name           text;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS given_by       text;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS code           text;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS head_name      text;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS contact_email  text;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS staff_count    integer DEFAULT 1;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS status         text DEFAULT 'Active';
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS description    text;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS created_at     timestamptz DEFAULT now();
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS updated_at     timestamptz DEFAULT now();

CREATE TABLE IF NOT EXISTS public.assign_from (
    id          bigserial PRIMARY KEY,
    name        text,
    created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.assign_from ADD COLUMN IF NOT EXISTS name        text;
ALTER TABLE public.assign_from ADD COLUMN IF NOT EXISTS department  text;
ALTER TABLE public.assign_from ADD COLUMN IF NOT EXISTS role        text;
ALTER TABLE public.assign_from ADD COLUMN IF NOT EXISTS status      text DEFAULT 'Active';
ALTER TABLE public.assign_from ADD COLUMN IF NOT EXISTS created_at  timestamptz DEFAULT now();

-- dropdown_options: one row per option, value stored in the column that matches
-- the category (settingApi.CATEGORY_TO_COLUMN).  sound_test and temperature were
-- missing from schema_checklist_delegation.sql.
CREATE TABLE IF NOT EXISTS public.dropdown_options (
    id          bigserial PRIMARY KEY,
    created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.dropdown_options ADD COLUMN IF NOT EXISTS machine_name   text;
ALTER TABLE public.dropdown_options ADD COLUMN IF NOT EXISTS machine_area   text;
ALTER TABLE public.dropdown_options ADD COLUMN IF NOT EXISTS part_name      text;
ALTER TABLE public.dropdown_options ADD COLUMN IF NOT EXISTS priority       text;
ALTER TABLE public.dropdown_options ADD COLUMN IF NOT EXISTS task_priority  text;
ALTER TABLE public.dropdown_options ADD COLUMN IF NOT EXISTS project_type   text;
ALTER TABLE public.dropdown_options ADD COLUMN IF NOT EXISTS task_status    text;
ALTER TABLE public.dropdown_options ADD COLUMN IF NOT EXISTS sound_test     text;
ALTER TABLE public.dropdown_options ADD COLUMN IF NOT EXISTS temperature    text;
ALTER TABLE public.dropdown_options ADD COLUMN IF NOT EXISTS image_url      text;
ALTER TABLE public.dropdown_options ADD COLUMN IF NOT EXISTS category       text;   -- legacy, unused by code
ALTER TABLE public.dropdown_options ADD COLUMN IF NOT EXISTS value          text;   -- legacy, unused by code
ALTER TABLE public.dropdown_options ADD COLUMN IF NOT EXISTS created_at     timestamptz DEFAULT now();

-- ==============================================================================
-- 10. notifications / user_notifications   (notificationApi.js)
--     ROOT CAUSE of "column created_by not found":
--       code inserts {title, message, role_target, created_by} and reads
--       notifications.created_by / .role_target; schema_checklist_delegation.sql
--       defined neither (it has target_role / target_user_id instead).
--     created_by is TEXT so it works whether users.id is text ('USR-01') or
--     numeric (code sends parseInt(userId) or null).
--     user_notifications is upserted with onConflict 'user_id, notification_id'
--     -> UNIQUE index added in section 15.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id          bigserial PRIMARY KEY,
    title       text,
    message     text,
    created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS title          text;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS message        text;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS role_target    text DEFAULT 'all';   -- fetch filter .in('role_target',['all',role])
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS created_by     text;                 -- creator users.id  (MISSING before)
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type           text DEFAULT 'info';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS action_url     text;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS target_role    text;                 -- legacy alias
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS target_user_id  text;                -- legacy alias
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS user_name      text;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read        boolean DEFAULT false;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS created_at     timestamptz DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_created_by ON public.notifications (created_by);

CREATE TABLE IF NOT EXISTS public.user_notifications (
    id               bigserial PRIMARY KEY,
    notification_id  bigint,
    user_id          text,
    is_read          boolean DEFAULT false,
    created_at       timestamptz DEFAULT now()
);
ALTER TABLE public.user_notifications ADD COLUMN IF NOT EXISTS notification_id  bigint;
ALTER TABLE public.user_notifications ADD COLUMN IF NOT EXISTS user_id          text;
ALTER TABLE public.user_notifications ADD COLUMN IF NOT EXISTS is_read          boolean DEFAULT false;
ALTER TABLE public.user_notifications ADD COLUMN IF NOT EXISTS read_at          timestamptz;
ALTER TABLE public.user_notifications ADD COLUMN IF NOT EXISTS created_at       timestamptz DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON public.user_notifications (user_id);

-- ==============================================================================
-- 11. whatsapp_logs   (whatsappService.js insertLog / whatsappLogService)
--     NOTE (conflict): schema_checklist_delegation.sql created recipient_phone
--     NOT NULL; the code writes phone_number (and message_type, stage,
--     error_message, sender_name, reference_id, message_id, direction) and
--     updates is_read.  Legacy NOT NULLs are dropped below.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.whatsapp_logs (
    id          bigserial PRIMARY KEY,
    created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS recipient_name  text;
ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS phone_number    text;
ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS message_type    text;
ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS stage           text;
ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS message_content text;
ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS status          text;
ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS error_message   text;
ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS sender_name     text;
ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS reference_id    text;
ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS message_id      text;
ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS direction       text DEFAULT 'outbound';
ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS is_read         boolean DEFAULT false;
ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS created_at      timestamptz DEFAULT now();
-- legacy columns from schema_checklist_delegation.sql (kept, but no longer required)
ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS recipient_phone   text;
ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS task_id           text;
ALTER TABLE public.whatsapp_logs ADD COLUMN IF NOT EXISTS response_payload  jsonb;
DO $$
DECLARE c text;
BEGIN
    FOREACH c IN ARRAY ARRAY['recipient_phone','message_content','recipient_name','status'] LOOP
        BEGIN
            EXECUTE format('ALTER TABLE public.whatsapp_logs ALTER COLUMN %I DROP NOT NULL', c);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'whatsapp_logs.%: %', c, SQLERRM;
        END;
    END LOOP;
END $$;
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_created_at ON public.whatsapp_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_phone      ON public.whatsapp_logs (phone_number);

-- Realtime: whatsappService.subscribeToChanges and RealtimeLogoutListener / Setting.jsx
-- listen to postgres_changes on whatsapp_logs and users.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='whatsapp_logs') THEN
                ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_logs;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='users') THEN
                ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'realtime publication: %', SQLERRM;
        END;
    END IF;
END $$;

-- ==============================================================================
-- 12. order-to-delivery   (utils/storage.js, utils/masterStorage.js)
--     Same definition as supabase/order_delivery_users.sql step 4.
--     masterStorage upserts {kind, id, data} -> needs the (kind, id) primary key.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.order_delivery_orders (
    id          text PRIMARY KEY,
    data        jsonb NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.order_delivery_orders ADD COLUMN IF NOT EXISTS data        jsonb;
ALTER TABLE public.order_delivery_orders ADD COLUMN IF NOT EXISTS created_at  timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.order_delivery_orders ADD COLUMN IF NOT EXISTS updated_at  timestamptz NOT NULL DEFAULT now();  -- saveOrder writes it

CREATE TABLE IF NOT EXISTS public.order_delivery_masters (
    kind        text NOT NULL,
    id          text NOT NULL,
    data        jsonb NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (kind, id)
);
ALTER TABLE public.order_delivery_masters ADD COLUMN IF NOT EXISTS data        jsonb;
ALTER TABLE public.order_delivery_masters ADD COLUMN IF NOT EXISTS created_at  timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.order_delivery_masters ADD COLUMN IF NOT EXISTS updated_at  timestamptz NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_odm_kind ON public.order_delivery_masters (kind);

-- ==============================================================================
-- 13. core/* tables
--     festival_contacts (GlobalSettigns.jsx): stores the GLOBAL_SHIP_TO row
--       {name, phone_number, is_active, extra_fields jsonb}
--     vendors / transporters (MasterDataView.jsx, Master Data tab)
--     NOTE (conflict): database/schema_masters.sql defines vendors / transporters
--     with phone NOT NULL, a VARCHAR id with no default and none of the columns
--     MasterDataView writes (contact, email, gstin, payment_terms, fix_transporter,
--     contacts[], cities[], duration...).  Columns are added and NOT NULL relaxed;
--     the order-to-delivery module no longer uses these tables (it uses
--     order_delivery_masters).
--     purchase_* / newpete_settings are referenced by core code (TAT service,
--     MasterDataView) but have NO definition anywhere in the repo; minimal
--     definitions are created from the columns the code touches.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.festival_contacts (
    id            bigserial PRIMARY KEY,
    name          text,
    phone_number  text,
    is_active     boolean DEFAULT true,
    extra_fields  jsonb,
    created_at    timestamptz DEFAULT now()
);
ALTER TABLE public.festival_contacts ADD COLUMN IF NOT EXISTS name          text;
ALTER TABLE public.festival_contacts ADD COLUMN IF NOT EXISTS phone_number  text;
ALTER TABLE public.festival_contacts ADD COLUMN IF NOT EXISTS is_active     boolean DEFAULT true;
ALTER TABLE public.festival_contacts ADD COLUMN IF NOT EXISTS extra_fields  jsonb;
ALTER TABLE public.festival_contacts ADD COLUMN IF NOT EXISTS created_at    timestamptz DEFAULT now();

CREATE TABLE IF NOT EXISTS public.vendors (
    id          text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name        text,
    created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS name             text;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS contact          text;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS address          text;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS email            text;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS city             text;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS gstin            text;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS payment_terms    text;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS fix_transporter  text;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS phone            text;  -- legacy
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS created_at       timestamptz DEFAULT now();
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS updated_at       timestamptz DEFAULT now();

CREATE TABLE IF NOT EXISTS public.transporters (
    id          text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name        text,
    created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.transporters ADD COLUMN IF NOT EXISTS name       text;
ALTER TABLE public.transporters ADD COLUMN IF NOT EXISTS contacts   jsonb DEFAULT '[]'::jsonb;  -- multi value; code inserts []
ALTER TABLE public.transporters ADD COLUMN IF NOT EXISTS duration   text;
ALTER TABLE public.transporters ADD COLUMN IF NOT EXISTS cities     jsonb DEFAULT '[]'::jsonb;  -- multi value
ALTER TABLE public.transporters ADD COLUMN IF NOT EXISTS address    text;
ALTER TABLE public.transporters ADD COLUMN IF NOT EXISTS phone      text;  -- legacy
ALTER TABLE public.transporters ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.transporters ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
DO $$
DECLARE t text;
BEGIN
    FOREACH t IN ARRAY ARRAY['vendors','transporters'] LOOP
        BEGIN
            EXECUTE format('ALTER TABLE public.%I ALTER COLUMN phone DROP NOT NULL', t);
        EXCEPTION WHEN OTHERS THEN RAISE NOTICE '%.phone: %', t, SQLERRM; END;
    END LOOP;
END $$;

CREATE TABLE IF NOT EXISTS public.purchase_master_items (
    id          bigserial PRIMARY KEY,
    item_details text,
    created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.purchase_master_items ADD COLUMN IF NOT EXISTS item_details         text;
ALTER TABLE public.purchase_master_items ADD COLUMN IF NOT EXISTS online_item_name     text;
ALTER TABLE public.purchase_master_items ADD COLUMN IF NOT EXISTS vendor               text;
ALTER TABLE public.purchase_master_items ADD COLUMN IF NOT EXISTS category             text;
ALTER TABLE public.purchase_master_items ADD COLUMN IF NOT EXISTS unit                 text;
ALTER TABLE public.purchase_master_items ADD COLUMN IF NOT EXISTS parent_group         text;
ALTER TABLE public.purchase_master_items ADD COLUMN IF NOT EXISTS shelf_capacity       numeric;
ALTER TABLE public.purchase_master_items ADD COLUMN IF NOT EXISTS max_level_qty        numeric;
ALTER TABLE public.purchase_master_items ADD COLUMN IF NOT EXISTS rol_qty              numeric;
ALTER TABLE public.purchase_master_items ADD COLUMN IF NOT EXISTS reorder_level        numeric;
ALTER TABLE public.purchase_master_items ADD COLUMN IF NOT EXISTS order_formula        text;
ALTER TABLE public.purchase_master_items ADD COLUMN IF NOT EXISTS min_order_qty        numeric;
ALTER TABLE public.purchase_master_items ADD COLUMN IF NOT EXISTS eligible_for_online  text;
ALTER TABLE public.purchase_master_items ADD COLUMN IF NOT EXISTS variant_available    text;
ALTER TABLE public.purchase_master_items ADD COLUMN IF NOT EXISTS image_url            text;
ALTER TABLE public.purchase_master_items ADD COLUMN IF NOT EXISTS item_description     text;
ALTER TABLE public.purchase_master_items ADD COLUMN IF NOT EXISTS created_at           timestamptz DEFAULT now();

CREATE TABLE IF NOT EXISTS public.newpete_settings (
    id          bigserial PRIMARY KEY,
    created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.newpete_settings ADD COLUMN IF NOT EXISTS setting_name   text;
ALTER TABLE public.newpete_settings ADD COLUMN IF NOT EXISTS setting_value  text;
ALTER TABLE public.newpete_settings ADD COLUMN IF NOT EXISTS created_at     timestamptz DEFAULT now();

-- tatService.js
CREATE TABLE IF NOT EXISTS public.purchase_tat_settings (
    id           bigserial PRIMARY KEY,
    stage_key    text,
    tat_minutes  integer DEFAULT 20,
    is_active    boolean DEFAULT true,
    updated_at   timestamptz DEFAULT now()
);
ALTER TABLE public.purchase_tat_settings ADD COLUMN IF NOT EXISTS stage_key    text;
ALTER TABLE public.purchase_tat_settings ADD COLUMN IF NOT EXISTS tat_minutes  integer DEFAULT 20;
ALTER TABLE public.purchase_tat_settings ADD COLUMN IF NOT EXISTS is_active    boolean DEFAULT true;
ALTER TABLE public.purchase_tat_settings ADD COLUMN IF NOT EXISTS updated_at   timestamptz DEFAULT now();
ALTER TABLE public.purchase_tat_settings ADD COLUMN IF NOT EXISTS created_at   timestamptz DEFAULT now();

CREATE TABLE IF NOT EXISTS public.purchase_tat_tracking (
    id          bigserial PRIMARY KEY,
    entity_id   text,
    stage_key   text,
    updated_at  timestamptz DEFAULT now()
);
ALTER TABLE public.purchase_tat_tracking ADD COLUMN IF NOT EXISTS entity_id     text;
ALTER TABLE public.purchase_tat_tracking ADD COLUMN IF NOT EXISTS stage_key     text;
ALTER TABLE public.purchase_tat_tracking ADD COLUMN IF NOT EXISTS started_at    timestamptz;
ALTER TABLE public.purchase_tat_tracking ADD COLUMN IF NOT EXISTS planned_at    timestamptz;
ALTER TABLE public.purchase_tat_tracking ADD COLUMN IF NOT EXISTS completed_at  timestamptz;
ALTER TABLE public.purchase_tat_tracking ADD COLUMN IF NOT EXISTS status        text DEFAULT 'Pending';
ALTER TABLE public.purchase_tat_tracking ADD COLUMN IF NOT EXISTS updated_at     timestamptz DEFAULT now();
ALTER TABLE public.purchase_tat_tracking ADD COLUMN IF NOT EXISTS created_at     timestamptz DEFAULT now();

-- purchase_deliveries is only READ by tatService (id, po_id, received, received_at)
CREATE TABLE IF NOT EXISTS public.purchase_deliveries (
    id          bigserial PRIMARY KEY,
    po_id       text,
    received    boolean DEFAULT false,
    received_at timestamptz
);
ALTER TABLE public.purchase_deliveries ADD COLUMN IF NOT EXISTS po_id        text;
ALTER TABLE public.purchase_deliveries ADD COLUMN IF NOT EXISTS received     boolean DEFAULT false;
ALTER TABLE public.purchase_deliveries ADD COLUMN IF NOT EXISTS received_at  timestamptz;

-- legacy table touched by checklist supabaseApiAdapter.js (sheet-adapter shim)
CREATE TABLE IF NOT EXISTS public.tasks (
    id          bigserial PRIMARY KEY,
    task_id     text,
    created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS task_id      text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS status       text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS actual_date  timestamptz;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS remarks      text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS image_url    text;

-- ==============================================================================
-- 14. DEFAULT VALUES FOR KEYS THE CODE NEVER SENDS
--     (a) id default for text/int ids on tables where inserts omit id
--     (b) task_id default (auto number) for checklist / delegation / ea_tasks:
--         assignTaskApi / EATask insert rows WITHOUT task_id, but every read/update
--         path looks rows up by task_id.
-- ==============================================================================
DO $$
DECLARE r record; seq text; mx bigint;
BEGIN
    FOR r IN
        SELECT c.table_name, c.data_type
        FROM information_schema.columns c
        WHERE c.table_schema = 'public' AND c.column_name = 'id'
          AND c.column_default IS NULL AND COALESCE(c.is_identity,'NO') = 'NO'
          AND c.table_name IN ('departments','vendors','transporters')
    LOOP
        BEGIN
            IF r.data_type IN ('text','character varying') THEN
                EXECUTE format('ALTER TABLE public.%I ALTER COLUMN id SET DEFAULT gen_random_uuid()::text', r.table_name);
            ELSIF r.data_type IN ('integer','bigint','smallint') THEN
                seq := r.table_name || '_id_seq';
                EXECUTE format('CREATE SEQUENCE IF NOT EXISTS public.%I', seq);
                EXECUTE format('SELECT COALESCE(MAX(id),0) FROM public.%I', r.table_name) INTO mx;
                EXECUTE format('SELECT setval(%L, %s, false)', 'public.' || seq, mx + 1);
                EXECUTE format('ALTER TABLE public.%I ALTER COLUMN id SET DEFAULT nextval(%L)', r.table_name, 'public.' || seq);
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '%.id default: %', r.table_name, SQLERRM;
        END;
    END LOOP;
END $$;

DO $$
DECLARE t text; dt text; dflt text; seq text; mx bigint;
BEGIN
    FOREACH t IN ARRAY ARRAY['checklist','delegation','ea_tasks'] LOOP
        BEGIN
            SELECT data_type, column_default INTO dt, dflt
            FROM information_schema.columns
            WHERE table_schema='public' AND table_name=t AND column_name='task_id';
            IF dt IS NOT NULL AND dflt IS NULL THEN
                seq := t || '_task_id_seq';
                EXECUTE format('CREATE SEQUENCE IF NOT EXISTS public.%I', seq);
                IF dt IN ('integer','bigint','smallint') THEN
                    EXECUTE format('SELECT COALESCE(MAX(task_id),0) FROM public.%I', t) INTO mx;
                    EXECUTE format('SELECT setval(%L, %s, false)', 'public.' || seq, mx + 1);
                    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN task_id SET DEFAULT nextval(%L)', t, 'public.' || seq);
                ELSE
                    EXECUTE format('SELECT COALESCE(MAX(task_id::bigint),0) FROM public.%I WHERE task_id ~ ''^[0-9]{1,15}$''', t) INTO mx;
                    EXECUTE format('SELECT setval(%L, %s, false)', 'public.' || seq, mx + 1);
                    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN task_id SET DEFAULT nextval(%L)::text', t, 'public.' || seq);
                END IF;
                -- back-fill rows that already have no task_id
                IF dt IN ('integer','bigint','smallint') THEN
                    EXECUTE format('UPDATE public.%I SET task_id = nextval(%L) WHERE task_id IS NULL', t, 'public.' || seq);
                ELSE
                    EXECUTE format('UPDATE public.%I SET task_id = nextval(%L)::text WHERE task_id IS NULL', t, 'public.' || seq);
                END IF;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '%.task_id default: %', t, SQLERRM;
        END;
    END LOOP;
END $$;

-- ==============================================================================
-- 15. UNIQUE INDEXES REQUIRED BY .upsert(onConflict) CALLS
--     (guarded: if existing data has duplicates the index is skipped with a NOTICE)
-- ==============================================================================
DO $$
BEGIN
    -- checkListApi.updateChecklistData: .upsert(updates, { onConflict: ['task_id'] })
    BEGIN CREATE UNIQUE INDEX IF NOT EXISTS uq_checklist_task_id   ON public.checklist  (task_id);
    EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'uq_checklist_task_id skipped: %', SQLERRM; END;
    BEGIN CREATE UNIQUE INDEX IF NOT EXISTS uq_delegation_task_id  ON public.delegation (task_id);
    EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'uq_delegation_task_id skipped: %', SQLERRM; END;
    BEGIN CREATE UNIQUE INDEX IF NOT EXISTS uq_ea_tasks_task_id    ON public.ea_tasks   (task_id);
    EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'uq_ea_tasks_task_id skipped: %', SQLERRM; END;
    -- notificationApi.markAsReadApi: onConflict 'user_id, notification_id'
    BEGIN CREATE UNIQUE INDEX IF NOT EXISTS uq_user_notifications_user_notification
              ON public.user_notifications (user_id, notification_id);
    EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'uq_user_notifications skipped: %', SQLERRM; END;
    -- tatService: onConflict 'stage_key' and 'entity_id, stage_key'
    BEGIN CREATE UNIQUE INDEX IF NOT EXISTS uq_purchase_tat_settings_stage_key
              ON public.purchase_tat_settings (stage_key);
    EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'uq_purchase_tat_settings skipped: %', SQLERRM; END;
    BEGIN CREATE UNIQUE INDEX IF NOT EXISTS uq_purchase_tat_tracking_entity_stage
              ON public.purchase_tat_tracking (entity_id, stage_key);
    EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'uq_purchase_tat_tracking skipped: %', SQLERRM; END;
    -- MasterDataView import: onConflict 'item_details'
    BEGIN CREATE UNIQUE INDEX IF NOT EXISTS uq_purchase_master_items_item_details
              ON public.purchase_master_items (item_details);
    EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'uq_purchase_master_items skipped: %', SQLERRM; END;
END $$;

-- ==============================================================================
-- 16. STORAGE BUCKETS used by the code (public, anon upload allowed).
--     Buckets: checklist, maintenance, repair, parts, profiles, user-profiles,
--     audio-recordings, task-instructions, purchase-builty
--     Skipped automatically if the storage schema is not present.
-- ==============================================================================
DO $$
DECLARE b text;
BEGIN
    IF to_regclass('storage.buckets') IS NOT NULL THEN
        FOREACH b IN ARRAY ARRAY['checklist','maintenance','repair','parts','profiles','user-profiles',
                                 'audio-recordings','task-instructions','purchase-builty'] LOOP
            BEGIN
                INSERT INTO storage.buckets (id, name, public) VALUES (b, b, true)
                ON CONFLICT (id) DO NOTHING;
            EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'bucket %: %', b, SQLERRM; END;
        END LOOP;

        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects'
                           AND policyname='app_buckets_public_all') THEN
                CREATE POLICY app_buckets_public_all ON storage.objects
                    FOR ALL USING (bucket_id IN ('checklist','maintenance','repair','parts','profiles','user-profiles',
                                                 'audio-recordings','task-instructions','purchase-builty'))
                    WITH CHECK (bucket_id IN ('checklist','maintenance','repair','parts','profiles','user-profiles',
                                              'audio-recordings','task-instructions','purchase-builty'));
            END IF;
        EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'storage policy: %', SQLERRM; END;
    END IF;
END $$;

-- ==============================================================================
-- 17. ROOT ADMIN (only if no row with this id) and PostgREST schema reload
-- ==============================================================================
-- Guarded so a type mismatch (e.g. legacy numeric users.id) or an existing admin
-- user never aborts the whole script.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE lower(user_name) = 'admin' OR lower(username) = 'admin') THEN
        INSERT INTO public.users (id, username, user_name, name, password, email, email_id, role, is_admin, status,
                                  allowed_pages, allowed_stages, system_access, page_access, can_self_assign)
        VALUES ('USR-ADMIN', 'admin', 'admin', 'Sainy Garg', 'admin123', 'admin@sainygargcouture.com',
                'admin@sainygargcouture.com', 'Admin', true, 'active',
                '["dashboard","orders","stages","settings"]'::jsonb,
                '["material_check","embroidery_marking_cutting","embroidery_sample_approval","full_embroidery","final_cutting_karigar_allotment","stitching_completed","first_qc_alterations_cleared","finishing_final_qc_passed","trial_packing_pickup","final_trial_delivered_return"]'::jsonb,
                'all', 'all', true);
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'admin seed skipped: %', SQLERRM;
END $$;

NOTIFY pgrst, 'reload schema';

-- =====================================================================
-- ROUTE RENAME MIGRATION: /dashboard/... -> /checklist/...
-- Saved permission ids and legacy page_access lists still hold the old paths.
-- =====================================================================
UPDATE public.users
SET allowed_checklist_pages = (
  SELECT jsonb_agg(replace(v, '/dashboard/', '/checklist/'))
  FROM jsonb_array_elements_text(allowed_checklist_pages::jsonb) AS v
)
WHERE allowed_checklist_pages IS NOT NULL
  AND allowed_checklist_pages::text LIKE '%/dashboard/%'
  AND pg_typeof(allowed_checklist_pages)::text = 'jsonb';

NOTIFY pgrst, 'reload schema';
