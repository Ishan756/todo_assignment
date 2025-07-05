import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import activityRoutes from './routes/activity.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(cors({
  origin: [
     "http://localhost:5173",               
    "https://todo-assignment-wheat.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kanban-board')
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


app.use('/api/auth', authRoutes);
app.use('/api/tasks', authenticateToken, taskRoutes);
app.use('/api/activity', authenticateToken, activityRoutes);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-board', (boardId) => {
    socket.join(boardId);
    console.log(`User ${socket.id} joined board ${boardId}`);
  });

  socket.on('task-updated', (data) => {
    socket.to(data.boardId).emit('task-updated', data);
  });

  socket.on('task-created', (data) => {
    socket.to(data.boardId).emit('task-created', data);
  });

  socket.on('task-deleted', (data) => {
    socket.to(data.boardId).emit('task-deleted', data);
  });

  socket.on('activity-logged', (data) => {
    socket.to(data.boardId).emit('activity-logged', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };