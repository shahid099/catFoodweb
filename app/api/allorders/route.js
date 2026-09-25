import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

// =====================================================
// GET - Fetch ALL Orders across all customers (Admin Route)
// =====================================================
export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    // 1. Authentication check
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Please login first.' },
        { status: 401 }
      );
    }

    // 2. JWT Verification
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session.' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user session.' },
        { status: 401 }
      );
    }

    // 3. User & Admin Verification
    const user = await User.findById(userId).select('-password').lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      );
    }

    // Optional: Restrict endpoint strictly to admins
    if (user.role && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Admins only.' },
        { status: 403 }
      );
    }

    // 4. Fetch ALL Orders from Database (No user-specific filters)
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .lean();

    // 5. Collect all unique Product IDs referenced across all orders
    const productIds = new Set();

    orders.forEach((order) => {
      if (!order.items) return;

      const itemsMap =
        order.items instanceof Map
          ? Object.fromEntries(order.items)
          : order.items;

      Object.keys(itemsMap).forEach((productId) => {
        if (mongoose.Types.ObjectId.isValid(productId)) {
          productIds.add(productId);
        }
      });
    });

    // 6. Bulk fetch referenced products
    const validProductIds = Array.from(productIds).map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const products = await Product.find({
      _id: { $in: validProductIds },
    }).lean();

    // 7. Map products for quick lookup
    const productMap = {};
    products.forEach((product) => {
      productMap[product._id.toString()] = product;
    });

    // 8. Hydrate order item objects with full product metadata
    const populatedOrders = orders.map((order) => {
      const itemsMap =
        order.items instanceof Map
          ? Object.fromEntries(order.items)
          : order.items || {};

      const detailedItems = Object.entries(itemsMap).map(
        ([productId, itemData]) => {
          let quantity = 1;

          if (typeof itemData === 'number') {
            quantity = itemData;
          } else if (typeof itemData === 'object' && itemData !== null) {
            quantity = itemData.quantity || 1;
          }

          return {
            quantity,
            product: productMap[productId] || {
              _id: productId,
              title: itemData?.title || itemData?.name || 'Product Unavailable',
              price: itemData?.price || 0,
              imageUrl: itemData?.imageUrl || '',
            },
          };
        }
      );

      return {
        ...order,
        items: detailedItems,
      };
    });

    // 9. Return response with total orders list
    return NextResponse.json(
      {
        success: true,
        orders: populatedOrders,
        totalOrders: populatedOrders.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch All Orders Route Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch all orders.',
      },
      { status: 500 }
    );
  }
}