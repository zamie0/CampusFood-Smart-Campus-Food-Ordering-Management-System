import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import bcrypt from 'bcryptjs';
import Vendor from '@/models/Vendor';

// --- GET /api/vendors ---
// Fetch vendors with optional search, status, pagination
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || undefined;
    const limit = Number(url.searchParams.get('limit') || 50);
    const page = Number(url.searchParams.get('page') || 1);

    const query: any = {};
    if (search) {
      // Text search (requires text index on VendorSchema)
      query.$text = { $search: search };
    }
    if (status) query.status = status;

    const items = await Vendor.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Vendor.countDocuments(query);

    // Remove passwords just in case
    const sanitizedItems = items.map((v) => {
      const { password, ...rest } = v;
      return rest;
    });

    return NextResponse.json({ items: sanitizedItems, total, page, limit });
  } catch (err: any) {
    console.error('GET /api/vendors error', err);
    return NextResponse.json(
      { error: 'Failed to fetch vendors', detail: err?.message },
      { status: 500 }
    );
  }
}

// --- POST /api/vendors ---
// Register a new vendor
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if vendor already exists
    const existing = await Vendor.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const created = await Vendor.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      status: 'inactive', // Pending admin approval
    });

    const vendorResponse = created.toObject();
    delete vendorResponse.password;

    return NextResponse.json(vendorResponse, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/vendors error', err);

    // Duplicate key error (email exists)
    const code = err?.code === 11000 ? 409 : 500;

    return NextResponse.json(
      { error: 'Failed to create vendor', detail: err?.message },
      { status: code }
    );
  }
}
