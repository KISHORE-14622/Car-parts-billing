const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createStaff = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/car-parts-scanner');
    console.log('Connected to MongoDB');

    // Check if staff user already exists
    const existingStaff = await User.findOne({ email: 'staff@barcodescanner.com' });
    if (existingStaff) {
      console.log('Staff user already exists');
      process.exit(0);
    }

    // Create staff user
    const hashedPassword = await bcrypt.hash('staff123', 12);
    
    const staffUser = new User({
      firstName: 'Staff',
      lastName: 'User',
      username: 'staff',
      email: 'staff@barcodescanner.com',
      password: hashedPassword,
      role: 'staff',
      isActive: true
    });

    await staffUser.save();
    console.log('Staff user created successfully');
    console.log('Email: staff@barcodescanner.com');
    console.log('Password: staff123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating staff user:', error);
    process.exit(1);
  }
};

createStaff();
