import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { join } from 'path';

const app = express();
app.use(cors());

// Serving static files if in production
if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (_, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

// Initialize HTTP server and socket.io
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? true : 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket'],
});

// Data structures
const users = new Map();  // Mapping socketId -> { username }
const waitingPool = new Map();  // Mapping socketId -> username
const rooms = new Map();  // Mapping roomId -> { roomId, users (socketIds) }

// WebSocket events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  console.log('Current waiting pool size:', waitingPool.size);
  console.log('Current rooms:', rooms.size);

  // Event to find a stranger
  socket.on('find-stranger', ({ username }) => {
    console.log('find-stranger event received:', socket.id, username);

    // Remove user from any existing rooms first
    const existingRoom = [...rooms.values()].find(r => r.users.includes(socket.id));
    if (existingRoom) {
      socket.to(existingRoom.roomId).emit('stranger-left');
      rooms.delete(existingRoom.roomId);
    }

    // Store user info
    users.set(socket.id, { username });

    // Add user to the waiting pool
    waitingPool.set(socket.id, username);

    // Try to pair user with a stranger if there's one in the pool
    if (waitingPool.size > 1) {
      // Get all users except the current one
      const availableStrangers = [...waitingPool.entries()]
        .filter(([id]) => id !== socket.id);
      
      if (availableStrangers.length > 0) {
        // Get random stranger
        const randomIndex = Math.floor(Math.random() * availableStrangers.length);
        const [strangerSocketId, strangerUsername] = availableStrangers[randomIndex];

        // Remove both users from the waiting pool
        waitingPool.delete(socket.id);
        waitingPool.delete(strangerSocketId);

        // Create a room ID
        const roomId = `room-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        rooms.set(roomId, { roomId, users: [socket.id, strangerSocketId] });

        // Add both users to the room
        socket.join(roomId);
        const strangerSocket = io.sockets.sockets.get(strangerSocketId);
        if (strangerSocket) {
          strangerSocket.join(roomId);
        }

        // Notify both users with usernames
        socket.emit('stranger-found', { 
          strangerId: strangerSocketId,
          strangerUsername: strangerUsername 
        });
        io.to(strangerSocketId).emit('stranger-found', { 
          strangerId: socket.id,
          strangerUsername: username 
        });

        console.log(`Matched users in room ${roomId}:`, socket.id, strangerSocketId);
      }
    }
  });

  // Event for starting video calls
  socket.on('video-offer', ({ offer, to }) => {
    socket.to(to).emit('video-offer', { offer, from: socket.id });
  });

  socket.on('video-answer', ({ answer, to }) => {
    socket.to(to).emit('video-answer', { answer, from: socket.id });
  });

  socket.on('ice-candidate', ({ candidate, to }) => {
    socket.to(to).emit('ice-candidate', { candidate, from: socket.id });
  });

  // Event for user leaving the room
  socket.on('leave-chat', () => {
    const room = [...rooms.values()].find(r => r.users.includes(socket.id));
    if (room) {
      socket.to(room.roomId).emit('stranger-left');
      rooms.delete(room.roomId);
    }
    waitingPool.delete(socket.id);  // Remove from waiting pool
  });

  // Event for disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const room = [...rooms.values()].find(r => r.users.includes(socket.id));
    if (room) {
      console.log(`User ${socket.id} disconnected from room ${room.roomId}`);
      socket.to(room.roomId).emit('stranger-left');
      rooms.delete(room.roomId);
    }
    waitingPool.delete(socket.id);
    users.delete(socket.id);
    console.log('Updated waiting pool size:', waitingPool.size);
    console.log('Updated rooms:', rooms.size);
  });

  // Event for sending messages
  socket.on('send-message', ({ message, to }) => {
    const timestamp = new Date().toISOString();
    socket.to(to).emit('receive-message', { message, from: socket.id, timestamp });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
