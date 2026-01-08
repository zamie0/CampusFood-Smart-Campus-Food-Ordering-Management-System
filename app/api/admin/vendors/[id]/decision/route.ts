import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';

const Vendor = (async () => {
  const mod = await import('@/models/Vendor');
  // @ts-ignore
  return (mod as any).default || (mod as any);
})();
const AuditLog = (async () => {
  const mod = await import('@/models/AuditLog');
  // @ts-ignore
  return (mod as any).default || (mod as any);
})();

// POST decision on vendor: { action: 'approve'|'reject', reason?: string, adminId?: string }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { action, reason, adminId } = await req.json();
    const VendorModel = await Vendor;
    const AuditModel = await AuditLog;

    const resolvedParams = await params;
    const vendor = await VendorModel.findById(resolvedParams.id);
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

    let newStatus: 'active' | 'inactive' | 'suspended' = vendor.status;
    if (action === 'approve') newStatus = 'active';
    else if (action === 'reject') newStatus = 'suspended';
    else return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    const previousStatus = vendor.status;
    vendor.status = newStatus;
    await vendor.save();

    // Create audit log if AuditModel is available
    try {
      if (AuditModel && typeof AuditModel.create === 'function') {
        await AuditModel.create({
          actorType: 'Admin',
          actorId: adminId || null,
          actorTypeRef: 'Admin',
          action: action === 'approve' ? 'VENDOR_APPROVED' : 'VENDOR_REJECTED',
          entityType: 'Vendor',
          entityId: vendor._id,
          reason: reason || undefined,
          metadata: { previousStatus, newStatus },
        });
      }
    } catch (auditError) {
      // Log audit error but don't fail the request
      console.error('Failed to create audit log:', auditError);
    }

    return NextResponse.json({ success: true, vendor: vendor.toObject() });
  } catch (err: any) {
    console.error('POST /api/admin/vendors/[id]/decision error', err);
    return NextResponse.json({ error: 'Failed to update vendor decision' }, { status: 500 });
  }
}
