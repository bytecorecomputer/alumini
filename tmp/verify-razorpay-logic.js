
// Mock parsing logic from Donate.jsx
function parseFrontendAmount(amount, customAmount) {
    let finalAmount = '0';
    if (amount === 'Custom') {
        finalAmount = customAmount;
    } else {
        finalAmount = amount.replace('$', '').toLowerCase();
        if (finalAmount.includes('k')) {
            finalAmount = (parseFloat(finalAmount.replace('k', '')) * 1000).toString();
        }
    }
    return finalAmount;
}

// Mock parsing logic from create-order.js
function parseBackendAmount(amount) {
    let cleanedAmount = 0;
    if (typeof amount === 'string') {
        cleanedAmount = parseFloat(amount.replace(/,/g, ''));
    } else {
        cleanedAmount = amount;
    }
    return Math.round(cleanedAmount * 100);
}

console.log('--- Testing Parsing Logic ---');

const testCases = [
    { label: '$100', frontend: '$100', expected: '100', expectedPaise: 10000 },
    { label: '$500', frontend: '$500', expected: '500', expectedPaise: 50000 },
    { label: '$2.5k', frontend: '$2.5k', expected: '2500', expectedPaise: 250000 },
    { label: 'Custom (1234)', frontend: 'Custom', custom: '1234', expected: '1234', expectedPaise: 123400 },
];

testCases.forEach(tc => {
    const feResult = parseFrontendAmount(tc.frontend, tc.custom);
    const beResult = parseBackendAmount(feResult);
    
    const fePass = feResult === tc.expected;
    const bePass = beResult === tc.expectedPaise;
    
    console.log(`\nTest Case: ${tc.label}`);
    console.log(`  Frontend Result: ${feResult} (${fePass ? 'PASS' : 'FAIL: expected ' + tc.expected})`);
    console.log(`  Backend Result (Paise): ${beResult} (${bePass ? 'PASS' : 'FAIL: expected ' + tc.expectedPaise})`);
});
