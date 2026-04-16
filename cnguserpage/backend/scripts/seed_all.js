import mongoose from 'mongoose';
import 'dotenv/config';
import bcryptjs from 'bcryptjs';

const USER_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cnguserdb';
const BUNK_URI = process.env.BUNKADMIN_DB_URI || 'mongodb://localhost:27017/bunkadmindb';
const SUPER_URI = process.env.SUPERADMIN_DB_URI || 'mongodb://localhost:27017/superadmindb';

async function seed() {
    console.log('🚀 SEEDING ALL DATABASES...');

    try {
        const userConn = await mongoose.createConnection(USER_URI).asPromise();
        const bunkConn = await mongoose.createConnection(BUNK_URI).asPromise();
        const superConn = await mongoose.createConnection(SUPER_URI).asPromise();

        const salt = await bcryptjs.genSalt(10);
        const hp = await bcryptjs.hash('Admin@123', salt);

        // 1. Super Admin
        await superConn.db.collection('superadmins').deleteMany({});
        await superConn.db.collection('superadmins').insertOne({
            name: 'Master Admin', email: 'admin@super.com', password: hp, role: 'superadmin', isVerified: true, createdAt: new Date()
        });

        // 2. Bunk Admin & Stations (Approved)
        await bunkConn.db.collection('bunkadmins').deleteMany({});
        await bunkConn.db.collection('stations').deleteMany({});
        
        const bid = new mongoose.Types.ObjectId();
        const sid = new mongoose.Types.ObjectId();

        await bunkConn.db.collection('bunkadmins').insertOne({
            _id: bid, name: 'Bunk Mgr', email: 'admin@bunk.com', password: hp, role: 'bunkadmin', status: 'approved', isVerified: true, assignedStation: sid
        });

        await bunkConn.db.collection('stations').insertMany([
            {
                _id: sid, name: 'Mumbai Express CNG', address: 'Bandra', lat: 19.05, lng: 72.82, 
                stockLevel: 750, pricePerKg: 89, status: 'approved', ownedBy: bid, pumpStatus: 'free', waitingTime: 5
            },
            {
                name: 'Pune Green Fuel', address: 'Kalyani Nagar', lat: 18.54, lng: 73.90, 
                stockLevel: 420, pricePerKg: 91, status: 'approved', ownedBy: bid, pumpStatus: 'busy', waitingTime: 20
            }
        ]);

        // 3. User
        await userConn.db.collection('users').deleteMany({});
        await userConn.db.collection('users').insertOne({
            name: 'John Doe', email: 'user@cng.com', password: hp, phone: '9000000000', isVerified: true,
            vehicle: { name: 'Swift', type: 'Car', number: 'MH01AB1234' },
            settings: { notifications: true, darkMode: false }
        });

        console.log('✅ SEED SUCCESSFUL');
        console.log('   - User: user@cng.com / Admin@123');
        console.log('   - Bunk: admin@bunk.com / Admin@123');
        console.log('   - Super: admin@super.com / Admin@123');

        await userConn.close();
        await bunkConn.close();
        await superConn.close();
        process.exit(0);
    } catch (e) {
        console.error('❌ SEED ERROR:', e.message);
        process.exit(1);
    }
}
seed();
