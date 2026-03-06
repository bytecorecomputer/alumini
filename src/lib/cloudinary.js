const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'da8todyb7';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

/**
 * Uploads a file to Cloudinary using Unsigned Uploads.
 */
export const uploadToCloudinary = async (file) => {
    if (!file) return null;

    if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size too large. Please select an image under 10MB.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    console.log(`Attempting Cloudinary upload to cloud: ${CLOUD_NAME} using preset: ${UPLOAD_PRESET}`);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error('Cloudinary Server Error:', data);
            throw new Error(data.error?.message || 'Cloudinary upload failed. Check if the "Unsigned" preset is correctly configured.');
        }

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
