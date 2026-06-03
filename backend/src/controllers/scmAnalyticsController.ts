import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncWrapper';
import InventoryItem from '../models/InventoryItem';
import Supplier from '../models/Supplier';
import PurchaseOrder from '../models/PurchaseOrder';
import Shipment from '../models/Shipment';
import ColdChainLog from '../models/ColdChainLog';
import DemandForecast from '../models/DemandForecast';
import Warehouse from '../models/Warehouse';

// @desc    SCM executive overview KPIs + chart data
// @route   GET /api/v1/scm/analytics/overview
// @access  super_admin / hospital_admin / scm_manager
export const getScmOverview = asyncHandler(async (req: Request, res: Response) => {
  const scope: Record<string, any> = {};
  if (req.user?.role !== 'super_admin') {
    scope.hospitalId = req.user?.hospitalId;
  } else if (req.query.hospitalId) {
    scope.hospitalId = req.query.hospitalId;
  }

  const now = new Date();
  const in30Days = new Date();
  in30Days.setDate(now.getDate() + 30);

  const [
    inventory,
    suppliers,
    activeSuppliers,
    poStatusAgg,
    procurementSpendAgg,
    shipmentStatusAgg,
    inTransit,
    delayed,
    coldChainBreaches,
    forecasts,
    warehouses,
    categoryAgg,
  ] = await Promise.all([
    InventoryItem.find(scope),
    Supplier.countDocuments(scope),
    Supplier.countDocuments({ ...scope, isActive: true }),
    PurchaseOrder.aggregate([{ $match: scope }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    PurchaseOrder.aggregate([
      { $match: { ...scope, status: { $in: ['approved', 'ordered', 'received'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Shipment.aggregate([{ $match: scope }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Shipment.countDocuments({ ...scope, status: 'in_transit' }),
    Shipment.countDocuments({ ...scope, status: 'delayed' }),
    ColdChainLog.countDocuments({ ...scope, breach: true }),
    DemandForecast.find(scope),
    Warehouse.find(scope),
    InventoryItem.aggregate([{ $match: scope }, { $group: { _id: '$category', count: { $sum: 1 } } }]),
  ]);

  // Inventory-derived metrics
  const inventoryValue = inventory.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
  const lowStock = inventory.filter((i) => i.reorderLevel > 0 && i.quantity <= i.reorderLevel && i.quantity > 0).length;
  const outOfStock = inventory.filter((i) => i.quantity <= 0).length;
  const expiringSoon = inventory.filter(
    (i) => i.expiryDate && new Date(i.expiryDate) <= in30Days && new Date(i.expiryDate) >= now
  ).length;
  const expired = inventory.filter((i) => i.expiryDate && new Date(i.expiryDate) < now).length;

  // Warehouse utilization
  const totalCapacity = warehouses.reduce((s, w) => s + (w.capacity || 0), 0);
  const usedCapacity = warehouses.reduce((s, w) => s + (w.usedCapacity || 0), 0);
  const warehouseUtilization = totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0;

  // Forecast accuracy (100 - mean absolute percentage error)
  let forecastAccuracy = 0;
  const scored = forecasts.filter((f) => f.forecastQty > 0 && f.actualQty > 0);
  if (scored.length > 0) {
    const mape =
      scored.reduce((sum, f) => sum + Math.abs(f.forecastQty - f.actualQty) / f.forecastQty, 0) / scored.length;
    forecastAccuracy = Math.max(0, Math.round((1 - mape) * 100));
  }

  // Service level proxy: delivered shipments / total shipments
  const totalShipments = shipmentStatusAgg.reduce((s, x) => s + x.count, 0);
  const delivered = shipmentStatusAgg.find((x) => x._id === 'delivered')?.count || 0;
  const serviceLevel = totalShipments > 0 ? Math.round((delivered / totalShipments) * 100) : 100;

  res.status(200).json({
    success: true,
    data: {
      stats: {
        inventoryValue,
        totalItems: inventory.length,
        lowStock,
        outOfStock,
        expiringSoon,
        expired,
        totalSuppliers: suppliers,
        activeSuppliers,
        procurementSpend: procurementSpendAgg[0]?.total || 0,
        shipmentsInTransit: inTransit,
        delayedShipments: delayed,
        coldChainBreaches,
        forecastAccuracy,
        warehouseUtilization,
        serviceLevel,
        openPurchaseOrders:
          (poStatusAgg.find((x) => x._id === 'pending_approval')?.count || 0) +
          (poStatusAgg.find((x) => x._id === 'approved')?.count || 0) +
          (poStatusAgg.find((x) => x._id === 'ordered')?.count || 0),
      },
      charts: {
        poByStatus: poStatusAgg.map((x) => ({ name: x._id, count: x.count })),
        shipmentByStatus: shipmentStatusAgg.map((x) => ({ name: x._id, count: x.count })),
        inventoryByCategory: categoryAgg.map((x) => ({ name: x._id, count: x.count })),
        forecastVsActual: forecasts
          .sort((a, b) => a.period.localeCompare(b.period))
          .map((f) => ({ name: f.period, forecast: f.forecastQty, actual: f.actualQty })),
      },
    },
  });
});
