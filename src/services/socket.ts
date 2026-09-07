import { io, Socket } from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_SERVER_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to QueueLess Realtime WebSocket server:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('⚡ Disconnected from WebSocket server:', reason);
    });

    socket.on('connect_error', (error) => {
      console.warn('⚡ WebSocket connection error (using REST polling/fallback):', error.message);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
