import mongoose, { Schema, Document } from 'mongoose';

export interface IDemandForecast extends Document {
  hospitalId: mongoose.Types.ObjectId;
  itemName: string;
  category: 'drug' | 'chemotherapy' | 'consumable' | 'reagent' | 'other';
  period: string; // e.g. "2026-06"
  forecastQty: number;
  actualQty: number;
  createdBy?: mongoose.Types.ObjectId;
}

const demandForecastSchema = new Schema<IDemandForecast>(
  {
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    itemName: { type: String, required: true },
    category: {
      type: String,
      enum: ['drug', 'chemotherapy', 'consumable', 'reagent', 'other'],
      default: 'other',
    },
    period: { type: String, required: true },
    forecastQty: { type: Number, default: 0 },
    actualQty: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model<IDemandForecast>('DemandForecast', demandForecastSchema);
