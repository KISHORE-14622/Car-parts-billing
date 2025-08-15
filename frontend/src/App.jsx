import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <Router>
          <div className="min-h-screen bg-hero-pattern">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
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
                
                {/* Staff Management - Admin and Staff access */}
                <Route 
                  path="/staff-management" 
                  element={
                    <ProtectedRoute allowedRoles={["admin", "staff"]}>
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
          </div>
        </Router>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
