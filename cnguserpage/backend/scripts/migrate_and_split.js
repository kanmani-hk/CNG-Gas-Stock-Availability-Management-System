import mongoose from 'mongoose';
import 'dotenv/config';

// ── CONNECTION URIS ──────────────────────────────────────────
const USER_DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cnguserdb';
const BUNK_ADMIN_DB_URI = process.env.BUNKADMIN_DB_URI || 'mongodb://localhost:27017/bunkadmindb';
const SUPER_ADMIN_DB_URI = process.env.SUPERADMIN_DB_URI || 'mongodb://localhost:27017/superadmindb';

async function migrate() {
    console.log('🚀 Starting Robust Multi-Database Migration...');

    try {
        const userConn = await mongoose.createConnection(USER_DB_URI).asPromise();
        const bunkConn = await mongoose.createConnection(BUNK_ADMIN_DB_URI).asPromise();
        const superConn = await mongoose.createConnection(SUPER_ADMIN_DB_URI).asPromise();
        console.log('✓ Connected to all 3 Target Databases');

        // Access the old source collection
        const oldCollection = userConn.db.collection('cnguser');
        const documents = await oldCollection.find({}).toArray();
        console.log(`ℹ Found ${documents.length} total source documents.`);

        let stats = {
            users: 0,
            bookings: 0,
            feedbacks: 0,
            loginAttempts: 0,
            bunkAdmins: 0,
            stations: 0,
            driverRequests: 0,
            reports: 0,
            superAdmins: 0,
            adminRequests: 0,
            priceChanges: 0
        };

        for (const doc of documents) {
            // 1. Classification for superadmindb
            if (doc.role === 'superadmin') {
                await superConn.db.collection('superadmins').insertOne(doc);
                stats.superAdmins++;
            }
            else if (doc.bunkAdminId && (doc.requestedAction || doc.remarks)) {
                await superConn.db.collection('admin_requests').insertOne(doc);
                stats.adminRequests++;
            }
            else if (doc.oldPrice !== undefined && doc.newPrice !== undefined) {
                await superConn.db.collection('price_changes').insertOne(doc);
                stats.priceChanges++;
            }
            // 2. Classification for bunkadmindb
            else if (doc.role === 'bunkadmin' || doc.assignedStations) {
                await bunkConn.db.collection('bunkadmins').insertOne(doc);
                stats.bunkAdmins++;
            }
            else if (doc.lat && doc.pricePerKg && (doc.stockLevel !== undefined || doc.address)) {
                await bunkConn.db.collection('stations').insertOne(doc);
                stats.stations++;
            }
            else if (doc.driverName && doc.vehicleNumber && doc.requestedGas) {
                await bunkConn.db.collection('driver_requests').insertOne(doc);
                stats.driverRequests++;
            }
            else if (doc.totalSalesAmount || doc.totalStockSold) {
                await bunkConn.db.collection('reports').insertOne(doc);
                stats.reports++;
            }
            // 3. Classification for cnguserdb
            else if (doc.email && doc.password && !doc.role) {
                await userConn.db.collection('users').insertOne(doc);
                stats.users++;
            }
            else if (doc.userId && doc.slotTime && doc.slotDate) {
                await userConn.db.collection('bookings').insertOne(doc);
                stats.bookings++;
            }
            else if (doc.subject && doc.message && doc.email) {
                await userConn.db.collection('feedbacks').insertOne(doc);
                stats.feedbacks++;
            }
            else if (doc.success !== undefined && doc.ip !== undefined) {
                await userConn.db.collection('login_attempts').insertOne(doc);
                stats.loginAttempts++;
            }
            else {
                console.log(`⚠ Skipped document: _id ${doc._id} (Matches no category)`);
            }
        }

        console.log('\n✅ Migration Complete!');
        console.table(stats);

        await userConn.close();
        await bunkConn.close();
        await superConn.close();
        process.exit();
    } catch (error) {
        console.error('✗ Migration failed:', error.message);
        process.exit(1);
    }
}

migrate();
