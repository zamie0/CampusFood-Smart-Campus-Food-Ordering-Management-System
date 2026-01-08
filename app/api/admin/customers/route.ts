import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';

const Customer = (async () => {
  const mod = await import('@/models/Customer');
  return (mod as any).default || (mod as any);
})();

const Order = (async () => {
  const mod = await import('@/models/Order');
  return (mod as any).default || (mod as any);
})();

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const CustomerModel = await Customer;
    const OrderModel = await Order;

    const customers = await CustomerModel.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Get order statistics for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer: any) => {
        const orders = await OrderModel.find({ customerId: customer._id }).lean();
        const totalSpent = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
        
        return {
          id: customer._id.toString(),
          name: customer.name,
          email: customer.email,
          phone: customer.phone || '',
          orders: orders.length,
          totalSpent,
          createdAt: customer.createdAt,
        };
      })
    );

    // Sort by total spent descending
    customersWithStats.sort((a, b) => b.totalSpent - a.totalSpent);

    return NextResponse.json({
      customers: customersWithStats,
      total: customersWithStats.length,
    });
  } catch (err: any) {
    console.error('GET /api/admin/customers error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch customers', detail: err?.message },
      { status: 500 }
    );
  }
}

