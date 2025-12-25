import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import Message from './models/Message.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debug Logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/contact', contactRoutes);

// Socket.io Logic
io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return next(new Error('Authentication error'));

            // Handle both { user: { id } } and { id } payload structures
            socket.user = decoded.user || decoded;
            next();
        });
    } else {
        next(new Error('Authentication error'));
    }
});

io.on('connection', (socket) => {
    console.log('User Connected:', socket.user.id);

    // Join room based on Connection ID
    socket.on('join_room', (connectionId) => {
        socket.join(connectionId);
        console.log(`User ${socket.user.id} joined room: ${connectionId}`);
    });

    // Send Message
    socket.on('send_message', async (data) => {
        // data: { connectionId, message, senderRole }
        const { connectionId, message, senderRole } = data;

        try {
            // Save to DB
            const newMessage = new Message({
                connectionId,
                senderRole,
                message,
                createdAt: new Date(),
                read: false
            });
            await newMessage.save();

            // Emit to Room (including sender for simplicity, or exclude sender)
            io.to(connectionId).emit('receive_message', newMessage);

        } catch (err) {
            console.error('Socket Message Error:', err);
        }
    });

    // Mark as Read
    socket.on('mark_read', async (data) => {
        const { connectionId, role } = data;
        try {
            // Update all messages where sender is NOT role
            await Message.updateMany(
                { connectionId, senderRole: { $ne: role }, read: false },
                { $set: { read: true } }
            );

            // Notify other user
            io.to(connectionId).emit('messages_read', { readerRole: role });
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
    });
});

// Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected Successfully');
    } catch (err) {
        console.error('MongoDB Connection Failed:', err.message);
        process.exit(1);
    }
};

connectDB();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Modified to force restart 7
