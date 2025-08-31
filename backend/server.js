const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection with fallback to local MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/barcode-scanner';

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('MongoDB connected successfully');
  console.log('Database:', mongoose.connection.name);
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  console.log('Falling back to local MongoDB...');
  // Try local connection as fallback
  mongoose.connect('mongodb://localhost:27017/barcode-scanner')
    .then(() => console.log('Connected to local MongoDB'))
    .catch((localErr) => console.error('Local MongoDB connection failed:', localErr));
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/settings', require('./routes/settings'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Car Parts Barcode Scanner API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Handle server startup with better error handling
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔍 Test endpoint: http://localhost:${PORT}/api/products`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, trying port ${PORT + 1}...`);
    server.listen(PORT + 1, () => {
      console.log(`🚀 Server is running on port ${PORT + 1}`);
      console.log(`📡 API Base URL: http://localhost:${PORT + 1}/api`);
    });
  } else {
    console.error('Server startup error:', err);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close();
  });
});
