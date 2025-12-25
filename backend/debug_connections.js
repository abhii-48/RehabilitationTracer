import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Connection from './models/Connection.js';
import User from './models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
// Attempt default if above fails, or assumes running from backend dir
dotenv.config();

const run = async () => {
    try {
        console.log("Connecting to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const connections = await Connection.find({});
        console.log("--- CONNECTIONS ---");
        connections.forEach(c => {
            console.log(`Connection ID: ${c._id}`);
            console.log(`  DocID: '${c.doctorId}'`);
            console.log(`  PatID: '${c.patientId}'`);
            console.log(`  Status: ${c.status}`);
        });

        const users = await User.find({});
        console.log("--- USERS ---");
        users.forEach(u => {
            console.log(`User ID: '${u._id}' - Name: ${u.firstName} ${u.lastName} - Role: ${u.role}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
