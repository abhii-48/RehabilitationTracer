import mongoose from 'mongoose';

const ConnectionSchema = new mongoose.Schema({
    patientId: {
        type: String, // Changed to String to support custom IDs like 'RT-P-...'
        required: true
    },
    doctorId: {
        type: String, // Changed to String to support custom IDs if needed
        required: true
    },
    problem: {
        type: String,
        required: true
    },
    message: {
        type: String, // Brief description from patient
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'completed'],
        default: 'pending'
    }
}, { timestamps: true });

// Prevent duplicate pending requests
ConnectionSchema.index({ patientId: 1, doctorId: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });

export default mongoose.model('Connection', ConnectionSchema);
