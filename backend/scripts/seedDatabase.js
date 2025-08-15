const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const sampleProducts = require('../data/sampleProducts');

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${insertedProducts.length} sample products`);

    console.log('Database seeded successfully!');
    
    // Display some sample barcodes for testing
    console.log('\n--- Sample Barcodes for Testing ---');
    insertedProducts.slice(0, 5).forEach(product => {
      console.log(`${product.name}: ${product.barcode}`);
    });
    console.log('-----------------------------------\n');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the seed function
seedDatabase();
