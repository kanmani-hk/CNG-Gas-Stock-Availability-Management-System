import express from 'express';
import GlobalPrice from '../models/GlobalPrice.js';
import Station from '../models/StationRef.js';
import CngUserStation from '../models/CngUserStationRef.js';
import PriceChange from '../models/PriceChange.js';


const router = express.Router();

// Get current global price
router.get('/price', async (req, res) => {
    try {
        let price = await GlobalPrice.findOne().sort({ createdAt: -1 });
        if (!price) {
            price = await GlobalPrice.create({ pricePerKg: 85.0 });
        }
        res.json(price);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update global price and all stations
router.post('/price', async (req, res) => {
    try {
        const { pricePerKg } = req.body;
        if (!pricePerKg || isNaN(pricePerKg)) {
            return res.status(400).json({ error: 'Valid price is required' });
        }

        // 1. Update/Create GlobalPrice record
        let priceRecord = await GlobalPrice.findOne().sort({ createdAt: -1 });
        if (priceRecord) {
            priceRecord.pricePerKg = pricePerKg;
            await priceRecord.save();
        } else {
            priceRecord = await GlobalPrice.create({ pricePerKg });
        }

        // 2. Fetch all stations to log individual changes
        const stations = await Station.find({});
        
        // 3. Log in Change Table - Price change for the bunk prices (superadmindb)
        const priceLogs = stations.map(s => ({
            stationId: s._id,
            stationName: s.name,
            oldPrice: s.pricePerKg,
            newPrice: pricePerKg,
            status: 'applied',
            processedBy: req.user ? req.user.userId : null
        }));
        await PriceChange.insertMany(priceLogs);

        // 4. Update ALL stations in BOTH databases
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (Global Update)';
        
        const [bunkUpdate, userUpdate] = await Promise.all([
            Station.updateMany({}, { 
                $set: { 
                    pricePerKg: pricePerKg,
                    lastUpdated: timestamp
                } 
            }),
            CngUserStation.updateMany({}, {
                $set: {
                    pricePerKg: pricePerKg,
                    lastUpdated: timestamp
                }
            })
        ]);

        res.json({ 
            message: 'Global price updated and logged across all tables', 
            globalPrice: priceRecord,
            bunkStationsUpdated: bunkUpdate.modifiedCount,
            userStationsUpdated: userUpdate.modifiedCount
        });

    } catch (error) {
        console.error('Price update error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
