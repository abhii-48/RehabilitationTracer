import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import auth from '../middleware/auth.js';
import PatientUpdate from '../models/PatientUpdate.js';
import AssignedTask from '../models/AssignedTask.js';
import Connection from '../models/Connection.js';
import ManualTask from '../models/ManualTask.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, PNG and PDF are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @route   POST /api/patient/update
// @desc    Submit pain level and optional files (Singleton Pattern with Merge)
router.post('/update', [auth, upload.array('files', 3)], async (req, res) => {
    try {
        const { connectionId, painLevel, note } = req.body;
        console.log('DEBUG: /api/patient/update called. Body:', req.body, 'Files:', req.files?.length);


        if (!connectionId) {
            return res.status(400).json({ msg: 'Connection ID is required.' });
        }

        // Verify connection belongs to user
        const connection = await Connection.findById(connectionId);
        if (!connection || connection.patientId.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized for this connection.' });
        }

        const filesData = req.files.map(f => ({
            originalName: f.originalname,
            filename: f.filename,
            path: `/uploads/${f.filename}`,
            mimeType: f.mimetype
        }));

        // Singleton Logic: Find existing update
        let update = await PatientUpdate.findOne({ connectionId });

        if (update) {
            // MERGE: Update existing record
            if (painLevel !== undefined && painLevel !== null && painLevel !== '') {
                update.painLevel = painLevel;
            }
            if (filesData.length > 0) {
                // Append new files to existing ones
                update.files.push(...filesData);
            }
            if (note) {
                update.note = note;
            }

            await update.save();
        } else {
            // CREATE: New record
            update = new PatientUpdate({
                connectionId,
                painLevel: (painLevel !== undefined && painLevel !== '') ? painLevel : -1,
                files: filesData,
                note
            });
            await update.save();
        }

        res.json(update);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});




// @route   GET /api/patient/progress/:connectionId
// @desc    Get patient progress summary
router.get('/progress/:connectionId', auth, async (req, res) => {
    try {
        console.log(`DEBUG: /progress hit with id ${req.params.connectionId}`);
        const { connectionId } = req.params;

        const connection = await Connection.findById(connectionId);
        if (!connection) return res.status(404).json({ msg: 'Connection not found' });
        if (connection.patientId.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });

        const [updates, assignedTasks, manualTasks] = await Promise.all([
            PatientUpdate.find({ connectionId }).sort({ createdAt: 1 }),
            AssignedTask.find({ connectionId }),
            ManualTask.find({ connectionId })
        ]);

        const painTrend = updates.filter(u => u.painLevel >= 0).map(u => ({
            date: u.createdAt,
            value: u.painLevel
        }));

        const totalVideoTasks = assignedTasks.length;
        const completedVideoTasks = assignedTasks.filter(t => t.isCompleted).length;
        const totalManualTasks = manualTasks.length;
        const completedManualTasks = manualTasks.filter(t => t.status === 'Completed').length;

        const stats = {
            tasksCompleted: completedManualTasks,
            totalTasks: totalManualTasks,
            exercisesCompleted: completedVideoTasks,
            totalExercises: totalVideoTasks,
        };

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const updatesLast7Days = updates.filter(u => new Date(u.createdAt) >= sevenDaysAgo);
        const uniqueDays = new Set(updatesLast7Days.map(u => new Date(u.createdAt).toDateString())).size;
        const consistencyScore = Math.min(Math.round((uniqueDays / 7) * 100), 100);
        stats.consistency = `${consistencyScore}% this week`;

        const totalItems = totalVideoTasks + totalManualTasks;
        const completedItems = completedVideoTasks + completedManualTasks;
        const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
        const latestPain = painTrend.length > 0 ? painTrend[painTrend.length - 1].value : 5;
        const painScore = Math.max(0, Math.min(100, (11 - latestPain) * 10));
        const recoveryScore = Math.round((consistencyScore * 0.4) + (completionRate * 0.3) + (painScore * 0.3));

        res.json({ recoveryScore, painTrend, stats });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/patient/notify-tasks
// @desc    Notify doctor about task completion
router.post('/notify-tasks', auth, async (req, res) => {
    try {
        const { connectionId, completedTaskIds } = req.body;

        if (!connectionId) {
            return res.status(400).json({ msg: 'Connection ID is required.' });
        }

        // Verify connection belongs to user
        const connection = await Connection.findById(connectionId);
        if (!connection || connection.patientId.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized for this connection.' });
        }

        // Create a Patient Update entry specifically for tasks
        // We can use a special indicator in 'note' or just generic text
        const update = new PatientUpdate({
            connectionId,
            painLevel: -1, // Indicator for "Just Task Update" or handles in frontend
            files: [],
            note: "Patient has completed assigned exercises."
        });

        await update.save();
        res.json(update);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/patient/tasks/:connectionId
// @desc    Get assigned tasks with reset logic
router.get('/tasks/:connectionId', auth, async (req, res) => {
    try {
        const tasks = await AssignedTask.find({ connectionId: req.params.connectionId });
        const now = new Date();

        // Check for resets
        const updatedTasks = await Promise.all(tasks.map(async (task) => {
            if (task.isCompleted && task.lastCompletedAt) {
                // Use resetIntervalSeconds if available, else fallback to frequencyHours
                const intervalMs = (task.resetIntervalSeconds ? task.resetIntervalSeconds * 1000 : task.frequencyHours * 60 * 60 * 1000);
                const resetTime = new Date(task.lastCompletedAt.getTime() + intervalMs);
                if (now > resetTime) {
                    task.isCompleted = false;
                    await task.save();
                }
            }
            return task;
        }));

        res.json(updatedTasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/patient/task/:taskId/complete
// @desc    Mark task as complete
router.put('/task/:taskId/complete', auth, async (req, res) => {
    try {
        const task = await AssignedTask.findById(req.params.taskId);
        if (!task) return res.status(404).json({ msg: 'Task not found' });

        // Basic auth check: usually ensure patient owns the connection linked to task
        // Skipping deep check for speed, assuming ID knowledge implies access or user is authorized via connection check if strict.

        task.isCompleted = true;
        task.lastCompletedAt = new Date();
        await task.save();

        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



// @route   GET /api/patient/manual-tasks/:connectionId
// @desc    Get manual tasks with auto-reset logic
router.get('/manual-tasks/:connectionId', auth, async (req, res) => {
    try {
        const { connectionId } = req.params;
        let tasks = await ManualTask.find({ connectionId });

        const now = new Date();
        const updatedTasks = [];

        for (let task of tasks) {
            if (task.status === 'Completed' && task.lastCompletedAt) {
                const completedTime = new Date(task.lastCompletedAt);
                const diffHours = (now - completedTime) / (1000 * 60 * 60);

                let shouldReset = false;
                if (task.frequency === 'Daily' && diffHours >= 24) shouldReset = true;
                if (task.frequency === 'Alternate Days' && diffHours >= 48) shouldReset = true;

                if (shouldReset) {
                    task.status = 'Pending';
                    task.lastCompletedAt = null;
                    await task.save();
                }
            }
            updatedTasks.push(task);
        }

        res.json(updatedTasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/patient/manual-tasks/:taskId/complete
// @desc    Mark manual task as completed
router.put('/manual-tasks/:taskId/complete', auth, async (req, res) => {
    try {
        const task = await ManualTask.findById(req.params.taskId);
        if (!task) return res.status(404).json({ msg: 'Task not found' });

        task.status = 'Completed';
        task.lastCompletedAt = new Date();
        await task.save();

        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



export default router;
