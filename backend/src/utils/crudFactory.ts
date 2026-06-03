import { Request, Response, NextFunction } from 'express';
import { Model } from 'mongoose';
import { asyncHandler } from './asyncWrapper';
import { AppError } from './AppError';

interface CrudOptions {
  // Fields to run a case-insensitive regex search against (?search=)
  searchFields?: string[];
  // Mongoose populate spec applied to list/getOne
  populate?: { path: string; select?: string }[];
}

/**
 * Builds tenant-scoped CRUD controllers for a Mongoose model.
 * - Non-super_admin users are always scoped to their own hospitalId.
 * - super_admin may optionally pass ?hospitalId= to scope.
 */
export const crudFactory = (model: Model<any>, options: CrudOptions = {}) => {
  const { searchFields = [], populate = [] } = options;

  // Empty strings break ObjectId/Date casting — drop them so the field is simply omitted.
  const sanitize = (obj: Record<string, any>) => {
    const out = { ...obj };
    Object.keys(out).forEach((k) => {
      if (out[k] === '') delete out[k];
    });
    return out;
  };

  const scopeQuery = (req: Request): Record<string, any> => {
    const query: Record<string, any> = {};
    if (req.user?.role !== 'super_admin') {
      query.hospitalId = req.user?.hospitalId;
    } else if (req.query.hospitalId) {
      query.hospitalId = req.query.hospitalId;
    }
    return query;
  };

  const list = asyncHandler(async (req: Request, res: Response) => {
    const query = scopeQuery(req);

    if (req.query.search && searchFields.length > 0) {
      const regex = new RegExp(String(req.query.search), 'i');
      query.$or = searchFields.map((f) => ({ [f]: regex }));
    }

    // Allow simple equality filters passed via query (e.g. ?status=approved)
    ['status', 'category', 'priority', 'riskLevel'].forEach((f) => {
      if (req.query[f]) query[f] = req.query[f];
    });

    let q = model.find(query).sort('-createdAt');
    populate.forEach((p) => (q = q.populate(p.path, p.select)));
    const data = await q;

    res.status(200).json({ success: true, count: data.length, data });
  });

  const getOne = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let q = model.findById(req.params.id);
    populate.forEach((p) => (q = q.populate(p.path, p.select)));
    const doc = await q;

    if (!doc) return next(new AppError('Record not found', 404));
    if (
      req.user?.role !== 'super_admin' &&
      doc.hospitalId?.toString() !== req.user?.hospitalId?.toString()
    ) {
      return next(new AppError('Not authorized to access this record', 403));
    }

    res.status(200).json({ success: true, data: doc });
  });

  const create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const payload = sanitize(req.body);

    if (req.user?.role !== 'super_admin') {
      payload.hospitalId = req.user?.hospitalId;
    }
    if (!payload.hospitalId) {
      return next(new AppError('Hospital ID is required', 400));
    }
    payload.createdBy = req.user?._id;

    const doc = await model.create(payload);
    res.status(201).json({ success: true, data: doc });
  });

  const update = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const existing = await model.findById(req.params.id);
    if (!existing) return next(new AppError('Record not found', 404));
    if (
      req.user?.role !== 'super_admin' &&
      existing.hospitalId?.toString() !== req.user?.hospitalId?.toString()
    ) {
      return next(new AppError('Not authorized to update this record', 403));
    }

    const payload = sanitize(req.body);
    delete payload.hospitalId; // tenant key is immutable

    const doc = await model.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: doc });
  });

  const remove = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const existing = await model.findById(req.params.id);
    if (!existing) return next(new AppError('Record not found', 404));
    if (
      req.user?.role !== 'super_admin' &&
      existing.hospitalId?.toString() !== req.user?.hospitalId?.toString()
    ) {
      return next(new AppError('Not authorized to delete this record', 403));
    }

    await existing.deleteOne();
    res.status(200).json({ success: true, data: {} });
  });

  return { list, getOne, create, update, remove };
};
