import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';

const Order = (async () => {
  const mod = await import('@/models/Order');
  // @ts-ignore
  return (mod as any).default || (mod as any);
})();

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const Model = await Order;
    const order = await Model.findById(params.id)
      .populate('customerId', 'name email')
      .populate('vendorId', 'name email')
      .lean();
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json(order);
  } catch (err: any) {
    console.error('GET /api/orders/[id] error', err);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const Model = await Order;

    const updated = await Model.findByIdAndUpdate(params.id, body, { new: true })
      .populate('customerId', 'name email')
      .populate('vendorId', 'name email')
      .lean();
    if (!updated) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('PATCH /api/orders/[id] error', err);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const Model = await Order;

    const deleted = await Model.findByIdAndDelete(params.id).lean();
    if (!deleted) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/orders/[id] error', err);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}