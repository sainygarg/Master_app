import supabase from '../../../core/config/supabaseClient';

export const ORDER_IMAGE_BUCKET = 'order-images';

// Downscale + re-encode so uploads stay small (max 1280px, JPEG 70%)
const compressToBlob = (file, max = 1280, quality = 0.7) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not read image'));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not process image'))), 'image/jpeg', quality);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

// Uploads a photo to Supabase Storage and returns its public URL.
// Orders then store only this short URL instead of megabytes of base64.
export const uploadOrderImage = async (file, folder = 'drafts') => {
  const blob = await compressToBlob(file);
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await supabase.storage
    .from(ORDER_IMAGE_BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
  if (error) throw error;
  return supabase.storage.from(ORDER_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
};
