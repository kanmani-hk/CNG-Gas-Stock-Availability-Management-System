import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const BUNKADMIN_DB_URI = process.env.BUNKADMIN_DB_URI || 'mongodb://localhost:27017/bunkadmindb';

const stationSchema = new mongoose.Schema({
    name: String,
    address: String,
    lat: Number,
    lng: Number,
    stockLevel: { type: Number, default: 500 },
    status: { type: String, default: 'approved' },
    pricePerKg: Number,
    operatingHours: { type: String, default: '24/7' },
    pumpStatus: { type: String, default: 'free' },
    waitingTime: { type: Number, default: 0 }
}, { timestamps: true });

async function seed() {
    await mongoose.connect(BUNKADMIN_DB_URI);
    const Station = mongoose.model('Station', stationSchema, 'stations');
    
    // Check if stations already exist
    const count = await Station.countDocuments();
    if (count > 0) {
        console.log('Stations already exist count:', count);
    } else {
        await Station.create([
            {
                name: "Bharat Petroleum - Coimbatore",
                address: "Avinashi Road, Peelamedu, Coimbatore",
                lat: 11.0285,
                lng: 77.0125,
                stockLevel: 800,
                status: 'approved',
                pricePerKg: 92.5,
                operatingHours: '24/7'
            },
            {
                name: "Indian Oil - Salem",
                address: "OMR Road, Salem Highway, Salem",
                lat: 11.6643,
                lng: 78.1460,
                stockLevel: 300,
                status: 'approved',
                pricePerKg: 91.0,
                operatingHours: '6 AM - 11 PM'
            }
        ]);
        console.log('✅ Stations seeded!');
    }
    process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
