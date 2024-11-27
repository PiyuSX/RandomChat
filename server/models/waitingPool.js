export class WaitingPool {
  constructor() {
    this.pool = new Map();
  }

  addUser(socketId, username) {
    this.pool.set(socketId, username);
  }

  removeUser(socketId) {
    this.pool.delete(socketId);
  }

  hasWaitingUsers() {
    return this.pool.size > 0;
  }

  getRandomUser() {
    const users = Array.from(this.pool.entries());
    const randomIndex = Math.floor(Math.random() * users.length);
    const [socketId, username] = users[randomIndex];
    // this.removeUser(socketId);
    return { socketId, username };
  }

  clear() {
    this.pool.clear();
  }
}