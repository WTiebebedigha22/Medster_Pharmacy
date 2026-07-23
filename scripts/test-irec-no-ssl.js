import https from 'https';
import fetch from 'node-fetch';

const IREC_API_URL = 'https://api.irec.com/v1/products';
const IREC_API_KEY = '635581f8-9922-4d5a-a669-25ea84146a8f';

// Create an agent that ignores SSL certificate errors
const agent = new https.Agent({
    rejectUnauthorized: false
});

async function testNoSSL() {
    try {
        const response = await fetch(IREC_API_URL, {
            agent: agent,
            headers: {
                'Authorization': `Bearer ${IREC_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        console.log('Status:', response.status);
        if (response.ok) {
            const data = await response.json();
            console.log('Success! Data keys:', Object.keys(data));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testNoSSL();