import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5001/api'; // BunkAdmin API

async function testRegistration() {
    console.log('Testing BunkAdmin Registration...');
    const payload = {
        name: 'Test Admin',
        email: `test_${Date.now()}@gmail.com`,
        password: 'Password123!',
        phone: '1234567890',
        bunkName: 'Test Bunk',
        bunkAddress: '123 Test St',
        bunkLat: 11.0,
        bunkLng: 77.0,
        bunkPrice: 75.0,
        bunkOperatingHours: '24/7'
    };

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log('Response Status:', res.status);
        console.log('Response Body:', JSON.stringify(data, null, 2));

        if (res.ok) {
            console.log('Registration call SUCCESS');
        } else {
            console.log('Registration call FAILED');
        }
    } catch (err) {
        console.error('Network Error:', err.message);
        console.log('Is the server running on port 5001?');
    }
}

testRegistration();
