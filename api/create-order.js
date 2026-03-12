import Razorpay from 'razorpay';

export default async function handler(req, res) {
    console.log('--- Order Creation Protocol Initiated ---');
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { amount } = req.body;

        // Vercel might have VITE_ prefixes or not. Let's check both for maximal robustness.
        const rawKeyId = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '';
        const rawKeySecret = process.env.RAZORPAY_KEY_SECRET || '';
        
        const keyId = rawKeyId.replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim();
        const keySecret = rawKeySecret.replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim();


        console.log('Checking Credentials:', {
            hasKeyId: !!keyId,
            hasKeySecret: !!keySecret,
            keyIdPreview: keyId ? `${keyId.substring(0, 8)}...` : 'None'
        });

        if (!keyId || !keySecret) {
            return res.status(500).json({ 
                error: 'Configuration Error', 
                details: `Razorpay keys are missing on the server. Please add VITE_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to Vercel Environment Variables. (KeyID: ${!!keyId}, Secret: ${!!keySecret})` 
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

        console.log('Sending request to Razorpay API with options:', { ...options, amount: options.amount });
        const order = await razorpay.orders.create(options);
        
        console.log('Order created successfully:', order.id);
        return res.status(200).json(order);
    } catch (error) {
        console.error('CRITICAL FAILURE in create-order:', error);
        
        let detailedError = 'Unknown error occurred';
        let errorCode = 'UNKNOWN_ERROR';

        if (error.error && error.error.description) {
            detailedError = error.error.description; // Razorpay specific error format
            errorCode = error.error.code || 'RAZORPAY_ERROR';
        } else if (error.message) {
            detailedError = error.message;
            errorCode = error.code || 'INTERNAL_ERROR';
        }

        return res.status(500).json({ 
            error: 'Razorpay API Connection Failed', 
            details: detailedError,
            code: errorCode,
            raw: error
        });
    }
}



