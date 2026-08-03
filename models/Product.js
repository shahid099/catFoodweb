import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true }, // Useful for deleting images from Cloudinary later
    tag: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);