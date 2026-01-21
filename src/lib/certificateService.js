import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase/firestore';
import { storage } from '../firebase/storage';

/**
 * Generate a unique certificate number
 * Format: BTCR/YYYY/XXXXX
 */
export const generateCertificateNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    return `BTCR/${year}/${random}`;
};

/**
 * Generate a unique marksheet number
 * Format: YYYY/NARDBLY/XXXXX
 */
export const generateMarksheetNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    return `${year}/NARDBLY/${random}`;
};

/**
 * Save certificate data to Firestore
 */
export const saveCertificate = async (certificateData) => {
    try {
        const certificatesRef = collection(db, 'certificates');
        const docRef = await addDoc(certificatesRef, {
            ...certificateData,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error saving certificate:', error);
        throw error;
    }
};

/**
 * Upload certificate PDF to Firebase Storage (Legacy)
 */
export const uploadCertificatePDF = async (blob, filename) => {
    try {
        const storageRef = ref(storage, `certificates/${filename}`);
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading PDF:', error);
        throw error;
    }
};

/**
 * Convert Blob to Base64
 */
export const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

/**
 * Upload certificate PDF to GitHub
 */
export const uploadToGitHub = async (blob, filename) => {
    console.log("Starting GitHub Upload for:", filename);
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    const owner = import.meta.env.VITE_GITHUB_OWNER;
    const repo = import.meta.env.VITE_GITHUB_REPO;

    if (!token || !owner || !repo) {
        console.error("Missing GitHub Env Vars", { owner, repo, hasToken: !!token });
        throw new Error("GitHub credentials not found in environment variables");
    }

    try {
        const content = await blobToBase64(blob);
        const path = `certificates/${filename}`;
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

        console.log("Uploading to:", url);

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json',
            },
            body: JSON.stringify({
                message: `Add certificate: ${filename}`,
                content: content,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("GitHub API Error:", error);
            throw new Error(`GitHub Upload Failed: ${error.message}`);
        }

        const data = await response.json();
        console.log("GitHub Upload Success:", data);
        return data.content.download_url;
    } catch (error) {
        console.error('Error uploading to GitHub:', error);
        throw error;
    }
};

/**
 * Get all certificates
 */
export const getCertificates = async () => {
    try {
        const certificatesRef = collection(db, 'certificates');
        const q = query(certificatesRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const certificates = [];
        querySnapshot.forEach((doc) => {
            certificates.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        return certificates;
    } catch (error) {
        console.error('Error fetching certificates:', error);
        throw error;
    }
};

/**
 * Delete certificate
 */
export const deleteCertificate = async (certificateId) => {
    try {
        const certificateRef = doc(db, 'certificates', certificateId);
        await deleteDoc(certificateRef);
    } catch (error) {
        console.error('Error deleting certificate:', error);
        throw error;
    }
};

/**
 * Calculate grade based on percentage
 */
export const calculateGrade = (percentage, subjects = []) => {
    // Check if any subject is failed based on minMarks (default 33)
    const hasFailedSubject = subjects.some(s => s.obtained < (s.minMarks || 33));
    if (hasFailedSubject) return 'F';

    if (percentage >= 85) return 'A+';
    if (percentage >= 75) return 'A';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
};

/**
 * Calculate division based on percentage
 */
export const calculateDivision = (percentage, subjects = []) => {
    // Check if any subject is failed based on minMarks (default 33)
    const hasFailedSubject = subjects.some(s => s.obtained < (s.minMarks || 33));
    if (hasFailedSubject || percentage < 33) return 'Fail';

    if (percentage >= 60) return '1st Division';
    if (percentage >= 45) return '2nd Division';
    if (percentage >= 33) return '3rd Division';
    return 'Fail';
};
