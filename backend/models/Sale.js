const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  }
});

const saleSchema = new mongoose.Schema({
  saleNumber: {
    type: String,
    unique: true,
    required: true
  },
  items: [saleItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'check'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  customer: {
    name: String,
    email: String,
    phone: String,
    address: String
  },
  notes: String,
  saleDate: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Static method to generate sale number (can be called manually if needed)
saleSchema.statics.generateSaleNumber = async function() {
  try {
    const lastSale = await this.findOne({}, {}, { sort: { 'createdAt': -1 } });
    let nextNumber = 1;
    
    if (lastSale && lastSale.saleNumber) {
      const match = lastSale.saleNumber.match(/SALE-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    } else {
      const count = await this.countDocuments();
      nextNumber = count + 1;
    }
    
    return `SALE-${String(nextNumber).padStart(6, '0')}`;
  } catch (error) {
    console.error('Error in generateSaleNumber:', error);
    const timestamp = Date.now();
    return `SALE-${String(timestamp).slice(-9)}`;
  }
};

// Generate sale number before saving
saleSchema.pre('save', async function(next) {
  if (this.isNew && !this.saleNumber) {
    try {
      // Use a more robust method to generate unique sale numbers
      // Get the current timestamp and a random component to avoid collisions
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      
      // Try to find the highest existing sale number to ensure uniqueness
      const lastSale = await mongoose.model('Sale').findOne({}, {}, { sort: { 'createdAt': -1 } });
      let nextNumber = 1;
      
      if (lastSale && lastSale.saleNumber) {
        // Extract number from existing sale number (format: SALE-XXXXXX)
        const match = lastSale.saleNumber.match(/SALE-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      } else {
        // Fallback: count all documents + 1
        const count = await mongoose.model('Sale').countDocuments();
        nextNumber = count + 1;
      }
      
      // Generate sale number with fallback for uniqueness
      let saleNumber = `SALE-${String(nextNumber).padStart(6, '0')}`;
      
      // Check if this sale number already exists (extra safety)
      const existingSale = await mongoose.model('Sale').findOne({ saleNumber });
      if (existingSale) {
        // If collision detected, use timestamp-based approach
        saleNumber = `SALE-${String(timestamp).slice(-6)}${String(random).padStart(3, '0')}`;
      }
      
      this.saleNumber = saleNumber;
      console.log(`Generated sale number: ${this.saleNumber}`);
    } catch (error) {
      console.error('Error generating sale number:', error);
      // Fallback: use timestamp-based number if all else fails
      const timestamp = Date.now();
      this.saleNumber = `SALE-${String(timestamp).slice(-9)}`;
      console.log(`Fallback sale number generated: ${this.saleNumber}`);
    }
  }
  next();
});

// Index for faster queries
saleSchema.index({ saleDate: -1 });
saleSchema.index({ saleNumber: 1 });
saleSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Sale', saleSchema);
