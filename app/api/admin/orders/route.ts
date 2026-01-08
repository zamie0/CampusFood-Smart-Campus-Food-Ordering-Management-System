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

const Vendor = (async () => {
  const mod = await import('@/models/Vendor');
  return (mod as any).default || (mod as any);
})();

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const OrderModel = await Order;
    const CustomerModel = await Customer;
    const VendorModel = await Vendor;

    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const skip = parseInt(url.searchParams.get('skip') || '0');

    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await OrderModel.find(query)
      .populate('customerId', 'name email')
      .populate('vendorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const mappedOrders = orders.map((order: any) => ({
      id: order._id.toString(),
      customerId: order.customerId?._id?.toString(),
      customerName: order.customerId?.name || 'Unknown Customer',
      customerEmail: order.customerId?.email || '',
      vendorId: order.vendorId?._id?.toString(),
      vendorName: order.vendorId?.name || 'Unknown Vendor',
      items: (order.items || []).map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus || 'pending',
      orderTime: new Date(order.createdAt).getTime(),
      createdAt: order.createdAt,
    }));

    const totalCount = await OrderModel.countDocuments(query);

    return NextResponse.json({
      orders: mappedOrders,
      total: totalCount,
      limit,
      skip,
    });
  } catch (err: any) {
    console.error('GET /api/admin/orders error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch orders', detail: err?.message },
      { status: 500 }
    );
  }
}

