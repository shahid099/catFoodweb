import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';

import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    // ---------------------------------------
    // 1. Get customer _id from HTTP-only cookie
    // ---------------------------------------
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_session')?.value;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please login first.',
        },
        { status: 401 }
      );
    }

    // ---------------------------------------
    // 2. Validate MongoDB ObjectId
    // ---------------------------------------
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid customer session.',
        },
        { status: 401 }
      );
    }

    // ---------------------------------------
    // 3. Find the customer
    // ---------------------------------------
    const customer = await User.findById(userId)
      .select('-password')
      .lean();

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Customer not found.',
        },
        { status: 404 }
      );
    }

    // ---------------------------------------
    // 4. Find ONLY this customer's orders
    // ---------------------------------------
    const orders = await Order.find({
      user: new mongoose.Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 })
      .lean();

    // ---------------------------------------
    // 5. Collect product IDs from all orders
    // ---------------------------------------
    const productIds = new Set();

    orders.forEach((order) => {
      if (!order.items) return;

      const itemsMap =
        order.items instanceof Map
          ? Object.fromEntries(order.items)
          : order.items;

      Object.keys(itemsMap).forEach((productId) => {
        productIds.add(productId);
      });
    });

    // ---------------------------------------
    // 6. Fetch all products
    // ---------------------------------------
    const validProductIds = Array.from(productIds).filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    const products = await Product.find({
      _id: { $in: validProductIds },
    }).lean();

    // ---------------------------------------
    // 7. Create product lookup map
    // ---------------------------------------
    const productMap = {};

    products.forEach((product) => {
      productMap[product._id.toString()] = product;
    });

    // ---------------------------------------
    // 8. Attach product information to orders
    // ---------------------------------------
    const populatedOrders = orders.map((order) => {
      const itemsMap =
        order.items instanceof Map
          ? Object.fromEntries(order.items)
          : order.items || {};

      const detailedItems = Object.entries(itemsMap).map(
        ([productId, itemData]) => {
          const quantity =
            typeof itemData === 'number'
              ? itemData
              : itemData?.quantity || 1;

          return {
            quantity,
            product:
              productMap[productId] || {
                _id: productId,
                title: 'Product Unavailable',
                price: 0,
                imageUrl: '',
              },
          };
        }
      );

      return {
        ...order,
        items: detailedItems,
      };
    });

    // ---------------------------------------
    // 9. Return customer + orders
    // ---------------------------------------
    return NextResponse.json(
      {
        success: true,

        customer: {
          _id: customer._id,
          fullName: customer.fullName,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          area: customer.area,
        },

        orders: populatedOrders,

        totalOrders: populatedOrders.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch Customer Orders Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch customer orders.',
      },
      { status: 500 }
    );
  }
}