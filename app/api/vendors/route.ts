import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import bcrypt from 'bcryptjs';

const Vendor = (async () => {
  const mod = await import('@/models/Vendor');
  // @ts-ignore
  return (mod as any).default || (mod as any);
})();

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || undefined;
    const limit = Number(url.searchParams.get('limit') || 50);
    const page = Number(url.searchParams.get('page') || 1);

    const Model = await Vendor;

    const query: any = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (status) query.status = status;

    const items = await Model.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Model.countDocuments(query);

    return NextResponse.json({ items, total, page, limit });
  } catch (err: any) {
    console.error('GET /api/vendors error', err);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const Model = await Vendor;

    // Check if vendor already exists
    const existing = await Model.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const created = await Model.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      status: 'inactive', // Pending approval
    });

    // Remove password from response
    const vendorResponse = created.toObject();
    delete vendorResponse.password;

    return NextResponse.json(vendorResponse, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/vendors error', err);
    const code = err?.code === 11000 ? 409 : 500;
    return NextResponse.json({ error: 'Failed to create vendor', detail: err?.message }, { status: code });
  }
}
