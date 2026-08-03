// app/api/products/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';

export async function GET() {
  try {
    await connectDB();
    
    // Fetch all products sorted by newest first
    const products = await Product.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error) {
    console.error('Fetch Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}