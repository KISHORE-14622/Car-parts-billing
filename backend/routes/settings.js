const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { authenticateToken } = require('../middleware/auth');

// @route   GET /api/settings
// @desc    Get application settings
// @access  Public (settings like currency should be available to all users)
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    // Return settings with formatted response
    res.json({
      success: true,
      data: {
        currency: settings.currency,
        language: settings.language,
        timezone: settings.timezone,
        dateFormat: settings.dateFormat,
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        salesAlerts: settings.salesAlerts,
        lowStockAlerts: settings.lowStockAlerts,
        taxRate: settings.taxRate,
        companyName: settings.companyName,
        companyAddress: settings.companyAddress,
        companyPhone: settings.companyPhone,
        companyEmail: settings.companyEmail,
        lowStockThreshold: settings.lowStockThreshold,
        currencySymbol: settings.getCurrencySymbol(),
        currencyLocale: settings.getCurrencyLocale(),
        lastUpdated: settings.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: error.message
    });
  }
});

// @route   PUT /api/settings
// @desc    Update application settings
// @access  Private (Admin only)
router.put('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const {
      currency,
      language,
      timezone,
      dateFormat,
      emailNotifications,
      pushNotifications,
      salesAlerts,
      lowStockAlerts,
      taxRate,
      companyName,
      companyAddress,
      companyPhone,
      companyEmail,
      lowStockThreshold
    } = req.body;

    // Validate currency if provided
    if (currency && !['USD', 'EUR', 'GBP', 'INR'].includes(currency)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid currency. Supported currencies: USD, EUR, GBP, INR'
      });
    }

    // Validate language if provided
    if (language && !['en', 'es', 'fr'].includes(language)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid language. Supported languages: en, es, fr'
      });
    }

    // Validate timezone if provided
    if (timezone && !['UTC', 'EST', 'PST', 'CST', 'IST'].includes(timezone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid timezone. Supported timezones: UTC, EST, PST, CST, IST'
      });
    }

    // Validate date format if provided
    if (dateFormat && !['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].includes(dateFormat)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Supported formats: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD'
      });
    }

    // Validate tax rate if provided
    if (taxRate !== undefined && (taxRate < 0 || taxRate > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Tax rate must be between 0 and 100'
      });
    }

    // Validate low stock threshold if provided
    if (lowStockThreshold !== undefined && lowStockThreshold < 0) {
      return res.status(400).json({
        success: false,
        message: 'Low stock threshold must be 0 or greater'
      });
    }

    // Prepare update object (only include provided fields)
    const updates = {};
    if (currency !== undefined) updates.currency = currency;
    if (language !== undefined) updates.language = language;
    if (timezone !== undefined) updates.timezone = timezone;
    if (dateFormat !== undefined) updates.dateFormat = dateFormat;
    if (emailNotifications !== undefined) updates.emailNotifications = emailNotifications;
    if (pushNotifications !== undefined) updates.pushNotifications = pushNotifications;
    if (salesAlerts !== undefined) updates.salesAlerts = salesAlerts;
    if (lowStockAlerts !== undefined) updates.lowStockAlerts = lowStockAlerts;
    if (taxRate !== undefined) updates.taxRate = taxRate;
    if (companyName !== undefined) updates.companyName = companyName;
    if (companyAddress !== undefined) updates.companyAddress = companyAddress;
    if (companyPhone !== undefined) updates.companyPhone = companyPhone;
    if (companyEmail !== undefined) updates.companyEmail = companyEmail;
    if (lowStockThreshold !== undefined) updates.lowStockThreshold = lowStockThreshold;

    // Update settings
    const settings = await Settings.updateSettings(updates, req.user._id);

    // Log the settings update
    console.log(`Settings updated by ${req.user.fullName} (${req.user.email}):`, updates);

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        currency: settings.currency,
        language: settings.language,
        timezone: settings.timezone,
        dateFormat: settings.dateFormat,
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        salesAlerts: settings.salesAlerts,
        lowStockAlerts: settings.lowStockAlerts,
        taxRate: settings.taxRate,
        companyName: settings.companyName,
        companyAddress: settings.companyAddress,
        companyPhone: settings.companyPhone,
        companyEmail: settings.companyEmail,
        lowStockThreshold: settings.lowStockThreshold,
        currencySymbol: settings.getCurrencySymbol(),
        currencyLocale: settings.getCurrencyLocale(),
        lastUpdated: settings.updatedAt,
        lastUpdatedBy: req.user.fullName
      }
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message
    });
  }
});

// @route   GET /api/settings/currencies
// @desc    Get available currencies with their symbols and locales
// @access  Public
router.get('/currencies', (req, res) => {
  try {
    const currencies = [
      {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        locale: 'en-US'
      },
      {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        locale: 'de-DE'
      },
      {
        code: 'GBP',
        name: 'British Pound',
        symbol: '£',
        locale: 'en-GB'
      },
      {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹',
        locale: 'en-IN'
      }
    ];

    res.json({
      success: true,
      data: currencies
    });
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching currencies',
      error: error.message
    });
  }
});

// @route   POST /api/settings/reset
// @desc    Reset settings to default values
// @access  Private (Admin only)
router.post('/reset', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Delete existing settings and create new default ones
    await Settings.deleteMany({});
    const settings = await Settings.create({ lastUpdatedBy: req.user._id });

    console.log(`Settings reset to defaults by ${req.user.fullName} (${req.user.email})`);

    res.json({
      success: true,
      message: 'Settings reset to default values',
      data: {
        currency: settings.currency,
        language: settings.language,
        timezone: settings.timezone,
        dateFormat: settings.dateFormat,
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        salesAlerts: settings.salesAlerts,
        lowStockAlerts: settings.lowStockAlerts,
        taxRate: settings.taxRate,
        companyName: settings.companyName,
        companyAddress: settings.companyAddress,
        companyPhone: settings.companyPhone,
        companyEmail: settings.companyEmail,
        lowStockThreshold: settings.lowStockThreshold,
        currencySymbol: settings.getCurrencySymbol(),
        currencyLocale: settings.getCurrencyLocale(),
        lastUpdated: settings.updatedAt
      }
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting settings',
      error: error.message
    });
  }
});

module.exports = router;
