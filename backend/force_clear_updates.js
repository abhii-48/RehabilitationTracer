import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const PatientUpdateSchema = new mongoose.Schema({
    connectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Connection', required: true },
    painLevel: { type: Number, required: true },
    files: [{
        originalName: String,
        filename: String,
        path: String,
        mimeType: String
    }],
    note: { type: String }
}, { timestamps: true });

const PatientUpdate = mongoose.model('PatientUpdate', PatientUpdateSchema);

const clearAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const result = await PatientUpdate.deleteMany({});
        console.log(`Deleted ${result.deletedCount} patient updates.`);

        console.log("Force clear complete.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

clearAll();
