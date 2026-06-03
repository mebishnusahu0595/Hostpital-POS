import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  hospitalId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  category: 'pharmaceutical' | 'consumables' | 'reagents' | 'equipment' | 'logistics' | 'other';
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  leadTimeDays: number;
  onTimeDeliveryRate: number; // 0-100
  qualityScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
}

const supplierSchema = new Schema<ISupplier>(
  {
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    name: { type: String, required: true },
    code: { type: String },
    category: {
      type: String,
      enum: ['pharmaceutical', 'consumables', 'reagents', 'equipment', 'logistics', 'other'],
      default: 'other',
    },
    contactEmail: { type: String },
    contactPhone: { type: String },
    address: { type: String },
    leadTimeDays: { type: Number, default: 0 },
    onTimeDeliveryRate: { type: Number, default: 100, min: 0, max: 100 },
    qualityScore: { type: Number, default: 100, min: 0, max: 100 },
    riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

supplierSchema.pre('validate', function () {
  if (!this.code) {
    this.code = `SUP-${Date.now().toString(36).toUpperCase()}`;
  }
});

export default mongoose.model<ISupplier>('Supplier', supplierSchema);
