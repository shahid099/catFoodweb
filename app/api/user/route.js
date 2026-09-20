import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import mongoose from 'mongoose';

// Ensure Product model is loaded for Mongoose populate
import '@/models/Product'; 

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const rawId = searchParams.get('customerId');

    if (!rawId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Build conditions to cover all potential field name variations
    const isObjectId = mongoose.Types.ObjectId.isValid(rawId);
    const targetId = isObjectId ? new mongoose.Types.ObjectId(rawId) : rawId;

    const query = {
      $or: [
        { customerId: targetId },
        { customerId: rawId },
        { userId: targetId },
        { userId: rawId },
        { user: targetId },
        { user: rawId },
      ],
    };

    // Query database with populate fallback
    const userOrders = await Order.find(query)
      .populate({
        path: 'items.product',
        select: 'title price imageUrl',
      })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`[DEBUG /api/user] Found ${userOrders.length} orders for ID: ${rawId}`);

    return NextResponse.json({ success: true, orders: userOrders }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch order history' },
      { status: 500 }
    );
  }
}