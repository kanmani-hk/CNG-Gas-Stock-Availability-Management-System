import express from 'express';
import mongoose from 'mongoose';
import Station from '../models/Station.js';
import BunkAdmin from '../models/BunkAdmin.js';
import DriverRequest from '../models/DriverRequest.js';
import Report from '../models/Report.js';
import { authenticateBunkAdmin } from '../middleware/auth.js';

// Static imports for reliability
import { sendBookingNotification, sendAdminBookingAlert } from '../config/email.js';

const router = express.Router();

// ─── ADD A DRIVER BOOKING (PUBLIC) ────────────────────────
router.post('/:id/bookings', async (req, res) => {
    try {
        const stationId = req.params.id;
        console.log(`[BOOKING_POST] Received request for station: ${stationId}`);

        if (!stationId || !mongoose.Types.ObjectId.isValid(stationId)) {
            return res.status(400).json({ error: 'Invalid station id format' });
        }

        const { driverName, driverEmail, vehicleNumber, timeSlot, requestedGas } = req.body;
        console.log(`[BOOKING_DATA] Driver: ${driverName}, Email: ${driverEmail}, Slot: ${timeSlot}, Gas: ${requestedGas}kg`);

        if (!driverName || !driverEmail || !vehicleNumber || !timeSlot || !requestedGas) {
            return res.status(400).json({ error: 'Missing booking details' });
        }
        
        const gasAmount = Number(requestedGas) || 0;
        
        // Find station and populate owner email for alert
        const station = await Station.findById(stationId).populate('ownedBy', 'email');
        if (!station) {
            return res.status(404).json({ error: 'Station not found' });
        }
        
        // 1. Create entry in Request Table - Drivers Booking (bunkadmindb)
        const driverRequest = await DriverRequest.create({
            stationId: station._id,
            driverName,
            driverEmail,
            vehicleNumber,
            timeSlot,
            requestedGasInKg: gasAmount,
            status: 'pending'
        });

        // 1.1 Also push to station.bookings (for real-time consistency)
        station.bookings.push({
            driverName,
            driverEmail,
            vehicleNumber,
            timeSlot,
            requestedGas: gasAmount,
            status: 'pending'
        });

        // 2. Update stock
        if (gasAmount > 0 && station.stockLevel >= gasAmount) {
            station.stockLevel -= gasAmount;
            await station.save();
        }

        console.log(`[BOOKING_SAVED] Driver request stored successfully for ${driverName}`);

        // ─── NOTIFICATIONS (Non-blocking) ───────────────────
        try {
            sendBookingNotification(driverEmail, driverName, 'pending', station.name, timeSlot)
                .catch(err => console.error(`[MAIL_DRIVER_ERR]`, err));
            
            if (station.ownedBy && station.ownedBy.email) {
                sendAdminBookingAlert(station.ownedBy.email, driverRequest, station.name)
                    .catch(err => console.error(`[MAIL_ADMIN_ERR]`, err));
            }
        } catch (mailErr) {
            console.error('[MAIL_CRITICAL_ERR] Async block failed', mailErr);
        }

        res.json({ message: 'Booking successful (Request Table)', driverRequest });

    } catch (error) {
        console.error('Add booking error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// ─── GET ALL STATIONS (PUBLIC) ──────────────────────────────
// Used by the user page to fetch all bunk admin stations
router.get('/', async (req, res) => {
    try {
        const stations = await Station.find({ status: 'approved' }).populate('ownedBy', 'name email phone');
        res.json(stations);
    } catch (error) {
        console.error('Get stations error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── GET SINGLE STATION ─────────────────────────────────────
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

// ─── UPDATE OWN STATION (ADMIN ONLY) ────────────────────────
// Bunk admin can only update THEIR OWN station
router.put('/:id', authenticateBunkAdmin, async (req, res) => {
    try {
        const stationId = req.params.id;

        if (!stationId || !mongoose.Types.ObjectId.isValid(stationId)) {
            return res.status(400).json({ error: 'Invalid station id' });
        }

        // Verify this station belongs to the logged-in admin
        const admin = await BunkAdmin.findById(req.user.userId);
        if (!admin || !admin.assignedStation || admin.assignedStation.toString() !== stationId) {
            return res.status(403).json({ error: 'You can only update your own station' });
        }

        const { stockLevel, pricePerKg, name, address, lat, lng, operatingHours } = req.body;
        const updateData = {
            $set: {
                lastUpdated: 'Just now',
            },
        };

        if (stockLevel !== undefined) updateData.$set.stockLevel = stockLevel;
        // Price update removed - managed only by Super Admin
        if (name) updateData.$set.name = name;
        if (address) updateData.$set.address = address;
        if (lat !== undefined) updateData.$set.lat = Number(lat);
        if (lng !== undefined) updateData.$set.lng = Number(lng);
        if (operatingHours) updateData.$set.operatingHours = operatingHours;
        if (req.body.pumpStatus !== undefined) updateData.$set.pumpStatus = req.body.pumpStatus;
        if (req.body.waitingTime !== undefined) updateData.$set.waitingTime = Number(req.body.waitingTime);

        // If stock level is updated, we might calculate daily sales.
        // To simplify, let's assume the user updates stock level when stock arrives or is sold.
        // We'll trust the request to send sales data if necessary via another endpoint.

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


// ─── UPDATE BOOKING STATUS (ADMIN ONLY) ───────────────────
router.put('/:id/bookings/:bookingId', authenticateBunkAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        console.log(`[BOOKING_UPDATE] Station: ${req.params.id}, Booking: ${req.params.bookingId}, Status: ${status}`);
        
        // Find station by ID first
        const station = await Station.findById(req.params.id);
        if (!station) return res.status(404).json({ error: 'Station not found' });
        
        // Verify ownership
        if (station.ownedBy.toString() !== req.user.userId) {
            console.warn(`[UNAUTHORIZED_UPDATE] Admin ${req.user.userId} tried to update station ${station._id} owned by ${station.ownedBy}`);
            return res.status(403).json({ error: 'Unauthorized to update this station' });
        }
        
        const booking = station.bookings.id(req.params.bookingId);
        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        
        // If transitioning to cancelled, add gas back
        if (status === 'cancelled' && booking.status !== 'cancelled') {
            const gasToRestore = booking.requestedGas || 0;
            if (gasToRestore > 0) {
                station.stockLevel += gasToRestore;
                // Ensures stock doesn't exceed maxCapacity (assuming maxCapacity is available or just add back)
                if (station.stockLevel > station.maxCapacity && station.maxCapacity) {
                    station.stockLevel = station.maxCapacity;
                }
            }
        }

        // If transitioning from cancelled back to something else, remove gas?
        // Might complicate things. Let's just handle simple user case. Re-reserving after cancel isn't typical.

        booking.status = status;
        await station.save();

        // Sync with DriverRequest collection (bunkadmindb)
        try {
            await DriverRequest.findOneAndUpdate(
                { 
                    stationId: station._id, 
                    driverEmail: booking.driverEmail, 
                    timeSlot: booking.timeSlot,
                    vehicleNumber: booking.vehicleNumber
                },
                { $set: { status: status } }
            );
            console.log(`[DRIVER_REQUEST_SYNC] Status updated in standalone collection`);
        } catch (syncErr) {
            console.warn(`[DRIVER_REQUEST_SYNC_ERR] ${syncErr.message}`);
        }


        // Send notifications
        if (booking.driverEmail) {
            console.log(`[MAIL_UPDATE] Process status change notification...`);
            // To Driver
            sendBookingNotification(
                booking.driverEmail,
                booking.driverName,
                status,
                station.name,
                booking.timeSlot
            ).then(sent => console.log(`[MAIL_UPDATE_DRIVER] Result: ${sent}`))
             .catch(err => console.error(`[MAIL_UPDATE_DRIVER_ERR]`, err));

            // To Admin (Real-time process confirmation)
            BunkAdmin.findById(req.user.userId).then(admin => {
                if (admin && admin.email) {
                    sendAdminBookingAlert(admin.email, booking, station.name)
                        .then(sent => console.log(`[MAIL_UPDATE_ADMIN] Result: ${sent}`))
                        .catch(err => console.error(`[MAIL_UPDATE_ADMIN_ERR]`, err));
                }
            });
        }

        res.json({ message: 'Booking updated', station });
    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── ADD DAILY SALES (ALIGNED WITH REPORT TABLE) ───────────
router.post('/:id/sales', authenticateBunkAdmin, async (req, res) => {
    try {
        const { date, amount, stockSold, bookingCount } = req.body;
        console.log(`[REPORT_ADD] Station: ${req.params.id}, Date: ${date}, Amount: ${amount}`);
        
        const station = await Station.findById(req.params.id);
        if (!station) return res.status(404).json({ error: 'Station not found' });
        if (station.ownedBy.toString() !== req.user.userId) return res.status(403).json({ error: 'Unauthorized' });
        
        // 1. Create entry in Report Table - Daily Sales (bunkadmindb)
        const report = await Report.findOneAndUpdate(
            { stationId: station._id, date },
            { 
                $set: { 
                    totalSalesAmount: amount, 
                    totalStockSold: stockSold,
                    totalBookings: bookingCount || 0
                } 
            },
            { upsert: true, new: true }
        );

        // 2. Adjust real-time stock
        if (station.stockLevel >= stockSold) {
            station.stockLevel -= stockSold;
            
            // Push to daily sales array for historical tracking
            station.dailySales.push({ date, amount, stockSold });
            
            await station.save();
        }

        res.json({ message: 'Report created successfully in Report Table', report });
    } catch (error) {
        console.error('Add report error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

export default router;
