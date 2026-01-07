import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';

const Order = (async () => {
  const mod = await import('@/models/Order');
  // @ts-ignore
  return (mod as any).default || (mod as any);
})();
const Vendor = (async () => {
  const mod = await import('@/models/Vendor');
  // @ts-ignore
  return (mod as any).default || (mod as any);
})();

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const customerId = req.nextUrl.searchParams.get('customerId');
    if (!customerId) return NextResponse.json({ error: 'Missing customerId' }, { status: 400 });

    const OrderModel = await Order;
    const latest = await OrderModel.findOne({ customerId })
      .sort({ createdAt: -1 })
      .lean();

    if (!latest) return NextResponse.json({ order: null });

    // Attach vendor name if possible
    let vendorName: string | undefined = undefined;
    try {
      const VendorModel = await Vendor;
      const vendor = await VendorModel.findById(latest.vendorId).select('name').lean();
      vendorName = vendor?.name;
    } catch {}

    return NextResponse.json({
      order: {
        id: String(latest._id),
        vendorName: vendorName || 'Vendor',
        items: latest.items?.map((i: any) => ({ name: i.name, quantity: i.quantity, price: i.price })) || [],
        total: latest.totalAmount,
        status: latest.status,
        estimatedReady: latest.estimatedReadyTime ? new Date(latest.estimatedReadyTime).toLocaleTimeString() : undefined,
      },
    });
  } catch (err: any) {
    console.error('GET /api/orders/latest error', err);
    return NextResponse.json({ error: 'Failed to load order' }, { status: 500 });
  }
}
