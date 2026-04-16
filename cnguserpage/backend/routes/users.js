import express from 'express';
import User from '../models/User.js';
import UserSettings from '../models/UserSettings.js';
import Vehicle from '../models/Vehicle.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password').lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, location, vehicleName, vehicleType, vehicleNumber } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    
    if (vehicleName !== undefined) updateData['vehicle.name'] = vehicleName;
    if (vehicleType !== undefined) updateData['vehicle.type'] = vehicleType;
    if (vehicleNumber !== undefined) updateData['vehicle.number'] = vehicleNumber;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true }
    ).select('-password').lean();

    // ── SYNC SEPARATE VEHICLE COLLECTION ─────────────────
    if (vehicleName || vehicleType || vehicleNumber) {
        const vehicleUpdate = {};
        if (vehicleName) vehicleUpdate.name = vehicleName;
        if (vehicleType) vehicleUpdate.type = vehicleType;
        if (vehicleNumber) vehicleUpdate.number = vehicleNumber;
        
        await Vehicle.findOneAndUpdate(
            { userId: req.user.userId, isPrimary: true },
            { $set: vehicleUpdate },
            { upsert: true }
        );
    }
    // ─────────────────────────────────────────────────────────

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user settings
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const { settings } = req.body;
    
    const updatedSettings = await UserSettings.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: settings },
      { new: true, upsert: true }
    );

    res.json({ message: 'Settings updated successfully', settings: updatedSettings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add favorite station
router.post('/favorites', authenticateToken, async (req, res) => {
  try {
    const { stationId, stationName } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $push: {
          favorites: { stationId, stationName },
        },
      },
      { new: true }
    ).select('-password');

    res.json({ message: 'Station added to favorites', user });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove favorite station
router.delete('/favorites/:stationId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $pull: {
          favorites: { stationId: req.params.stationId },
        },
      },
      { new: true }
    ).select('-password');

    res.json({ message: 'Station removed from favorites', user });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
