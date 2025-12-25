import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Connection from './models/Connection.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const run = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        const allConnections = await Connection.find({});
        console.log(`Total Connections: ${allConnections.length}`);

        const seen = new Set();
        const duplicates = [];

        for (const conn of allConnections) {
            const key = `${conn.patientId}-${conn.doctorId}`;
            if (seen.has(key)) {
                duplicates.push(conn);
            } else {
                seen.add(key);
            }
        }

        console.log(`Found ${duplicates.length} duplicate pairs.`);

        if (duplicates.length > 0) {
            console.log("Removing duplicates...");
            for (const dup of duplicates) {
                console.log(`Removing duplicate connection: ${dup._id} (Status: ${dup.status})`);
                await Connection.findByIdAndDelete(dup._id);
            }
            console.log("Duplicates removed.");
        } else {
            console.log("No duplicates found.");
        }

    } catch (err) {
        console.error("Cleanup Error:", err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
