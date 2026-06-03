import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Hospital from '../models/Hospital';
import User from '../models/User';
import Supplier from '../models/Supplier';
import Warehouse from '../models/Warehouse';
import InventoryItem from '../models/InventoryItem';
import PurchaseOrder from '../models/PurchaseOrder';
import Shipment from '../models/Shipment';
import ColdChainLog from '../models/ColdChainLog';
import DemandForecast from '../models/DemandForecast';

dotenv.config();

const seedScm = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB for SCM Seeding...');

    // 1. Find Zexton Hospital
    let hospital = await Hospital.findOne({ name: 'ZEXTON HOSPITAL' });
    if (!hospital) {
      hospital = await Hospital.findOne({});
    }
    if (!hospital) {
      console.error('No hospital found! Please create a hospital first.');
      process.exit(1);
    }
    const hospitalId = hospital._id;
    console.log(`Seeding SCM for Hospital: ${hospital.name} (${hospitalId})`);

    // 2. Clear existing SCM data specifically for this hospital
    await Supplier.deleteMany({ hospitalId });
    await Warehouse.deleteMany({ hospitalId });
    await InventoryItem.deleteMany({ hospitalId });
    await PurchaseOrder.deleteMany({ hospitalId });
    await Shipment.deleteMany({ hospitalId });
    await ColdChainLog.deleteMany({ hospitalId });
    await DemandForecast.deleteMany({ hospitalId });
    await User.deleteMany({ hospitalId, role: 'scm_manager' });
    console.log('Cleared existing SCM data.');

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash('zexton@123', salt);

    // 3. Create SCM Manager
    const scmManager = await User.create({
      hospitalId,
      name: 'Zexton SCM Manager',
      email: 'scm@zexton.com',
      passwordHash,
      role: 'scm_manager',
      isActive: true,
    } as any);
    console.log('Created SCM Manager: scm@zexton.com / zexton@123');

    // 4. Create Suppliers
    const suppliers = await Supplier.insertMany([
      {
        hospitalId,
        name: 'OncoPharm Solutions',
        category: 'pharmaceutical',
        contactEmail: 'orders@oncopharm.com',
        contactPhone: '+1-555-0192',
        address: '100 Biotech Way, Boston, MA',
        leadTimeDays: 3,
        onTimeDeliveryRate: 98,
        qualityScore: 99,
        riskLevel: 'low',
        isActive: true,
        createdBy: scmManager._id,
      },
      {
        hospitalId,
        name: 'MedConsumables Corp',
        category: 'consumables',
        contactEmail: 'sales@medconsumables.com',
        contactPhone: '+1-555-0143',
        address: '45 Supply Ave, Chicago, IL',
        leadTimeDays: 5,
        onTimeDeliveryRate: 92,
        qualityScore: 94,
        riskLevel: 'medium',
        isActive: true,
        createdBy: scmManager._id,
      },
      {
        hospitalId,
        name: 'ColdChain Logistics',
        category: 'logistics',
        contactEmail: 'ops@coldchainlog.com',
        contactPhone: '+1-555-0187',
        address: '77 Refrigerated Rd, Newark, NJ',
        leadTimeDays: 2,
        onTimeDeliveryRate: 97,
        qualityScore: 96,
        riskLevel: 'low',
        isActive: true,
        createdBy: scmManager._id,
      }
    ]);
    console.log('Created Suppliers.');

    // 5. Create Warehouses
    const warehouses = await Warehouse.insertMany([
      {
        hospitalId,
        name: 'Main Oncology Store',
        location: 'Basement Block A',
        type: 'central',
        capacity: 1000,
        usedCapacity: 450,
        manager: 'Dr. Moses Chandran',
        createdBy: scmManager._id,
      },
      {
        hospitalId,
        name: 'Cold Storage Room B',
        location: 'Ground Floor Block C',
        type: 'cold_storage',
        capacity: 500,
        usedCapacity: 120,
        manager: 'SCM Manager',
        createdBy: scmManager._id,
      }
    ]);
    console.log('Created Warehouses.');

    // 6. Create Inventory Items
    const inventoryItems = await InventoryItem.insertMany([
      {
        hospitalId,
        name: 'Trastuzumab 440mg (Chemotherapy)',
        category: 'chemotherapy',
        unit: 'vials',
        quantity: 85,
        reorderLevel: 20,
        unitCost: 15000,
        batchNumber: 'TZ-2026-X8',
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // ~6 months
        requiresColdChain: true,
        storageTempMin: 2,
        storageTempMax: 8,
        supplierId: suppliers[0]._id,
        warehouseId: warehouses[1]._id,
        createdBy: scmManager._id,
      },
      {
        hospitalId,
        name: 'Doxorubicin 50mg',
        category: 'chemotherapy',
        unit: 'vials',
        quantity: 120,
        reorderLevel: 30,
        unitCost: 2000,
        batchNumber: 'DOX-99881',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // ~12 months
        requiresColdChain: false,
        supplierId: suppliers[0]._id,
        warehouseId: warehouses[0]._id,
        createdBy: scmManager._id,
      },
      {
        hospitalId,
        name: 'Chemo Infusion Sets',
        category: 'consumable',
        unit: 'pcs',
        quantity: 500,
        reorderLevel: 150,
        unitCost: 150,
        batchNumber: 'INF-2026-B1',
        expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), // ~24 months
        requiresColdChain: false,
        supplierId: suppliers[1]._id,
        warehouseId: warehouses[0]._id,
        createdBy: scmManager._id,
      },
      {
        hospitalId,
        name: 'Oncology Reagent Kit',
        category: 'reagent',
        unit: 'kits',
        quantity: 12,
        reorderLevel: 5,
        unitCost: 8500,
        batchNumber: 'RG-ONC-01',
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // ~3 months
        requiresColdChain: true,
        storageTempMin: -20,
        storageTempMax: -10,
        supplierId: suppliers[0]._id,
        warehouseId: warehouses[1]._id,
        createdBy: scmManager._id,
      }
    ]);
    console.log('Created Inventory Items.');

    // 7. Create Purchase Orders
    const purchaseOrders = await PurchaseOrder.insertMany([
      {
        hospitalId,
        supplierId: suppliers[0]._id,
        items: [
          {
            name: 'Trastuzumab 440mg (Chemotherapy)',
            quantity: 50,
            unitPrice: 15000,
          }
        ],
        totalAmount: 750000,
        status: 'received',
        priority: 'high',
        expectedDelivery: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        notes: 'Urgent stocking for Oncology clinic B.',
        requestedBy: scmManager._id,
        createdBy: scmManager._id,
      },
      {
        hospitalId,
        supplierId: suppliers[0]._id,
        items: [
          {
            name: 'Doxorubicin 50mg',
            quantity: 30,
            unitPrice: 2000,
          },
          {
            name: 'Oncology Reagent Kit',
            quantity: 10,
            unitPrice: 8500,
          }
        ],
        totalAmount: 145000,
        status: 'ordered',
        priority: 'medium',
        expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        notes: 'Standard replenishment.',
        requestedBy: scmManager._id,
        createdBy: scmManager._id,
      }
    ]);
    console.log('Created Purchase Orders.');

    // 8. Create Shipment
    const shipments = await Shipment.insertMany([
      {
        hospitalId,
        purchaseOrderId: purchaseOrders[1]._id,
        carrier: 'DHL Express',
        origin: 'OncoPharm Solutions Warehouse, Boston',
        destination: 'Zexton Hospital Main Store',
        status: 'in_transit',
        trackingNumber: 'DHL98229102',
        dispatchedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        cost: 3200,
        createdBy: scmManager._id,
      }
    ]);
    console.log('Created Shipment.');

    // 9. Create Cold Chain Logs
    await ColdChainLog.insertMany([
      {
        hospitalId,
        unitName: 'Ultra-Low Freezer F1',
        warehouseId: warehouses[1]._id,
        temperature: -15.5,
        minThreshold: -25,
        maxThreshold: -10,
        breach: false,
        recordedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdBy: scmManager._id,
      },
      {
        hospitalId,
        unitName: 'Chemo Cold Room C1',
        warehouseId: warehouses[1]._id,
        temperature: 4.8,
        minThreshold: 2,
        maxThreshold: 8,
        breach: false,
        recordedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        createdBy: scmManager._id,
      },
      {
        hospitalId,
        unitName: 'Chemo Cold Room C1',
        warehouseId: warehouses[1]._id,
        temperature: 5.2,
        minThreshold: 2,
        maxThreshold: 8,
        breach: false,
        recordedAt: new Date(),
        createdBy: scmManager._id,
      }
    ]);
    console.log('Created Cold Chain Logs.');

    // 10. Create Demand Forecasts
    await DemandForecast.insertMany([
      {
        hospitalId,
        itemName: 'Trastuzumab 440mg (Chemotherapy)',
        category: 'chemotherapy',
        period: '2026-06',
        forecastQty: 95,
        actualQty: 0,
        createdBy: scmManager._id,
      },
      {
        hospitalId,
        itemName: 'Doxorubicin 50mg',
        category: 'chemotherapy',
        period: '2026-06',
        forecastQty: 110,
        actualQty: 0,
        createdBy: scmManager._id,
      },
      {
        hospitalId,
        itemName: 'Chemo Infusion Sets',
        category: 'consumable',
        period: '2026-06',
        forecastQty: 480,
        actualQty: 0,
        createdBy: scmManager._id,
      }
    ]);
    console.log('Created Demand Forecasts.');

    console.log('--- SCM SEEDING COMPLETE ---');
    process.exit(0);
  } catch (error) {
    console.error('SCM Seeding failed:', error);
    process.exit(1);
  }
};

seedScm();
