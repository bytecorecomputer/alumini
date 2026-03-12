import Razorpay from 'razorpay';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { amount } = req.body;

        const keyId = process.env.VITE_RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            return res.status(500).json({ 
                error: 'Configuration Error', 
                details: `Razorpay keys are missing on the server. KeyID: ${!!keyId}, Secret: ${!!keySecret}` 
            });
        }

        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });

        const options = {
            amount: Math.round(parseFloat(amount) * 100),
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        return res.status(200).json(order);
    } catch (error) {
        console.error('Error in create-order:', error);
        return res.status(500).json({ 
            error: 'Razorpay Order Creation Failed', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

