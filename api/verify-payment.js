import crypto from 'crypto';

export default async function handler(req, res) {
    console.log('--- Payment Verification Protocol Initiated ---');

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const rawKeySecret = process.env.RAZORPAY_KEY_SECRET || '';
        const keySecret = rawKeySecret.replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim();


        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            console.error('Missing verification parameters');
            return res.status(400).json({ error: 'Missing payment verification details' });
        }

        if (!keySecret) {
            console.error('RAZORPAY_KEY_SECRET missing on server');
            return res.status(500).json({ error: 'Configuration Error: RAZORPAY_KEY_SECRET is not set.' });
        }

        const hmac = crypto.createHmac('sha256', keySecret);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const expectedSignature = hmac.digest('hex');

        if (expectedSignature === razorpay_signature) {
            console.log('Payment Verified Successfully:', razorpay_payment_id);
            return res.status(200).json({ success: true, message: 'Payment verified successfully' });
        } else {
            console.error('Signature Mismatch. Verification Failed.');
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error('CRITICAL FAILURE in verify-payment:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}

