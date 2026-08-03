import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const formData = await req.formData();

    const title = formData.get('title');
    const description = formData.get('description');
    const price = formData.get('price');
    const tag = formData.get('tag');
    const file = formData.get('image');

    if (!title || !description || !price || !file) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert file into a Buffer for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload image to Cloudinary using a stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'products' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // Save product record to MongoDB
    await connectDB();
    const newProduct = await Product.create({
      title,
      description,
      price: parseFloat(price),
      imageUrl: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id,
      tag: tag || null,
    });

    return NextResponse.json(
      { success: true, product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { error: 'Server error uploading product' },
      { status: 500 }
    );
  }
}