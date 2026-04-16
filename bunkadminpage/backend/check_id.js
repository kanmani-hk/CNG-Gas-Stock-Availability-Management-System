import mongoose from 'mongoose';
import 'dotenv/config';

async function checkId() {
    try {
        const id = '69afe499a318091e2c6915cd';
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bunkadmindb';
        console.log('Connecting to:', uri);
        await mongoose.connect(uri);
        
        const Station = mongoose.model('Station', new mongoose.Schema({}));
        const s = await Station.findById(id);
        if (s) {
            console.log('Station found!');
        } else {
            console.log('Station NOT found in bunkadmindb.');
        }
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkId();
