import { useState } from 'react';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const GITHUB_OWNER = import.meta.env.VITE_GITHUB_OWNER || 'bytecorecomputer';
const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO || 'ByteCore-diploma';

/**
 * Custom hook to securely upload files directly to a GitHub repository.
 * Extracts a File object to base64, pushes it via the GitHub REST API,
 * and returns the raw file URL for storage.
 */
export const useGithubUpload = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Remove the data:*/*;base64, prefix
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const uploadFile = async (file, rollNo) => {
        setIsUploading(true);
        setUploadError(null);

        try {
            if (!GITHUB_TOKEN) {
                throw new Error("GitHub Authentication Token is missing. Check .env configuration.");
            }

            if (file.size > 20 * 1024 * 1024) { // GitHub API allows up to ~100MB, but let's cap it at 20MB for browser memory
                throw new Error("File size exceeds the 20MB limit for API uploads.");
            }

            const base64Content = await fileToBase64(file);
            const extension = file.name.split('.').pop();
            const fileName = `${rollNo}_${Date.now()}.${extension}`;

            // Define the path inside the repo (e.g., certificates/1044_12345.pdf)
            const path = `certificates/${fileName}`;

            const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Upload certificate for roll no: ${rollNo}`,
                    content: base64Content,
                    branch: 'main'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("GitHub API Error:", errorData);
                throw new Error(errorData.message || "Failed to push file to GitHub Repository.");
            }

            const data = await response.json();

            // GitHub returns a download_url in the content object, or we can construct the raw url
            // e.g. https://raw.githubusercontent.com/bytecorecomputer/ByteCore-diploma/main/certificates/fileName
            const rawUrl = data.content?.download_url || `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${path}`;

            setIsUploading(false);
            return rawUrl;

        } catch (err) {
            console.error("GitHub Upload Process Failed:", err);
            setUploadError(err.message || 'An unexpected error occurred during GitHub upload.');
            setIsUploading(false);
            throw err;
        }
    };

    return { uploadFile, isUploading, uploadError };
};
