import mongoose from 'mongoose';
import 'dotenv/config';

async function checkStations() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bunkadmindb';
        console.log('Connecting to:', uri);
        await mongoose.connect(uri);
        console.log('Connected!');
        
        const Station = mongoose.model('Station', new mongoose.Schema({
            name: String,
            status: String
        }));
        
        const stations = await Station.find({});
        console.log('Found', stations.length, 'stations in BunkAdmin DB:');
        stations.forEach(s => {
            console.log(`- ${s.name} (ID: ${s._id}) [Status: ${s.status}]`);
        });
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkStations();
