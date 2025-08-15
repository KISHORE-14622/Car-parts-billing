# Authentication System Guide

## Overview

This barcode scanner application now includes a comprehensive authentication system with role-based access control. The system supports two user roles:

- **Admin**: Can create, edit, and delete products using barcode scanning
- **Staff**: Can only scan barcodes to view product details

## Features Implemented

### Backend Authentication
- JWT-based authentication
- Password hashing with bcryptjs
- Role-based middleware protection
- User model with admin/staff roles
- Protected API endpoints

### Frontend Authentication
- React Context for authentication state management
- Protected routes based on user roles
- Role-specific dashboards
- Authentication-aware navigation
- Automatic token management

## User Roles & Permissions

### Admin Role
- **Access**: Admin Dashboard (`/admin`)
- **Permissions**:
  - Create new products with barcode scanning
  - Edit existing products
  - Delete products (soft delete)
  - View all products
  - Scan barcodes for product management

### Staff Role
- **Access**: Staff Dashboard (`/staff`)
- **Permissions**:
  - Scan barcodes to view product details
  - View product information
  - Search and browse products (read-only)

## Default Admin Account

A default admin account has been created:
- **Email**: `admin@barcodescanner.com`
- **Password**: `admin123`
- **Role**: Admin

⚠️ **Important**: Please change the default password after first login for security.

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (admin only)
- `GET /api/auth/me` - Get current user info

### Protected Product Endpoints
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Public Product Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/barcode/:barcode` - Get product by barcode

## Frontend Routes

### Public Routes
- `/` - Home page
- `/products` - Product listing
- `/product/:id` - Product details
- `/login` - Login page

### Protected Routes
- `/admin` - Admin dashboard (Admin only)
- `/staff` - Staff dashboard (Staff only)

## Usage Instructions

### For Administrators

1. **Login**: Navigate to `/login` and use admin credentials
2. **Admin Dashboard**: Access via `/admin` or navbar "Admin Dashboard"
3. **Create Products**: 
   - Use the barcode scanner to scan product barcodes
   - Fill in product details in the form
   - Submit to create new products
4. **Edit Products**: 
   - View existing products in the dashboard
   - Click edit to modify product details
   - Use barcode scanner to update barcodes if needed

### For Staff Members

1. **Login**: Navigate to `/login` with staff credentials
2. **Staff Dashboard**: Access via `/staff` or navbar "Staff Scanner"
3. **Scan Products**:
   - Use the barcode scanner to scan product barcodes
   - View product details instantly
   - Browse product information (read-only)

### Creating New Users

Only administrators can create new user accounts:

1. Login as admin
2. Navigate to admin dashboard
3. Use the "Create User" section
4. Specify role (admin/staff) and user details
5. Provide credentials to the new user

## Security Features

- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: Passwords are hashed using bcryptjs
- **Role-based Access**: Routes and API endpoints protected by user roles
- **Token Expiration**: Automatic logout when tokens expire
- **Protected Routes**: Frontend routes protected by authentication status

## Environment Variables

Make sure these environment variables are set in your `.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

## Development Setup

1. **Backend Setup**:
   ```bash
   cd backend
   npm install
   npm run create-admin  # Create default admin user
   npm start            # Start backend server
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev         # Start frontend development server
   ```

## Testing the Authentication System

1. **Test Admin Login**:
   - Go to `/login`
   - Use: `admin@barcodescanner.com` / `admin123`
   - Should redirect to `/admin`

2. **Test Admin Features**:
   - Create new products with barcode scanning
   - Edit existing products
   - Access admin-only features

3. **Test Staff Access**:
   - Create a staff user via admin dashboard
   - Login with staff credentials
   - Should redirect to `/staff`
   - Verify read-only access to products

4. **Test Route Protection**:
   - Try accessing `/admin` without login (should redirect to login)
   - Try accessing `/staff` as admin (should be allowed)
   - Try accessing `/admin` as staff (should be denied)

## Troubleshooting

### Common Issues

1. **"Token expired" errors**: 
   - Tokens expire after 24 hours
   - User will be automatically logged out
   - Re-login to get new token

2. **"Access denied" errors**:
   - Check user role permissions
   - Ensure user has correct role for the action

3. **Database connection issues**:
   - Verify MongoDB is running
   - Check MONGODB_URI in environment variables

4. **CORS issues**:
   - Backend includes CORS middleware
   - Frontend should run on different port than backend

### Debug Tips

- Check browser console for authentication errors
- Verify JWT tokens in browser localStorage
- Check backend logs for authentication middleware errors
- Ensure all required environment variables are set

## Security Best Practices

1. **Change Default Password**: Always change the default admin password
2. **Strong Passwords**: Enforce strong password policies
3. **Regular Token Rotation**: Consider implementing token refresh
4. **HTTPS**: Use HTTPS in production
5. **Environment Variables**: Keep JWT secrets secure
6. **User Management**: Regularly audit user accounts and permissions

## Future Enhancements

Potential improvements to consider:
- Password reset functionality
- Email verification for new users
- Two-factor authentication
- User activity logging
- Session management
- Password strength requirements
- Account lockout after failed attempts
