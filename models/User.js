import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple documents to have no email set
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'],
    },
    phone: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple documents to have no phone set
      trim: true,
    },
    password: {
      type: String,
      required: false,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

// Custom validation: Ensure either email OR phone is provided
UserSchema.path('email').validate(function () {
  return this.email || this.phone;
}, 'Either email or phone number is required.');

UserSchema.path('phone').validate(function () {
  return this.email || this.phone;
}, 'Either email or phone number is required.');

export default mongoose.models.Users || mongoose.model('Users', UserSchema);