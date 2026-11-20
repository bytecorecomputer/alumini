import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize Firebase Admin SDK
if (!getApps().length) {
    try {
        let serviceAccount;

        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            let rawJson = process.env.FIREBASE_SERVICE_ACCOUNT;
            serviceAccount = JSON.parse(rawJson);

            // Just in case it got unescaped during ENV storage:
            if (serviceAccount.private_key) {
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            }

            initializeApp({
                credential: cert(serviceAccount)
            });
            console.log("Firebase Admin Initialized via JSON");
        } else {
            // Fallback for individual env vars
            serviceAccount = {
                projectId: process.env.VITE_FIREBASE_PROJECT_ID || "practice-be58e",
                clientEmail: process.env.VITE_FIREBASE_CLIENT_EMAIL,
                // Handle newlines in the private key
                privateKey: process.env.VITE_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            };

            if (serviceAccount && serviceAccount.privateKey) {
                initializeApp({
                    credential: cert(serviceAccount)
                });
                console.log("Firebase Admin Initialized via ENV Parts");
            } else {
                console.warn("Firebase Admin SDK: service account not fully provided in env.");
            }
        }
    } catch (e) {
        console.error("Firebase Admin initialization error:", e);
    }
}

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
        const decodedToken = await getAuth().verifyIdToken(token);
        // Ensure user is an admin by checking firestore users collection
        const userDoc = await getFirestore().collection('users').doc(decodedToken.uid).get();
        if (!userDoc.exists || !['admin', 'super_admin'].includes(userDoc.data().role)) {
            return res.status(403).json({ error: 'Forbidden: Requires admin privileges' });
        }
    } catch (e) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    try {
        const { title, body, tokens, url } = req.body;

        if (!title || !body || !tokens || !Array.isArray(tokens) || tokens.length === 0) {
            return res.status(400).json({ error: 'Missing required payload (title, body, tokens array)' });
        }

        if (!getApps().length) {
            return res.status(500).json({ error: 'Firebase Admin not initialized. Check server Vercel env.' });
        }

        // Clean tokens to ensure valid FCM identifiers
        const validTokens = tokens.filter(t => typeof t === 'string' && t.trim().length > 10);

        if (validTokens.length === 0) {
            return res.status(400).json({ error: 'All provided tokens were invalid or empty.' });
        }

        // Send a message to devices subscribed to the provided tokens.
        const message = {
            notification: {
                title: title,
                body: body,
            },
            data: url ? { url: url } : {},
            tokens: validTokens, // Cleaned array
        };

        const response = await getMessaging().sendEachForMulticast(message);
        return res.status(200).json({
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount,
            responses: response.responses
        });

    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
