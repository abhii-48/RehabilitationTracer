import mongoose from 'mongoose';

const ManualTaskSchema = new mongoose.Schema({
    connectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Connection', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['Exercise', 'Instruction'], default: 'Exercise' },
    frequency: { type: String, enum: ['Daily', 'Alternate Days'], default: 'Daily' },
    reminderInterval: { type: Number, default: 24 }, // In hours
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
    lastCompletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('ManualTask', ManualTaskSchema);
