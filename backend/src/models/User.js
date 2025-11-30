import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['employee', 'manager'],
    default: 'employee'
  },
  employeeId: {
    type: String,
    unique: true
  },
  department: {
    type: String,
    required: [true, 'Please provide a department'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ employeeId: 1 });

// Hash password and generate employee ID before saving
userSchema.pre('save', async function(next) {
  // Hash password if modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  // Generate employee ID for new users
  if (this.isNew && !this.employeeId) {
    let employeeId;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      const count = await mongoose.model('User').countDocuments();
      employeeId = `EMP${String(count + 1).padStart(3, '0')}`;
      const existing = await mongoose.model('User').findOne({ employeeId });
      if (!existing) {
        isUnique = true;
        this.employeeId = employeeId;
      }
      attempts++;
    }
    
    if (!isUnique) {
      // Fallback: use timestamp-based ID
      this.employeeId = `EMP${Date.now().toString().slice(-6)}`;
    }
  }
  
  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;

