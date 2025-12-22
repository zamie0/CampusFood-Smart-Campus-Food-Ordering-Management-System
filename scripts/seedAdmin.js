import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../config/db.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'admin', 'staff'], default: 'admin' },
    permissions: [{ type: String }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function seedAdmin() {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@campusfood.com' });
    if (existingAdmin) {
      console.log('Admin already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    const admin = await Admin.create({
      name: 'System Admin',
      email: 'admin@campusfood.com',
      password: hashedPassword,
      role: 'superadmin',
      status: 'active',
    });

    console.log('Admin created:', admin.email);
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    process.exit(0);
  }
}

seedAdmin();