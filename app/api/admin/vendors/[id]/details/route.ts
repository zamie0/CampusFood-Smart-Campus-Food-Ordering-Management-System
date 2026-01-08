import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';

const Vendor = (async () => {
  const mod = await import('@/models/Vendor');
  return (mod as any).default || (mod as any);
})();

const Order = (async () => {
  const mod = await import('@/models/Order');
  return (mod as any).default || (mod as any);
})();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const VendorModel = await Vendor;
    const OrderModel = await Order;

    const { id } = await params;

    const vendor = await VendorModel.findById(id).lean();
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Get vendor orders
    const orders = await OrderModel.find({ vendorId: id })
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const totalOrders = orders.length;
    const revenue = orders
      .filter((o: any) => ['completed', 'delivered', 'ready', 'picked_up'].includes(o.status))
      .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

    const mappedOrders = orders.map((order: any) => ({
      id: order._id.toString(),
      customerId: order.customerId?._id?.toString(),
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

    // Get menu items
    const menuItems = (vendor.menu || []).map((item: any, index: number) => ({
      id: `menu_${index}`,
      name: item.name,
      price: item.price,
      category: item.tags?.[0] || 'Uncategorized',
      description: item.description || '',
      isAvailable: item.available !== false,
      isPopular: false, // Can be enhanced later
      prepTime: 15, // Default, can be enhanced later
    }));

    return NextResponse.json({
      vendor: {
        id: vendor._id.toString(),
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        description: vendor.details,
        isActive: vendor.isOnline && vendor.status === 'active',
        totalOrders,
        revenue,
        approvedAt: vendor.updatedAt,
      },
      menu: menuItems,
      orders: mappedOrders,
    });
  } catch (err: any) {
    console.error('GET /api/admin/vendors/[id]/details error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch vendor details', detail: err?.message },
      { status: 500 }
    );
  }
}

