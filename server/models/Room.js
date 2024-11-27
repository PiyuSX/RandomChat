export class Room {
  constructor(id, type) {
    this.id = id;
    this.type = type;
    this.users = new Set();
    }
  
    broadcastMessage(senderId, message) {
      this.users.forEach(userId => {
        if (userId !== senderId) {
          // Assuming there's a function sendMessage to send a message to a user
          sendMessage(userId, message);
        }
      });
    }
  }

  addUser(userId) {
    this.users.add(userId);
  }

  removeUser(userId) {
    this.users.delete(userId);
  }

  hasUser(userId) {
    return this.users.has(userId);
  }

  isEmpty() {
    return this.users.size === 0;
  }

  getOtherUser(userId) {
    return Array.from(this.users).find(id => id !== userId);
  }
}
