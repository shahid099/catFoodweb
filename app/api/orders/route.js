import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product'; // Ensure Product model is imported

export async function GET() {
  try {
    await connectDB();

    // 1. Fetch all orders sorted by newest first
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();

    // 2. Collect all unique Product IDs from all orders
    const productIds = new Set();
    orders.forEach((order) => {
      if (order.items) {
        // Map elements can be iterated via Object.keys or Map methods
        const keys = order.items instanceof Map ? Array.from(order.items.keys()) : Object.keys(order.items);
        keys.forEach((id) => productIds.add(id));
      }
    });

    // 3. Fetch all matching product details in a single query
    const products = await Product.find({ _id: { $in: Array.from(productIds) } }).lean();

    // Create a quick lookup map: { "productId": productObject }
    const productMap = products.reduce((acc, product) => {
      acc[product._id.toString()] = product;
      return acc;
    }, {});

    // 4. Attach populated product details to each order
    const populatedOrders = orders.map((order) => {
      const itemsMap = order.items instanceof Map ? Object.fromEntries(order.items) : order.items || {};
      
      const detailedItems = Object.entries(itemsMap).map(([productId, quantity]) => ({
        quantity,
        product: productMap[productId] || {
          _id: productId,
          title: 'Product Unavailable',
          price: 0,
          imageUrl: '',
        },
      }));

      return {
        ...order,
        items: detailedItems, // Transformed into an array: [{ product: {...}, quantity: 2 }]
      };
    });

    return NextResponse.json({ success: true, orders: populatedOrders }, { status: 200 });
  } catch (error) {
    console.error('Fetch Orders Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}


// PATCH: Update Order Status
export async function PATCH(request) {
  try {
    await connectDB();

    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Status updated', status: updatedOrder.status },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update Order Status Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order status' },
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