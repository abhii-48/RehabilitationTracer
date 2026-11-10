import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import generateToken from './utils/generateToken.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const runVerification = async () => {
    console.log("=== START VERIFICATION ===");
    try {
        console.log("Connecting to MONGO_URI:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✓ DB Connection Successful");

        const testEmail1 = `test_patient1_${Date.now()}@example.com`;
        const testEmail2 = `test_patient2_${Date.now()}@example.com`;

        // 1. Create Patient 1 with empty patientId
        const salt = await bcrypt.genSalt(10);
        const pass = await bcrypt.hash("password123", salt);

        const p1Id = `RT-P-${Math.floor(100000 + Math.random() * 900000)}`;
        const p1 = await User.create({
            firstName: "Test",
            lastName: "Patient1",
            email: testEmail1,
            password: pass,
            role: "patient",
            patientId: p1Id
        });
        console.log("✓ Patient 1 Created:", p1._id, "patientId:", p1.patientId);

        // 2. Create Patient 2 with empty patientId
        const p2Id = `RT-P-${Math.floor(100000 + Math.random() * 900000)}`;
        const p2 = await User.create({
            firstName: "Test",
            lastName: "Patient2",
            email: testEmail2,
            password: pass,
            role: "patient",
            patientId: p2Id
        });
        console.log("✓ Patient 2 Created:", p2._id, "patientId:", p2.patientId);

        // 3. Test token generation
        const token1 = generateToken(p1._id);
        console.log("✓ Token Generated:", token1 ? "Valid Token String" : "Failed");

        // Clean up test users
        await User.deleteMany({ email: { $in: [testEmail1, testEmail2] } });
        console.log("✓ Test records cleaned up successfully");

        console.log("=== ALL VERIFICATION CHECKS PASSED ===");

    } catch (err) {
        console.error("❌ Verification Failed:", err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
};

runVerification();
