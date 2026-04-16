import mongoose from 'mongoose';
import 'dotenv/config';

async function checkDB() {
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cnguserdb';
    console.log('Connecting to:', MONGO_URI);
    try {
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('--- Collections in cnguserdb ---');
        if (collections.length === 0) console.log('No collections found.');
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`${col.name}: ${count} documents`);
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkDB();
