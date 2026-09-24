import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { connectDB } from '@/lib/db';
import User from '@/models/User';

// Prevent Next.js from attempting static generation during build
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { identifier, email, phone, password } = await req.json();

    // Accept identifier directly or fall back to email/phone
    const userIdentifier = identifier || email || phone;

    if (!userIdentifier || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email or phone number and password are required.',
        },
        { status: 400 }
      );
    }

    await connectDB();

    // ---------------------------------------
    // Find user by email OR phone
    // ---------------------------------------
    const identifierValue = userIdentifier.trim();

    const user = await User.findOne({
      $or: [
        { email: identifierValue.toLowerCase() },
        { phone: identifierValue },
      ],
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials.',
        },
        { status: 401 }
      );
    }

    // ---------------------------------------
    // Verify password
    // ---------------------------------------
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials.',
        },
        { status: 401 }
      );
    }

    // ---------------------------------------
    // Create JWT
    // ---------------------------------------
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'customer',
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    // ---------------------------------------
    // Prepare response
    // ---------------------------------------
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged in successfully',

        user: {
          id: user._id,
          fullName: user.fullName || user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          area: user.area || '',
          role: user.role || 'customer',
        },
      },
      {
        status: 200,
      }
    );

    // ---------------------------------------
    // Store JWT in HTTP-only cookie
    // ---------------------------------------
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error.',
      },
      { status: 500 }
    );
  }
}