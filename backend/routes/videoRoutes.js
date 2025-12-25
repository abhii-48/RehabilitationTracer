import express from 'express';
import Video from '../models/Video.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/videos/search
// @desc    Search videos by keywords (problem, title)
// @access  Private
router.get('/search', auth, async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);

        // Simple regex search or text search
        // We set up a text index, so we can use $text or regex
        // Regex is often better for partial matches in small datasets
        const videos = await Video.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { problem: { $regex: query, $options: 'i' } },
                { domain: { $regex: query, $options: 'i' } }
            ]
        }).limit(20);

        res.json(videos);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;
