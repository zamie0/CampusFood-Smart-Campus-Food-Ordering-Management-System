import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const Admin = (async () => {
  const mod = await import('@/models/Admin');
  // @ts-ignore
  return (mod as any).default || (mod as any);
})();

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const AdminModel = await Admin;
    const admin = await AdminModel.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (admin.status !== 'active') {
      return NextResponse.json({ error: 'Account inactive' }, { status: 403 });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      { adminId: admin._id, email: admin.email, role: admin.role, type: 'admin' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
      },
    });
  } catch (err: any) {
    console.error('POST /api/admins/auth error', err);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
