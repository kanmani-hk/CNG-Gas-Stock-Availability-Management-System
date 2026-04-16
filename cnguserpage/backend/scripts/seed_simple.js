import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

async function seed() {
    const salt = await bcryptjs.genSalt(10);
    const hp = await bcryptjs.hash('Admin@123', salt);

    // 1. User DB
    await mongoose.connect('mongodb://localhost:27017/cnguserdb');
    await mongoose.connection.db.collection('users').deleteMany({});
    await mongoose.connection.db.collection('users').insertOne({
        name: 'Test User', email: 'user@cng.com', password: hp, isVerified: true
    });
    await mongoose.disconnect();

    // 2. Bunk DB
    await mongoose.connect('mongodb://localhost:27017/bunkadmindb');
    await mongoose.connection.db.collection('bunkadmins').deleteMany({});
    await mongoose.connection.db.collection('stations').deleteMany({});
    await mongoose.connection.db.collection('stations').insertOne({
        name: 'Demo Bunk', address: 'Coimbatore', lat: 11.0, lng: 77.0, stockLevel: 500, pricePerKg: 85, status: 'approved'
    });
    await mongoose.disconnect();

    console.log('--- SEEDING DONE ---');
}
seed();
