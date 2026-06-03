import mongoose, { Schema, Document } from 'mongoose';

interface POItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface IPurchaseOrder extends Document {
  hospitalId: mongoose.Types.ObjectId;
  poNumber: string;
  supplierId?: mongoose.Types.ObjectId;
  items: POItem[];
  totalAmount: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'ordered' | 'received';
  priority: 'low' | 'medium' | 'high';
  expectedDelivery?: Date;
  notes?: string;
  requestedBy?: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
}

const poItemSchema = new Schema<POItem>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

const purchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    poNumber: { type: String },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    items: { type: [poItemSchema], default: [] },
    totalAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'approved', 'rejected', 'ordered', 'received'],
      default: 'pending_approval',
    },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    expectedDelivery: { type: Date },
    notes: { type: String },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

purchaseOrderSchema.pre('validate', function () {
  if (!this.poNumber) {
    this.poNumber = `PO-${Date.now().toString(36).toUpperCase()}`;
  }
});

purchaseOrderSchema.pre('save', function () {
  if (this.isModified('items')) {
    this.totalAmount = this.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  }
});

export default mongoose.model<IPurchaseOrder>('PurchaseOrder', purchaseOrderSchema);
