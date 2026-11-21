/**
 * IMAGE UPLOADER HELPER
 * Upload local design images or extracted HTML images into the Supabase 'design-assets' bucket.
 * 
 * Usage:
 *   node scripts/upload_design_images.cjs <path_to_images_folder>
 * 
 * Example:
 *   node scripts/upload_design_images.cjs ./images
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://cagibmportrxcvoerutv.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_1Tp9ddXydm2FEE-YNdqUcA_7Adibzrd';
const BUCKET_NAME = 'design-assets';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function uploadImages(folderPath) {
  if (!folderPath || !fs.existsSync(folderPath)) {
    console.error(`Folder "${folderPath}" does not exist. Please pass a valid directory path.`);
    process.exit(1);
  }

  const files = fs.readdirSync(folderPath).filter(f => /\.(png|jpe?g|webp|avif)$/i.test(f));
  console.log(`Found ${files.length} images to upload in "${folderPath}"...`);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fullPath = path.join(folderPath, file);
    const fileBuffer = fs.readFileSync(fullPath);
    const ext = path.extname(file).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

    console.log(`[${i + 1}/${files.length}] Uploading ${file}...`);
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(file, fileBuffer, {
        contentType: mimeType,
        upsert: true
      });

    if (error) {
      console.error(`  ❌ Failed to upload ${file}:`, error.message);
    } else {
      const { data: pub } = supabase.storage.from(BUCKET_NAME).getPublicUrl(file);
      console.log(`  ✅ Public URL: ${pub.publicUrl}`);
    }
  }

  console.log('\nAll images processed.');
}

const targetFolder = process.argv[2] || './design_images';
uploadImages(targetFolder).catch(console.error);
