import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import Vendor from "@/models/Vendor";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user || !user.primaryEmailAddress?.emailAddress)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    let customer = await Customer.findOne({
      email: user.primaryEmailAddress.emailAddress,
    });

    // Auto-create customer if it doesn't exist
    if (!customer) {
      customer = await Customer.create({
        email: user.primaryEmailAddress.emailAddress,
        name: user.fullName || user.firstName || user.primaryEmailAddress.emailAddress.split('@')[0],
        status: 'active',
      });
    }

    const body = await req.json();
    const { vendorId, items, total, notes } = body;

    if (!vendorId || !items?.length)
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });

    if (total === undefined || total === null || total < 0)
      return NextResponse.json({ error: "Total amount is required" }, { status: 400 });

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

    // Process items: only include foodItemId if it's a valid ObjectId
    const processedItems = items.map((item: any) => {
      const processedItem: any = {
        name: item.name,
        description: item.description || '',
        price: item.price,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions || '',
      };

      // Only add foodItemId if it exists and is a valid ObjectId string (24 hex characters)
      // Don't include it at all if it's invalid/undefined to avoid validation errors
      if (item.foodItemId && typeof item.foodItemId === 'string' && /^[0-9a-fA-F]{24}$/.test(item.foodItemId)) {
        processedItem.foodItemId = item.foodItemId;
      }
      // If foodItemId is invalid or undefined, we simply don't include it in the object

      return processedItem;
    });

    const order = await Order.create({
      customerId: customer._id,
      vendorId: vendor._id,
      items: processedItems,
      totalAmount: total,
      notes: notes || '',
      status: "pending",
    });

    return NextResponse.json(order, { status: 201 });

  } catch (err: any) {
    console.error("POST /api/orders error:", err);
    return NextResponse.json(
      { error: "Failed to create order", detail: err?.message },
      { status: 500 }
    );
  }
}
