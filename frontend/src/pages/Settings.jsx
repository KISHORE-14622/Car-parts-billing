import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { 
  Settings as SettingsIcon,
  User,
  Lock,
  Bell,
  Globe,
  Save,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const { settings, updateSettings, loading, error, getAvailableCurrencies } = useSettings();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    salesAlerts: true,
    lowStockAlerts: true
  });

  const [systemSettings, setSystemSettings] = useState({
    language: 'en',
    timezone: 'UTC',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY'
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  // Load settings when component mounts or settings change
  useEffect(() => {
    if (settings) {
      setSystemSettings({
        language: settings.language || 'en',
        timezone: settings.timezone || 'UTC',
        currency: settings.currency || 'USD',
        dateFormat: settings.dateFormat || 'MM/DD/YYYY'
      });
      setNotificationSettings({
        emailNotifications: settings.emailNotifications ?? true,
        pushNotifications: settings.pushNotifications ?? false,
        salesAlerts: settings.salesAlerts ?? true,
        lowStockAlerts: settings.lowStockAlerts ?? true
      });
    }
  }, [settings]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSystemChange = (e) => {
    const { name, value } = e.target;
    setSystemSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: profileForm.fullName.split(' ')[0],
          lastName: profileForm.fullName.split(' ').slice(1).join(' ') || profileForm.fullName.split(' ')[0],
          email: profileForm.email
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setUpdateMessage('Profile updated successfully!');
        // Update the user context if available
        setTimeout(() => setUpdateMessage(''), 3000);
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setUpdateMessage(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setUpdateMessage('Error: New passwords do not match!');
      return;
    }
    
    setIsUpdating(true);
    setUpdateMessage('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setUpdateMessage('Password updated successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setUpdateMessage(''), 3000);
      } else {
        throw new Error(data.message || 'Failed to update password');
      }
    } catch (err) {
      setUpdateMessage(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage('');
    
    try {
      const result = await updateSettings(notificationSettings);
      if (result.success) {
        setUpdateMessage('Notification settings updated successfully!');
        setTimeout(() => setUpdateMessage(''), 3000);
      } else {
        setUpdateMessage(`Error: ${result.message}`);
      }
    } catch (err) {
      setUpdateMessage(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSystemSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage('');
    
    try {
      const result = await updateSettings(systemSettings);
      if (result.success) {
        setUpdateMessage('System settings updated successfully!');
        setTimeout(() => setUpdateMessage(''), 3000);
      } else {
        setUpdateMessage(`Error: ${result.message}`);
      }
    } catch (err) {
      setUpdateMessage(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: Globe }
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2 text-lg text-gray-600">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <SettingsIcon className="h-8 w-8" />
          <span>Settings</span>
        </h1>
        <p className="text-gray-600">Manage your account and application preferences</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Update Message */}
      {updateMessage && (
        <div className={`border rounded-lg p-4 flex items-center space-x-2 ${
          updateMessage.includes('Error') 
            ? 'bg-red-50 border-red-200 text-red-800' 
            : 'bg-green-50 border-green-200 text-green-800'
        }`}>
          <AlertCircle className="h-5 w-5" />
          <span>{updateMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md transition-colors ${
                  activeTab === id
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="card-content">
              
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={profileForm.fullName}
                        onChange={handleProfileChange}
                        className="input w-full"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        className="input w-full"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                        className="input w-full"
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save Profile</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Password Settings */}
              {activeTab === 'password' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          className="input w-full pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        className="input w-full"
                        required
                        minLength="6"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        className="input w-full"
                        required
                        minLength="6"
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Save className="h-4 w-4" />
                        <span>Update Password</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                  <form onSubmit={handleNotificationSubmit} className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                          <p className="text-xs text-gray-500">Receive notifications via email</p>
                        </div>
                        <input
                          type="checkbox"
                          name="emailNotifications"
                          checked={notificationSettings.emailNotifications}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                          <p className="text-xs text-gray-500">Receive push notifications in browser</p>
                        </div>
                        <input
                          type="checkbox"
                          name="pushNotifications"
                          checked={notificationSettings.pushNotifications}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Sales Alerts</label>
                          <p className="text-xs text-gray-500">Get notified about new sales</p>
                        </div>
                        <input
                          type="checkbox"
                          name="salesAlerts"
                          checked={notificationSettings.salesAlerts}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Low Stock Alerts</label>
                          <p className="text-xs text-gray-500">Get notified when products are low in stock</p>
                        </div>
                        <input
                          type="checkbox"
                          name="lowStockAlerts"
                          checked={notificationSettings.lowStockAlerts}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="btn-primary flex items-center space-x-2"
                      >
                        {isUpdating ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        <span>{isUpdating ? 'Saving...' : 'Save Preferences'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* System Settings */}
              {activeTab === 'system' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">System Preferences</h2>
                  <form onSubmit={handleSystemSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Language</label>
                      <select
                        name="language"
                        value={systemSettings.language}
                        onChange={handleSystemChange}
                        className="input w-full"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Timezone</label>
                      <select
                        name="timezone"
                        value={systemSettings.timezone}
                        onChange={handleSystemChange}
                        className="input w-full"
                      >
                        <option value="UTC">UTC</option>
                        <option value="EST">Eastern Time</option>
                        <option value="PST">Pacific Time</option>
                        <option value="CST">Central Time</option>
                        <option value="IST">India Standard Time</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Currency</label>
                      <select
                        name="currency"
                        value={systemSettings.currency}
                        onChange={handleSystemChange}
                        className="input w-full"
                      >
                        <option value="USD">USD ($) - US Dollar</option>
                        <option value="EUR">EUR (€) - Euro</option>
                        <option value="GBP">GBP (£) - British Pound</option>
                        <option value="INR">INR (₹) - Indian Rupee</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Changing currency will update all price displays across the application
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date Format</label>
                      <select
                        name="dateFormat"
                        value={systemSettings.dateFormat}
                        onChange={handleSystemChange}
                        className="input w-full"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="btn-primary flex items-center space-x-2"
                      >
                        {isUpdating ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        <span>{isUpdating ? 'Saving...' : 'Save Settings'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
