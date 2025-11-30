import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createManager = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get manager details from command line arguments or use defaults
    const args = process.argv.slice(2);
    const name = args[0] || 'Manager';
    const email = args[1] || 'manager@example.com';
    const password = args[2] || 'manager123';
    const department = args[3] || 'Management';
    const employeeId = args[4] || 'MGR001';

    // Check if manager already exists
    const existingManager = await User.findOne({ email });
    if (existingManager) {
      console.log('Manager with this email already exists!');
      process.exit(1);
    }

    // Create manager
    const manager = await User.create({
      name,
      email,
      password,
      department,
      role: 'manager',
      employeeId
    });

    console.log('Manager created successfully!');
    console.log('Email:', manager.email);
    console.log('Password:', password);
    console.log('Employee ID:', manager.employeeId);
    console.log('Role:', manager.role);

    process.exit(0);
  } catch (error) {
    console.error('Error creating manager:', error.message);
    process.exit(1);
  }
};

createManager();

