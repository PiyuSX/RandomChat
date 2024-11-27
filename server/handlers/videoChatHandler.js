import { RoomService } from '../services/roomService.js';

export function handleVideoChat(io, socket, stranger, username) {
  const room = RoomService.createRoom(socket.id, stranger.socketId, 'video');
  RoomService.setupRoom(io, socket, room, stranger.socketId);

  socket.emit('stranger-found', { 
    strangerId: stranger.socketId,
    username: stranger.username 
  });
  
  io.to(stranger.socketId).emit('stranger-found', { 
    strangerId: socket.id,
    username 
  });

  socket.on('video-offer', ({ offer, to }) => {
    socket.to(to).emit('video-offer', { 
      offer,
      from: socket.id 
    });
  });

  socket.on('video-answer', ({ answer, to }) => {
    socket.to(to).emit('video-answer', { 
      answer,
      from: socket.id 
    });
  });

  socket.on('ice-candidate', ({ candidate, to }) => {
    socket.to(to).emit('ice-candidate', { 
      candidate,
      from: socket.id 
    });
  });

  socket.on('leave-chat', () => {
    RoomService.leaveRoom(socket, room);
  });
}