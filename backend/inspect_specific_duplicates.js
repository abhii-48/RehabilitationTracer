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
        const ids = ['69494e93f939afb84903b007', '694a5d0129d95607358481e5'];

        for (const id of ids) {
            console.log(`\n--- Inspecting Connection: ${id} ---`);
            const conn = await Connection.findById(id);
            if (!conn) {
                console.log("NOT FOUND");
                continue;
            }
            console.log("Raw Doc:", conn.toObject());

            // Check Patient
            const patient = await User.findOne({
                $or: [{ _id: conn.patientId }, { patientId: conn.patientId }]
            });
            console.log(`Linked Patient found? ${!!patient}`);
            if (patient) console.log(`Patient: ${patient.firstName} ${patient.lastName} (ID: ${patient._id})`);

            // Check Doctor
            const doctor = await User.findOne({
                $or: [{ _id: conn.doctorId }, { doctorId: conn.doctorId }]
            });
            console.log(`Linked Doctor found? ${!!doctor}`);
            if (doctor) console.log(`Doctor: ${doctor.firstName} ${doctor.lastName} (ID: ${doctor._id})`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
