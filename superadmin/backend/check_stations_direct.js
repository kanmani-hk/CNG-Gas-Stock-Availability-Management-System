import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const BUNKADMIN_DB_URI = process.env.BUNKADMIN_DB_URI || 'mongodb://localhost:27017/bunkadmindb';

async function check() {
    await mongoose.connect(BUNKADMIN_DB_URI);
    const stations = await mongoose.connection.db.collection('stations').find({}).toArray();
    console.log('STATIONS_FOUND:', stations.length);
    console.log(JSON.stringify(stations, null, 2));
    process.exit(0);
}
check().catch(err => { console.error(err); process.exit(1); });
