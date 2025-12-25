import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Connection from './models/Connection.js';
import User from './models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const id = '694a5d0129d95607358481e5'; // The ID from the URL in screenshot

        console.log(`\n--- Inspecting Connection: ${id} ---`);
        const conn = await Connection.findById(id);
        if (!conn) {
            console.log("NOT FOUND in DB");
        } else {
            console.log("Connection Found!");
            console.log(`Doctor ID:  ${conn.doctorId}`);
            console.log(`Patient ID: ${conn.patientId}`);
            console.log(`Status:     ${conn.status}`);

            const patient = await User.findById(conn.patientId);
            console.log(`Patient User: ${patient ? patient.firstName + ' ' + patient.lastName : 'NOT FOUND'}`);
            console.log(`Patient _id:  ${patient ? patient._id : 'N/A'}`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
