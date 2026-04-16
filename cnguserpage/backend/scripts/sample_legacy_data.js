import fs from 'fs';
import mongoose from 'mongoose';
import 'dotenv/config';

async function sampleData() {
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cnguserdb';
    let output = '';
    
    try {
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.db;
        const oldCollection = db.collection('cnguser');
        const samples = await oldCollection.find({}).limit(50).toArray();
        
        output += `--- Legacy Data Sample (Found ${samples.length} docs) ---\n`;
        samples.forEach((doc, i) => {
            // Keep only relevant fields to avoid excessive output
            const docClone = { ...doc };
            if (docClone.password) docClone.password = 'HASHED';
            if (docClone.confirmPassword) docClone.confirmPassword = 'HASHED';
            
            output += `\n[Doc ${i + 1}] ${JSON.stringify(docClone, null, 2)}\n`;
        });
        
        fs.writeFileSync('migration_sample.txt', output);
        await mongoose.disconnect();
    } catch (error) {
        fs.writeFileSync('migration_sample.txt', `Error: ${error.message}`);
    }
}

sampleData();
