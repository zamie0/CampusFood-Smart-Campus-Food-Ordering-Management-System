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
    const days = parseInt(url.searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Basic counts
    const [totalVendors, activeVendors, totalCustomers, totalOrders] = await Promise.all([
      VendorModel.countDocuments({}),
      VendorModel.countDocuments({ isOnline: true, status: 'active' }),
      CustomerModel.countDocuments({}),
      OrderModel.countDocuments({}),
    ]);

    // Revenue calculations
    const allOrders = await OrderModel.find({
      status: { $in: ['completed', 'delivered', 'ready', 'picked_up'] },
    }).lean();

    const totalRevenue = allOrders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

    // Recent orders (last N days)
    const recentOrders = await OrderModel.find({
      createdAt: { $gte: startDate },
    }).lean();

    const recentRevenue = recentOrders
      .filter((o: any) => ['completed', 'delivered', 'ready', 'picked_up'].includes(o.status))
      .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

    // Orders by status
    const ordersByStatus = await OrderModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusMap: Record<string, number> = {};
    ordersByStatus.forEach((item: any) => {
      statusMap[item._id] = item.count;
    });

    // Revenue by day (last N days)
    const revenueByDay = await OrderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['completed', 'delivered', 'ready', 'picked_up'] },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top vendors by revenue
    const topVendorsByRevenue = await OrderModel.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'delivered', 'ready', 'picked_up'] },
        },
      },
      {
        $group: {
          _id: '$vendorId',
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);

    // Populate vendor names
    const vendorIds = topVendorsByRevenue.map((v: any) => v._id);
    const vendors = await VendorModel.find({ _id: { $in: vendorIds } })
      .select('name')
      .lean();

    const vendorMap: Record<string, string> = {};
    vendors.forEach((v: any) => {
      vendorMap[v._id.toString()] = v.name;
    });

    const topVendors = topVendorsByRevenue.map((v: any) => ({
      vendorId: v._id.toString(),
      vendorName: vendorMap[v._id.toString()] || 'Unknown',
      revenue: v.revenue,
      orders: v.orders,
    }));

    // Average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Orders by day of week
    const ordersByDayOfWeek = await OrderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 },
        },
      },
    ]);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const ordersByDay = dayNames.map((day, index) => {
      const dayData = ordersByDayOfWeek.find((d: any) => d._id === index + 1);
      return {
        day,
        count: dayData?.count || 0,
      };
    });

    return NextResponse.json({
      overview: {
        totalVendors,
        activeVendors,
        totalCustomers,
        totalOrders,
        totalRevenue,
        recentRevenue,
        avgOrderValue,
      },
      ordersByStatus: statusMap,
      revenueByDay,
      topVendors,
      ordersByDayOfWeek: ordersByDay,
      period: days,
    });
  } catch (err: any) {
    console.error('GET /api/admin/analytics error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', detail: err?.message },
      { status: 500 }
    );
  }
}

