import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';

const Vendor = (async () => {
  const mod = await import('@/models/Vendor');
  // @ts-ignore
  return (mod as any).default || (mod as any);
})();

// List vendors awaiting approval: use status 'inactive' or explicit 'suspended' as pending placeholder
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'inactive'; // treat 'inactive' as pending by default
    const limit = Number(url.searchParams.get('limit') || 50);
    const page = Number(url.searchParams.get('page') || 1);

    const VendorModel = await Vendor;

    const query: any = { status };

    const items = await VendorModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await VendorModel.countDocuments(query);

    return NextResponse.json({ items, total, page, limit });
  } catch (err) {
    console.error('GET /api/admin/vendors/pending error', err);
    return NextResponse.json({ error: 'Failed to fetch pending vendors' }, { status: 500 });
  }
}
