import fs from 'fs';
import mongoose from 'mongoose';

async function listAll() {
    let output = '';
    const dbs = ['cnguserdb', 'bunkadmindb', 'superadmindb', 'cnggasstock', 'admin'];
    for (const dbName of dbs) {
        const uri = `mongodb://localhost:27017/${dbName}`;
        try {
            const conn = await mongoose.createConnection(uri).asPromise();
            const collections = await conn.db.listCollections().toArray();
            output += `--- DB: ${dbName} ---\n`;
            if (collections.length === 0) output += 'Empty.\n';
            for (const col of collections) {
                const count = await conn.db.collection(col.name).countDocuments();
                output += `  ${col.name}: ${count} docs\n`;
            }
            await conn.close();
        } catch (e) {
            output += `--- DB: ${dbName} (Error: ${e.message}) ---\n`;
        }
    }
    fs.writeFileSync('db_discovery.txt', output);
}

listAll();
