import mongoose from 'mongoose';
import fs from 'fs';

async function checkId() {
    let log = '';
    try {
        const id = '69afe499a318091e2c6915cd';
        const uris = [
            'mongodb://localhost:27017/cnguserdb',
            'mongodb://localhost:27017/bunkadmindb',
            'mongodb://localhost:27017/superadmindb'
        ];
        
        for (const uri of uris) {
            log += `Checking ${uri}...\n`;
            try {
                const conn = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 2000 }).asPromise();
                const Station = conn.model('Station', new mongoose.Schema({}, { strict: false }));
                const s = await Station.findById(id);
                if (s) {
                    log += `✓ FOUND in ${uri}\n`;
                } else {
                    log += `✗ Not found in ${uri}\n`;
                }
                await conn.close();
            } catch (e) {
                log += `Error connecting to ${uri}: ${e.message}\n`;
            }
        }
    } catch (err) {
        log += `Global error: ${err.message}\n`;
    }
    fs.writeFileSync('trace_results.txt', log);
    process.exit(0);
}
checkId();
