const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { authenticateToken, requireAdmin, requireStaffOrAdmin } = require('../middleware/auth');

// GET /api/sales - Get all sales with pagination (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      filter.saleDate = {};
      if (req.query.startDate) {
        filter.saleDate.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.saleDate.$lte = new Date(req.query.endDate);
      }
    }
    
    const sales = await Sale.find(filter)
      .populate('items.product', 'name barcode')
      .populate('createdBy', 'fullName')
      .skip(skip)
      .limit(limit)
      .sort({ saleDate: -1 });
    
    const total = await Sale.countDocuments(filter);
    
    res.json({
      sales,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalSales: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: 'Error fetching sales', error: error.message });
  }
});

// GET /api/sales/revenue/monthly - Get monthly revenue data (admin only)
router.get('/revenue/monthly', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    
    const monthlyRevenue = await Sale.aggregate([
      {
        $match: {
          saleDate: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1)
          },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$saleDate' },
            year: { $year: '$saleDate' }
          },
          totalRevenue: { $sum: '$totalAmount' },
          totalSales: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      },
      {
        $sort: { '_id.month': 1 }
      }
    ]);
    
    // Fill in missing months with zero revenue
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const result = months.map((month, index) => {
      const monthData = monthlyRevenue.find(item => item._id.month === index + 1);
      return {
        month,
        monthNumber: index + 1,
        totalRevenue: monthData ? monthData.totalRevenue : 0,
        totalSales: monthData ? monthData.totalSales : 0,
        averageOrderValue: monthData ? monthData.averageOrderValue : 0
      };
    });
    
    res.json({
      year,
      monthlyData: result,
      totalYearRevenue: result.reduce((sum, month) => sum + month.totalRevenue, 0),
      totalYearSales: result.reduce((sum, month) => sum + month.totalSales, 0)
    });
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    res.status(500).json({ message: 'Error fetching monthly revenue', error: error.message });
  }
});

// GET /api/sales/stats - Get sales statistics (admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    // Today's sales
    const todaySales = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startOfToday },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalSales: { $sum: 1 }
        }
      }
    ]);
    
    // This month's sales
    const monthSales = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startOfMonth },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalSales: { $sum: 1 }
        }
      }
    ]);
    
    // This year's sales
    const yearSales = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startOfYear },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalSales: { $sum: 1 }
        }
      }
    ]);
    
    // Top selling products
    const topProducts = await Sale.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          productName: '$product.name',
          totalQuantity: 1,
          totalRevenue: 1
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);
    
    res.json({
      today: {
        revenue: todaySales[0]?.totalRevenue || 0,
        sales: todaySales[0]?.totalSales || 0
      },
      thisMonth: {
        revenue: monthSales[0]?.totalRevenue || 0,
        sales: monthSales[0]?.totalSales || 0
      },
      thisYear: {
        revenue: yearSales[0]?.totalRevenue || 0,
        sales: yearSales[0]?.totalSales || 0
      },
      topProducts
    });
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    res.status(500).json({ message: 'Error fetching sales stats', error: error.message });
  }
});

// POST /api/sales - Create new sale (staff and admin)
router.post('/', authenticateToken, requireStaffOrAdmin, async (req, res) => {
  try {
    const { items, customer, paymentMethod, tax, discount, notes } = req.body;
    
    // Validate and calculate totals
    let subtotal = 0;
    const saleItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.productId}` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }
      
      const totalPrice = product.price * item.quantity;
      subtotal += totalPrice;
      
      saleItems.push({
        product: product._id,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice
      });
    }
    
    const taxAmount = tax || 0;
    const discountAmount = discount || 0;
    const totalAmount = subtotal + taxAmount - discountAmount;
    
    // Create sale
    const sale = new Sale({
      items: saleItems,
      subtotal,
      tax: taxAmount,
      discount: discountAmount,
      totalAmount,
      paymentMethod,
      customer: customer || {},
      notes: notes || '',
      createdBy: req.user._id
    });
    
    const savedSale = await sale.save();
    
    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }
    
    // Populate the saved sale for response
    const populatedSale = await Sale.findById(savedSale._id)
      .populate('items.product', 'name barcode')
      .populate('createdBy', 'fullName');
    
    res.status(201).json(populatedSale);
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(400).json({ message: 'Error creating sale', error: error.message });
  }
});

// GET /api/sales/:id - Get sale by ID (admin only)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('items.product', 'name barcode manufacturer')
      .populate('createdBy', 'fullName email');
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    res.json(sale);
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(500).json({ message: 'Error fetching sale', error: error.message });
  }
});

module.exports = router;
