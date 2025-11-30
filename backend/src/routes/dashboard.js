import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';
import { getEmployeeDashboard, getManagerDashboard } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/employee', protect, authorize('employee'), getEmployeeDashboard);
router.get('/manager', protect, authorize('manager'), getManagerDashboard);

export default router;

