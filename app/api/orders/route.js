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
// GET - Fetch logged-in customer's orders
// =====================================================
export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    // ---------------------------------------
    // Check authentication
    // ---------------------------------------
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please login first.',
        },
        { status: 401 }
      );
    }

    // ---------------------------------------
    // Verify JWT
    // ---------------------------------------
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired session.',
        },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // ---------------------------------------
    // Validate user ID
    // ---------------------------------------
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid customer session.',
        },
        { status: 401 }
      );
    }

    // ---------------------------------------
    // Find customer
    // ---------------------------------------
    const user = await User.findById(userId)
      .select('-password')
      .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Customer not found.',
        },
        { status: 404 }
      );
    }

    // ---------------------------------------
    // Find customer's orders
    // (Matches by User ID or Email/Phone fallback)
    // ---------------------------------------
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const queryConditions = [
      { user: userObjectId },
      { userId: userObjectId },
    ];

    if (user.email) queryConditions.push({ email: user.email }, { 'customer.email': user.email });
    if (user.phone) queryConditions.push({ phone: user.phone }, { 'customer.phone': user.phone });

    const orders = await Order.find({ $or: queryConditions })
      .sort({ createdAt: -1 })
      .lean();

    // ---------------------------------------
    // Collect product IDs
    // ---------------------------------------
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

    // ---------------------------------------
    // Fetch products
    // ---------------------------------------
    const validProductIds = Array.from(productIds).map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const products = await Product.find({
      _id: { $in: validProductIds },
    }).lean();

    // ---------------------------------------
    // Create product lookup map
    // ---------------------------------------
    const productMap = {};
    products.forEach((product) => {
      productMap[product._id.toString()] = product;
    });

    // ---------------------------------------
    // Attach details to orders
    // ---------------------------------------
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

    // ---------------------------------------
    // Return customer + orders
    // ---------------------------------------
    return NextResponse.json(
      {
        success: true,
        customer: {
          _id: user._id,
          fullName: user.fullName || user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          area: user.area || '',
          role: user.role || 'customer',
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

// =====================================================
// PATCH - Update Order Status
// =====================================================
export async function PATCH(request) {
  try {
    await connectDB();

    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order ID and status are required.',
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid order ID.',
        },
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
        {
          success: false,
          error: 'Order not found.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Status updated.',
        status: updatedOrder.status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update Order Status Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update order status.',
      },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Place New Order
// =====================================================
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      fullName,
      email,
      phone,
      area,
      address,
      notes,
      items,
      paymentMethod,
      subtotal,
      deliveryFee,
      totalAmount,
    } = body;

    // Validate customer inputs
    if (!fullName || !area || !address) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required customer details.',
        },
        { status: 400 }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide either an email address or phone number.',
        },
        { status: 400 }
      );
    }

    if (!items || Object.keys(items).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cart is empty.',
        },
        { status: 400 }
      );
    }

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanPhone = phone ? phone.trim() : '';

    // Check existing authentication
    const cookieStore = await cookies();
    const existingToken = cookieStore.get('token')?.value;

    let authenticatedUser = null;

    if (existingToken) {
      try {
        const decoded = jwt.verify(existingToken, process.env.JWT_SECRET);

        if (decoded?.userId && mongoose.Types.ObjectId.isValid(decoded.userId)) {
          authenticatedUser = await User.findById(decoded.userId);
        }
      } catch (error) {
        authenticatedUser = null;
      }
    }

    let user = authenticatedUser;

    // Lookup customer by email/phone if unauthenticated
    if (!user) {
      const queryConditions = [];

      if (cleanEmail) queryConditions.push({ email: cleanEmail });
      if (cleanPhone) queryConditions.push({ phone: cleanPhone });

      if (queryConditions.length > 0) {
        user = await User.findOne({ $or: queryConditions });
      }
    }

    // Create user if they don't exist
    if (!user) {
      user = await User.create({
        fullName,
        name: fullName,
        email: cleanEmail || undefined,
        phone: cleanPhone || undefined,
        address,
        area,
      });
    } else {
      // Update existing profile details
      user.fullName = fullName;
      user.name = fullName;
      user.address = address;
      user.area = area;

      if (cleanEmail) user.email = cleanEmail;
      if (cleanPhone) user.phone = cleanPhone;

      await user.save();
    }

    const formattedPaymentMethod =
      paymentMethod === 'card'
        ? 'Card on Delivery (POS)'
        : 'Cash on Delivery';

    // Create new Order document
    const newOrder = await Order.create({
      user: user._id,
      userId: user._id,
      customer: {
        fullName,
        email: cleanEmail,
        phone: cleanPhone,
        area,
        address,
        notes: notes || '',
      },
      fullName,
      email: cleanEmail,
      phone: cleanPhone,
      area,
      address,
      notes: notes || '',
      items: items || {},
      subtotal: Number(subtotal) || 0,
      deliveryFee: deliveryFee !== undefined ? Number(deliveryFee) : 0.790,
      totalAmount: Number(totalAmount) || 0,
      paymentMethod: formattedPaymentMethod,
      status: 'Pending',
    });

    // Sign fresh auth JWT
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'customer',
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        orderId: newOrder._id,
        user: {
          _id: user._id,
          fullName: user.fullName || user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          area: user.area || '',
        },
      },
      { status: 201 }
    );

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Failed to create order:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}