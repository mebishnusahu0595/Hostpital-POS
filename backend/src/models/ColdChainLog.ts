import mongoose, { Schema, Document } from 'mongoose';

export interface IColdChainLog extends Document {
  hospitalId: mongoose.Types.ObjectId;
  unitName: string;
  warehouseId?: mongoose.Types.ObjectId;
  temperature: number;
  minThreshold: number;
  maxThreshold: number;
  breach: boolean;
  recordedAt: Date;
  notes?: string;
  createdBy?: mongoose.Types.ObjectId;
}

const coldChainLogSchema = new Schema<IColdChainLog>(
  {
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    unitName: { type: String, required: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
    temperature: { type: Number, required: true },
    minThreshold: { type: Number, default: 2 },
    maxThreshold: { type: Number, default: 8 },
    breach: { type: Boolean, default: false },
    recordedAt: { type: Date, default: Date.now },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Derive breach flag from temperature vs thresholds
coldChainLogSchema.pre('validate', function () {
  this.breach = this.temperature < this.minThreshold || this.temperature > this.maxThreshold;
});

export default mongoose.model<IColdChainLog>('ColdChainLog', coldChainLogSchema);
