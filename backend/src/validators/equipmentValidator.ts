import { z } from 'zod';

export const createEquipmentSchema = z.object({
  hospitalId: z.string().optional(),
  name: z.string().min(2, 'Name is required'),
  category: z.enum(['imaging', 'monitoring', 'laboratory', 'surgical', 'life_support', 'diagnostic', 'rehabilitation', 'sterilization', 'other']),
  subCategory: z.string().optional(),
  equipmentCode: z.string().min(1, 'Equipment Code is required'),
  serialNumber: z.string().optional(),
  modelNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  vendor: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().optional(),
  warrantyExpiry: z.string().optional(),
  location: z.union([
    z.string(),
    z.object({
      building: z.string().optional(),
      floor: z.string().optional(),
      ward: z.string().optional(),
      room: z.string().optional(),
    })
  ]).optional(),
  status: z.enum(['active', 'under_maintenance', 'out_of_service', 'decommissioned']).optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  maintenanceFrequency: z.enum(['weekly', 'monthly', 'quarterly', 'biannual', 'annual']),
  lastMaintenanceDate: z.string().optional(),
  complianceDueDate: z.string().optional(),
});

export const updateEquipmentSchema = z.object({
  name: z.string().min(2).optional(),
  category: z.enum(['imaging', 'monitoring', 'laboratory', 'surgical', 'life_support', 'diagnostic', 'rehabilitation', 'sterilization', 'other']).optional(),
  subCategory: z.string().optional(),
  serialNumber: z.string().optional(),
  modelNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  vendor: z.string().optional(),
  location: z.union([
    z.string(),
    z.object({
      building: z.string().optional(),
      floor: z.string().optional(),
      ward: z.string().optional(),
      room: z.string().optional(),
    })
  ]).optional(),
  status: z.enum(['active', 'under_maintenance', 'out_of_service', 'decommissioned']).optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  maintenanceFrequency: z.enum(['weekly', 'monthly', 'quarterly', 'biannual', 'annual']).optional(),
});

export const assignEngineerSchema = z.object({
  engineerId: z.string().min(1, 'Engineer ID is required'),
});
