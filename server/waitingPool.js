export class WaitingPool {
  constructor() {
    this.pool = new Map(); // socketId -> username
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
    if (this.pool.size === 0) return null; // Adding safety check for empty pool
    const keys = Array.from(this.pool.keys());
    const randomIndex = Math.floor(Math.random() * keys.length);
    const socketId = keys[randomIndex];
    const username = this.pool.get(socketId);
    this.removeUser(socketId); // Remove the matched user
    return { socketId, username };
  }

  clear() {
    this.pool.clear();
  }
}
