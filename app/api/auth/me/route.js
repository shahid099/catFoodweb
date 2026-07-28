import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    // 1. Retrieve the token cookie set by your POST login route
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // 2. Verify JWT signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // 3. Connect to MongoDB using your connectDB helper
    await connectDB();

    // 4. Fetch the user using decoded.userId (excluding password)
    const user = await User.findById(decoded.userId).select('name email role');

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // 5. Return user details
    return NextResponse.json({ 
      user: {
        id: user._id.toString(),
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      } 
    }, { status: 200 });
  } 
  
  catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}