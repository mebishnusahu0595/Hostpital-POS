import { z } from 'zod';

export const supplierSchema = z.object({
  hospitalId: z.string().optional(),
  name: z.string().min(2, 'Name is required'),
  category: z.enum(['pharmaceutical', 'consumables', 'reagents', 'equipment', 'logistics', 'other']).optional(),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  leadTimeDays: z.number().min(0).optional(),
  onTimeDeliveryRate: z.number().min(0).max(100).optional(),
  qualityScore: z.number().min(0).max(100).optional(),
  riskLevel: z.enum(['low', 'medium', 'high']).optional(),
  isActive: z.boolean().optional(),
});

export const warehouseSchema = z.object({
  hospitalId: z.string().optional(),
  name: z.string().min(2, 'Name is required'),
  location: z.string().optional(),
  type: z.enum(['central', 'pharmacy', 'lab', 'cold_storage', 'ward']).optional(),
  capacity: z.number().min(0).optional(),
  usedCapacity: z.number().min(0).optional(),
  manager: z.string().optional(),
});

export const inventoryItemSchema = z.object({
  hospitalId: z.string().optional(),
  name: z.string().min(2, 'Name is required'),
  category: z.enum(['drug', 'chemotherapy', 'consumable', 'reagent', 'other']).optional(),
  unit: z.string().optional(),
  quantity: z.number().min(0).optional(),
  reorderLevel: z.number().min(0).optional(),
  unitCost: z.number().min(0).optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  requiresColdChain: z.boolean().optional(),
  storageTempMin: z.number().optional(),
  storageTempMax: z.number().optional(),
  supplierId: z.string().optional().or(z.literal('')),
  warehouseId: z.string().optional().or(z.literal('')),
});

export const purchaseOrderSchema = z.object({
  hospitalId: z.string().optional(),
  supplierId: z.string().optional().or(z.literal('')),
  items: z
    .array(
      z.object({
        name: z.string().min(1, 'Item name is required'),
        quantity: z.number().min(0),
        unitPrice: z.number().min(0),
      })
    )
    .optional(),
  totalAmount: z.number().min(0).optional(),
  status: z.enum(['draft', 'pending_approval', 'approved', 'rejected', 'ordered', 'received']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  expectedDelivery: z.string().optional(),
  notes: z.string().optional(),
});

export const shipmentSchema = z.object({
  hospitalId: z.string().optional(),
  purchaseOrderId: z.string().optional().or(z.literal('')),
  carrier: z.string().optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
  status: z.enum(['pending', 'in_transit', 'delivered', 'delayed', 'cancelled']).optional(),
  trackingNumber: z.string().optional(),
  dispatchedAt: z.string().optional(),
  expectedDelivery: z.string().optional(),
  deliveredAt: z.string().optional(),
  cost: z.number().min(0).optional(),
});

export const coldChainLogSchema = z.object({
  hospitalId: z.string().optional(),
  unitName: z.string().min(1, 'Unit name is required'),
  warehouseId: z.string().optional().or(z.literal('')),
  temperature: z.number(),
  minThreshold: z.number().optional(),
  maxThreshold: z.number().optional(),
  recordedAt: z.string().optional(),
  notes: z.string().optional(),
});

export const demandForecastSchema = z.object({
  hospitalId: z.string().optional(),
  itemName: z.string().min(1, 'Item name is required'),
  category: z.enum(['drug', 'chemotherapy', 'consumable', 'reagent', 'other']).optional(),
  period: z.string().min(1, 'Period is required'),
  forecastQty: z.number().min(0).optional(),
  actualQty: z.number().min(0).optional(),
});
