import mongoose from 'mongoose';

const AssignedTaskSchema = new mongoose.Schema({
    connectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Connection', required: true },
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
    videoTitle: { type: String }, // Cache title for fewer joins
    youtubeId: { type: String },  // Cache for easy display
    frequencyHours: { type: Number, default: 24 }, // Keep for legacy or display if needed
    resetIntervalSeconds: { type: Number, default: 86400 }, // Default 24 hours in seconds
    lastCompletedAt: { type: Date },
    isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('AssignedTask', AssignedTaskSchema);
