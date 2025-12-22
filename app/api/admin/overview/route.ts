import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';

const Vendor = (async () => {
  const mod = await import('@/models/Vendor');
  // @ts-ignore
  return (mod as any).default || (mod as any);
})();
const Customer = (async () => {
  const mod = await import('@/models/Customer');
  // @ts-ignore
  return (mod as any).default || (mod as any);
})();
const Admin = (async () => {
  const mod = await import('@/models/Admin');
  // @ts-ignore
  return (mod as any).default || (mod as any);
})();
const AuditLog = (async () => {
  const mod = await import('@/models/AuditLog');
  // @ts-ignore
  return (mod as any).default || (mod as any);
})();

export async function GET() {
  try {
    await connectDB();
    const VendorModel = await Vendor;
    const CustomerModel = await Customer;
    const AdminModel = await Admin;

    const [vendorCount, customerCount, adminCount, pendingCount, suspendedCount] = await Promise.all([
      VendorModel.countDocuments({}),
      CustomerModel.countDocuments({}),
      AdminModel.countDocuments({}),
      VendorModel.countDocuments({ status: 'inactive' }),
      VendorModel.countDocuments({ status: 'suspended' }),
    ]);

    const topVendors = await VendorModel.find({}).sort({ rating: -1 }).limit(5).select('name rating').lean();

    const AuditModel = await AuditLog;
    const recentDecisions = await AuditModel.find({ action: { $in: ['VENDOR_APPROVED', 'VENDOR_REJECTED'] } })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('action entityId reason createdAt')
      .lean();

    return NextResponse.json({
      counts: { vendors: vendorCount, customers: customerCount, admins: adminCount, pendingVendors: pendingCount, suspendedVendors: suspendedCount },
      topVendors,
      recentDecisions,
    });
  } catch (err: any) {
    console.error('GET /api/admin/overview error', err);
    return NextResponse.json({ error: 'Failed to load admin overview' }, { status: 500 });
  }
}
