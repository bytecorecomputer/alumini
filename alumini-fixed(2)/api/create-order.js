import Razorpay from 'razorpay';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    let keyId = '';
    let keySecret = '';

    try {
        const { amount } = req.body;

        // Vercel might have VITE_ prefixes or not. Let's check both for maximal robustness.
        const rawKeyId = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '';
        const rawKeySecret = process.env.VITE_RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || '';
        
        keyId = rawKeyId.replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim();
        keySecret = rawKeySecret.replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim();

        if (!keyId || !keySecret) {
            console.error('Razorpay keys missing on server');
            return res.status(500).json({
                error: 'Configuration Error',
                details: 'Payment gateway is not configured. Please contact the site administrator.'
            });
        }

        // IMPROVEMENT: Robust amount parsing for paise
        let cleanedAmount = 0;
        if (typeof amount === 'string') {
            cleanedAmount = parseFloat(amount.replace(/,/g, ''));
        } else {
            cleanedAmount = amount;
        }

        if (!cleanedAmount || isNaN(cleanedAmount) || cleanedAmount <= 0) {
            return res.status(400).json({ error: 'Invalid amount provided', received: amount });
        }

        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });

        const options = {
            amount: Math.round(cleanedAmount * 100), // Convert to paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        return res.status(200).json(order);
    } catch (error) {
        console.error('Razorpay order creation failed:', error);

        let detailedError = 'Unable to create payment order. Please try again.';
        let errorCode = 'UNKNOWN_ERROR';

        if (error.error && error.error.description) {
            detailedError = error.error.description; // Razorpay specific error format
            errorCode = error.error.code || 'RAZORPAY_ERROR';
        }

        if (error.statusCode === 401) {
            detailedError = 'Payment gateway authentication failed. Please contact the site administrator.';
        }

        return res.status(500).json({
            error: 'Razorpay API Connection Failed',
            details: detailedError,
            code: errorCode
        });
    }
}

