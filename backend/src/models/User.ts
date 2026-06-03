import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  hospitalId: mongoose.Types.ObjectId | null;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: 'super_admin' | 'hospital_admin' | 'engineer' | 'staff' | 'scm_manager';
  isActive: boolean;
  avatar?: string;
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  lastLogin?: Date;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', default: null },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['super_admin', 'hospital_admin', 'engineer', 'staff', 'scm_manager'],
      required: true,
    },
    isActive: { type: Boolean, default: true },
    avatar: { type: String },
    refreshToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    lastLogin: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', userSchema);
