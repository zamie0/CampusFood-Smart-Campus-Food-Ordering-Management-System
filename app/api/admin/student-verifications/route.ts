import { NextResponse } from 'next/server';
import connectDB from '@/config/db';

const Profile = (async () => {
  const mod = await import('@/models/Profile');
  // @ts-ignore
  return (mod as any).default || (mod as any);
})();

export async function GET() {
  try {
    await connectDB();
    const ProfileModel = await Profile;
    const items = await ProfileModel.find({ student_id: { $ne: null } })
      .select('_id user_id full_name email student_id student_id_verified createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const normalized = items.map((d: any) => ({
      id: String(d._id),
      user_id: d.user_id,
      full_name: d.full_name,
      email: d.email,
      student_id: d.student_id,
      student_id_verified: d.student_id_verified || 'pending',
      created_at: d.createdAt,
    }));

    return NextResponse.json({ items: normalized });
  } catch (err: any) {
    console.error('GET /api/admin/student-verifications error', err);
    return NextResponse.json({ error: 'Failed to load verifications' }, { status: 500 });
  }
}
