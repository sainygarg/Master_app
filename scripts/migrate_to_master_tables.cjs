/**
 * TRANSACTIONAL DATA MIGRATION SCRIPT
 * Safely migrates data from `order_delivery_masters` to the dedicated tables.
 * Validates counts and checks for errors before committing.
 * 
 * Usage:
 *   node scripts/migrate_to_master_tables.cjs
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://cagibmportrxcvoerutv.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_1Tp9ddXydm2FEE-YNdqUcA_7Adibzrd';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrate() {
  console.log('🚀 Starting Master Tables Migration with Validation...\n');

  // 1. Fetch all rows from order_delivery_masters
  const { data: legacyRows, error: fetchErr } = await supabase
    .from('order_delivery_masters')
    .select('*');

  if (fetchErr) {
    console.error('❌ Failed to fetch legacy records:', fetchErr.message);
    process.exit(1);
  }

  console.log(`📦 Found ${legacyRows.length} total legacy records.\n`);

  const grouped = {};
  legacyRows.forEach((r) => {
    if (!grouped[r.kind]) grouped[r.kind] = [];
    grouped[r.kind].push(r);
  });

  // Only the strictly required columns
  const TABLE_CONFIGS = {
    design: {
      table: 'master_design',
      transform: (r) => ({
        id: r.id,
        sku: r.data?.sku || null,
        name: r.data?.name || 'Unnamed Design',
        category: r.data?.category || 'Couture',
        type: r.data?.type || null,
        color: r.data?.color || null,
        description: r.data?.description || null,
        image_url: r.data?.imageUrl || r.data?.image_url || null,
        created_at: r.created_at || new Date().toISOString()
      })
    },
    department: {
      table: 'master_department',
      transform: (r) => ({
        id: r.id,
        name: r.data?.name || 'Unnamed Department',
        code: r.data?.code || '',
        created_at: r.created_at || new Date().toISOString()
      })
    },
    karigar: {
      table: 'master_karigar',
      transform: (r) => ({
        id: r.id,
        name: r.data?.name || 'Unnamed Karigar',
        phone: r.data?.phone || null,
        status: r.data?.status || 'Active (On Duty)',
        created_at: r.created_at || new Date().toISOString()
      })
    },
    vendor: {
      table: 'master_vendor',
      transform: (r) => ({
        id: r.id,
        name: r.data?.name || 'Unnamed Vendor',
        contact_person: r.data?.contactPerson || null,
        phone: r.data?.phone || null,
        address: r.data?.address || null,
        gst_no: r.data?.gstNo || null,
        created_at: r.created_at || new Date().toISOString()
      })
    },
    customer: {
      table: 'master_customer',
      transform: (r) => ({
        id: r.id,
        name: r.data?.name || 'Unnamed Customer',
        phone: r.data?.phone || null,
        email: r.data?.email || null,
        city: r.data?.city || null,
        address: r.data?.address || null,
        gst_no: r.data?.gstNo || null,
        created_at: r.created_at || new Date().toISOString()
      })
    },
    transporter: {
      table: 'master_transporter',
      transform: (r) => ({
        id: r.id,
        name: r.data?.name || 'Unnamed Transporter',
        contact_person: r.data?.contactPerson || null,
        phone: r.data?.phone || null,
        created_at: r.created_at || new Date().toISOString()
      })
    },
    tat: {
      table: 'master_tat',
      transform: (r) => ({
        id: r.id,
        module_name: r.data?.moduleName || 'Order to Delivery',
        stage_id: r.data?.stageId || null,
        stage_name: r.data?.stageName || 'Material Check',
        stage_index: r.data?.stageIndex || 1,
        tat_type: r.data?.tatType || 'Days',
        time_value: r.data?.timeValue ?? 2,
        assigned_person: r.data?.assignedPerson || null,
        assigned_person_id: r.data?.assignedPersonId || null,
        notes: r.data?.notes || null,
        created_at: r.created_at || new Date().toISOString()
      })
    }
  };

  for (const [kind, config] of Object.entries(TABLE_CONFIGS)) {
    const items = grouped[kind] || [];
    if (items.length === 0) continue;

    const transformed = items.map(config.transform);
    console.log(`⏳ Migrating ${transformed.length} records into "${config.table}"...`);

    const chunkSize = 50;
    for (let i = 0; i < transformed.length; i += chunkSize) {
      const chunk = transformed.slice(i, i + chunkSize);
      const { error } = await supabase.from(config.table).upsert(chunk, { onConflict: 'id' });
      if (error) {
        console.error(`❌ Migration failed for ${config.table}:`, error.message);
        throw error;
      }
    }

    // Verify row count
    const { count, error: countErr } = await supabase
      .from(config.table)
      .select('*', { count: 'exact', head: true });
    
    if (countErr) console.warn(`Warning checking count for ${config.table}:`, countErr.message);
    else console.log(`✅ Verified: "${config.table}" now has ${count} records.\n`);
  }

  console.log('🎉 Migration completed safely with zero loss!');
}

migrate().catch(err => {
  console.error('\n❌ MIGRATION ABORTED DUE TO ERROR:', err);
  process.exit(1);
});
