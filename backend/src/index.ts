import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import teacherRoutes from './routes/teacher.routes';
import studentRoutes from './routes/student.routes';
import lessonRoutes from './routes/lesson.routes';
import roomRoutes from './routes/room.routes';
import instrumentRoutes from './routes/instrument.routes';
import paymentRoutes from './routes/payment.routes';
import packageRoutes from './routes/package.routes';

// Import middleware
import { errorHandler } from './middleware/error.middleware';
import { authenticateJwt } from './middleware/auth.middleware';

// Create Express application
const app = express();
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateJwt, userRoutes);
app.use('/api/teachers', authenticateJwt, teacherRoutes);
app.use('/api/students', authenticateJwt, studentRoutes);
app.use('/api/lessons', authenticateJwt, lessonRoutes);
app.use('/api/rooms', authenticateJwt, roomRoutes);
app.use('/api/instruments', authenticateJwt, instrumentRoutes);
app.use('/api/payments', authenticateJwt, paymentRoutes);
app.use('/api/packages', authenticateJwt, packageRoutes);

// API health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Handle socket disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  // Join a room (for private messages or lesson notifications)
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room: ${roomId}`);
  });
  
  // Leave a room
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room: ${roomId}`);
  });
});

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// For testing purposes
export default app;