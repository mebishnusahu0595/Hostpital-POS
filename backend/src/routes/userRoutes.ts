import express from 'express';
import {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  forceResetPassword,
  updateMe,
  updateMyAvatar,
} from '../controllers/userController';
import { verifyToken, requireRole, enforceHospitalScope } from '../middleware/auth';
import { uploadImage } from '../middleware/upload';
import { validate } from '../middleware/validate';
import {
  createUserSchema,
  updateUserSchema,
  resetUserPasswordSchema,
} from '../validators/userValidator';

const router = express.Router();

router.use(verifyToken);

// Any authenticated user can update their own profile
router.patch('/me', updateMe);
router.post('/me/avatar', uploadImage.single('avatar'), updateMyAvatar);

router.use(enforceHospitalScope);
router.use(requireRole(['super_admin', 'hospital_admin']));

router.get('/', getUsers);
router.post('/', validate(createUserSchema), createUser);
router.get('/:id', getUser);
router.patch('/:id', validate(updateUserSchema), updateUser);
router.delete('/:id', deleteUser);
router.post('/:id/reset-password', validate(resetUserPasswordSchema), forceResetPassword);

export default router;
