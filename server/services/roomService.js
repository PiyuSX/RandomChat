import { Room } from '../models/Room.js';

export class RoomService {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(user1Id, user2Id, type = 'chat') {
    const roomId = `${type}_${user1Id}_${user2Id}`;
    const room = new Room(roomId, type);
    room.addUser(user1Id);
    room.addUser(user2Id);
    this.rooms.set(roomId, room);
    return roomId;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  setupRoom(io, socket, roomId, strangerId) {
    const room = this.getRoom(roomId);
    if (room) {
      socket.join(roomId);
      const strangerSocket = io.sockets.sockets.get(strangerId);
      if (strangerSocket) {
        strangerSocket.join(roomId);
      }
      socket.on('message', (message) => {
        io.to(roomId).emit('message', message);
      });
    }
  }

  leaveRoom(socket, roomId) {
    const room = this.getRoom(roomId);
    if (room) {
      room.removeUser(socket.id);
      socket.to(roomId).emit('stranger-left');
      socket.leave(roomId);
      if (room.isEmpty()) {
        this.rooms.delete(roomId);
      }
    }
  }

  getRoomByUserId(userId) {
    for (const [roomId, room] of this.rooms) {
      if (room.hasUser(userId)) {
        return roomId;
      }
    }
    return null;
  }
}
