import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bunkadmindb';

async function resetDB() {
  try {
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      console.log(`Dropping collection: ${collection.name}`);
      await mongoose.connection.db.dropCollection(collection.name);
    }

    console.log('Database reset complete.');
    process.exit(0);
  } catch (error) {
    console.error('Database reset failed:', error);
    process.exit(1);
  }
}

resetDB();
