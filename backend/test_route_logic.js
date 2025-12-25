import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
// import { expect } from 'chai'; 
import Connection from './models/Connection.js';
import User from './models/User.js';
import doctorRoutes from './routes/doctorRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config(); // Fallback

const app = express();
app.use(express.json());
// Mock Auth Middleware
app.use((req, res, next) => {
    // We will inject user in the test manually or mock the auth middleware if we were running a full server
    // For this script we will try to invoke the logic or spin up a temp server
    next();
});

const run = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        // 1. Find a doctor with connections
        const connection = await Connection.findOne({ status: 'accepted' });
        if (!connection) {
            console.log("No accepted connections found to test.");
            return;
        }
        console.log("Found Connection:", connection._id);
        console.log("  Doctor:", connection.doctorId);
        console.log("  Patient:", connection.patientId);

        const doctorId = connection.doctorId;

        // 2. Simulate /active-patients
        // logic from route:
        const connections = await Connection.find({
            doctorId: doctorId,
            status: 'accepted'
        });

        const enriched = await Promise.all(connections.map(async (conn) => {
            return {
                connectionId: conn._id, // This is what we send to frontend
                problem: conn.problem
            };
        }));

        console.log("Active Patients Response Sample:", enriched[0]);
        if (!enriched[0].connectionId) console.error("CRITICAL: connectionId is undefined!");
        else console.log("connectionId is valid:", enriched[0].connectionId);

        // 3. Simulate /connection/:id
        const targetId = enriched[0].connectionId.toString();
        console.log(`Testing lookup for ID: ${targetId}`);

        const foundConn = await Connection.findById(targetId);
        if (!foundConn) {
            console.log("findById FAILED for", targetId);
        } else {
            console.log("findById SUCCESS for", targetId);
        }

        // Check Authorization Logic Simulation
        const reqUser = { id: doctorId }; // Simulate doctor
        const isAuthorized =
            (String(reqUser.id) === String(foundConn.doctorId)) ||
            (String(reqUser.id) === String(foundConn.patientId));

        console.log(`Authorization Check for User ${reqUser.id}: ${isAuthorized}`);

    } catch (err) {
        console.error("Test Failed:", err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
