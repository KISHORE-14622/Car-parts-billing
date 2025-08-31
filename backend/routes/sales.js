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
    
    // Enhanced logging for debugging
    console.log('Sales POST request received:', {
      itemsCount: items?.length,
      paymentMethod: paymentMethod,
      user: req.user?.fullName,
      requestBody: JSON.stringify(req.body, null, 2)
    });
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('Validation error: Items array is required and must not be empty');
      return res.status(400).json({ 
        message: 'Items array is required and must contain at least one item',
        received: { items: items }
      });
    }
    
    if (!paymentMethod) {
      console.error('Validation error: Payment method is required');
      return res.status(400).json({ 
        message: 'Payment method is required',
        received: { paymentMethod }
      });
    }
    
    // Validate and calculate totals
    let subtotal = 0;
    const saleItems = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`Processing item ${i + 1}:`, item);
      
      // Handle both productId and product._id field names for flexibility
      const productId = item.productId || item.product?._id || item.product;
      
      if (!productId) {
        console.error(`Validation error: Product ID missing for item ${i + 1}`, item);
        return res.status(400).json({ 
          message: `Product ID is required for item ${i + 1}`,
          received: item
        });
      }
      
      if (!item.quantity || item.quantity <= 0) {
        console.error(`Validation error: Invalid quantity for item ${i + 1}`, item);
        return res.status(400).json({ 
          message: `Valid quantity is required for item ${i + 1}`,
          received: item
        });
      }
      
      const product = await Product.findById(productId);
      if (!product) {
        console.error(`Product not found: ${productId}`);
        return res.status(400).json({ 
          message: `Product not found: ${productId}`,
          productId: productId
        });
      }
      
      if (product.stock < item.quantity) {
        console.error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          product: product.name,
          available: product.stock,
          requested: item.quantity
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
      
      console.log(`Item ${i + 1} processed successfully:`, {
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: totalPrice
      });
    }
    
    const taxAmount = tax || 0;
    const discountAmount = discount || 0;
    const totalAmount = subtotal + taxAmount - discountAmount;
    
    console.log('Sale totals calculated:', {
      subtotal: subtotal,
      taxAmount: taxAmount,
      discountAmount: discountAmount,
      totalAmount: totalAmount
    });
    
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
    
    // Ensure saleNumber is generated before saving (additional safety check)
    if (!sale.saleNumber) {
      try {
        sale.saleNumber = await Sale.generateSaleNumber();
        console.log('Manually generated sale number:', sale.saleNumber);
      } catch (error) {
        console.error('Failed to generate sale number manually:', error);
        // Ultimate fallback
        sale.saleNumber = `SALE-${Date.now().toString().slice(-9)}`;
        console.log('Ultimate fallback sale number:', sale.saleNumber);
      }
    }
    
    console.log('About to save sale with data:', {
      saleNumber: sale.saleNumber,
      itemsCount: sale.items.length,
      totalAmount: sale.totalAmount,
      paymentMethod: sale.paymentMethod,
      createdBy: sale.createdBy
    });
    
    const savedSale = await sale.save();
    console.log('Sale saved successfully:', savedSale.saleNumber);
    
    // Update product stock
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const productId = item.productId || item.product?._id || item.product;
      
      await Product.findByIdAndUpdate(
        productId,
        { $inc: { stock: -item.quantity } }
      );
      console.log(`Stock updated for product ${productId}: -${item.quantity}`);
    }
    
    // Populate the saved sale for response
    const populatedSale = await Sale.findById(savedSale._id)
      .populate('items.product', 'name barcode')
      .populate('createdBy', 'fullName');
    
    console.log('Sale completed successfully:', {
      saleNumber: populatedSale.saleNumber,
      totalAmount: populatedSale.totalAmount,
      itemCount: populatedSale.items.length
    });
    
    res.status(201).json(populatedSale);
  } catch (error) {
    console.error('Error creating sale:', {
      message: error.message,
      stack: error.stack,
      requestBody: req.body
    });
    
    // Send more detailed error response
    res.status(400).json({ 
      message: 'Error creating sale', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/sales/export/csv - Export sales data as CSV (admin only)
router.get('/export/csv', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const filter = {};
    
    // Apply same filters as the main sales endpoint
    if (req.query.startDate || req.query.endDate) {
      filter.saleDate = {};
      if (req.query.startDate) {
        filter.saleDate.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.saleDate.$lte = new Date(req.query.endDate);
      }
    }
    
    // Fetch all sales without pagination for export
    const sales = await Sale.find(filter)
      .populate('items.product', 'name barcode manufacturer')
      .populate('createdBy', 'fullName email')
      .sort({ saleDate: -1 });
    
    // Generate CSV content
    const csvHeaders = [
      'Sale Number',
      'Sale Date',
      'Staff Member',
      'Staff Email',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Product Name',
      'Product Barcode',
      'Quantity',
      'Unit Price',
      'Line Total',
      'Payment Method',
      'Subtotal',
      'Tax',
      'Discount',
      'Total Amount',
      'Notes'
    ];
    
    let csvContent = csvHeaders.join(',') + '\n';
    
    // Process each sale
    sales.forEach(sale => {
      const saleDate = new Date(sale.saleDate).toLocaleDateString('en-US');
      const staffName = sale.createdBy?.fullName || 'Unknown';
      const staffEmail = sale.createdBy?.email || '';
      const customerName = sale.customer?.name || '';
      const customerEmail = sale.customer?.email || '';
      const customerPhone = sale.customer?.phone || '';
      const paymentMethod = sale.paymentMethod.replace('_', ' ').toUpperCase();
      const notes = (sale.notes || '').replace(/"/g, '""'); // Escape quotes in notes
      
      // Create a row for each item in the sale
      sale.items.forEach(item => {
        const productName = (item.product?.name || 'Unknown Product').replace(/"/g, '""');
        const productBarcode = item.product?.barcode || '';
        
        const row = [
          `"${sale.saleNumber}"`,
          `"${saleDate}"`,
          `"${staffName}"`,
          `"${staffEmail}"`,
          `"${customerName}"`,
          `"${customerEmail}"`,
          `"${customerPhone}"`,
          `"${productName}"`,
          `"${productBarcode}"`,
          item.quantity,
          item.unitPrice.toFixed(2),
          item.totalPrice.toFixed(2),
          `"${paymentMethod}"`,
          sale.subtotal.toFixed(2),
          sale.tax.toFixed(2),
          sale.discount.toFixed(2),
          sale.totalAmount.toFixed(2),
          `"${notes}"`
        ];
        
        csvContent += row.join(',') + '\n';
      });
    });
    
    // Set headers for file download
    const filename = `sales-export-${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting sales to CSV:', error);
    res.status(500).json({ message: 'Error exporting sales to CSV', error: error.message });
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
