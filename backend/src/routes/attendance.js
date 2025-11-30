import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';
import {
  checkIn,
  checkOut,
  getMyHistory,
  getMySummary,
  getToday,
  getAllAttendance,
  getEmployeeAttendance,
  getTeamSummary,
  exportAttendance,
  getTodayStatus
} from '../controllers/attendanceController.js';

const router = express.Router();

// Employee routes
router.post('/checkin', protect, authorize('employee'), checkIn);
router.post('/checkout', protect, authorize('employee'), checkOut);
router.get('/my-history', protect, authorize('employee'), getMyHistory);
router.get('/my-summary', protect, authorize('employee'), getMySummary);
router.get('/today', protect, authorize('employee'), getToday);

// Manager routes
router.get('/all', protect, authorize('manager'), getAllAttendance);
router.get('/employee/:id', protect, authorize('manager'), getEmployeeAttendance);
router.get('/summary', protect, authorize('manager'), getTeamSummary);
router.get('/export', protect, authorize('manager'), exportAttendance);
router.get('/today-status', protect, authorize('manager'), getTodayStatus);

export default router;

