import express from 'express';
import { registerUser, loginUser, syncUser, getUserProfile, updateProfile, updateSettings, deleteAccount, changePassword } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', auth, getUserProfile); // Add this
router.post('/sync', syncUser);
router.put('/profile', auth, updateProfile); // Update profile (age, gender, etc.)
router.put('/settings', auth, updateSettings); // Update settings (notifications, etc.)
router.put('/change-password', auth, changePassword);
router.delete('/account', auth, deleteAccount); // Delete/Deactivate account

export default router;
