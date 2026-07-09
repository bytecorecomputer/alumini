import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    try {
        let serviceAccount;

        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            let rawJson = process.env.FIREBASE_SERVICE_ACCOUNT;
            serviceAccount = JSON.parse(rawJson);

            if (serviceAccount.private_key) {
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            }

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } else {
            serviceAccount = {
                projectId: process.env.VITE_FIREBASE_PROJECT_ID || "practice-be58e",
                clientEmail: process.env.VITE_FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.VITE_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            };

            if (serviceAccount && serviceAccount.privateKey) {
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
            }
        }
    } catch (e) {
        console.error("Firebase Admin initialization error:", e);
    }
}

export default async function handler(req, res) {
    // Enable CORS for potential standalone frontend hits, mostly local dev
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { registration, mobile } = req.body;

        if (!registration || !mobile) {
            return res.status(400).json({ error: 'Missing registration or mobile' });
        }

        if (!admin.apps.length) {
            return res.status(500).json({ error: 'Firebase Admin not initialized.' });
        }

        const db = admin.firestore();
        const studentsRef = db.collection('students');
        
        // Query the students collection
        const snapshot = await studentsRef
            .where('registration', '==', registration.trim())
            .where('mobile', '==', mobile.trim())
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(401).json({ error: 'Invalid Registration or Mobile Number' });
        }

        const studentDoc = snapshot.docs[0];
        const studentData = studentDoc.data();

        // Create Custom Token using registration ID as the UID
        const customToken = await admin.auth().createCustomToken(studentData.registration, {
            role: 'student',
            course: studentData.course
        });

        return res.status(200).json({
            success: true,
            token: customToken,
            studentData: studentData
        });

    } catch (error) {
        console.error('Error during student login:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
