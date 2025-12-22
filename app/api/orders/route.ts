import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import { currentUser } from '@clerk/nextjs/server';

const Order = (async () => {
  const mod = await import('@/models/Order');
  // @ts-ignore
  return (mod as any).default || (mod as any);
})();

const Customer = (async () => {
  const mod = await import('@/models/Customer');
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
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const customerId = url.searchParams.get('customerId');
    const vendorId = url.searchParams.get('vendorId');
    const status = url.searchParams.get('status');
    const limit = Number(url.searchParams.get('limit') || 50);
    const page = Number(url.searchParams.get('page') || 1);

    const Model = await Order;

    const query: any = {};
    if (customerId) query.customerId = customerId;
    if (vendorId) query.vendorId = vendorId;
    if (status) query.status = status;

    const orders = await Model.find(query)
      .populate('customerId', 'name email')
      .populate('vendorId', 'name email')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Model.countDocuments(query);

    return NextResponse.json({ orders, total, page, limit });
  } catch (err: any) {
    console.error('GET /api/orders error', err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { vendorId, items, deliveryAddress, notes } = body;

    if (!vendorId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const CustomerModel = await Customer;
    const VendorModel = await Vendor;
    const OrderModel = await Order;

    // Find customer by Clerk ID
    const customer = await CustomerModel.findOne({ email: user.primaryEmailAddress?.emailAddress });
    if (!customer) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 });
    }

    // Verify vendor exists and is active
    const vendor = await VendorModel.findById(vendorId);
    if (!vendor || vendor.status !== 'active') {
      return NextResponse.json({ error: 'Vendor not found or inactive' }, { status: 404 });
    }

    // Calculate total
    let totalAmount = 0;
    const orderItems = items.map((item: any) => {
      const subtotal = item.price * item.quantity;
      totalAmount += subtotal;
      return {
        foodItemId: item.foodItemId,
        name: item.name,
        description: item.description,
        price: item.price,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions,
      };
    });

    const order = await OrderModel.create({
      customerId: customer._id,
      vendorId,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      notes,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/orders error', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}