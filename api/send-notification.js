import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    try {
        let serviceAccount;

        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            // Sometimes Vercel strips or double escapes newlines in JSON strings.
            let rawJson = process.env.FIREBASE_SERVICE_ACCOUNT;
            // Ensure any stringified \n is properly replaced before parsing
            // Actually, if it's JSON, the parser handles \\n as \n inside strings.
            serviceAccount = JSON.parse(rawJson);

            // Just in case it got unescaped during ENV storage:
            if (serviceAccount.private_key) {
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            }
        } else {
            // Fallback for individual env vars
            serviceAccount = {
                projectId: process.env.VITE_FIREBASE_PROJECT_ID || "practice-be58e",
                clientEmail: process.env.VITE_FIREBASE_CLIENT_EMAIL,
                // Handle newlines in the private key
                privateKey: process.env.VITE_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            };
        }

        if (serviceAccount && serviceAccount.privateKey) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } else {
            console.warn("Firebase Admin SDK: service account not fully provided in env.");
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

    try {
        const { title, body, tokens } = req.body;

        if (!title || !body || !tokens || !Array.isArray(tokens) || tokens.length === 0) {
            return res.status(400).json({ error: 'Missing required payload (title, body, tokens array)' });
        }

        if (!admin.apps.length) {
            return res.status(500).json({ error: 'Firebase Admin not initialized. Check server Vercel env.' });
        }

        // Send a message to devices subscribed to the provided tokens.
        const message = {
            notification: {
                title: title,
                body: body,
            },
            tokens: tokens, // array of FCM tokens
        };

        const response = await admin.messaging().sendEachForMulticast(message);
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
