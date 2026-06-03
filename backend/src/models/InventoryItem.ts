import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryItem extends Document {
  hospitalId: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  category: 'drug' | 'chemotherapy' | 'consumable' | 'reagent' | 'other';
  unit: string;
  quantity: number;
  reorderLevel: number;
  unitCost: number;
  batchNumber?: string;
  expiryDate?: Date;
  requiresColdChain: boolean;
  storageTempMin?: number;
  storageTempMax?: number;
  supplierId?: mongoose.Types.ObjectId;
  warehouseId?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
}

const inventoryItemSchema = new Schema<IInventoryItem>(
  {
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    name: { type: String, required: true },
    sku: { type: String },
    category: {
      type: String,
      enum: ['drug', 'chemotherapy', 'consumable', 'reagent', 'other'],
      default: 'other',
    },
    unit: { type: String, default: 'unit' },
    quantity: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 0 },
    unitCost: { type: Number, default: 0 },
    batchNumber: { type: String },
    expiryDate: { type: Date },
    requiresColdChain: { type: Boolean, default: false },
    storageTempMin: { type: Number },
    storageTempMax: { type: Number },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

inventoryItemSchema.pre('validate', function () {
  if (!this.sku) {
    this.sku = `SKU-${Date.now().toString(36).toUpperCase()}`;
  }
});

export default mongoose.model<IInventoryItem>('InventoryItem', inventoryItemSchema);
