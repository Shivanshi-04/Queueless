import { Server } from 'socket.io';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });

    socket.on('subscribe:token', (tokenId) => {
      if (tokenId) {
        socket.join(`token:${tokenId}`);
        console.log(`[Socket.io] Socket ${socket.id} joined room token:${tokenId}`);
      }
    });

    socket.on('unsubscribe:token', (tokenId) => {
      if (tokenId) {
        socket.leave(`token:${tokenId}`);
        console.log(`[Socket.io] Socket ${socket.id} left room token:${tokenId}`);
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    console.warn('[Socket.io] io instance requested before initialization.');
  }
  return io;
};

export const emitQueueEvent = (eventName, data) => {
  if (io) {
    io.emit(eventName, data);
    if (data && data._id) {
      io.to(`token:${data._id}`).emit(eventName, data);
    }
  }
};
