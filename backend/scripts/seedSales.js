const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const User = require('../models/User');
require('dotenv').config();

const sampleSales = [
  {
    items: [
      { productId: null, quantity: 2, unitPrice: 25.99, totalPrice: 51.98 },
      { productId: null, quantity: 1, unitPrice: 15.50, totalPrice: 15.50 }
    ],
    subtotal: 67.48,
    tax: 5.40,
    discount: 0,
    totalAmount: 72.88,
    paymentMethod: 'card',
    customer: {
      name: 'John Smith',
      email: 'john@example.com',
      phone: '555-0123'
    },
    saleDate: new Date(2024, 0, 15), // January 15, 2024
    notes: 'Regular customer purchase'
  },
  {
    items: [
      { productId: null, quantity: 1, unitPrice: 89.99, totalPrice: 89.99 }
    ],
    subtotal: 89.99,
    tax: 7.20,
    discount: 5.00,
    totalAmount: 92.19,
    paymentMethod: 'cash',
    customer: {
      name: 'Sarah Johnson',
      phone: '555-0456'
    },
    saleDate: new Date(2024, 1, 3), // February 3, 2024
    notes: 'Discount applied for bulk purchase'
  },
  {
    items: [
      { productId: null, quantity: 3, unitPrice: 12.75, totalPrice: 38.25 },
      { productId: null, quantity: 2, unitPrice: 45.00, totalPrice: 90.00 }
    ],
    subtotal: 128.25,
    tax: 10.26,
    discount: 0,
    totalAmount: 138.51,
    paymentMethod: 'bank_transfer',
    customer: {
      name: 'Mike Wilson',
      email: 'mike@example.com'
    },
    saleDate: new Date(2024, 2, 20), // March 20, 2024
  },
  {
    items: [
      { productId: null, quantity: 1, unitPrice: 199.99, totalPrice: 199.99 }
    ],
    subtotal: 199.99,
    tax: 16.00,
    discount: 20.00,
    totalAmount: 195.99,
    paymentMethod: 'card',
    customer: {
      name: 'Lisa Brown',
      email: 'lisa@example.com',
      phone: '555-0789'
    },
    saleDate: new Date(2024, 3, 10), // April 10, 2024
    notes: 'Premium customer discount'
  },
  {
    items: [
      { productId: null, quantity: 4, unitPrice: 8.99, totalPrice: 35.96 },
      { productId: null, quantity: 1, unitPrice: 67.50, totalPrice: 67.50 }
    ],
    subtotal: 103.46,
    tax: 8.28,
    discount: 0,
    totalAmount: 111.74,
    paymentMethod: 'cash',
    customer: {
      name: 'David Lee'
    },
    saleDate: new Date(2024, 4, 5), // May 5, 2024
  },
  // Current month sales for better demo
  {
    items: [
      { productId: null, quantity: 2, unitPrice: 34.99, totalPrice: 69.98 }
    ],
    subtotal: 69.98,
    tax: 5.60,
    discount: 0,
    totalAmount: 75.58,
    paymentMethod: 'card',
    customer: {
      name: 'Emma Davis',
      email: 'emma@example.com'
    },
    saleDate: new Date(), // Today
    notes: 'Online order pickup'
  },
  {
    items: [
      { productId: null, quantity: 1, unitPrice: 125.00, totalPrice: 125.00 },
      { productId: null, quantity: 3, unitPrice: 22.50, totalPrice: 67.50 }
    ],
    subtotal: 192.50,
    tax: 15.40,
    discount: 10.00,
    totalAmount: 197.90,
    paymentMethod: 'bank_transfer',
    customer: {
      name: 'Robert Taylor',
      phone: '555-0321'
    },
    saleDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  }
];

async function seedSales() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing sales
    await Sale.deleteMany({});
    console.log('Cleared existing sales');

    // Get some products and admin user
    const products = await Product.find().limit(10);
    const adminUser = await User.findOne({ role: 'admin' });

    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    if (products.length === 0) {
      console.error('No products found. Please seed products first.');
      process.exit(1);
    }

    // Assign random products to sales items
    const salesWithProducts = sampleSales.map(sale => {
      const updatedItems = sale.items.map(item => {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        return {
          ...item,
          product: randomProduct._id,
          unitPrice: randomProduct.price,
          totalPrice: randomProduct.price * item.quantity
        };
      });

      // Recalculate totals based on actual product prices
      const subtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const totalAmount = subtotal + sale.tax - sale.discount;

      return {
        ...sale,
        items: updatedItems,
        subtotal,
        totalAmount,
        createdBy: adminUser._id
      };
    });

    // Create sales
    const createdSales = await Sale.insertMany(salesWithProducts);
    console.log(`Created ${createdSales.length} sample sales`);

    // Display summary
    const totalRevenue = createdSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    console.log(`Total sample revenue: $${totalRevenue.toFixed(2)}`);

    console.log('Sales seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding sales:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedSales();
