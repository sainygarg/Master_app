import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cagibmportrxcvoerutv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_1Tp9ddXydm2FEE-YNdqUcA_7Adibzrd';
const SHEET_XLSX_URL =
  'https://docs.google.com/spreadsheets/d/1jcSLPz_p62ErPcRckTkg63fUM4tO6b9nfAGf6ttt6bU/export?format=xlsx';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const norm = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

function extractDriveId(url) {
  const m1 = String(url || '').match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m1) return m1[1];
  const m2 = String(url || '').match(/\/d\/([a-zA-Z0-9_-]+)/);
  return m2 ? m2[1] : null;
}

function extFromContentType(ct) {
  const lower = String(ct || '').toLowerCase();
  if (lower.includes('png')) return { ext: 'png', contentType: 'image/png' };
  if (lower.includes('webp')) return { ext: 'webp', contentType: 'image/webp' };
  return { ext: 'jpg', contentType: 'image/jpeg' };
}

async function downloadDriveImage(driveUrl) {
  const fileId = extractDriveId(driveUrl);
  const fetchUrl = fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : driveUrl;
  const res = await fetch(fetchUrl, { redirect: 'follow' });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (!ct.startsWith('image/')) {
    throw new Error(`Non-image content-type: ${ct}`);
  }
  const arrayBuf = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuf);
  if (buffer.length < 100) {
    throw new Error('Empty or corrupt image buffer');
  }
  return { buffer, ...extFromContentType(ct) };
}

async function runPool(items, concurrency, fn) {
  const results = new Array(items.length);
  let nextIdx = 0;
  async function worker() {
    while (nextIdx < items.length) {
      const idx = nextIdx++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

async function main() {
  console.log('1. Downloading Google Sheet workbook...');
  const sheetRes = await fetch(SHEET_XLSX_URL, { redirect: 'follow' });
  if (!sheetRes.ok) throw new Error(`Failed to fetch sheet: HTTP ${sheetRes.status}`);
  const sheetBuf = Buffer.from(await sheetRes.arrayBuffer());
  const wb = XLSX.read(sheetBuf, { type: 'buffer' });

  const imageSheetName = wb.SheetNames.find((n) => n.toLowerCase() === 'image') || wb.SheetNames.find((n) => n.toLowerCase().includes('image'));
  if (!imageSheetName) throw new Error('Could not find "Image" tab in workbook');
  const rawRows = XLSX.utils.sheet_to_json(wb.Sheets[imageSheetName], { defval: '' });
  console.log(`Loaded ${rawRows.length} rows from "${imageSheetName}" tab.`);

  console.log('2. Checking existing master_design rows in Supabase...');
  let hasImagesCol = true;
  let { data: existingDesigns, error: fetchErr } = await supabase
    .from('master_design')
    .select('id, sku, name, category, type, description, image_url, images');

  if (fetchErr && String(fetchErr.message || '').includes('images')) {
    hasImagesCol = false;
    console.warn('Warning: "images" column not found on master_design yet. Will sync primary image_url only.');
    const fallback = await supabase
      .from('master_design')
      .select('id, sku, name, category, type, description, image_url');
    if (fallback.error) throw fallback.error;
    existingDesigns = fallback.data;
  } else if (fetchErr) {
    throw fetchErr;
  }

  console.log(`Found ${existingDesigns.length} existing designs in Supabase.`);

  const dbByName = new Map();
  const usedSkus = new Set();
  let maxDsnNum = 0;

  for (const d of existingDesigns) {
    dbByName.set(norm(d.name), d);
    if (d.sku) usedSkus.add(String(d.sku).toLowerCase());
    const m = String(d.id || '').match(/DSN-(\d+)/i);
    if (m) maxDsnNum = Math.max(maxDsnNum, parseInt(m[1], 10));
  }

  // Group/deduplicate sheet rows by normalized product name
  const parsedDesigns = [];
  const seenSheetNames = new Set();

  for (const r of rawRows) {
    const rawName = String(r['PRODUCT NAME '] || r['PRODUCT NAME'] || '').trim();
    if (!rawName) continue;
    const key = norm(rawName);
    if (seenSheetNames.has(key)) continue;
    seenSheetNames.add(key);

    const links = [];
    for (let i = 1; i <= 11; i++) {
      const val = String(r[String(i)] || '').trim();
      if (val.startsWith('http') && !links.includes(val)) links.push(val);
    }
    if (links.length === 0 && r['IMAGE LINKS']) {
      String(r['IMAGE LINKS'])
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.startsWith('http'))
        .forEach((u) => {
          if (!links.includes(u)) links.push(u);
        });
    }

    const collection = String(r['Collection name '] || r['Collection name'] || '').trim();
    const subCat = String(r['Sub category '] || r['Sub category'] || '').trim();
    const fabric = String(r['FABRIC'] || '').trim();

    parsedDesigns.push({
      rawName,
      normName: key,
      links,
      collection,
      subCat,
      fabric,
    });
  }

  console.log(`3. Processing ${parsedDesigns.length} unique designs from sheet...`);

  let updatedExisting = 0;
  let createdNew = 0;
  let totalImagesUploaded = 0;
  let totalImagesFailed = 0;

  for (let idx = 0; idx < parsedDesigns.length; idx++) {
    const item = parsedDesigns[idx];
    const existing = dbByName.get(item.normName);

    let targetId;
    let targetSku;
    if (existing) {
      targetId = existing.id;
      targetSku = existing.sku || `sg${slugify(item.rawName)}`;
    } else {
      maxDsnNum += 1;
      targetId = `DSN-${String(maxDsnNum).padStart(3, '0')}`;
      let baseSku = `sg${slugify(item.rawName).slice(0, 18) || maxDsnNum}`;
      let candidate = baseSku;
      let suffix = 2;
      while (usedSkus.has(candidate.toLowerCase())) {
        candidate = `${baseSku}${suffix++}`;
      }
      targetSku = candidate;
      usedSkus.add(targetSku.toLowerCase());
    }

    // Download & upload all images for this design concurrently (up to 4 per design)
    const uploadedUrls = [];
    if (item.links.length > 0) {
      const results = await runPool(item.links, 4, async (driveUrl, imgIdx) => {
        try {
          const { buffer, ext, contentType } = await downloadDriveImage(driveUrl);
          const fileName = `${targetSku}-${imgIdx + 1}.${ext}`;
          const { error: upErr } = await supabase.storage.from('designs').upload(fileName, buffer, {
            contentType,
            upsert: true,
          });
          if (upErr) throw upErr;
          const { data: pub } = supabase.storage.from('designs').getPublicUrl(fileName);
          totalImagesUploaded++;
          return pub.publicUrl;
        } catch (err) {
          totalImagesFailed++;
          console.warn(`  [!] ${item.rawName} img #${imgIdx + 1} failed (${err.message})`);
          return null;
        }
      });
      results.filter(Boolean).forEach((u) => uploadedUrls.push(u));
    }

    if (existing) {
      const existingImgs = Array.isArray(existing.images)
        ? existing.images.filter(Boolean)
        : existing.image_url
          ? [existing.image_url]
          : [];
      const mergedImgs = [...existingImgs];
      uploadedUrls.forEach((u) => {
        if (!mergedImgs.includes(u)) mergedImgs.push(u);
      });

      const updatePayload = {
        image_url: existing.image_url || mergedImgs[0] || null,
        category: existing.category || item.collection || 'Couture',
        type: existing.type || item.subCat || null,
        description: existing.description || (item.fabric ? `Fabric: ${item.fabric}` : null),
      };
      if (hasImagesCol) {
        updatePayload.images = mergedImgs;
      }

      const { error: uErr } = await supabase.from('master_design').update(updatePayload).eq('id', existing.id);
      if (uErr) {
        console.error(`  [ERR] Failed updating ${existing.id} (${item.rawName}): ${uErr.message}`);
      } else {
        updatedExisting++;
      }
    } else {
      const insertPayload = {
        id: targetId,
        sku: targetSku,
        name: item.rawName,
        category: item.collection || 'Couture',
        type: item.subCat || null,
        color: null,
        description: item.fabric ? `Fabric: ${item.fabric}` : null,
        image_url: uploadedUrls[0] || null,
      };
      if (hasImagesCol) {
        insertPayload.images = uploadedUrls;
      }

      const { error: iErr } = await supabase.from('master_design').insert(insertPayload);
      if (iErr) {
        console.error(`  [ERR] Failed inserting ${targetId} (${item.rawName}): ${iErr.message}`);
      } else {
        createdNew++;
      }
    }

    if ((idx + 1) % 15 === 0 || idx === parsedDesigns.length - 1) {
      console.log(`Progress: ${idx + 1}/${parsedDesigns.length} designs processed...`);
    }
  }

  console.log('\n=== SYNC COMPLETE ===');
  console.log(`Existing designs updated (deduplicated): ${updatedExisting}`);
  console.log(`New designs created: ${createdNew}`);
  console.log(`Images uploaded to "designs" bucket: ${totalImagesUploaded}`);
  console.log(`Images skipped/failed: ${totalImagesFailed}`);
  if (!hasImagesCol) {
    console.log('NOTE: Run the ALTER TABLE query to add the "images" JSONB column if you want all multi-image arrays saved.');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
