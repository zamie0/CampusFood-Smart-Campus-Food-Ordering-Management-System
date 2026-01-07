import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';

const Vendor = (async () => {
  const mod = await import('@/models/Vendor');
  // @ts-ignore
  return (mod as any).default || (mod as any);
})();

// PATCH to set online/offline: { isOnline: boolean }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { isOnline } = await req.json();
    const Model = await Vendor;
    const resolvedParams = await params;
    const updated = await Model.findByIdAndUpdate(
      resolvedParams.id,
      { isOnline: !!isOnline },
      { new: true }
    ).lean();

    if (!updated) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('PATCH /api/vendors/[id]/status error', err);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
