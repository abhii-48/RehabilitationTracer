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
        await mongoose.connect(process.env.MONGO_URI);
        const badId = '69494e93f939afb84903b007';
        console.log(`Attempting to delete: ${badId}`);

        // Use deleteOne with query to avoid casting issues in findById if strict
        const res = await Connection.deleteOne({ _id: badId });

        console.log("Delete Result:", res);

    } catch (err) {
        console.error("Delete Error:", err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
