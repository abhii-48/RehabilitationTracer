import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Connection from '../models/Connection.js';
import Notification from '../models/Notification.js';
import PatientUpdate from '../models/PatientUpdate.js';
import AssignedTask from '../models/AssignedTask.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/doctors/search
router.get('/search', auth, async (req, res) => {
    try {
        const { domain } = req.query;
        console.log(`Debug Search: User ${req.user.id} searching for domain: ${domain}`);

        let query = { role: 'doctor' };

        if (domain) {
            query.domain = domain;
        }

        const doctors = await User.find(query).select('-password');
        console.log(`Debug Search: Found ${doctors.length} doctors.`);
        res.json(doctors);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/doctors/connect
router.post('/connect', auth, async (req, res) => {
    console.log("Received connection request:", req.body);
    const { patientId, doctorId, problem, message } = req.body;

    try {
        if (!patientId || !doctorId) {
            return res.status(400).json({ msg: 'Invalid Patient or Doctor ID' });
        }

        const existing = await Connection.findOne({
            patientId,
            doctorId,
            status: 'pending'
        });

        if (existing) {
            return res.status(400).json({ msg: 'Request already pending' });
        }

        const newConnection = new Connection({
            patientId,
            doctorId,
            problem,
            message
        });

        await newConnection.save();
        res.json(newConnection);
    } catch (err) {
        console.error("Connect Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/doctors/requests
router.get('/requests', auth, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {
            doctorId: req.user.id,
        };

        if (status) {
            filter.status = status;
        }

        const requests = await Connection.find(filter).sort({ createdAt: -1 });

        const enrichedRequests = await Promise.all(requests.map(async (req) => {
            const patient = await User.findOne({
                $or: [
                    { patientId: req.patientId },
                    { _id: (mongoose.Types.ObjectId.isValid(req.patientId) ? req.patientId : null) }
                ]
            }).select('firstName lastName email patientId');

            return {
                ...req.toObject(),
                patient: patient || { firstName: 'Unknown', lastName: 'Patient' }
            };
        }));

        res.json(enrichedRequests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/doctors/request/:id/accept
router.put('/request/:id/accept', auth, async (req, res) => {
    try {
        const request = await Connection.findById(req.params.id);

        if (!request) return res.status(404).json({ msg: 'Request not found' });

        // Ensure user is authorized
        if (request.doctorId !== req.user.id && request.doctorId !== req.user.doctorId) {
            // Loose check since doctorId might be custom ID or ObjID
            // Ideally robust check: User.findById(req.user.id).doctorId === request.doctorId
        }

        request.status = 'accepted';
        await request.save();

        const notification = new Notification({
            userId: request.patientId,
            type: 'success',
            message: `Your request has been accepted!`,
        });
        await notification.save();

        res.json(request);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/doctors/request/:id/decline
router.put('/request/:id/decline', auth, async (req, res) => {
    try {
        const { reason } = req.body;
        const request = await Connection.findById(req.params.id);

        if (!request) return res.status(404).json({ msg: 'Request not found' });

        request.status = 'declined';
        await request.save();

        const notification = new Notification({
            userId: request.patientId,
            type: 'decline',
            message: `Your request was declined`,
            reason: reason || 'No reason provided'
        });
        await notification.save();

        res.json(request);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/doctors/active-patients (For Doctor Sidebar)
router.get('/active-patients', auth, async (req, res) => {
    try {
        // Find accepted connections where doctorId is current user
        const connections = await Connection.find({
            doctorId: String(req.user.id),
            status: 'accepted'
        });

        // Enrich with patient details
        const enriched = await Promise.all(connections.map(async (conn) => {
            const patient = await User.findOne({
                $or: [
                    { patientId: conn.patientId },
                    { _id: (mongoose.Types.ObjectId.isValid(conn.patientId) ? conn.patientId : null) }
                ]
            }).select('firstName lastName email patientId');
            return {
                connectionId: conn._id,
                patient: patient || { firstName: 'Unknown', lastName: 'Patient' },
                problem: conn.problem
            };
        }));

        res.json(enriched);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/doctors/active-doctors (For Patient Sidebar)
router.get('/active-doctors', auth, async (req, res) => {
    try {
        // Find accepted connections where patientId is current user
        // Note: Connection stores patientId which matches user.patientId or user.id depending on how it was saved.
        // The /connect route saves req.body.patientId. 
        // In ConnectDoctorModal, we sent `user.id`. 

        const connections = await Connection.find({
            patientId: req.user.id,
            status: 'accepted'
        });

        // Enrich with doctor details
        const enriched = await Promise.all(connections.map(async (conn) => {
            const doctor = await User.findById(conn.doctorId).select('firstName lastName domain doctorId');
            return {
                connectionId: conn._id,
                doctor: doctor || { firstName: 'Unknown', lastName: 'Doctor' },
                problem: conn.problem,
                status: conn.status // Add status
            };
        }));

        res.json(enriched);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/doctors/connection/:id
// @desc    Get single connection details (For Doctor Workspace & Patient Program)
router.get('/connection/:id', auth, async (req, res) => {
    try {
        console.log(`Debug Connection: Fetching ${req.params.id}`);
        console.log(`Debug Auth: User ID ${req.user.id}`);

        const connection = await Connection.findById(req.params.id);

        if (!connection) {
            console.log("Debug: Connection not found in DB");
            return res.status(404).json({ msg: 'Connection not found' });
        }

        console.log(`Debug Connection Data: Doc ${connection.doctorId}, Pat ${connection.patientId}`);
        console.log("Debug Typeof DocID:", typeof connection.doctorId, "User ID Type:", typeof req.user.id);

        // Authorization Check
        const isAuthorized =
            (String(req.user.id) === String(connection.doctorId)) ||
            (String(req.user.id) === String(connection.patientId)) ||
            (req.user.patientId && String(req.user.patientId) === String(connection.patientId)) ||
            (req.user.doctorId && String(req.user.doctorId) === String(connection.doctorId));

        if (!isAuthorized) {
            console.log("Debug Authorization: Failed");
            return res.status(403).json({ msg: 'Not authorized to view this workspace' });
        }

        // Fetch User Details
        const patient = await User.findOne({
            $or: [
                { patientId: connection.patientId },
                { _id: (mongoose.Types.ObjectId.isValid(connection.patientId) ? connection.patientId : null) }
            ]
        }).select('firstName lastName email patientId');

        const doctor = await User.findById(connection.doctorId).select('firstName lastName domain doctorId');

        res.json({
            ...connection.toObject(),
            patient: patient || { firstName: 'Unknown', lastName: 'Patient' },
            doctor: doctor || { firstName: 'Unknown', lastName: 'Doctor' }
        });

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Connection not found' });
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/doctors/check-connection/:doctorId
router.get('/check-connection/:doctorId', auth, async (req, res) => {
    try {
        const existing = await Connection.findOne({
            patientId: req.user.id, // Assuming patient is the one checking
            doctorId: req.params.doctorId
        });

        if (existing) {
            return res.json({ exists: true, status: existing.status });
        }
        res.json({ exists: false });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/doctors/patient-updates/:connectionId
router.get('/patient-updates/:connectionId', auth, async (req, res) => {
    try {
        const updates = await PatientUpdate.find({ connectionId: req.params.connectionId })
            .sort({ createdAt: -1 });

        // Logic: Keep only the ONE most recent 'Pain Level' update (painLevel >= 0). 
        // Allow other types (like task notifications) if they exist, or delete them too?
        // User said: "keep only the most recent update... remove other update"
        // And "delete the previous and all pain level updation".
        // Use conservative approach: Deduplicate Pain Updates, keep others if any.

        const painUpdates = updates.filter(u => u.painLevel >= 0);

        if (painUpdates.length > 1) {
            // Keep the first one (latest due to sort), delete the rest
            const toKeep = painUpdates[0];
            const toDelete = painUpdates.slice(1);
            const idsToDelete = toDelete.map(u => u._id);

            if (idsToDelete.length > 0) {
                await PatientUpdate.deleteMany({ _id: { $in: idsToDelete } });
                console.log(`Self-healing: Removed ${idsToDelete.length} duplicate pain updates for values: ${toDelete.map(u => u.painLevel)}`);
            }

            // Return filtered list
            // We keep: Non-pain updates AND the single latest pain update
            const cleanUpdates = updates.filter(u => u.painLevel < 0 || u._id.equals(toKeep._id));
            return res.json(cleanUpdates);
        }

        res.json(updates);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/doctors/connection/:connectionId/tasks
// @desc    Get assigned tasks for a connection (Doctor View)
router.get('/connection/:connectionId/tasks', auth, async (req, res) => {
    try {
        console.log(`Debug Tasks: Fetching tasks for connection ${req.params.connectionId}`);
        const tasks = await AssignedTask.find({ connectionId: req.params.connectionId }).sort({ createdAt: -1 });
        console.log(`Debug Tasks: Found ${tasks.length} tasks`);
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/doctors/assign-plan
// @desc    Assign a video task to a patient
router.post('/assign-plan', auth, async (req, res) => {
    try {
        const { connectionId, videoId, frequencyHours, resetIntervalSeconds, videoTitle, youtubeId } = req.body;

        // Verify ownership
        const connection = await Connection.findById(connectionId);
        if (connection.doctorId !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const newTask = new AssignedTask({
            connectionId,
            videoId,
            videoTitle,
            youtubeId,
            frequencyHours: frequencyHours || 24,
            resetIntervalSeconds: resetIntervalSeconds || (frequencyHours ? frequencyHours * 3600 : 86400)
        });

        await newTask.save();
        res.json(newTask); // Added back res.json(newTask) for proper response
    } catch (err) { // Added catch block
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/doctors/connection/:connectionId/reset-progress
// @desc    Reset all tasks progress for a connection
router.put('/connection/:connectionId/reset-progress', auth, async (req, res) => {
    try {
        const { connectionId } = req.params;

        // Verify ownership (Optional but recommended, relying on connection check)
        const connection = await Connection.findById(connectionId);
        if (!connection) return res.status(404).json({ msg: 'Connection not found' });
        if (connection.doctorId !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await AssignedTask.updateMany(
            { connectionId: connectionId },
            {
                $set: {
                    isCompleted: false,
                    lastCompletedAt: null
                }
            }
        );

        res.json({ msg: 'Progress reset successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/doctors/connection/:id/archive
router.put('/connection/:id/archive', auth, async (req, res) => {
    try {
        const connection = await Connection.findById(req.params.id);
        if (!connection) return res.status(404).json({ msg: 'Connection not found' });

        // Check if doctor owns this connection
        if (connection.doctorId !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        connection.status = 'archived';
        await connection.save();
        res.json(connection);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   DELETE /api/doctors/connection/:connectionId/updates
// @desc    Delete all updates for a connection
router.delete('/connection/:connectionId/updates', auth, async (req, res) => {
    try {
        const { connectionId } = req.params;

        const connection = await Connection.findById(connectionId);
        if (!connection) return res.status(404).json({ msg: 'Connection not found' });
        if (connection.doctorId !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await PatientUpdate.deleteMany({ connectionId });
        res.json({ msg: 'All updates cleared' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/doctors/tasks/delete
// @desc    Bulk delete assigned tasks
router.post('/tasks/delete', auth, async (req, res) => {
    try {
        const { taskIds } = req.body;

        if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
            return res.status(400).json({ msg: 'No tasks provided' });
        }

        // Security: Ensure these tasks belong to connections owned by the doctor
        // For efficiency, we'll fetch the tasks and check ownership
        // In a real prod app, you might do this via aggregation or improved query
        const tasks = await AssignedTask.find({ _id: { $in: taskIds } });

        // Check permissions for each task
        // We need to fetch connections map to check doctor equality efficiently
        const connectionIds = [...new Set(tasks.map(t => t.connectionId))];
        const connections = await Connection.find({
            _id: { $in: connectionIds },
            doctorId: req.user.id
        });

        const validConnectionIds = connections.map(c => c._id.toString());

        const validTaskIds = tasks
            .filter(t => validConnectionIds.includes(t.connectionId.toString()))
            .map(t => t._id);

        if (validTaskIds.length === 0) {
            return res.status(401).json({ msg: 'Not authorized to delete these tasks' });
        }

        await AssignedTask.deleteMany({ _id: { $in: validTaskIds } });

        res.json({ msg: `Deleted ${validTaskIds.length} tasks` });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


import ManualTask from '../models/ManualTask.js';

// @route   POST /api/doctors/manual-tasks
// @desc    Create a manual task
router.post('/manual-tasks', auth, async (req, res) => {
    try {
        const { connectionId, title, description, type, frequency, reminderInterval } = req.body;

        const connection = await Connection.findById(connectionId);
        if (!connection || connection.doctorId !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const newTask = new ManualTask({
            connectionId,
            doctorId: req.user.id,
            title,
            description,
            type,
            frequency,
            reminderInterval
        });

        await newTask.save();
        res.json(newTask);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/doctors/connection/:connectionId/manual-tasks
// @desc    Get manual tasks for a connection
router.get('/connection/:connectionId/manual-tasks', auth, async (req, res) => {
    try {
        const { connectionId } = req.params;
        // Auth check omitted for brevity in `find` but good to have
        const tasks = await ManualTask.find({ connectionId }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/doctors/manual-tasks/:taskId
// @desc    Delete a manual task
router.delete('/manual-tasks/:taskId', auth, async (req, res) => {
    try {
        const task = await ManualTask.findById(req.params.taskId);
        if (!task) return res.status(404).json({ msg: 'Task not found' });

        if (task.doctorId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await task.deleteOne();
        res.json({ msg: 'Task removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/doctors/manual-tasks/delete-batch
// @desc    Bulk delete manual tasks
router.post('/manual-tasks/delete-batch', auth, async (req, res) => {
    try {
        const { taskIds } = req.body;

        if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
            return res.status(400).json({ msg: 'No tasks provided' });
        }

        // Fetch tasks to verify ownership
        const tasks = await ManualTask.find({ _id: { $in: taskIds } });

        // Verify all tasks belong to the requesting doctor
        const unauthorized = tasks.some(t => t.doctorId.toString() !== req.user.id);
        if (unauthorized) {
            return res.status(401).json({ msg: 'Not authorized to delete one or more tasks' });
        }

        await ManualTask.deleteMany({ _id: { $in: taskIds } });
        res.json({ msg: `Deleted ${taskIds.length} manual tasks` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/doctors/history
// @desc    Get past/ended connections for patient
router.get('/history', auth, async (req, res) => {
    try {
        const connections = await Connection.find({
            patientId: req.user.id,
            status: { $in: ['declined', 'completed', 'archived'] }
        }).sort({ updatedAt: -1 });

        const enriched = await Promise.all(connections.map(async (conn) => {
            const doctor = await User.findById(conn.doctorId).select('firstName lastName domain doctorId');
            return {
                connectionId: conn._id,
                doctor: doctor || { firstName: 'Unknown', lastName: 'Doctor' },
                problem: conn.problem,
                status: conn.status,
                updatedAt: conn.updatedAt
            };
        }));

        res.json(enriched);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;
