import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as VendorModule from '@/models/Vendor';

const Vendor = VendorModule.default || VendorModule;

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const VendorModel = Vendor;
    const vendor = await VendorModel.findOne({ email: email.toLowerCase() });

    if (!vendor) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (vendor.status !== 'active') {
      return NextResponse.json({ error: 'Account not approved or suspended' }, { status: 403 });
    }

    const isValidPassword = await bcrypt.compare(password, vendor.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      { vendorId: vendor._id, email: vendor.email, type: 'vendor' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      token,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        status: vendor.status,
      },
    });
  } catch (err: any) {
    console.error('POST /api/vendors/auth error', err);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

