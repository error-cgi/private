
try {
    const apkBuilder = require('./includes/apkBuilder');
    console.log('apkBuilder loaded successfully');
    console.log('Exports:', Object.keys(apkBuilder));
} catch (error) {
    console.error('Error loading apkBuilder:', error);
}

try {
    const routes = require('./includes/expressRoutes');
    console.log('expressRoutes loaded successfully');
} catch (error) {
    console.error('Error loading expressRoutes:', error);
}
