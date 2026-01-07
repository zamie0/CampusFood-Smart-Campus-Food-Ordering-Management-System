import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/db";

const Vendor = (async () => {
  const mod = await import("@/models/Vendor");
  // @ts-ignore
  return (mod as any).default || (mod as any);
})();

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const statusParam = url.searchParams.get("status"); // optional: pending | rejected
    const limit = Number(url.searchParams.get("limit") || 50);
    const page = Number(url.searchParams.get("page") || 1);
    const search = url.searchParams.get("search") || "";

    const VendorModel = await Vendor;

    const query: any = {};

    if (statusParam === "rejected") {
      query.status = "suspended"; // if you mark rejected vendors as suspended
    } else {
      // Default: fetch pending vendors
      query.status = "inactive";
    }

    if (search) {
      query.$text = { $search: search };
    }

    const items = await VendorModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await VendorModel.countDocuments(query);

    const sanitized = items.map((v: any) => ({
      id: v._id,
      name: v.name,
      email: v.email,
      phone: v.phone,
      description: v.details,
      status: v.status === "inactive" ? "pending" : v.status === "suspended" ? "rejected" : v.status,
      submittedAt: new Date(v.createdAt).getTime(),
    }));

    return NextResponse.json({ items: sanitized, total, page, limit });
  } catch (err) {
    console.error("GET /api/admin/vendors/pending error", err);
    return NextResponse.json(
      { error: "Failed to fetch pending vendors" },
      { status: 500 }
    );
  }
}
