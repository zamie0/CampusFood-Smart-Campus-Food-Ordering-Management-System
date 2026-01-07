import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';

const Vendor = (async () => {
  const mod = await import('@/models/Vendor');
  // @ts-ignore
  return (mod as any).default || (mod as any);
})();
const Customer = (async () => {
  const mod = await import('@/models/Customer');
  // @ts-ignore
  return (mod as any).default || (mod as any);
})();

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const VendorModel = await Vendor;
    const CustomerModel = await Customer;
    const resolvedParams = await params;

    const vendor = await VendorModel.findById(resolvedParams.id).lean();
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

    // Example composition: customers who favorited this vendor
    const favoriteCustomers = await CustomerModel.find({ favorites: vendor._id })
      .select('name email')
      .lean();

    // Placeholder aggregates (extend as you add orders, etc.)
    const overview = {
      vendor,
      stats: {
        favoriteCustomers: favoriteCustomers.length,
      },
      favoriteCustomers,
    };

    return NextResponse.json(overview);
  } catch (err: any) {
    console.error('GET /api/vendors/[id]/overview error', err);
    return NextResponse.json({ error: 'Failed to load vendor overview' }, { status: 500 });
  }
}
