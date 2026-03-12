import fetch from 'node-fetch';

async function testEndpoints() {
    console.log('--- Testing Razorpay Endpoints ---');

    // 1. Test Create Order
    console.log('\n1. Testing /api/create-order...');
    try {
        const createRes = await fetch('http://localhost:3000/api/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: '100' })
        });
        const createData = await createRes.json();
        
        if (createRes.ok) {
            console.log('✅ Success: Order created!');
            console.log('Order ID:', createData.id);
        } else {
            console.log('❌ Error: Failed to create order');
            console.log('Details:', createData);
        }
    } catch (err) {
        console.log('❌ Error: Connection failed (Ensure server is running on localhost:3000)');
        console.error(err.message);
    }

    // 2. Test Verify Payment (Signature check)
    console.log('\n2. Testing /api/verify-payment with mock data...');
    try {
        const verifyRes = await fetch('http://localhost:3000/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                razorpay_order_id: 'order_mock123',
                razorpay_payment_id: 'pay_mock123',
                razorpay_signature: 'invalid_sig' 
            })
        });
        const verifyData = await verifyRes.json();
        
        if (!verifyRes.ok && verifyData.message === 'Invalid signature') {
            console.log('✅ Success: Properly rejected invalid signature');
        } else {
            console.log('❓ Note: Check logic if this should have failed differently');
            console.log('Details:', verifyData);
        }
    } catch (err) {
        console.log('❌ Error: Connection failed');
        console.error(err.message);
    }
}

testEndpoints();
