import { Request, Response, NextFunction } from 'express';
import Hospital from '../models/Hospital';
import Equipment from '../models/Equipment';
import MaintenanceLog from '../models/MaintenanceLog';
import ServiceReport from '../models/ServiceReport';
import Notification from '../models/Notification';
import { asyncHandler } from '../utils/asyncWrapper';

// Helper to get start of current month
const getStartOfMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

// Helper for monthly recurring revenue calculation
const calculateMRR = (hospitals: any[]) => {
  const pricing = {
    free: 0,
    basic: 999,
    pro: 2499,
    enterprise: 10000 // Placeholder for enterprise
  };
  
  return hospitals.reduce((acc, h) => {
    if (h.subscriptionStatus === 'active') {
      return acc + (pricing[h.subscriptionPlan as keyof typeof pricing] || 0);
    }
    return acc;
  }, 0);
};

// @desc    Dashboard KPIs
// @route   GET /api/v1/analytics/dashboard
// @access  Protected
export const getDashboardStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const hospitalId = req.user?.hospitalId;
  const role = req.user?.role;
  const userId = req.user?._id;

  // --- SUPER ADMIN DASHBOARD ---
  if (role === 'super_admin') {
    const totalHospitals = await Hospital.countDocuments();
    const activeHospitals = await Hospital.countDocuments({ isActive: true });
    const suspendedHospitals = await Hospital.countDocuments({ isActive: false });
    const totalEquipment = await Equipment.countDocuments();
    
    // New hospitals this month
    const newHospitalsThisMonth = await Hospital.countDocuments({
      createdAt: { $gte: getStartOfMonth() }
    });

    // MRR
    const allHospitals = await Hospital.find().select('subscriptionPlan subscriptionStatus');
    const mrr = calculateMRR(allHospitals);

    // Hospitals by subscription plan (donut chart data)
    const subPlanStats = await Hospital.aggregate([
      { $group: { _id: '$subscriptionPlan', count: { $sum: 1 } } }
    ]);

    // Top 5 hospitals by equipment count (bar chart data)
    const topHospitals = await Equipment.aggregate([
      { $group: { _id: '$hospitalId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'hospitals',
          localField: '_id',
          foreignField: '_id',
          as: 'hospital'
        }
      },
      { $unwind: '$hospital' },
      { $project: { name: '$hospital.name', count: 1 } }
    ]);

    // Platform alerts (critical issues)
    const platformAlerts = await Notification.find({ priority: 'critical' })
      .sort('-createdAt')
      .limit(10);

    // Platform Users
    const User = require('../models/User').default;
    const totalUsers = await User.countDocuments();

    // Recent Hospitals
    const recentHospitals = await Hospital.find()
      .sort('-createdAt')
      .limit(5);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalHospitals,
          activeHospitals,
          suspendedHospitals,
          totalEquipment,
          newHospitalsThisMonth,
          mrr,
          totalUsers
        },
        charts: {
          subscriptionPlans: subPlanStats,
          topHospitals
        },
        platformAlerts,
        recentHospitals
      }
    });
  }

  // --- HOSPITAL ADMIN DASHBOARD ---
  if (role === 'hospital_admin') {
    const totalEquipment = await Equipment.countDocuments({ hospitalId });
    const statusStats = await Equipment.aggregate([
      { $match: { hospitalId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Maintenance due this week
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    const maintenanceDueThisWeek = await Equipment.countDocuments({
      hospitalId,
      nextMaintenanceDate: { $gte: now, $lte: nextWeek }
    });

    // Open service reports by priority
    const reportsByPriority = await ServiceReport.aggregate([
      { $match: { hospitalId, status: { $ne: 'resolved' } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Compliance score
    const compliantEquipment = await Equipment.countDocuments({
      hospitalId,
      complianceDueDate: { $gt: now }
    });
    const complianceScore = totalEquipment > 0 ? (compliantEquipment / totalEquipment) * 100 : 0;

    // Condition distribution
    const conditionStats = await Equipment.aggregate([
      { $match: { hospitalId } },
      { $group: { _id: '$condition', count: { $sum: 1 } } }
    ]);

    // Cost of maintenance (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const maintenanceCostMonthly = await MaintenanceLog.aggregate([
      { 
        $match: { 
          hospitalId, 
          status: 'completed', 
          completedAt: { $gte: sixMonthsAgo } 
        } 
      },
      {
        $group: {
          _id: { month: { $month: '$completedAt' }, year: { $year: '$completedAt' } },
          totalCost: { $sum: '$totalCost' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Critical reports
    const criticalAlerts = await ServiceReport.find({ 
      hospitalId, 
      priority: 'critical',
      status: { $ne: 'resolved' }
    }).sort('-createdAt').limit(5);

    // Uptime trend (last 6 months) derived from real breakdown logs.
    // Per month: uptime = 100% minus the share of equipment that suffered an
    // unplanned breakdown (corrective/emergency maintenance) that month.
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const breakdownsByMonth = await MaintenanceLog.aggregate([
      {
        $match: {
          hospitalId,
          type: { $in: ['corrective', 'emergency'] },
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 }
        }
      }
    ]);
    const uptimeTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const match = breakdownsByMonth.find(
        (b) => b._id.month === d.getMonth() + 1 && b._id.year === d.getFullYear()
      );
      const breakdownCount = match ? match.count : 0;
      const uptime = totalEquipment > 0
        ? Math.max(0, 100 - (breakdownCount / totalEquipment) * 100)
        : 100;
      uptimeTrend.push({
        name: monthNames[d.getMonth()],
        uptime: parseFloat(uptime.toFixed(1))
      });
    }
 
    const recentlyAdded = await Equipment.find({ hospitalId })
      .sort('-createdAt')
      .limit(5);

    const upcomingMaintenance = await MaintenanceLog.find({ 
      hospitalId, 
      status: 'scheduled',
      scheduledDate: { $gte: now }
    }).populate('equipmentId', 'name').sort('scheduledDate').limit(5);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalEquipment,
          maintenanceDue: maintenanceDueThisWeek,
          complianceScore,
          openReports: await ServiceReport.countDocuments({ hospitalId, status: { $ne: 'resolved' } }),
          outOfService: await Equipment.countDocuments({ hospitalId, status: 'out_of_service' })
        },
        charts: {
          statusDistribution: statusStats,
          conditionDistribution: conditionStats,
          monthlyCosts: maintenanceCostMonthly,
          uptimeTrend
        },
        recentlyAdded,
        upcomingMaintenance,
        criticalAlerts
      }
    });
  }

  // --- ENGINEER DASHBOARD ---
  if (role === 'engineer') {
    const assignedEquipmentCount = await Equipment.countDocuments({ assignedEngineer: userId });
    
    const now = new Date();
    const startOfToday = new Date(now.setHours(0,0,0,0));
    const endOfToday = new Date(now.setHours(23,59,59,999));
    
    const tasksDueToday = await MaintenanceLog.countDocuments({
      engineerId: userId,
      status: 'scheduled',
      scheduledDate: { $gte: startOfToday, $lte: endOfToday }
    });

    const openReportsAssigned = await ServiceReport.countDocuments({
      assignedTo: userId,
      status: { $in: ['open', 'assigned', 'in_progress'] }
    });

    const completedThisMonth = await MaintenanceLog.countDocuments({
      engineerId: userId,
      status: 'completed',
      completedAt: { $gte: getStartOfMonth() }
    });

    return res.status(200).json({
      success: true,
      data: {
        assignedEquipmentCount,
        tasksDueToday,
        openReportsAssigned,
        completedThisMonth
      }
    });
  }

  res.status(403).json({ success: false, message: 'Unauthorized role for dashboard' });
});

// @desc    Equipment stats (by category, status)
// @route   GET /api/v1/analytics/equipment
// @access  Protected
export const getEquipmentStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const hospitalId = req.user?.hospitalId;
  const query: any = hospitalId ? { hospitalId } : {};

  const statsByCategory = await Equipment.aggregate([
    { $match: query },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  const statsByStatus = await Equipment.aggregate([
    { $match: query },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      byCategory: statsByCategory,
      byStatus: statsByStatus
    }
  });
});

// @desc    Compliance status across hospital
// @route   GET /api/v1/analytics/compliance
// @access  Protected
export const getComplianceStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const hospitalId = req.user?.hospitalId;
    const query: any = hospitalId ? { hospitalId } : {};
    
    const overdueCompliance = await Equipment.countDocuments({
        ...query,
        complianceDueDate: { $lt: new Date() }
    });

    const totalEquipment = await Equipment.countDocuments(query);

    res.status(200).json({
        success: true,
        data: {
            overdueCompliance,
            complianceScore: totalEquipment > 0 ? ((totalEquipment - overdueCompliance) / totalEquipment) * 100 : 0
        }
    });
});

// @desc    Maintenance stats
// @route   GET /api/v1/analytics/maintenance
// @access  Protected
export const getMaintenanceStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const hospitalId = req.user?.hospitalId;
    const query: any = hospitalId ? { hospitalId } : {};
  
    const totalLogs = await MaintenanceLog.countDocuments(query);
    const completedLogs = await MaintenanceLog.countDocuments({ ...query, status: 'completed' });
  
    res.status(200).json({
      success: true,
      data: {
        total: totalLogs,
        completed: completedLogs,
        completionRate: totalLogs > 0 ? (completedLogs / totalLogs) * 100 : 0
      }
    });
});

// @desc    (super_admin) All hospital stats
// @route   GET /api/v1/analytics/hospitals
// @access  Super Admin
export const getAllHospitalStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const hospitals = await Hospital.find().select('name code subscriptionPlan subscriptionStatus');
    
    const stats = await Promise.all(hospitals.map(async (h) => {
      const equipmentCount = await Equipment.countDocuments({ hospitalId: h._id });
      return {
        _id: h._id,
        name: h.name,
        code: h.code,
        subscriptionPlan: h.subscriptionPlan,
        subscriptionStatus: h.subscriptionStatus,
        equipmentCount
      };
    }));
  
    res.status(200).json({
      success: true,
      data: stats
    });
});
// @desc    (super_admin) Platform-wide Analytics
// @route   GET /api/v1/analytics/platform
// @access  Super Admin
export const getPlatformAnalytics = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // 1. Hospital Registration Trend (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const registrationTrend = await Hospital.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // 2. Subscription Plan Distribution
    const planDistribution = await Hospital.aggregate([
      { $group: { _id: '$subscriptionPlan', count: { $sum: 1 } } }
    ]);

    // 3. Equipment Status Distribution (Global)
    const equipmentStatus = await Equipment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 4. Top 10 Hospitals by Equipment Count
    const topHospitals = await Equipment.aggregate([
      { $group: { _id: '$hospitalId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'hospitals',
          localField: '_id',
          foreignField: '_id',
          as: 'hospital'
        }
      },
      { $unwind: '$hospital' },
      { $project: { name: '$hospital.name', code: '$hospital.code', count: 1 } }
    ]);

    // 5. Activity Log Intensity (Daily for last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const AuditLog = require('../models/AuditLog').default;
    const activityTrend = await AuditLog.aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        registrationTrend,
        planDistribution,
        equipmentStatus,
        topHospitals,
        activityTrend
      }
    });
});
