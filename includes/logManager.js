module.exports = {
    log: (type, message) => {
        try {
            if (global.db && global.db.getMainDb) {
                const mainDb = global.db.getMainDb();
                let logs = mainDb.get('admin.logs').value() || [];
                logs.push({
                    time: new Date(),
                    type: type.name,
                    message: message
                });
                mainDb.get('admin').assign({ logs }).write();
            }
            console.log(`[${type.name}] ${message}`);
        } catch (error) {
            console.error("Error logging message:", error);
            console.log(`[${type.name}] ${message}`);
        }
    },
    getLogs: () => {
        try {
            if (global.db && global.db.getMainDb) {
                const mainDb = global.db.getMainDb();
                let logs = mainDb.get('admin.logs').value() || [];
                return logs.sort((a, b) => new Date(b.time) - new Date(a.time));
            }
            return [];
        } catch (error) {
            console.error("Error getting logs:", error);
            return [];
        }
    }
}