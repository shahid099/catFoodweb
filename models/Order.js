import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    customer: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      area: { type: String, required: true },
      address: { type: String, required: true },
      notes: { type: String, default: '' },
    },
    items: {
      type: Map,
      of: Number, // Stores productId: quantity pairs e.g., { "64a...": 2 }
      required: true,
    },
    status: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Processing', 'Delivered', 'Cancelled'],
    },
    paymentMethod: {
      type: String,
      default: 'Cash on Delivery',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);