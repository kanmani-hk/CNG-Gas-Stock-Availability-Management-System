const mongoose = require('mongoose');

async function checkStations() {
    try {
        await mongoose.connect('mongodb://localhost:27017/bunkadmindb');
        console.log('Connected to bunkadmindb');
        
        const Station = mongoose.model('Station', new mongoose.Schema({
            name: String,
            status: String
        }));
        
        const stations = await Station.find({});
        console.log('Total Stations:', stations.length);
        stations.forEach(s => console.log(`- ${s.name} (${s._id}) [${s.status}]`));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkStations();
