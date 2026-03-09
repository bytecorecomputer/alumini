import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is missing in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Uploads a file to Supabase Storage.
 * @param {File} file - The file to upload.
 * @param {string} registration - Student registration number for unique path.
 * @param {string} bucketName - The target bucket name (default: 'student-photos').
 * @returns {Promise<string>} - The public URL of the uploaded image.
 */
export const uploadToSupabase = async (file, registration, bucketName = 'student-photos') => {
    if (!file) return null;

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${registration}_${Date.now()}.${fileExt}`;
        const filePath = `profiles/${fileName}`;

        console.log(`Uploading to Supabase bucket: ${bucketName}, path: ${filePath}`);

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) {
            console.error('Supabase Upload Error:', error);
            throw new Error(`Supabase upload failed: ${error.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Supabase protocol error:', error);
        throw error;
    }
};
