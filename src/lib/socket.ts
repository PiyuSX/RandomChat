import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin
  : 'http://localhost:3000';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket'],
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }

  socket.on('message', (message: string) => {
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
      const messageElement = document.createElement('div');
      messageElement.textContent = message;
      messageContainer.appendChild(messageElement);
    }
  });
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};