import mongoose, { Schema, Document } from 'mongoose';

export interface IWarehouse extends Document {
  hospitalId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  location?: string;
  type: 'central' | 'pharmacy' | 'lab' | 'cold_storage' | 'ward';
  capacity: number;
  usedCapacity: number;
  manager?: string;
  createdBy?: mongoose.Types.ObjectId;
}

const warehouseSchema = new Schema<IWarehouse>(
  {
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    name: { type: String, required: true },
    code: { type: String },
    location: { type: String },
    type: {
      type: String,
      enum: ['central', 'pharmacy', 'lab', 'cold_storage', 'ward'],
      default: 'central',
    },
    capacity: { type: Number, default: 0 },
    usedCapacity: { type: Number, default: 0 },
    manager: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

warehouseSchema.pre('validate', function () {
  if (!this.code) {
    this.code = `WH-${Date.now().toString(36).toUpperCase()}`;
  }
});

export default mongoose.model<IWarehouse>('Warehouse', warehouseSchema);
