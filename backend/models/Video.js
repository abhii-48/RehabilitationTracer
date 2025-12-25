import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    youtubeId: { type: String, required: true },
    youtubeUrl: { type: String, required: true },
    source: { type: String },
    level: { type: String },
    problem: { type: String, required: true, index: true },
    domain: { type: String, required: true, index: true }
});

// Index for search
VideoSchema.index({ title: 'text', problem: 'text' });

export default mongoose.model('Video', VideoSchema);
