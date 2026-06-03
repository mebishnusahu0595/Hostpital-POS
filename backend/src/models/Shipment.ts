import mongoose, { Schema, Document } from 'mongoose';

export interface IShipment extends Document {
  hospitalId: mongoose.Types.ObjectId;
  shipmentNumber: string;
  purchaseOrderId?: mongoose.Types.ObjectId;
  carrier?: string;
  origin?: string;
  destination?: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';
  trackingNumber?: string;
  dispatchedAt?: Date;
  expectedDelivery?: Date;
  deliveredAt?: Date;
  cost: number;
  createdBy?: mongoose.Types.ObjectId;
}

const shipmentSchema = new Schema<IShipment>(
  {
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    shipmentNumber: { type: String },
    purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' },
    carrier: { type: String },
    origin: { type: String },
    destination: { type: String },
    status: {
      type: String,
      enum: ['pending', 'in_transit', 'delivered', 'delayed', 'cancelled'],
      default: 'pending',
    },
    trackingNumber: { type: String },
    dispatchedAt: { type: Date },
    expectedDelivery: { type: Date },
    deliveredAt: { type: Date },
    cost: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

shipmentSchema.pre('validate', function () {
  if (!this.shipmentNumber) {
    this.shipmentNumber = `SHP-${Date.now().toString(36).toUpperCase()}`;
  }
});

export default mongoose.model<IShipment>('Shipment', shipmentSchema);
