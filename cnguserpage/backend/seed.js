import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Station from './models/Station.js';

dotenv.config();

const predefinedStations = [
  {
    name: 'BPCL CNG Station',
    address: 'Bandra West, Mumbai, Maharashtra 400050',
    lat: 19.0596,
    lng: 72.8295,
    stockLevel: 85,
    pricePerKg: 89.50,
    operatingHours: '24/7',
    lastUpdated: '10 mins ago'
  },
  {
    name: 'HPCL Green Fuel',
    address: 'Kalyani Nagar, Pune, Maharashtra 411006',
    lat: 18.5480,
    lng: 73.9022,
    stockLevel: 42,
    pricePerKg: 91.00,
    operatingHours: '06:00 - 23:00',
    lastUpdated: '2 hours ago'
  },
  {
    name: 'IGL Smart Station',
    address: 'Connaught Place, New Delhi, Delhi 110001',
    lat: 28.6327,
    lng: 77.2197,
    stockLevel: 15,
    pricePerKg: 82.50,
    operatingHours: '24/7',
    lastUpdated: 'Just now'
  }
];

async function seed() {
    try {
        const uri = process.env.BUNKADMIN_DB_URI || 'mongodb://localhost:27017/bunkadmindb';
        console.log(`ℹ Connecting to: ${uri}`);
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✓ Connected to MongoDB');

        // Check if stations already exist
        const existingCount = await Station.countDocuments();
        if (existingCount > 0) {
            console.log(`ℹ Database already has ${existingCount} stations. Skipping seed.`);
            console.log('  To re-seed, drop the stations collection first:');
            console.log('  db.stations.drop()');
            await mongoose.disconnect();
            return;
        }

        // Insert all predefined stations
        const result = await Station.insertMany(predefinedStations);
        console.log(`✓ Seeded ${result.length} CNG stations into MongoDB`);
        console.log('  Database: cnggasstock');
        console.log('  Collection: stations');

        await mongoose.disconnect();
        console.log('✓ Done. MongoDB disconnected.');
    } catch (error) {
        console.error('✗ Seed failed:', error.message);
        process.exit(1);
    }
}

seed();
