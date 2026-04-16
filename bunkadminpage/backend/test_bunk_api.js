async function run() {
    const registerRes = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Test Admin',
            email: 'testadmin33@example.com',
            password: 'Password123!',
            bunkName: 'Test Bunk33',
            bunkAddress: '123 Main St33',
            bunkLat: 11.2,
            bunkLng: 76.3,
            bunkPrice: 75.5,
            bunkOperatingHours: '24/7'
        })
    });
    console.log('Register status:', registerRes.status);
    console.log('Register body:', await registerRes.json());
}

run().catch(console.error);
