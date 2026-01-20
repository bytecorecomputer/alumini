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
 * Upload certificate PDF to Firebase Storage
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
export const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
};

/**
 * Calculate division based on percentage
 */
export const calculateDivision = (percentage) => {
    if (percentage >= 60) return '1st';
    if (percentage >= 45) return '2nd';
    if (percentage >= 33) return '3rd';
    return 'Fail';
};
