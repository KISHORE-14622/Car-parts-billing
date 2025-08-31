import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../App';
import Sidebar from './Sidebar';
import { 
  Home, 
  Package, 
  Scan, 
  ShoppingCart, 
  User, 
  LogOut, 
  Shield, 
  ChevronDown,
  Menu,
  X,
  Settings
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAdmin, isStaff } = useAuth();
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/login');
  };

  const closeMenus = () => {
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };


  // Don't show navbar on login page
  if (location.pathname === '/login') {
    return null;
  }

  // Get navigation items based on user role
  const getNavItems = () => {
    const items = [];
    
    if (isAuthenticated()) {
      if (isAdmin()) {
        // Admin users only see admin dashboard and products
        items.push({ path: '/admin', label: 'Admin Dashboard', icon: Shield });
        items.push({ path: '/products', label: 'Products', icon: Package });
      } else if (isStaff()) {
        // Staff users see staff dashboard and products
        items.push({ path: '/staff', label: 'Staff Dashboard', icon: Scan });
        items.push({ path: '/products', label: 'Products', icon: Package });
      } else {
        // Regular users see home and products
        items.push({ path: '/', label: 'Home', icon: Home });
        items.push({ path: '/products', label: 'Products', icon: Package });
      }
    } else {
      // Non-authenticated users see home and products
      items.push({ path: '/', label: 'Home', icon: Home });
      items.push({ path: '/products', label: 'Products', icon: Package });
    }
    
    return items;
  };

  const allNavItems = getNavItems();

  return (
    <>
      <nav className="navbar bg-white shadow-lg border-b border-gray-200 sticky top-0">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Hamburger Menu and Logo */}
          <div className="flex items-center space-x-4">
            {/* Hamburger Menu - Only show for authenticated admin/staff users */}
            {isAuthenticated() && (isAdmin() || isStaff()) && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                title="Menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            
            {/* Logo */}
            <Link 
              to={isAuthenticated() && isAdmin() ? "/admin" : "/"} 
              className="flex items-center space-x-2" 
              onClick={closeMenus}
            >
              <ShoppingCart className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">
                Car parts store
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {allNavItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(path)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}


            {/* User Menu or Login Button */}
            {isAuthenticated() ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="font-medium">{user?.fullName}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <p className="text-xs text-primary-600 capitalize font-medium">{user?.role}</p>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium"
              >
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600 transition-colors"
            >
              {showMobileMenu ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {allNavItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={closeMenus}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(path)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </Link>
              ))}

              {/* Mobile User Section */}
              {isAuthenticated() ? (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <p className="text-xs text-primary-600 capitalize font-medium">{user?.role}</p>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 flex items-center space-x-2 transition-colors rounded-md"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <Link
                    to="/login"
                    onClick={closeMenus}
                    className="flex items-center space-x-2 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-md transition-colors font-medium"
                  >
                    <User className="h-4 w-4" />
                    <span>Sign In</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menus */}
      {(showUserMenu || showMobileMenu) && (
        <div
          className="fixed inset-0 z-30"
          onClick={closeMenus}
        />
      )}
      </nav>

      {/* Sidebar */}
      {isAuthenticated() && (isAdmin() || isStaff()) && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={closeSidebar} 
        />
      )}
    </>
  );
};

export default Navbar;
