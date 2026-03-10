import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validation for Supabase initialization
const validateSupabaseConfig = (url, key) => {
    if (!url || !key) {
        console.error('Supabase Error: URL or Anon Key is missing in environment variables.');
        return false;
    }
    try {
        new URL(url);
        return true;
    } catch (e) {
        console.error('Supabase Error: Invalid URL provided:', url);
        return false;
    }
};

const isConfigValid = validateSupabaseConfig(supabaseUrl, supabaseAnonKey);

export const supabase = isConfigValid
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

if (!supabase) {
    console.warn('Supabase client failed to initialize. Storage features will be unavailable.');
}

/**
 * Uploads a file to Supabase Storage.
 * @param {File} file - The file to upload.
 * @param {string} registration - Student registration number for unique path.
 * @param {string} bucketName - The target bucket name (default: 'student-photos').
 * @returns {Promise<string>} - The public URL of the uploaded image.
 */
export const uploadToSupabase = async (file, registration, bucketName = 'student bcc') => {
    if (!supabase) {
        console.error('Supabase client is not initialized. Cannot upload.');
        throw new Error('Supabase client is not initialized. Please check your configuration.');
    }
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
                upsert: true,
                contentType: file.type || 'image/jpeg'
            });

        if (error) {
            console.error('Supabase Upload Error:', error);
            throw new Error(`Supabase upload failed: ${error.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        console.log('Generated Supabase URL:', publicUrl);
        return publicUrl;
    } catch (error) {
        console.error('Supabase protocol error:', error);
        throw error;
    }
};
