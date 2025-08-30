const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const sampleProducts = require('../data/sampleProducts');

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/barcode-scanner';
    await mongoose.connect(MONGODB_URI);

    console.log('Connected to MongoDB');

    // Create a system user for seeding if it doesn't exist
    let systemUser = await User.findOne({ email: 'system@barcodescanner.com' });
    if (!systemUser) {
      systemUser = new User({
        username: 'system',
        email: 'system@barcodescanner.com',
        password: 'system123', // This will be hashed by the pre-save middleware
        firstName: 'System',
        lastName: 'Admin',
        role: 'admin'
      });
      await systemUser.save();
      console.log('Created system user for seeding');
    }

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('Cleared existing products and categories');

    // Extract unique categories from sample products
    const uniqueCategories = [...new Set(sampleProducts.map(product => product.category))];
    
    // Create categories
    const categoryMap = {};
    for (const categoryName of uniqueCategories) {
      const category = new Category({
        name: categoryName,
        description: `${categoryName} parts and components`,
        createdBy: systemUser._id,
        isActive: true
      });
      const savedCategory = await category.save();
      categoryMap[categoryName] = savedCategory._id;
      console.log(`Created category: ${categoryName}`);
    }

    // Create products with proper category references
    const productsToInsert = sampleProducts.map(product => ({
      ...product,
      category: categoryMap[product.category],
      createdBy: systemUser._id,
      isActive: true
    }));

    const insertedProducts = await Product.insertMany(productsToInsert);
    console.log(`Inserted ${insertedProducts.length} sample products`);

    console.log('Database seeded successfully!');
    
    // Display some sample barcodes for testing
    console.log('\n--- Sample Barcodes for Testing ---');
    insertedProducts.slice(0, 5).forEach(product => {
      console.log(`${product.name}: ${product.barcode}`);
    });
    console.log('-----------------------------------\n');

    // Test the barcode lookup
    console.log('Testing barcode lookup...');
    const testProduct = await Product.findOne({ barcode: '1234567890123' }).populate('category');
    if (testProduct) {
      console.log(`✅ Test successful: Found "${testProduct.name}" in category "${testProduct.category.name}"`);
    } else {
      console.log('❌ Test failed: Could not find test product');
    }

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
