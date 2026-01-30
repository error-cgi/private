const crypto = require('crypto');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

// Path ke database
const mainDbPath = path.join(__dirname, 'maindb.json');
const mainDbAdapter = new JSONFile(mainDbPath);

async function resetAdminPassword() {
  try {
    console.log('🔄 Resetting admin password...');
    
    // Default admin data dengan hash yang benar
    const defaultAdminData = {
      admin: {
        username: "admin",
        password: "21232f297a57a5a743894a0e4a801fc3", // admin (hash yang benar)
        loginToken: "",
        logs: [],
        ipLog: [],
      },
      clients: []
    };
    
    // Buat instance database dengan default data
    const mainDb = new Low(mainDbAdapter, defaultAdminData);
    
    // Baca database yang ada (jika ada)
    try {
      await mainDb.read();
      // Jika ada data client, pertahankan
      if (mainDb.data && mainDb.data.clients) {
        defaultAdminData.clients = mainDb.data.clients;
      }
    } catch (error) {
      // File tidak ada atau kosong, gunakan default
      console.log('📝 Creating new database file...');
    }
    
    // Update database dengan data yang benar
    mainDb.data = defaultAdminData;
    await mainDb.write();
    
    console.log('✅ Admin password berhasil direset!');
    console.log('👤 Username: admin');
    console.log('🔑 Password: admin');
    console.log('🔗 Login di: http://localhost:5002/login');
    
    // Verifikasi hash
    const testHash = crypto.createHash('md5').update('admin').digest('hex');
    console.log('🔍 Verifikasi hash MD5 "admin":', testHash);
    console.log('📊 Hash di database:', defaultAdminData.admin.password);
    console.log('✅ Hash match:', testHash === defaultAdminData.admin.password ? 'YES' : 'NO');
    
  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
  }
}

// Jalankan fungsi
resetAdminPassword(); 