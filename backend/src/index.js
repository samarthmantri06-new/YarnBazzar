require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Create HTTP server to attach socket.io
const server = http.createServer(app);

// Socket.io for admin real-time notifications
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_SELLER_URL || 'http://localhost:5173',
      process.env.CLIENT_BUYER_URL  || 'http://localhost:5174',
      process.env.CLIENT_ADMIN_URL  || 'http://localhost:5175',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// Attach io to app so controllers can emit events
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔌 Admin socket connected: ${socket.id}`);

  socket.on('join-admin', () => {
    socket.join('admin-room');
    console.log(`👮 Admin joined admin-room`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 YarnBazaar Platform running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: SQLite (local dev)\n`);
});
