// Native fetch is available in Node 18+

const BASE_URL = 'http://localhost:5000/api';

const run = async () => {
    try {
        // 1. Login to get token
        console.log("1. Logging in...");
        // Assuming a test user exists, otherwise we might fail here. 
        // Based on previous logs, we had users. Let's try to register a temporary one or use a known one.
        // Let's use a very likely email or create a new one.
        const testEmail = `testpatient_${Date.now()}@example.com`;
        const testPass = 'password123';

        // Register first just in case
        let authRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'Test',
                lastName: 'Patient',
                email: testEmail,
                password: testPass,
                role: 'patient'
            })
        });

        let authData = await authRes.json();
        let token = authData.token;

        if (!token) {
            // Maybe already exists, try login
            console.log("Registration might have failed/user exists, trying login...");
            authRes = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testEmail,
                    password: testPass
                })
            });
            authData = await authRes.json();
            token = authData.token;
        }

        if (!token) {
            console.error("Failed to get token:", authData);
            return;
        }
        console.log("Token acquired.");

        // 2. Search for doctors
        const domain = 'Physiotherapist';
        console.log(`2. Searching for ${domain}...`);
        const searchRes = await fetch(`${BASE_URL}/doctors/search?domain=${encodeURIComponent(domain)}`, {
            headers: { 'x-auth-token': token }
        });

        if (!searchRes.ok) {
            console.error("Search failed:", searchRes.status, await searchRes.text());
            return;
        }

        const doctors = await searchRes.json();
        console.log("Doctors found:", doctors);
        console.log("Is Array?", Array.isArray(doctors));
        console.log("Length:", doctors.length);

    } catch (err) {
        console.error("Script Error:", err);
    }
};

run();
