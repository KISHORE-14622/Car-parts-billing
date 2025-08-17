import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Users,
  Settings
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();
  
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            
            {/* Staff Management - Admin Only */}
            {isAdmin() && (
              <Link
                to="/staff-management"
                onClick={onClose}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors border border-gray-200 group"
              >
                <Users className="h-5 w-5 text-primary-600 group-hover:text-primary-700" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Staff Management</span>
              </Link>
            )}

            {/* Settings */}
            <Link
              to="/settings"
              onClick={onClose}
              className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors border border-gray-200 group"
            >
              <Settings className="h-5 w-5 text-primary-600 group-hover:text-primary-700" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Settings</span>
            </Link>

          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="text-xs text-gray-500 text-center">
            Car Parts Store Management
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
