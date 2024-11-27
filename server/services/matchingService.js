import { WaitingPool } from '../models/waitingPool.js';
import { handleTextChat } from '../handlers/textChatHandler.js';
import { handleVideoChat } from '../handlers/videoChatHandler.js';

export class MatchingService {
  constructor(roomService) {
    this.roomService = roomService;
    this.textPool = new WaitingPool();
    this.videoPool = new WaitingPool();
  }

  handleFindStranger(io, socket, { type, username }) {
    const pool = type === 'video' ? this.videoPool : this.textPool;
    const handler = type === 'video' ? handleVideoChat : handleTextChat;

    if (pool.hasWaitingUsers()) {
      const stranger = pool.getRandomUser();
      if (stranger) {
        handler(io, socket, stranger, username, this.roomService);
      } else {
        socket.emit('error', 'No waiting users found');
      }
    } else {
      pool.addUser(socket.id, username);
    }
  }

  handleDisconnect(socket) {
    this.textPool.removeUser(socket.id);
    this.videoPool.removeUser(socket.id);
    
    const roomId = this.roomService.getRoomByUserId(socket.id);
    if (roomId) {
      this.roomService.leaveRoom(socket, roomId);
    }
  }
}
