import fs from 'fs';
import mongoose from 'mongoose';
import 'dotenv/config';

async function cleanup() {
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cnguserdb';
    let output = '';
    output += `Connecting to: ${MONGO_URI}\n`;
    
    try {
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.db;
        
        const collectionsToDelete = ['users', 'stations', 'feedbacks', 'user_vehicles', 'user_settings'];
        
        for (const colName of collectionsToDelete) {
            const list = await db.listCollections({ name: colName }).toArray();
            if (list.length > 0) {
                await db.collection(colName).drop();
                output += `✓ Deleted collection: ${colName}\n`;
            } else {
                output += `ℹ Collection not found, skipping: ${colName}\n`;
            }
        }
        
        output += '--- Cleanup Complete! ---\n';
        fs.writeFileSync('cleanup_log.txt', output);
        process.exit(0);
    } catch (error) {
        output += `✗ Cleanup failed: ${error.message}\n`;
        fs.writeFileSync('cleanup_log.txt', output);
        process.exit(1);
    }
}

cleanup();
