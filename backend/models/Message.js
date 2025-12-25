import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    connectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Connection',
        required: true
    },
    senderRole: {
        type: String,
        enum: ['patient', 'doctor'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    }
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
