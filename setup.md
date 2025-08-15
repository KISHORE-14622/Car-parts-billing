# Quick Setup Guide

Follow these steps to get your Car Parts Barcode Scanner application running:

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- A modern web browser with camera support

## Setup Steps

### 1. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Go back to root
cd ..
```

### 2. Start MongoDB
Make sure MongoDB is running on your system:
- **Local MongoDB**: Start the MongoDB service
- **MongoDB Atlas**: Update the connection string in `backend/.env`

### 3. Seed the Database
```bash
cd backend
npm run seed
cd ..
```

### 4. Start the Application
```bash
# Start both frontend and backend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Test the Application

### Sample Barcodes for Testing:
- `1234567890123` - Brake Pads - Front Set
- `2345678901234` - Engine Oil Filter  
- `3456789012345` - Spark Plugs Set (4 pieces)
- `4567890123456` - Air Filter
- `5678901234567` - Timing Belt

### Features to Test:
1. **Home Page**: Navigate to http://localhost:3000
2. **Product Catalog**: Browse all products at /products
3. **Barcode Scanner**: Test scanning at /scanner
4. **Product Details**: Click on any product for detailed view

## Troubleshooting

### Common Issues:

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check the connection string in `backend/.env`
- For MongoDB Atlas, ensure your IP is whitelisted

**Camera Permission Denied:**
- Allow camera access in your browser
- Use HTTPS for production (required for camera access)
- Try the manual barcode input if camera fails

**Port Already in Use:**
- Change ports in `backend/.env` (PORT) and `frontend/vite.config.js`
- Kill existing processes using the ports

**Dependencies Issues:**
- Delete `node_modules` folders and `package-lock.json` files
- Run `npm install` again in each directory

## Next Steps

1. **Add More Products**: Use the API endpoints to add more car parts
2. **Customize UI**: Modify components in `frontend/src/components/`
3. **Add Authentication**: Implement user login/registration
4. **Deploy**: Deploy to your preferred hosting platform

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check the terminal output for backend errors
3. Ensure all dependencies are installed correctly
4. Verify MongoDB is running and accessible

Happy scanning! 🚗📱
