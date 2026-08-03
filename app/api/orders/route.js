import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';

// GET: Fetch all orders
export async function GET() {
  try {
    await connectDB();

    // Fetch all orders sorted by newest first
    const orders = await Order.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    console.error('Fetch Orders Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST: Place a new order
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { fullName, phone, area, address, notes, items } = body;

    if (!fullName || !phone || !area || !address) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newOrder = await Order.create({
      customer: {
        fullName,
        phone,
        area,
        address,
        notes: notes || '',
      },
      items: items || {},
      status: 'Pending',
      paymentMethod: 'Cash on Delivery',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        orderId: newOrder._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}