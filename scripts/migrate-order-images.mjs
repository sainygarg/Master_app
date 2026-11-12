// One-time: moves base64 photos that are still stored inside orders into Supabase Storage.
// Run AFTER database/schema_order_images.sql:   node scripts/migrate-order-images.mjs
// Add --dry to only report what would change.
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
try {
  for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch { /* fall back to process.env */ }

const url = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY || env.VITE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');

const DRY = process.argv.includes('--dry');
const supabase = createClient(url, key);
const BUCKET = 'order-images';

const isData = (v) => typeof v === 'string' && v.startsWith('data:image/');

async function upload(dataUrl, orderId) {
  const [meta, b64] = dataUrl.split(',');
  const ext = /image\/png/.test(meta) ? 'png' : /image\/webp/.test(meta) ? 'webp' : 'jpg';
  const type = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
  const path = `${orderId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, Buffer.from(b64, 'base64'), { contentType: type, cacheControl: '31536000' });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

const { data: rows, error } = await supabase.from('order_delivery_orders').select('id, data');
if (error) throw error;

let migratedOrders = 0, migratedImages = 0;
for (const row of rows) {
  const order = row.data || {};
  let changed = false;
  for (const field of ['designImages', 'inspirationImages']) {
    const list = order[field];
    if (!Array.isArray(list) || !list.some(isData)) continue;
    const next = [];
    for (const item of list) {
      if (isData(item)) {
        if (DRY) { next.push(item); migratedImages++; continue; }
        next.push(await upload(item, row.id));
        migratedImages++;
        changed = true;
      } else next.push(item);
    }
    order[field] = next;
  }
  if (changed) {
    const { error: upErr } = await supabase.from('order_delivery_orders').update({ data: order }).eq('id', row.id);
    if (upErr) { console.error('FAILED', row.id, upErr.message); continue; }
    migratedOrders++;
    console.log('migrated', row.id);
  }
}
console.log(`${DRY ? '[dry run] ' : ''}${migratedImages} image(s) ${DRY ? 'found' : 'moved'}${DRY ? '' : ` across ${migratedOrders} order(s)`}.`);
