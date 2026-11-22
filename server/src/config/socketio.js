"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setupSocketIO = setupSocketIO;
exports.getIO = getIO;
exports.emitToAll = emitToAll;
exports.emitWarning = emitWarning;
exports.emitRiskUpdate = emitRiskUpdate;

var _logger = require("../utils/logger");
var _jwt = require("../utils/jwt");
const { Server } = require("socket.io");

let io = null;

function setupSocketIO(httpServer, clientUrl) {
  const configuredOrigins = (clientUrl || '')
    .split(',')
    .map(s => s.trim().replace(/\/$/, ''))
    .filter(Boolean);

  const allowedOrigins = Array.from(new Set([
    'https://disaster-x-amber.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    ...configuredOrigins
  ]));

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        const normalizedOrigin = origin.replace(/\/$/, '');
        if (allowedOrigins.includes(normalizedOrigin)) {
          return callback(null, true);
        }
        return callback(new Error(`CORS origin not allowed: ${origin}`));
      },
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Preserve Socket.IO JWT authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        const decoded = (0, _jwt.verifyAccessToken)(token);
        socket.user = decoded;
      } catch (err) {
        _logger.logger.warn({ socketId: socket.id, error: err.message }, 'Socket.IO JWT verification warning');
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    _logger.logger.info({ socketId: socket.id }, 'Client connected');

    // Join NER monitoring room by default
    socket.join('ner-monitoring');

    // Join chat room
    socket.on('chat:join', (roomSlugOrId) => {
      socket.join(`chat:${roomSlugOrId}`);
      _logger.logger.info({ socketId: socket.id, room: roomSlugOrId }, 'Joined chat room');
    });

    socket.on('chat:leave', (roomSlugOrId) => {
      socket.leave(`chat:${roomSlugOrId}`);
    });

    // Join state-specific rooms
    socket.on('join:state', (state) => {
      socket.join(`state:${state}`);
      _logger.logger.info({ socketId: socket.id, state }, 'Joined state room');
    });

    // Join zone-specific rooms
    socket.on('join:zone', (zoneId) => {
      socket.join(`zone:${zoneId}`);
    });

    socket.on('disconnect', () => {
      _logger.logger.info({ socketId: socket.id }, 'Client disconnected');
    });
  });

  _logger.logger.info('🔌 Socket.IO initialized for NER monitoring and Community Chat');
  return io;
}

function getIO() {
  return io;
}

function emitToAll(event, data) {
  if (io) {
    io.to('ner-monitoring').emit(event, data);
  }
}

function emitWarning(warning) {
  if (!io) return;
  
  // Emit to all NER monitoring clients
  io.to('ner-monitoring').emit('warning:new', warning);
  
  // Emit to state-specific room
  if (warning.state) {
    io.to(`state:${warning.state}`).emit('warning:state', warning);
  }
  
  // Emit to zone-specific room
  if (warning.zone) {
    io.to(`zone:${warning.zone}`).emit('warning:zone', warning);
  }
}

function emitRiskUpdate(zones) {
  if (io) {
    io.to('ner-monitoring').emit('risk:update', {
      timestamp: new Date().toISOString(),
      zones: zones.map(z => ({
        _id: z._id,
        zoneId: z.zoneId,
        name: z.name,
        riskLevel: z.riskLevel,
        probability: z.probability,
        state: z.state
      }))
    });
  }
}
