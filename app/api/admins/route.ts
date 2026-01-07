import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';

const Admin = (async () => {
  const mod = await import('@/models/Admin');
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

    const Model = await Admin;

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
    console.error('GET /api/admins error', err);
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const Model = await Admin;

    const created = await Model.create(body);
    return NextResponse.json(created);
  } catch (err: any) {
    console.error('POST /api/admins error', err);
    const code = err?.code === 11000 ? 409 : 500;
    return NextResponse.json({ error: 'Failed to create admin', detail: err?.message }, { status: code });
  }
}
