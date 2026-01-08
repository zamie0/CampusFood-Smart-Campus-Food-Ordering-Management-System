import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';

const Order = (async () => {
  const mod = await import('@/models/Order');
  return (mod as any).default || (mod as any);
})();

const Customer = (async () => {
  const mod = await import('@/models/Customer');
  return (mod as any).default || (mod as any);
})();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const OrderModel = await Order;
    const CustomerModel = await Customer;
    const { id } = await params;

    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const excludeStatus = url.searchParams.get('excludeStatus');

    const query: any = { vendorId: id };

    if (status) {
      query.status = status;
    } else if (excludeStatus) {
      const excludeList = excludeStatus.split(',');
      query.status = { $nin: excludeList };
    }

    const orders = await OrderModel.find(query)
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const mappedOrders = orders.map((order: any) => ({
      id: order._id.toString(),
      customerName: order.customerId?.name || 'Unknown Customer',
      customerEmail: order.customerId?.email || '',
      items: (order.items || []).map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: order.totalAmount,
      status: order.status,
      orderTime: new Date(order.createdAt).getTime(),
      createdAt: order.createdAt,
    }));

    return NextResponse.json({ orders: mappedOrders });
  } catch (err: any) {
    console.error('GET /api/vendors/[id]/orders error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch vendor orders', detail: err?.message },
      { status: 500 }
    );
  }
}

