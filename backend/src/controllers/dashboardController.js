import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { 
  getStartOfDay, 
  getEndOfDay,
  getStartOfMonth,
  getEndOfMonth
} from '../utils/attendanceLogic.js';

// @desc    Get employee dashboard stats
// @route   GET /api/dashboard/employee
// @access  Private (Employee)
export const getEmployeeDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = getStartOfDay();
    const monthStart = getStartOfMonth();
    const monthEnd = getEndOfMonth();

    // Today's status
    const todayAttendance = await Attendance.findOne({
      userId,
      date: { $gte: today, $lt: getEndOfDay() }
    });

    // Monthly summary
    const monthlyAttendance = await Attendance.find({
      userId,
      date: { $gte: monthStart, $lte: monthEnd }
    });

    const present = monthlyAttendance.filter(a => a.status === 'present').length;
    const absent = monthlyAttendance.filter(a => a.status === 'absent').length;
    const late = monthlyAttendance.filter(a => a.status === 'late').length;
    const totalHours = monthlyAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);

    // Recent attendance (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentAttendance = await Attendance.find({
      userId,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: -1 }).limit(7);

    res.json({
      todayStatus: {
        checkedIn: !!todayAttendance?.checkInTime,
        checkedOut: !!todayAttendance?.checkOutTime,
        status: todayAttendance?.status || 'absent',
        checkInTime: todayAttendance?.checkInTime,
        checkOutTime: todayAttendance?.checkOutTime
      },
      monthlySummary: {
        present,
        absent,
        late,
        totalHours: Math.round(totalHours * 100) / 100
      },
      recentAttendance: recentAttendance.map(a => ({
        date: a.date,
        checkInTime: a.checkInTime,
        checkOutTime: a.checkOutTime,
        status: a.status,
        totalHours: a.totalHours
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get manager dashboard stats
// @route   GET /api/dashboard/manager
// @access  Private (Manager)
export const getManagerDashboard = async (req, res) => {
  try {
    const today = getStartOfDay();
    const monthStart = getStartOfMonth();
    const monthEnd = getEndOfMonth();

    // Total employees
    const totalEmployees = await User.countDocuments({ role: 'employee' });

    // Today's attendance
    const todayAttendance = await Attendance.find({
      date: { $gte: today, $lt: getEndOfDay() }
    }).populate('userId', 'name employeeId department');

    const todayPresent = todayAttendance.filter(a => a.checkInTime && (a.status === 'present' || a.status === 'late')).length;
    const todayAbsent = totalEmployees - todayPresent;
    const todayLate = todayAttendance.filter(a => a.status === 'late').length;

    // Late arrivals today
    const lateArrivals = todayAttendance
      .filter(a => a.status === 'late')
      .map(a => ({
        _id: a.userId._id,
        name: a.userId.name,
        employeeId: a.userId.employeeId,
        department: a.userId.department,
        checkInTime: a.checkInTime
      }));

    // Absent employees today
    const allEmployees = await User.find({ role: 'employee' });
    const presentEmployeeIds = todayAttendance.map(a => a.userId._id.toString());
    const absentEmployees = allEmployees
      .filter(emp => !presentEmployeeIds.includes(emp._id.toString()))
      .map(emp => ({
        _id: emp._id,
        name: emp.name,
        employeeId: emp.employeeId,
        department: emp.department
      }));

    // Weekly attendance trend (last 7 days)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = getStartOfDay(date);
      const dayEnd = getEndOfDay(date);
      
      const dayAttendance = await Attendance.find({
        date: { $gte: dayStart, $lt: dayEnd }
      });
      
      weeklyData.push({
        date: date.toISOString().split('T')[0],
        present: dayAttendance.filter(a => a.status === 'present').length,
        absent: dayAttendance.filter(a => a.status === 'absent').length,
        late: dayAttendance.filter(a => a.status === 'late').length
      });
    }

    // Department-wise attendance
    const departmentStats = {};
    const monthlyAttendance = await Attendance.find({
      date: { $gte: monthStart, $lte: monthEnd }
    }).populate('userId', 'department');

    monthlyAttendance.forEach(att => {
      const dept = att.userId.department;
      if (!departmentStats[dept]) {
        departmentStats[dept] = { present: 0, absent: 0, late: 0 };
      }
      if (att.status === 'present') departmentStats[dept].present++;
      if (att.status === 'absent') departmentStats[dept].absent++;
      if (att.status === 'late') departmentStats[dept].late++;
    });

    const departmentWise = Object.entries(departmentStats).map(([department, stats]) => ({
      department,
      ...stats
    }));

    res.json({
      totalEmployees,
      todayAttendance: {
        present: todayPresent,
        absent: todayAbsent,
        late: todayLate
      },
      lateArrivals,
      absentEmployees,
      weeklyTrend: weeklyData,
      departmentWise
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

