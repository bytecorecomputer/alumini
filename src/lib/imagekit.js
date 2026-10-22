const IK_ENDPOINT = 'https://upload.imagekit.io/api/v1/files/upload';
const IK_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || 'public_qclMrcU/c93AWmv54q8COQCjsyE=';
const IK_PRIVATE_KEY = import.meta.env.VITE_IMAGEKIT_PRIVATE_KEY;

/**
 * Uploads a file to ImageKit.
 */
export const uploadToImageKit = async (file, fileName = 'student_photo', folder = '/students') => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
    formData.append('useUniqueFileName', 'true');
    formData.append('folder', folder);

    const headers = new Headers();
    // ImageKit Server API requires Basic Auth: Base64(private_key:)
    if (IK_PRIVATE_KEY) {
        const auth = btoa(IK_PRIVATE_KEY + ':');
        headers.append('Authorization', `Basic ${auth}`);
    }

    try {
        const response = await fetch(IK_ENDPOINT, {
            method: 'POST',
            body: formData,
            headers: headers
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('ImageKit Error:', data);
            throw new Error(data.message || 'ImageKit upload failed. Please verify credentials in Dashboard -> API keys.');
        }

        return data.url;
    } catch (error) {
        console.error('ImageKit Protocol Failed:', error);
        throw error;
    }
};
