import express, { Router } from 'express';
import { Model } from 'mongoose';
import { verifyToken, requireRole, enforceHospitalScope } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { crudFactory } from '../utils/crudFactory';
import { ZodSchema } from 'zod';

import Supplier from '../models/Supplier';
import Warehouse from '../models/Warehouse';
import InventoryItem from '../models/InventoryItem';
import PurchaseOrder from '../models/PurchaseOrder';
import Shipment from '../models/Shipment';
import ColdChainLog from '../models/ColdChainLog';
import DemandForecast from '../models/DemandForecast';

import {
  supplierSchema,
  warehouseSchema,
  inventoryItemSchema,
  purchaseOrderSchema,
  shipmentSchema,
  coldChainLogSchema,
  demandForecastSchema,
} from '../validators/scmValidator';

import { getScmOverview } from '../controllers/scmAnalyticsController';

const router = express.Router();

router.use(verifyToken);
router.use(enforceHospitalScope);
router.use(requireRole(['super_admin', 'hospital_admin', 'scm_manager']));

// Mounts standard CRUD endpoints for a resource on the given sub-path.
const mountResource = (
  path: string,
  model: Model<any>,
  createSchema: ZodSchema,
  options: Parameters<typeof crudFactory>[1] = {}
) => {
  const sub: Router = express.Router();
  const ctrl = crudFactory(model, options);

  sub.get('/', ctrl.list);
  sub.post('/', validate(createSchema), ctrl.create);
  sub.get('/:id', ctrl.getOne);
  sub.patch('/:id', validate((createSchema as any).partial?.() ?? createSchema), ctrl.update);
  sub.delete('/:id', ctrl.remove);

  router.use(path, sub);
};

router.get('/analytics/overview', getScmOverview);

mountResource('/suppliers', Supplier, supplierSchema, {
  searchFields: ['name', 'code', 'category'],
});
mountResource('/warehouses', Warehouse, warehouseSchema, {
  searchFields: ['name', 'code', 'location'],
});
mountResource('/inventory', InventoryItem, inventoryItemSchema, {
  searchFields: ['name', 'sku', 'batchNumber'],
  populate: [
    { path: 'supplierId', select: 'name code' },
    { path: 'warehouseId', select: 'name code' },
  ],
});
mountResource('/purchase-orders', PurchaseOrder, purchaseOrderSchema, {
  searchFields: ['poNumber', 'notes'],
  populate: [{ path: 'supplierId', select: 'name code' }],
});
mountResource('/shipments', Shipment, shipmentSchema, {
  searchFields: ['shipmentNumber', 'carrier', 'trackingNumber', 'destination'],
  populate: [{ path: 'purchaseOrderId', select: 'poNumber' }],
});
mountResource('/cold-chain', ColdChainLog, coldChainLogSchema, {
  searchFields: ['unitName'],
  populate: [{ path: 'warehouseId', select: 'name code' }],
});
mountResource('/forecasts', DemandForecast, demandForecastSchema, {
  searchFields: ['itemName', 'period'],
});

export default router;
