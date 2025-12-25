
// Node 18+ has global fetch by default. No import needed.

const BASE_URL = 'http://localhost:5000/api';

async function runTest() {
    console.log("Starting Doctor Flow Test...");

    // 1. Register a new Doctor
    const timestamp = Date.now();
    const doctorData = {
        firstName: "Test",
        lastName: `Doctor_${timestamp}`,
        email: `doctor_${timestamp}@test.com`,
        password: "password123",
        role: "doctor",
        doctorId: `DOC-${timestamp}`,
        domain: "Physiotherapist"
    };

    console.log(`\n1. Registering Doctor: ${doctorData.email}`);
    let token = null;

    try {
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doctorData)
        });

        const regData = await regRes.json();
        if (!regRes.ok) {
            throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
        }
        console.log("   Registration Success!");
        token = regData.token;
    } catch (e) {
        console.error("   Registration Error:", e.message);
        return;
    }

    // 2. Fetch Pending Requests
    console.log("\n2. Fetching Pending Requests (GET /doctors/requests?status=pending)");
    try {
        const reqRes = await fetch(`${BASE_URL}/doctors/requests?status=pending`, {
            method: 'GET',
            headers: { 'x-auth-token': token }
        });

        if (!reqRes.ok) {
            const errText = await reqRes.text();
            throw new Error(`Fetch Requests Failed: ${reqRes.status} ${errText}`);
        }

        const requests = await reqRes.json();
        console.log(`   Success! Found ${requests.length} pending requests.`);
    } catch (e) {
        console.error("   Fetch Requests Error:", e.message);
    }

    // 3. Fetch Active Patients
    console.log("\n3. Fetching Active Patients (GET /doctors/active-patients)");
    try {
        const patRes = await fetch(`${BASE_URL}/doctors/active-patients`, {
            method: 'GET',
            headers: { 'x-auth-token': token }
        });

        if (!patRes.ok) {
            const errText = await patRes.text();
            throw new Error(`Fetch Patients Failed: ${patRes.status} ${errText}`);
        }

        const patients = await patRes.json();
        console.log(`   Success! Found ${patients.length} active patients.`);
    } catch (e) {
        console.error("   Fetch Patients Error:", e.message);
    }

    console.log("\nTest Completed.");
}

// Check for global fetch, otherwise import it (ESM style dynamic import if needed, but we used standard import above)
if (!globalThis.fetch) {
    console.error("This script requires Node 18+ with global fetch.");
    process.exit(1);
}

runTest();
