const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // System Settings
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'INR'],
    default: 'USD'
  },
  language: {
    type: String,
    enum: ['en', 'es', 'fr'],
    default: 'en'
  },
  timezone: {
    type: String,
    enum: ['UTC', 'EST', 'PST', 'CST', 'IST'],
    default: 'UTC'
  },
  dateFormat: {
    type: String,
    enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
    default: 'MM/DD/YYYY'
  },
  
  // Notification Settings
  emailNotifications: {
    type: Boolean,
    default: true
  },
  pushNotifications: {
    type: Boolean,
    default: false
  },
  salesAlerts: {
    type: Boolean,
    default: true
  },
  lowStockAlerts: {
    type: Boolean,
    default: true
  },
  
  // Business Settings
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  companyName: {
    type: String,
    default: 'Car Parts Store'
  },
  companyAddress: {
    type: String,
    default: ''
  },
  companyPhone: {
    type: String,
    default: ''
  },
  companyEmail: {
    type: String,
    default: ''
  },
  
  // Low stock threshold
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: 0
  },
  
  // Currency symbols mapping
  currencySymbols: {
    type: Map,
    of: String,
    default: {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹'
    }
  },
  
  // Locale mapping for number formatting
  currencyLocales: {
    type: Map,
    of: String,
    default: {
      'USD': 'en-US',
      'EUR': 'de-DE',
      'GBP': 'en-GB',
      'INR': 'en-IN'
    }
  },
  
  // Metadata
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Note: MongoDB automatically creates a unique index on _id, so we don't need to specify it

// Static method to get or create settings
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Static method to update settings
settingsSchema.statics.updateSettings = async function(updates, userId) {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({ ...updates, lastUpdatedBy: userId });
  } else {
    Object.assign(settings, updates);
    settings.lastUpdatedBy = userId;
    await settings.save();
  }
  return settings;
};

// Method to get currency symbol
settingsSchema.methods.getCurrencySymbol = function() {
  return this.currencySymbols.get(this.currency) || '$';
};

// Method to get currency locale
settingsSchema.methods.getCurrencyLocale = function() {
  return this.currencyLocales.get(this.currency) || 'en-US';
};

// Method to format currency
settingsSchema.methods.formatCurrency = function(amount) {
  return new Intl.NumberFormat(this.getCurrencyLocale(), {
    style: 'currency',
    currency: this.currency
  }).format(amount);
};

module.exports = mongoose.model('Settings', settingsSchema);
