import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dbOptions = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2,
};

// ── Super Admin DB (primary) ─────────────────────────────────
export const superAdminConn = mongoose.createConnection(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/superadmindb',
    dbOptions
);
superAdminConn.on('connected', () => console.log('✓ SuperAdmin DB connected'));
superAdminConn.on('error', (err) => console.error('✗ SuperAdmin DB error:', err.message));
superAdminConn.on('reconnected', () => console.log('✓ SuperAdmin DB reconnected'));

// ── BunkAdmin DB (read) ──────────────────────────────────────
export const bunkAdminConn = mongoose.createConnection(
    process.env.BUNKADMIN_DB_URI || 'mongodb://localhost:27017/bunkadmindb',
    dbOptions
);
bunkAdminConn.on('connected', () => console.log('✓ BunkAdmin DB connected'));
bunkAdminConn.on('error', (err) => console.error('✗ BunkAdmin DB error:', err.message));
bunkAdminConn.on('reconnected', () => console.log('✓ BunkAdmin DB reconnected'));

// ── CNG User DB (read) ───────────────────────────────────────
export const cngUserConn = mongoose.createConnection(
    process.env.CNGUSER_DB_URI || 'mongodb://localhost:27017/cnguserdb',
    dbOptions
);
cngUserConn.on('connected', () => console.log('✓ CNG User DB connected'));
cngUserConn.on('error', (err) => console.error('✗ CNG User DB error:', err.message));
cngUserConn.on('reconnected', () => console.log('✓ CNG User DB reconnected'));


export async function connectAllDBs() {
    const uris = [
        { label: 'SuperAdmin', uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/superadmindb', conn: superAdminConn },
        { label: 'BunkAdmin', uri: process.env.BUNKADMIN_DB_URI || 'mongodb://localhost:27017/bunkadmindb', conn: bunkAdminConn },
        { label: 'CNG User', uri: process.env.CNGUSER_DB_URI || 'mongodb://localhost:27017/cnguserdb', conn: cngUserConn },
    ];
    for (const db of uris) {
        try {
            if (db.conn.readyState === 0) await db.conn.asPromise();
        } catch (err) {
            console.warn(`⚠ Could not connect to ${db.label} DB: ${err.message}`);
        }
    }
}
