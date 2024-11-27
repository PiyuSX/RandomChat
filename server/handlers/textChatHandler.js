import { RoomService } from '../services/roomService.js';

export function handleTextChat(io, socket, stranger, username) {
  const room = RoomService.createRoom(socket.id, stranger.socketId, 'chat');
  RoomService.setupRoom(io, socket, room.id, stranger.socketId);

  socket.emit('stranger-found', { 
    strangerId: stranger.socketId,
    username: stranger.username 
  });
  
  io.to(stranger.socketId).emit('stranger-found', { 
    strangerId: socket.id,
    username 
  });

  socket.on('send-message', ({ message }) => {
    try {
      const timestamp = new Date().toISOString();
      console.log(`Sending message from ${socket.id} to room ${room.id}: ${message}`);
      socket.to(room.id).emit('chat-message', {
        sender: socket.id,
        message: message,
        timestamp: timestamp,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('leave-chat', () => {
    RoomService.leaveRoom(socket, room);
  });
}