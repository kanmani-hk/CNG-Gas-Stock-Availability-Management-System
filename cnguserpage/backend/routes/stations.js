import express from 'express';
import mongoose from 'mongoose';
import Station from '../models/Station.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import DriverRequest from '../models/DriverRequest.js';
import { authenticateToken } from './auth.js';
import { sendBookingConfirmation } from '../config/email.js';


const router = express.Router();

// Get all stations
router.get('/', async (req, res) => {
  try {
    const stations = await Station.find();
    res.json(stations);
  } catch (error) {
    console.error('Get stations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get station by ID
router.get('/:id', async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }
    res.json(station);
  } catch (error) {
    console.error('Get station error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new station (requires authentication)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, address, lat, lng, stockLevel, pricePerKg, operatingHours } = req.body;

    if (!name || !address || lat === undefined || lng === undefined || !pricePerKg) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newStation = new Station({
      name,
      address,
      lat,
      lng,
      stockLevel: stockLevel || 50,
      pricePerKg,
      operatingHours: operatingHours || '24/7',
      updatedBy: req.user.userId,
    });

    await newStation.save();
    res.status(201).json({ message: 'Station created successfully', station: newStation });
  } catch (error) {
    console.error('Create station error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update station stock level (requires authentication)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const stationId = req.params.id;

    // Guard against invalid / undefined ids to avoid CastError
    if (!stationId || !mongoose.Types.ObjectId.isValid(stationId)) {
      return res.status(400).json({ error: 'Invalid station id' });
    }

    const { stockLevel, pricePerKg } = req.body;
    const updateData = {
      $set: {
        lastUpdated: 'Just now',
        updatedBy: req.user.userId,
      },
    };

    if (stockLevel !== undefined) updateData.$set.stockLevel = stockLevel;
    if (pricePerKg !== undefined) updateData.$set.pricePerKg = pricePerKg;

    const station = await Station.findByIdAndUpdate(stationId, updateData, { new: true });

    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    res.json({ message: 'Station updated successfully', station });
  } catch (error) {
    console.error('Update station error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── ADD A BOOKING (ALIGNED WITH NEW BOOKING TABLE) ───────────
router.post('/:id/bookings', authenticateToken, async (req, res) => {
    try {
        const stationId = req.params.id;
        if (!stationId || !mongoose.Types.ObjectId.isValid(stationId)) {
            return res.status(400).json({ error: 'Invalid station id format' });
        }

        const { timeSlot, requestedGas } = req.body;
        const gasAmount = requestedGas ? Number(requestedGas) : 0;
        const station = await Station.findById(stationId);
        if (!station) return res.status(404).json({ error: 'Station not found' });
        
        // 1. Create entry in Booking Slot Table (cnguserdb)
        const booking = await Booking.create({
            userId: req.user.userId,
            stationId: station._id,
            stationName: station.name,
            slotTime: timeSlot,
            slotDate: new Date(), // Use today or requested date
            requestedGasInKg: gasAmount,
            status: 'pending'
        });

        // 1.1 Also push to station.bookings (for real-time dashboard)
        // Fetch full user for name/vehicle info
        const fullUser = await User.findById(req.user.userId);
        station.bookings.push({
            driverName: fullUser?.name || 'Anonymous Driver',
            driverEmail: fullUser?.email,
            vehicleNumber: fullUser?.vehicle?.number || 'N/A',
            timeSlot,
            requestedGas: gasAmount,
            status: 'pending'
        });

        // 1.2 ALSO create entry in DriverRequest collection (bunkadmindb)
        // This is crucial for the Bunk Admin to see the request in their "Bookings" list
        await DriverRequest.create({
            stationId: station._id,
            driverName: fullUser?.name || 'Anonymous Driver',
            driverEmail: fullUser?.email,
            vehicleNumber: fullUser?.vehicle?.number || 'N/A',
            timeSlot,
            requestedGasInKg: gasAmount,
            status: 'pending'
        });

        // 2. Update station stock if needed (in bunkadmindb)
        if (gasAmount > 0 && station.stockLevel >= gasAmount) {
            station.stockLevel -= gasAmount;
            await station.save();
        }

        // 3. Send email confirmation to user (Async/non-blocking)
        if (fullUser && fullUser.email) {
            sendBookingConfirmation(fullUser.email, {
                stationName: station.name,
                timeSlot,
                gasAmount,
                vehicleNumber: fullUser.vehicle?.number || 'N/A'
            }).catch(err => console.error('Booking email error:', err));
        }

        res.json({ message: 'Booking slot created successfully in Booking Table', booking });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// Delete station (requires authentication)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const station = await Station.findByIdAndDelete(req.params.id);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }
    res.json({ message: 'Station deleted successfully' });
  } catch (error) {
    console.error('Delete station error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
