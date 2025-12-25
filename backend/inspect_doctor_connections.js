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
        console.log("Connected to DB");

        // Hardcode the doctor ID from previous logs: 694646af1fe642d194213533 (Nithin Tony)
        const doctorId = '694646af1fe642d194213533';

        const connections = await Connection.find({ doctorId: doctorId });
        console.log(`\nConnections for Doctor ${doctorId}:`);

        for (const c of connections) {
            console.log("------------------------------------------");
            console.log(`Connection _id:  "${c._id}"`); // Quotes to see whitespace
            console.log(`PatientId:       "${c.patientId}"`);
            console.log(`Status:          "${c.status}"`);

            // Fetch Patient Details
            const patient = await User.findOne({
                $or: [
                    { patientId: c.patientId },
                    { _id: (mongoose.Types.ObjectId.isValid(c.patientId) ? c.patientId : null) }
                ]
            });
            console.log(`Patient Name:    "${patient ? patient.firstName + ' ' + patient.lastName : 'UNKNOWN'}"`);
            console.log(`Patient _id:     "${patient ? patient._id : 'N/A'}"`);
        }
        console.log("------------------------------------------");

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
