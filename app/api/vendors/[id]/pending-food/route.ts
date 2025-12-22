import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';

const Vendor = (async () => {
  const mod = await import('@/models/Vendor');
  // @ts-ignore
  return (mod as any).default || (mod as any);
})();

// POST: add pending food item(s). Body: { items: [{ name, description?, price, tags?, image? }] }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { items } = await req.json();
    const Model = await Vendor;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'items array required' }, { status: 400 });
    }

    const updated = await Model.findByIdAndUpdate(
      params.id,
      {
        $push: {
          pendingMenu: {
            $each: items.map((i: any) => ({
              name: i.name,
              description: i.description,
              price: i.price,
              available: i.available ?? true,
              tags: i.tags || [],
              image: i.image,
              status: 'pending',
            })),
          },
        },
      },
      { new: true }
    ).lean();

    if (!updated) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('POST /api/vendors/[id]/pending-food error', err);
    return NextResponse.json({ error: 'Failed to add pending food' }, { status: 500 });
  }
}

// PATCH approve/reject pending item
// Body: { action: 'approve'|'reject', index: number }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { action, index } = await req.json();
    const Model = await Vendor;

    const vendor = await Model.findById(params.id);
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

    if (typeof index !== 'number' || index < 0 || index >= vendor.pendingMenu.length) {
      return NextResponse.json({ error: 'Invalid index' }, { status: 400 });
    }

    const item = vendor.pendingMenu[index];
    if (action === 'approve') {
      vendor.menu.push({ ...item.toObject?.() ?? item, status: 'active' });
    }
    // remove the item from pendingMenu
    vendor.pendingMenu.splice(index, 1);

    await vendor.save();
    return NextResponse.json(vendor.toObject());
  } catch (err: any) {
    console.error('PATCH /api/vendors/[id]/pending-food error', err);
    return NextResponse.json({ error: 'Failed to update pending item' }, { status: 500 });
  }
}

// DELETE clear all pending items
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const Model = await Vendor;
    const updated = await Model.findByIdAndUpdate(
      params.id,
      { $set: { pendingMenu: [] } },
      { new: true }
    ).lean();

    if (!updated) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('DELETE /api/vendors/[id]/pending-food error', err);
    return NextResponse.json({ error: 'Failed to clear pending food' }, { status: 500 });
  }
}
