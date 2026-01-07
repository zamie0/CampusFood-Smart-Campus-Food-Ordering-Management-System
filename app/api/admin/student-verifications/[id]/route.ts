import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';

const Profile = (async () => {
  const mod = await import('@/models/Profile');
  // @ts-ignore
  return (mod as any).default || (mod as any);
})();

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const status = body?.status;
    if (!['pending', 'verified', 'declined'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectDB();
    const ProfileModel = await Profile;
    await ProfileModel.updateOne({ _id: params.id }, { $set: { student_id_verified: status } });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('PATCH /api/admin/student-verifications/[id] error', err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
