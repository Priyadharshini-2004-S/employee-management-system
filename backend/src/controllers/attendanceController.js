import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { 
  calculateStatus, 
  calculateTotalHours, 
  isToday, 
  getStartOfDay, 
  getEndOfDay,
  getStartOfMonth,
  getEndOfMonth
} from '../utils/attendanceLogic.js';
import { createObjectCsvWriter } from 'csv-writer';

// @desc    Check in
// @route   POST /api/attendance/checkin
// @access  Private (Employee)
export const checkIn = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = getStartOfDay();

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      userId,
      date: { $gte: today, $lt: getEndOfDay() }
    });

    if (existingAttendance && existingAttendance.checkInTime) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const checkInTime = new Date();
    const status = calculateStatus(checkInTime);

    let attendance;
    if (existingAttendance) {
      // Update existing record
      attendance = await Attendance.findByIdAndUpdate(
        existingAttendance._id,
        { checkInTime, status },
        { new: true }
      );
    } else {
      // Create new record
      attendance = await Attendance.create({
        userId,
        date: today,
        checkInTime,
        status
      });
    }

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check out
// @route   POST /api/attendance/checkout
// @access  Private (Employee)
export const checkOut = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = getStartOfDay();

    const attendance = await Attendance.findOne({
      userId,
      date: { $gte: today, $lt: getEndOfDay() }
    });

    if (!attendance || !attendance.checkInTime) {
      return res.status(400).json({ message: 'Please check in first' });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    const checkOutTime = new Date();
    const totalHours = calculateTotalHours(attendance.checkInTime, checkOutTime);

    attendance.checkOutTime = checkOutTime;
    attendance.totalHours = totalHours;
    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my attendance history
// @route   GET /api/attendance/my-history
// @access  Private (Employee)
export const getMyHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { month, year } = req.query;

    let startDate, endDate;
    if (month && year) {
      startDate = getStartOfMonth(new Date(year, month - 1));
      endDate = getEndOfMonth(new Date(year, month - 1));
    } else {
      // Default to current month
      startDate = getStartOfMonth();
      endDate = getEndOfMonth();
    }

    const attendance = await Attendance.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my monthly summary
// @route   GET /api/attendance/my-summary
// @access  Private (Employee)
export const getMySummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const { month, year } = req.query;

    let startDate, endDate;
    if (month && year) {
      startDate = getStartOfMonth(new Date(year, month - 1));
      endDate = getEndOfMonth(new Date(year, month - 1));
    } else {
      startDate = getStartOfMonth();
      endDate = getEndOfMonth();
    }

    const attendance = await Attendance.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    });

    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const halfDay = attendance.filter(a => a.status === 'half-day').length;
    const totalHours = attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);

    res.json({
      present,
      absent,
      late,
      halfDay,
      totalHours: Math.round(totalHours * 100) / 100,
      totalDays: attendance.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's attendance status
// @route   GET /api/attendance/today
// @access  Private (Employee)
export const getToday = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = getStartOfDay();

    const attendance = await Attendance.findOne({
      userId,
      date: { $gte: today, $lt: getEndOfDay() }
    });

    if (!attendance) {
      return res.json({
        checkedIn: false,
        checkedOut: false,
        checkInTime: null,
        checkOutTime: null,
        status: 'absent'
      });
    }

    res.json({
      checkedIn: !!attendance.checkInTime,
      checkedOut: !!attendance.checkOutTime,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      status: attendance.status,
      totalHours: attendance.totalHours
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all employees attendance (Manager)
// @route   GET /api/attendance/all
// @access  Private (Manager)
export const getAllAttendance = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, status } = req.query;

    let query = {};

    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) {
        query.userId = user._id;
      } else {
        return res.json([]);
      }
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = getStartOfDay(new Date(startDate));
      }
      if (endDate) {
        query.date.$lte = getEndOfDay(new Date(endDate));
      }
    }

    if (status) {
      query.status = status;
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 })
      .limit(1000);

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get specific employee attendance (Manager)
// @route   GET /api/attendance/employee/:id
// @access  Private (Manager)
export const getEmployeeAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    let query = { userId: id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = getStartOfDay(new Date(startDate));
      }
      if (endDate) {
        query.date.$lte = getEndOfDay(new Date(endDate));
      }
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get team summary (Manager)
// @route   GET /api/attendance/summary
// @access  Private (Manager)
export const getTeamSummary = async (req, res) => {
  try {
    const { month, year } = req.query;

    let startDate, endDate;
    if (month && year) {
      startDate = getStartOfMonth(new Date(year, month - 1));
      endDate = getEndOfMonth(new Date(year, month - 1));
    } else {
      startDate = getStartOfMonth();
      endDate = getEndOfMonth();
    }

    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('userId', 'name employeeId department');

    const summary = {
      totalEmployees: await User.countDocuments({ role: 'employee' }),
      totalPresent: attendance.filter(a => a.status === 'present').length,
      totalAbsent: attendance.filter(a => a.status === 'absent').length,
      totalLate: attendance.filter(a => a.status === 'late').length,
      totalHalfDay: attendance.filter(a => a.status === 'half-day').length,
      totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0)
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export attendance to CSV (Manager)
// @route   GET /api/attendance/export
// @access  Private (Manager)
export const exportAttendance = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;

    let query = {};

    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) {
        query.userId = user._id;
      }
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = getStartOfDay(new Date(startDate));
      }
      if (endDate) {
        query.date.$lte = getEndOfDay(new Date(endDate));
      }
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    const csvData = attendance.map(record => ({
      date: new Date(record.date).toLocaleDateString(),
      employeeId: record.userId.employeeId,
      name: record.userId.name,
      email: record.userId.email,
      department: record.userId.department,
      checkInTime: record.checkInTime ? new Date(record.checkInTime).toLocaleString() : 'N/A',
      checkOutTime: record.checkOutTime ? new Date(record.checkOutTime).toLocaleString() : 'N/A',
      status: record.status,
      totalHours: record.totalHours || 0
    }));

    const csvWriter = createObjectCsvWriter({
      path: 'attendance_export.csv',
      header: [
        { id: 'date', title: 'Date' },
        { id: 'employeeId', title: 'Employee ID' },
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'department', title: 'Department' },
        { id: 'checkInTime', title: 'Check In Time' },
        { id: 'checkOutTime', title: 'Check Out Time' },
        { id: 'status', title: 'Status' },
        { id: 'totalHours', title: 'Total Hours' }
      ]
    });

    await csvWriter.writeRecords(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_export.csv');
    
    // Read and send the file
    const fs = await import('fs');
    const fileContent = fs.readFileSync('attendance_export.csv');
    res.send(fileContent);
    
    // Clean up
    fs.unlinkSync('attendance_export.csv');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's attendance status for all employees (Manager)
// @route   GET /api/attendance/today-status
// @access  Private (Manager)
export const getTodayStatus = async (req, res) => {
  try {
    const today = getStartOfDay();

    const attendance = await Attendance.find({
      date: { $gte: today, $lt: getEndOfDay() }
    }).populate('userId', 'name email employeeId department');

    const present = attendance.filter(a => a.checkInTime && !a.checkOutTime || a.status === 'present' || a.status === 'late');
    const absent = attendance.filter(a => a.status === 'absent');
    const late = attendance.filter(a => a.status === 'late');

    const allEmployees = await User.find({ role: 'employee' });
    const absentEmployees = allEmployees.filter(emp => 
      !attendance.some(att => att.userId._id.toString() === emp._id.toString())
    );

    res.json({
      present: present.length,
      absent: absent.length + absentEmployees.length,
      late: late.length,
      presentEmployees: present.map(a => ({
        _id: a.userId._id,
        name: a.userId.name,
        employeeId: a.userId.employeeId,
        department: a.userId.department,
        checkInTime: a.checkInTime,
        status: a.status
      })),
      absentEmployees: [
        ...absent.map(a => ({
          _id: a.userId._id,
          name: a.userId.name,
          employeeId: a.userId.employeeId,
          department: a.userId.department
        })),
        ...absentEmployees.map(emp => ({
          _id: emp._id,
          name: emp.name,
          employeeId: emp.employeeId,
          department: emp.department
        }))
      ],
      lateEmployees: late.map(a => ({
        _id: a.userId._id,
        name: a.userId.name,
        employeeId: a.userId.employeeId,
        department: a.userId.department,
        checkInTime: a.checkInTime
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

