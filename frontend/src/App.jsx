import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import Scanner from './pages/Scanner';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import StaffManagement from './pages/StaffManagement';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Component to handle root route with role-based redirection
const RootRoute = () => {
  const { isAuthenticated, isAdmin, isStaff } = useAuth();
  
  if (isAuthenticated()) {
    if (isAdmin()) {
      return <Navigate to="/admin" replace />;
    } else if (isStaff()) {
      return <Navigate to="/staff" replace />;
    }
  }
  
  return <Home />;
};

// Component to conditionally apply container classes based on route
const MainContent = () => {
  const location = useLocation();
  const isStaffDashboard = location.pathname === '/staff';
  
  return (
    <main className={isStaffDashboard ? "staff-dashboard-main" : "container mx-auto px-4 py-8"}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<RootRoute />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        
        {/* Legacy scanner route - redirect to appropriate dashboard */}
        <Route path="/scanner" element={<Scanner />} />
        
        {/* Protected Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff" 
          element={
            <ProtectedRoute allowedRoles={["admin", "staff"]}>
              <StaffDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Staff Management - Admin only access */}
        <Route 
          path="/staff-management" 
          element={
            <ProtectedRoute requiredRole="admin">
              <StaffManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* Settings - Admin and Staff access */}
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute allowedRoles={["admin", "staff"]}>
              <Settings />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </main>
  );
};

function App() {
  const AppContent = () => {
    const location = useLocation();
    const isStaffDashboard = location.pathname === '/staff';
    
    // Add/remove body class for staff dashboard
    useEffect(() => {
      if (isStaffDashboard) {
        document.body.classList.add('staff-dashboard-active');
      } else {
        document.body.classList.remove('staff-dashboard-active');
      }
      
      // Cleanup on unmount
      return () => {
        document.body.classList.remove('staff-dashboard-active');
      };
    }, [isStaffDashboard]);
    
    return (
      <div className={isStaffDashboard ? "staff-dashboard-app-container bg-hero-pattern" : "min-h-screen bg-hero-pattern"}>
        <Navbar />
        <MainContent />
      </div>
    );
  };

  return (
    <AuthProvider>
      <ProductProvider>
        <Router>
          <AppContent />
        </Router>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
