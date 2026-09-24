import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    customer: {
      fullName: { type: String, required: true },
      email: { type: String, lowercase: true, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' },
      area: { type: String, required: true },
      address: { type: String, required: true },
      notes: { type: String, default: '' },
    },

    items: {
      type: Map,
      of: Number,
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

OrderSchema.path('customer.email').validate(function () {
  return this.customer?.email || this.customer?.phone;
}, 'Either customer email or phone number is required.');

OrderSchema.path('customer.phone').validate(function () {
  return this.customer?.email || this.customer?.phone;
}, 'Either customer email or phone number is required.');

export default mongoose.models.Order ||
  mongoose.model('Order', OrderSchema);