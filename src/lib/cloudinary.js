const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'da8todyb7';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'alumni_preset';

/**
 * Uploads a file to Cloudinary using Unsigned Uploads.
 * This keeps the API Secret safe from exposure in the frontend.
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export const uploadToCloudinary = async (file) => {
    if (!file) return null;

    // Performance optimization: Check file size (800KB limit for consistency)
    if (file.size > 800 * 1024) {
        throw new Error('Image size exceeds 800KB. Please optimize your graphic.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error('Cloudinary Error:', error);
            throw new Error(error.message || 'Transmission failure to Cloudinary.');
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Cloudinary Upload Protocol Failed:', error);
        throw error;
    }
};

/**
 * Generates a transformed Cloudinary URL.
 * @param {string} publicId - The public ID or URL of the image
 * @param {object} transforms - Transformation options (width, height, crop, etc.)
 * @returns {string} - The transformed URL
 */
export const getOptimizedUrl = (url, transforms = 'f_auto,q_auto,w_600') => {
    if (!url || !url.includes('cloudinary.com')) return url;

    // Simple transformation insertion for secure URLs
    // Format: .../upload/[transforms]/v1/public_id
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;

    return `${parts[0]}/upload/${transforms}/${parts[1]}`;
};
