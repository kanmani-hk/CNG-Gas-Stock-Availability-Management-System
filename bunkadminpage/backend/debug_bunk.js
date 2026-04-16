import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config({ path: 'd:/finalll/backup-final/backup-final/final/bunkadminpage/backend/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cng-bunk';

async function debug() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB:', MONGO_URI);

    const bunkAdmins = await mongoose.connection.collection('bunkadmins').find().toArray();
    console.log('Bunk Admins count:', bunkAdmins.length);

    for (const admin of bunkAdmins) {
        console.log(`- ${admin.email} (status: ${admin.status}, isVerified: ${admin.isVerified})`);
    }

    process.exit(0);
}

debug().catch(console.error);
