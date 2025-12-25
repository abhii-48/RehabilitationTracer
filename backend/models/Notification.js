import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: String, // Recipient ID (Patient)
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'decline', 'success', 'warning'],
        default: 'info'
    },
    message: {
        type: String,
        required: true
    },
    reason: {
        type: String, // Specific for decline reasons
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
