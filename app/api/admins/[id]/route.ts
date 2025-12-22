import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';

const Admin = (async () => {
  const mod = await import('@/models/Admin');
  // @ts-ignore
  return (mod as any).default || (mod as any);
})();

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const Model = await Admin;
    const item = await Model.findById(params.id).lean();
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(item);
  } catch (err: any) {
    console.error('GET /api/admins/[id] error', err);
    return NextResponse.json({ error: 'Failed to fetch admin' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const Model = await Admin;

    const updated = await Model.findByIdAndUpdate(params.id, body, { new: true }).lean();
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('PATCH /api/admins/[id] error', err);
    return NextResponse.json({ error: 'Failed to update admin', detail: err?.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const Model = await Admin;

    const deleted = await Model.findByIdAndDelete(params.id).lean();
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/admins/[id] error', err);
    return NextResponse.json({ error: 'Failed to delete admin' }, { status: 500 });
  }
}
