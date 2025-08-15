import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Eye, EyeOff, AlertCircle, Loader2, Shield } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, clearError, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      let redirectPath = location.state?.from?.pathname;
      
      if (!redirectPath) {
        // Default redirection based on user role - need to get user from context
        // This will be handled by the login success flow instead
        redirectPath = '/';
      }
      
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear errors when component mounts or form changes
  useEffect(() => {
    clearError();
    setLocalError('');
  }, [clearError, formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Basic validation
    if (!formData.login.trim()) {
      setLocalError('Email or username is required');
      return;
    }

    if (!formData.password) {
      setLocalError('Password is required');
      return;
    }

    const result = await login(formData);

    if (result.success) {
      // Role-based redirection
      const user = result.user;
      let redirectPath = location.state?.from?.pathname;
      
      if (!redirectPath) {
        // Default redirection based on user role
        if (user.role === 'admin') {
          redirectPath = '/admin';
        } else if (user.role === 'staff') {
          redirectPath = '/staff';
        } else {
          redirectPath = '/';
        }
      }
      
      navigate(redirectPath, { replace: true });
    }
  };

  const displayError = error || localError;

  return (
    <div className="min-h-screen bg-hero-pattern flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        <div className="flex justify-center">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Barcode Scanner</h1>
              <p className="text-sm text-gray-600">Authentication System</p>
            </div>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 text-shadow">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your credentials to access the system
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-slide-up">
        <div className="glass-effect py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border-gradient">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {displayError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Authentication Error
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {displayError}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="login" className="block text-sm font-medium text-gray-700">
                Email or Username
              </label>
              <div className="mt-1">
                <input
                  id="login"
                  name="login"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.login}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="Enter your email or username"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input w-full pr-10"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center space-x-2"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <LogIn className="h-5 w-5" />
                )}
                <span>{loading ? 'Signing in...' : 'Sign in'}</span>
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Demo Credentials</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>
                  <strong>Admin:</strong> admin@barcodescanner.com / admin123
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Admin can create products and manage users
                </div>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="mt-6 text-center">
            <div className="text-xs text-gray-500 space-y-1">
              <div>Car Parts Barcode Scanner System</div>
              <div>Secure Authentication Required</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
