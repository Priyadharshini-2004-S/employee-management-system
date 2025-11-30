import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day'],
    default: 'absent'
  },
  totalHours: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for unique attendance per user per date
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

// Index for querying by date
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ userId: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;

