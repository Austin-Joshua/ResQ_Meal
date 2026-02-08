/**
 * Socket.io server for real-time updates: food posted, match created, match status updated.
 * Clients join room user:${userId} and optionally role:${role}. Auth via handshake.auth.token (JWT).
 */
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';

let io = null;

/**
 * @param {import('http').Server} httpServer - HTTP server (from http.createServer(app))
 * @returns {import('socket.io').Server}
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        process.env.FRONTEND_URL,
      ].filter(Boolean),
      credentials: true,
    },
    path: '/socket.io',
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Auth token required'));
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Invalid or expired token'));
      socket.userId = decoded.id;
      socket.userRole = (decoded.role || '').toLowerCase();
      next();
    });
  });

  io.on('connection', (socket) => {
    const room = `user:${socket.userId}`;
    socket.join(room);
    if (socket.userRole) {
      socket.join(`role:${socket.userRole}`);
    }
    console.log(`[Socket] User ${socket.userId} (${socket.userRole}) connected`);
    socket.on('disconnect', () => {
      console.log(`[Socket] User ${socket.userId} disconnected`);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized. Call initSocket(httpServer) first.');
  return io;
}

/**
 * Emit to a single user by user id.
 */
function emitToUser(userId, event, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

/**
 * Emit to all users with a role (e.g. 'ngo', 'restaurant', 'volunteer').
 */
function emitToRole(role, event, payload) {
  if (!io) return;
  io.to(`role:${role}`).emit(event, payload);
}

/**
 * Broadcast to all connected clients (e.g. new food available).
 */
function broadcast(event, payload) {
  if (!io) return;
  io.emit(event, payload);
}

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToRole,
  broadcast,
};
