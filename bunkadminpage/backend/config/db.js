import mongoose from 'mongoose';
const dbOptions = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2,
};

// Connection for User-specific data (profiles, vehicle, etc.)
export const cngUserConn = mongoose.createConnection(
    process.env.CNGUSER_DB_URI || 'mongodb://localhost:27017/cnguserdb',
    dbOptions
);

// Connection for Bunk Admin data (Stations, requests, reports)
export const bunkAdminConn = mongoose.createConnection(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/bunkadmindb',
    dbOptions
);

// Listeners for robust reconnection and visibility
[cngUserConn, bunkAdminConn].forEach((conn, index) => {
    const label = index === 0 ? 'cnguserdb' : 'bunkadmindb';
    
    conn.on('connected', () => console.log(`[DB] Connected to ${label}`));
    conn.on('error', (err) => console.error(`[DB] Error in ${label}:`, err.message));
    conn.on('disconnected', () => console.warn(`[DB] Disconnected from ${label}`));
    conn.on('reconnected', () => console.log(`[DB] Reconnected to ${label}`));
});

export const connectDB = async () => {
    try {
        await Promise.all([
            cngUserConn.asPromise(),
            bunkAdminConn.asPromise()
        ]);
        console.log(`✓ Split Databases Connected: cnguserdb (Users) & bunkadmindb (Admins & Stations)`);
        return { cngUserConn, bunkAdminConn };
    } catch (error) {
        console.warn(`⚠ Database connection failed: ${error.message}`);
        return null;
    }
};


