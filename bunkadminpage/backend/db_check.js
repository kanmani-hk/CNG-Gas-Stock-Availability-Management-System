import mongoose from 'mongoose';
import fs from 'fs';

async function listCols() {
    let log = '';
    try {
        const uri = 'mongodb://localhost:27017/bunkadmindb';
        log += `Connecting to ${uri}...\n`;
        const conn = await mongoose.createConnection(uri).asPromise();
        const cols = await conn.db.listCollections().toArray();
        log += `Collections: ${cols.map(c => c.name).join(', ')}\n`;
        
        const Station = conn.model('Station', new mongoose.Schema({}, { strict: false }), 'stations');
        const count = await Station.countDocuments();
        log += `Station count in 'stations': ${count}\n`;
        
        const all = await Station.find().limit(5);
        log += `Sample IDs: ${all.map(s => s._id).join(', ')}\n`;
        
        await conn.close();
    } catch (e) {
        log += `Error: ${e.message}\n`;
    }
    fs.writeFileSync('db_check.txt', log);
    process.exit(0);
}
listCols();
