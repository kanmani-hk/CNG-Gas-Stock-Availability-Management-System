/**
 * seed.js — Creates or resets the default super admin account
 * Run: node seed.js
 *
 * Fixed credentials:
 *   Email:    superadmin@cng.com
 *   Password: SuperAdmin@2026
 */
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/superadmindb';

const FIXED_EMAIL = 'superadmin@cng.com';
const FIXED_PASSWORD = 'SuperAdmin@2026';
const FIXED_NAME = 'Super Admin';

const superAdminSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    role: { type: String, default: 'superadmin' },
}, { timestamps: true });

async function seed() {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to SuperAdmin DB');

    const SuperAdmin = mongoose.model('SuperAdmin', superAdminSchema);

    const hashed = await bcryptjs.hash(FIXED_PASSWORD, 10);

    await SuperAdmin.findOneAndUpdate(
        { email: FIXED_EMAIL },
        { name: FIXED_NAME, email: FIXED_EMAIL, password: hashed, role: 'superadmin' },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('\n✅ Super admin created / password reset successfully!');
    console.log('   Email:    ' + FIXED_EMAIL);
    console.log('   Password: ' + FIXED_PASSWORD + '\n');
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
});
