/**
 * SEED SCRIPT: Fetch 92 designs from Google Sheet "Data" tab and seed into Supabase.
 * 
 * Usage:
 *   node scripts/seed_designs.cjs
 */

const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://cagibmportrxcvoerutv.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_1Tp9ddXydm2FEE-YNdqUcA_7Adibzrd';
const SHEET_ID = '1jcSLPz_p62ErPcRckTkg63fUM4tO6b9nfAGf6ttt6bU';
const SUB_SHEET_NAME = 'Data';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function fetchSheetJson(sheetName) {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(sheetName);
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encoded}`;
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const jsonStr = body.substring(body.indexOf('{'), body.lastIndexOf('}') + 1);
          resolve(JSON.parse(jsonStr));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function runSeed() {
  console.log(`📡 Fetching "${SUB_SHEET_NAME}" from Google Sheet (${SHEET_ID})...`);
  const sheetData = await fetchSheetJson(SUB_SHEET_NAME);
  
  const rows = sheetData?.table?.rows || [];
  if (rows.length <= 1) {
    console.error('No rows found in sheet');
    return;
  }

  // Row 0 is the header: ["Design Image", "SKU Code", "Name Of Design", "Category", "Type ", "Color", "Design Description"]
  const dataRows = rows.slice(1);
  console.log(`✅ Loaded ${dataRows.length} design entries from sheet.\n`);

  const recordsToInsert = [];

  for (let i = 0; i < dataRows.length; i++) {
    const c = dataRows[i].c || [];
    
    const sku = c[1]?.v ? String(c[1].v).trim() : `SKU-${100 + i}`;
    const name = c[2]?.v ? String(c[2].v).trim() : `Design ${i + 1}`;
    const category = c[3]?.v ? String(c[3].v).trim() : 'Couture';
    const type = c[4]?.v ? String(c[4].v).trim() : '';
    const color = c[5]?.v ? String(c[5].v).trim() : '';
    const description = c[6]?.v ? String(c[6].v).trim() : '';

    // Standardized master ID: DSN-001, DSN-002, etc.
    const id = `DSN-${String(i + 1).padStart(3, '0')}`;

    // Expected Supabase Storage Image URL (for when image file is uploaded)
    const storageImagePath = `https://cagibmportrxcvoerutv.supabase.co/storage/v1/object/public/design-assets/${sku}.webp`;

    const itemData = {
      id,
      sku,
      name,
      category,
      type,
      color,
      description,
      imageUrl: storageImagePath,
      images: [storageImagePath],
      sourceSheet: 'Data',
      createdAt: new Date().toISOString()
    };

    recordsToInsert.push({
      kind: 'design',
      id,
      data: itemData
    });
  }

  console.log(`💾 Upserting ${recordsToInsert.length} designs into 'order_delivery_masters'...`);

  // Batch insert/upsert in chunks of 25
  const chunkSize = 25;
  let totalSaved = 0;

  for (let i = 0; i < recordsToInsert.length; i += chunkSize) {
    const chunk = recordsToInsert.slice(i, i + chunkSize);
    const { error } = await supabase
      .from('order_delivery_masters')
      .upsert(chunk, { onConflict: 'kind,id' });

    if (error) {
      console.error(`❌ Error inserting chunk ${i} - ${i + chunk.length}:`, error.message);
    } else {
      totalSaved += chunk.length;
      console.log(`  Progress: ${totalSaved} / ${recordsToInsert.length} designs saved.`);
    }
  }

  console.log(`\n🎉 Seeding completed successfully! Total designs stored: ${totalSaved}`);
}

runSeed().catch(err => {
  console.error('Fatal seed error:', err);
});
