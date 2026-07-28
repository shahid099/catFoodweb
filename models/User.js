import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  },
  { timestamps: true }
);

export default mongoose.models.Users || mongoose.model('Users', UserSchema);