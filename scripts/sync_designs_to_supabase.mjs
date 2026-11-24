import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const url = 'https://cagibmportrxcvoerutv.supabase.co';
const anonKey = 'sb_publishable_1Tp9ddXydm2FEE-YNdqUcA_7Adibzrd';
const supabase = createClient(url, anonKey);

async function syncAll() {
  const designsDir = path.join(process.cwd(), 'public', 'designs');
  const files = fs.readdirSync(designsDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'));
  console.log(`Found ${files.length} images to upload to Supabase bucket 'designs'...`);

  let uploaded = 0;
  for (const file of files) {
    const filePath = path.join(designsDir, file);
    const buffer = fs.readFileSync(filePath);
    const contentType = file.endsWith('.png') ? 'image/png' : 'image/jpeg';
    const { error } = await supabase.storage.from('designs').upload(file, buffer, {
      contentType,
      upsert: true
    });
    if (error) {
      console.error(`Failed uploading ${file}: ${error.message}`);
    } else {
      uploaded++;
    }
  }
  console.log(`Successfully uploaded ${uploaded} of ${files.length} images to designs bucket.`);

  const { data: designs, error: dErr } = await supabase.from('master_design').select('id, sku, image_url');
  if (dErr) {
    console.error('Error fetching master_design:', dErr);
    return;
  }

  let updatedCount = 0;
  for (const d of designs) {
    const fileName = (d.image_url && d.image_url.includes('/')) ? d.image_url.split('/').pop() : `${d.sku}.jpg`;
    const { data: pubData } = supabase.storage.from('designs').getPublicUrl(fileName);
    const newUrl = pubData.publicUrl;

    if (d.image_url !== newUrl) {
      const { error: uErr } = await supabase.from('master_design').update({ image_url: newUrl }).eq('id', d.id);
      if (uErr) {
        console.error(`Error updating design ${d.id}: ${uErr.message}`);
      } else {
        updatedCount++;
      }
    }
  }
  console.log(`Successfully updated ${updatedCount} designs in master_design table with Supabase bucket public URLs.`);
}

syncAll().catch(console.error);
