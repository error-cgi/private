# 🚀 PrivateRAT v2.0.0

**Advanced Remote Access Tool dengan Chat Apps Monitoring**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-2.0.0-orange.svg)](package.json)

## 🎯 Overview

PrivateRAT adalah Remote Access Tool (RAT) yang powerful dan aman untuk monitoring dan kontrol device Android secara real-time. Versi 2.0.0 hadir dengan fitur monitoring aplikasi chatting yang revolusioner dan infrastruktur yang sepenuhnya diperbarui.

## ✨ Fitur Utama

### 🔐 **Security & Performance**
- ✅ **Helmet.js** - Security headers yang kuat
- ✅ **CORS Protection** - Cross-origin resource sharing protection
- ✅ **Rate Limiting** - Anti-DDoS dan brute force protection
- ✅ **Compression** - Gzip compression untuk performa optimal
- ✅ **Input Validation** - Sanitasi input yang aman
- ✅ **JWT Authentication** - Token-based authentication

### 📱 **Chat Apps Monitoring** (NEW!)
- ✅ **WhatsApp Monitoring** - Real-time message capture
- ✅ **Telegram Monitoring** - Chat dan channel monitoring
- ✅ **Facebook Messenger** - Conversation tracking
- ✅ **Unified Contact Management** - Centralized contact database
- ✅ **Media Detection** - Support untuk gambar, video, dokumen
- ✅ **Real-time Updates** - Live monitoring dengan WebSocket

### 🖥️ **Core Features**
- ✅ **Device Management** - Multi-device monitoring
- ✅ **GPS Tracking** - Real-time location tracking
- ✅ **File Management** - Remote file explorer
- ✅ **Call & SMS Logs** - Communication monitoring
- ✅ **App Management** - Installed apps monitoring
- ✅ **Permission Control** - App permissions management
- ✅ **Microphone Recording** - Audio capture
- ✅ **WiFi Monitoring** - Network analysis
- ✅ **Clipboard Monitoring** - Text capture
- ✅ **Notification Logs** - App notification tracking

### 🛠️ **Technical Features**
- ✅ **Modern Architecture** - ES6+ dan async/await
- ✅ **Database Management** - LowDB dengan backup otomatis
- ✅ **Logging System** - Winston-based logging
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Performance Monitoring** - Real-time performance metrics
- ✅ **API Documentation** - RESTful API endpoints
- ✅ **Testing Framework** - Jest testing suite

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ 
- npm 8+
- Windows/Linux/macOS

### **Installation**

```bash
# Clone repository
git clone https://github.com/yourusername/PrivateRAT.git
cd PrivateRAT

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env file with your configuration
nano .env

# Start development server
npm run dev

# Or start production server
npm start
```

### **Environment Configuration**

Buat file `.env` dengan konfigurasi berikut:

```env
# Server Configuration
PORT=8080
CONTROL_PORT=22222

# Security
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-session-secret-key-here

# Database
DB_PATH=./maindb.json
CLIENT_DB_PATH=./clientData

# Monitoring
ENABLE_CHAT_MONITORING=true
ENABLE_REAL_TIME_LOGGING=true
```

## 📱 Chat Apps Monitoring

### **WhatsApp**
- Real-time message capture
- Media file detection
- Contact synchronization
- Group chat monitoring
- Status updates tracking

### **Telegram**
- Chat and channel monitoring
- Sticker detection
- File sharing monitoring
- User information tracking
- Bot interaction logging

### **Facebook Messenger**
- Conversation tracking
- Reaction monitoring
- Media sharing detection
- Online status tracking
- Thread management

## 🔧 Development

### **Scripts**
```bash
npm run dev          # Development mode dengan nodemon
npm start            # Production mode
npm test             # Run tests
npm run lint         # ESLint checking
npm run lint:fix     # Auto-fix linting issues
npm run build        # Build project
```

### **Project Structure**
```
PrivateRAT/
├── config/                 # Configuration files
│   ├── config.js          # Main configuration
│   ├── database.js        # Database management
│   ├── logger.js          # Logging configuration
│   └── middleware.js      # Security middleware
├── includes/               # Core modules
│   ├── clientManager.js   # Client management
│   ├── expressRoutes.js   # API routes
│   └── logManager.js      # Log management
├── assets/                 # Frontend assets
│   ├── views/             # EJS templates
│   └── webpublic/         # Static files
├── logs/                   # Application logs
├── clientData/             # Client databases
└── uploads/                # File uploads
```

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS Protection** - Cross-origin protection
- **Rate Limiting** - Anti-DDoS protection
- **Input Validation** - XSS protection
- **JWT Authentication** - Secure token system
- **Request Logging** - Audit trail
- **Error Handling** - Secure error responses

## 📊 Performance

- **Gzip Compression** - Reduced bandwidth usage
- **Database Optimization** - Efficient data storage
- **Memory Management** - Optimized resource usage
- **Real-time Updates** - WebSocket communication
- **Caching System** - Improved response times

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testNamePattern="Chat Monitoring"
```

## 📚 API Documentation

### **Authentication Endpoints**
- `POST /login` - User authentication
- `POST /logout` - User logout
- `POST /changepass` - Password change

### **Device Management**
- `GET /manage/:deviceid/:page` - Device data
- `POST /manage/:deviceid/:commandID` - Send commands
- `POST /manage/:deviceid/GPSPOLL/:speed` - GPS polling

### **Chat Apps Monitoring**
- `POST /manage/:deviceid/0xCH` - Chat apps data
- `GET /manage/:deviceid/whatsapp` - WhatsApp monitoring
- `GET /manage/:deviceid/telegram` - Telegram monitoring
- `GET /manage/:deviceid/messenger` - Messenger monitoring

## 🚨 Legal & Ethical Use

**⚠️ DISCLAIMER**: PrivateRAT dirancang untuk tujuan monitoring yang sah dan etis. Pengguna bertanggung jawab untuk:

- Mematuhi hukum privasi lokal
- Mendapatkan consent dari pengguna
- Menggunakan hanya untuk tujuan yang sah
- Tidak menyalahgunakan untuk aktivitas ilegal

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Distributed under the ISC License. See `LICENSE` for more information.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/PrivateRAT/issues)
- **Documentation**: [Wiki](https://github.com/yourusername/PrivateRAT/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/PrivateRAT/discussions)

## 🙏 Acknowledgments

- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **LowDB** - Database solution
- **Semantic UI** - Frontend framework
- **Winston** - Logging library

---

**Made with ❤️ by the PrivateRAT Team**

*Versi 2.0.0 - The Chat Monitoring Revolution* 