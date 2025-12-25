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

const cleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // Find all updates
        const allUpdates = await PatientUpdate.find().sort({ createdAt: -1 });
        console.log(`Found ${allUpdates.length} total updates.`);

        // Group by connectionId
        const groups = {};
        allUpdates.forEach(u => {
            const cid = u.connectionId.toString();
            if (!groups[cid]) groups[cid] = [];
            groups[cid].push(u);
        });

        for (const cid in groups) {
            const updates = groups[cid];
            if (updates.length > 1) {
                console.log(`Connection ${cid} has ${updates.length} updates. Keeping the latest.`);
                // Keep the first one (sorted -1)
                const toKeep = updates[0];
                const toDelete = updates.slice(1);

                const deleteIds = toDelete.map(u => u._id);
                // Actually delete
                await PatientUpdate.deleteMany({ _id: { $in: deleteIds } });
                console.log(`Deleted ${deleteIds.length} old updates for connection ${cid}.`);
            } else {
                console.log(`Connection ${cid} is clean.`);
            }
        }

        console.log("Cleanup complete.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

cleanup();
