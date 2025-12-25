import express from 'express';
import auth from '../middleware/auth.js';
import Message from '../models/Message.js';
import Connection from '../models/Connection.js';

const router = express.Router();

// @route   GET /api/chat/:connectionId
// @desc    Get message history
router.get('/:connectionId', auth, async (req, res) => {
    try {
        const { connectionId } = req.params;

        // Verify connection exists
        const connection = await Connection.findById(connectionId);
        if (!connection) {
            return res.status(404).json({ msg: 'Connection not found' });
        }

        // Access Control: User must be part of the connection
        const isPatient = connection.patientId.toString() === req.user.id;
        const isDoctor = connection.doctorId.toString() === req.user.id; // Assuming doctor auth middleware sets req.user.id

        // Note: Our auth middleware might differentiate user types. 
        // If req.user contains 'role', we can check that.
        // For now, checking IDs against the connection is safest.

        if (!isPatient && !isDoctor) {
            return res.status(403).json({ msg: 'Not authorized to view this chat' });
        }

        const messages = await Message.find({ connectionId }).sort({ createdAt: 1 });
        res.json(messages);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;
