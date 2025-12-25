import mongoose from 'mongoose';

const PatientUpdateSchema = new mongoose.Schema({
    connectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Connection', required: true },
    painLevel: { type: Number, required: true }, // 1-10
    files: [{
        originalName: String,
        filename: String,
        path: String,
        mimeType: String
    }],
    note: { type: String }
}, { timestamps: true });

export default mongoose.model('PatientUpdate', PatientUpdateSchema);
