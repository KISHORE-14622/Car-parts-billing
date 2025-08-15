const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const defaultCategories = [
  {
    name: 'Engine Parts',
    description: 'Components related to engine operation including pistons, valves, gaskets, and engine blocks'
  },
  {
    name: 'Brake System',
    description: 'Brake pads, rotors, calipers, brake fluid, and other braking components'
  },
  {
    name: 'Suspension',
    description: 'Shocks, struts, springs, and suspension components for vehicle stability'
  },
  {
    name: 'Electrical',
    description: 'Batteries, alternators, starters, wiring, and electrical components'
  },
  {
    name: 'Body Parts',
    description: 'Exterior and interior body components, panels, and trim pieces'
  },
  {
    name: 'Filters',
    description: 'Air filters, oil filters, fuel filters, and cabin air filters'
  },
  {
    name: 'Belts & Hoses',
    description: 'Timing belts, serpentine belts, radiator hoses, and other rubber components'
  },
  {
    name: 'Transmission',
    description: 'Transmission parts, clutches, and drivetrain components'
  },
  {
    name: 'Cooling System',
    description: 'Radiators, water pumps, thermostats, and cooling system components'
  },
  {
    name: 'Exhaust System',
    description: 'Mufflers, catalytic converters, exhaust pipes, and emission control parts'
  }
];

async function seedCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find an admin user to assign as creator
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    console.log(`Using admin user: ${adminUser.fullName} (${adminUser.email})`);

    // Check if categories already exist
    const existingCategories = await Category.find();
    if (existingCategories.length > 0) {
      console.log(`Found ${existingCategories.length} existing categories. Skipping seed.`);
      console.log('Existing categories:');
      existingCategories.forEach(cat => {
        console.log(`- ${cat.name}`);
      });
      process.exit(0);
    }

    // Create categories
    const categoriesToCreate = defaultCategories.map(cat => ({
      ...cat,
      createdBy: adminUser._id,
      updatedBy: adminUser._id
    }));

    const createdCategories = await Category.insertMany(categoriesToCreate);
    
    console.log(`Successfully created ${createdCategories.length} categories:`);
    createdCategories.forEach(cat => {
      console.log(`- ${cat.name}: ${cat.description}`);
    });

    console.log('\nCategories seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

// Run the seed function
seedCategories();
