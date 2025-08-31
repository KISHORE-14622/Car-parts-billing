const mongoose = require('mongoose');
const Settings = require('../models/Settings');
require('dotenv').config();

const seedSettings = async () => {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/barcode-scanner';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if settings already exist
    const existingSettings = await Settings.findOne();
    if (existingSettings) {
      console.log('Settings already exist. Skipping seed.');
      return;
    }

    // Create default settings
    const defaultSettings = await Settings.create({
      currency: 'USD',
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      emailNotifications: true,
      pushNotifications: false,
      salesAlerts: true,
      lowStockAlerts: true,
      taxRate: 0,
      companyName: 'Car Parts Store',
      companyAddress: '',
      companyPhone: '',
      companyEmail: '',
      lowStockThreshold: 10
    });

    console.log('✅ Default settings created successfully');
    console.log('Settings:', {
      currency: defaultSettings.currency,
      language: defaultSettings.language,
      timezone: defaultSettings.timezone,
      dateFormat: defaultSettings.dateFormat,
      companyName: defaultSettings.companyName,
      lowStockThreshold: defaultSettings.lowStockThreshold
    });

  } catch (error) {
    console.error('❌ Error seeding settings:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedSettings();
}

module.exports = seedSettings;
