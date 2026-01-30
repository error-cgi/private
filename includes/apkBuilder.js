const cp = require('child_process');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const CONST = require('./const');

/**
 * Memeriksa dan membuat direktori jika tidak ada
 * @param {string} dir Path direktori
 */
async function ensureDirectoryExists(dir) {
    try {
        await fsp.access(dir);
    } catch {
        await fsp.mkdir(dir, { recursive: true });
    }
}

/**
 * Menjalankan command shell dan menunggu hasilnya
 * @param {string} command Command yang akan dijalankan
 * @returns {Promise<string>} Output command
 */
function executeCommand(command) {
    return new Promise((resolve, reject) => {
        cp.exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Execution error:', error);
                console.error('stderr:', stderr);
                reject(error);
                return;
            }
            // java -version writes to stderr
            if (stdout) console.log('stdout:', stdout);
            if (stderr) console.log('stderr:', stderr);
            resolve(stdout || stderr);
        });
    });
}

/**
 * Memeriksa versi Java yang terinstall
 * @returns {Promise<string>} Versi Java yang terdeteksi
 */
async function checkJavaVersion() {
    try {
        const output = await executeCommand('java -version');
        return output;
    } catch (error) {
        throw new Error('Java tidak ditemukan. Mohon install Java JDK (versi 8 atau lebih baru).');
    }
}

/**
 * Memeriksa keberadaan file
 * @param {string} filePath Path file yang akan dicek
 */
async function checkFileExists(filePath) {
    try {
        await fsp.access(filePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Memodifikasi APK dengan URI dan PORT baru
 * @param {string} URI - URI untuk patch
 * @param {number} PORT - Port number
 * @returns {Promise<void>}
 */
async function patchAPK(URI, PORT) {
    try {
        // Validasi input
        if (!URI || typeof URI !== 'string') {
            throw new Error('URI tidak valid');
        }

        if (!PORT || typeof PORT !== 'number' || PORT >= 25565 || PORT <= 0) {
            throw new Error('Port harus antara 1-25564');
        }

        // Memastikan direktori ada
        await ensureDirectoryExists(path.dirname(CONST.patchFilePath));

        // Tentukan protocol dan bersihkan URI
        let protocol = 'http';
        let cleanURI = URI;
        
        if (URI.startsWith('http://')) {
            protocol = 'http';
            cleanURI = URI.replace('http://', '');
        } else if (URI.startsWith('https://')) {
            protocol = 'https';
            cleanURI = URI.replace('https://', '');
        }

        // Baca file smali
        let content = await fsp.readFile(CONST.patchFilePath, 'utf8');
        
        // Construct URL baru
        // Format di smali: const-string v3, "http://192.168.124.205:22222?model="
        const newUrl = `${protocol}://${cleanURI}:${PORT}`;
        console.log(`Patching APK dengan URL: ${newUrl}`);

        // Replace URL menggunakan regex
        // Mencocokkan pattern http/https, IP/Domain, Port, dan ?model=
        const regex = /const-string v3, "https?:\/\/.*:[0-9]+\?model="/;
        
        if (!regex.test(content)) {
            console.warn('Warning: Pattern URL tidak ditemukan di file smali. Mencoba metode alternatif...');
            // Fallback: cari string yang mirip jika regex spesifik gagal
            // const-string v3, "http://...
        }
        
        content = content.replace(regex, `const-string v3, "${newUrl}?model="`);
        
        // Tulis kembali file
        await fsp.writeFile(CONST.patchFilePath, content, 'utf8');
        console.log('APK berhasil di-patch');
        
    } catch (error) {
        throw new Error(`Gagal melakukan patch APK: ${error.message}`);
    }
}

/**
 * Membangun APK dari source
 * @returns {Promise<string>} Path ke APK yang sudah di-build
 */
async function buildAPK() {
    try {
        console.log('Memulai proses build APK...');
        
        // 1. Cek Java
        await checkJavaVersion();
        
        // 2. Build APK (smali -> apk)
        console.log('Building APK (apktool)...');
        console.log('Command:', CONST.buildCommand);
        await executeCommand(CONST.buildCommand);
        
        // 3. Sign APK
        console.log('Signing APK...');
        
        // Cek dan generate keystore jika perlu
        if (!await checkFileExists(CONST.keystore)) {
             console.log('Keystore tidak ditemukan. Mencoba generate keystore baru...');
             try {
                 // Command untuk generate keystore otomatis
                 const keytoolCmd = `keytool -genkey -v -keystore "${CONST.keystore}" -alias androidkey -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=Android, OU=Android, O=Android, L=Unknown, S=Unknown, C=US"`;
                 await executeCommand(keytoolCmd);
                 console.log('Keystore berhasil dibuat.');
             } catch (err) {
                 throw new Error(`Gagal membuat keystore: ${err.message}. Pastikan keytool ada di PATH.`);
             }
        }
        
        console.log('Command:', CONST.signCommand);
        await executeCommand(CONST.signCommand);
        
        // 4. Pindahkan/Rename hasil sign ke output final
        // Karena jarsigner menimpa file input (apkBuildPath), kita rename/copy ke apkSignedBuildPath
        
        await ensureDirectoryExists(path.dirname(CONST.apkSignedBuildPath));
        
        // Copy file
        await fsp.copyFile(CONST.apkBuildPath, CONST.apkSignedBuildPath);
        
        console.log('APK berhasil dibangun dan ditandatangani:', CONST.apkSignedBuildPath);
        return CONST.apkSignedBuildPath;
        
    } catch (error) {
        console.error('Error dalam proses build:', error);
        throw new Error(`Gagal membangun APK: ${error.message}`);
    }
}

/**
 * Membersihkan file sementara setelah build
 */
async function cleanup() {
    try {
        if (await checkFileExists(CONST.apkBuildPath)) {
            await fsp.unlink(CONST.apkBuildPath);
        }
    } catch (error) {
        console.warn('Gagal membersihkan file sementara:', error);
    }
}

module.exports = {
    buildAPK,
    patchAPK,
    cleanup,
    checkJavaVersion
};
