import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
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
    lowStockThreshold: 10,
    currencySymbol: '$',
    currencyLocale: 'en-US'
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Currency mapping for symbols and locales
  const currencyData = {
    'USD': { symbol: '$', locale: 'en-US', name: 'US Dollar' },
    'EUR': { symbol: '€', locale: 'de-DE', name: 'Euro' },
    'GBP': { symbol: '£', locale: 'en-GB', name: 'British Pound' },
    'INR': { symbol: '₹', locale: 'en-IN', name: 'Indian Rupee' }
  };

  // Fetch settings from API
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch settings');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err.message);
      // Keep default settings if fetch fails
    } finally {
      setLoading(false);
    }
  };

  // Update settings via API
  const updateSettings = async (newSettings) => {
    try {
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSettings)
      });

      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
        return { success: true, message: data.message };
      } else {
        throw new Error(data.message || 'Failed to update settings');
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Format currency using current settings
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return currencyData[settings.currency]?.symbol + '0.00';
    }
    
    try {
      return new Intl.NumberFormat(settings.currencyLocale || currencyData[settings.currency]?.locale, {
        style: 'currency',
        currency: settings.currency
      }).format(amount);
    } catch (error) {
      // Fallback formatting if Intl.NumberFormat fails
      const symbol = settings.currencySymbol || currencyData[settings.currency]?.symbol || '$';
      return `${symbol}${Number(amount).toFixed(2)}`;
    }
  };

  // Get currency symbol
  const getCurrencySymbol = () => {
    return settings.currencySymbol || currencyData[settings.currency]?.symbol || '$';
  };

  // Get currency name
  const getCurrencyName = () => {
    return currencyData[settings.currency]?.name || 'US Dollar';
  };

  // Get available currencies
  const getAvailableCurrencies = () => {
    return Object.entries(currencyData).map(([code, data]) => ({
      code,
      ...data
    }));
  };

  // Reset settings to defaults
  const resetSettings = async () => {
    try {
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/settings/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
        return { success: true, message: data.message };
      } else {
        throw new Error(data.message || 'Failed to reset settings');
      }
    } catch (err) {
      console.error('Error resetting settings:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Update currency-related data when currency changes
  useEffect(() => {
    if (settings.currency && currencyData[settings.currency]) {
      const currencyInfo = currencyData[settings.currency];
      setSettings(prev => ({
        ...prev,
        currencySymbol: currencyInfo.symbol,
        currencyLocale: currencyInfo.locale
      }));
    }
  }, [settings.currency]);

  const value = {
    settings,
    loading,
    error,
    updateSettings,
    formatCurrency,
    getCurrencySymbol,
    getCurrencyName,
    getAvailableCurrencies,
    resetSettings,
    refreshSettings: fetchSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
