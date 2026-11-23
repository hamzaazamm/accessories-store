const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');

/**
 * @desc    Get complete real database analytics for Admin Dashboard
 * @route   GET /api/admin/dashboard
 * @access  Admin
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total counts
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });
    const processingOrders = await Order.countDocuments({
      orderStatus: { $in: ['Confirmed', 'Processing', 'Shipped', 'Out for Delivery'] },
    });
    const lowStockProducts = await Product.countDocuments({ stockQty: { $lte: 5 } });

    // 2. Total revenue from orders that are not cancelled
    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? Number(revenueAgg[0].totalRevenue.toFixed(2)) : 0;

    // 3. Recent 8 orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .select('orderNumber customer totalAmount orderStatus paymentStatus paymentMethod createdAt');

    // 4. Best-selling products (aggregated from actual orders)
    const bestSellingAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          SKU: { $first: '$items.SKU' },
          image: { $first: '$items.image' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    // 5. Category distribution count
    const categoryCounts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: '$categoryInfo.name',
          count: 1,
        },
      },
    ]);

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        pendingOrders,
        deliveredOrders,
        processingOrders,
        lowStockProducts,
        recentOrders,
        bestSellingProducts: bestSellingAgg,
        categoryCounts,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders with filtering and search
 * @route   GET /api/admin/orders
 * @access  Admin
 */
const getAdminOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.orderStatus = status;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { orderNumber: searchRegex },
        { 'customer.name': searchRegex },
        { 'customer.email': searchRegex },
        { 'customer.phone': searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status with tracking message
 * @route   PUT /api/admin/orders/:id/status
 * @access  Admin
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = [
      'Pending',
      'Confirmed',
      'Processing',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = status;

    // If order is delivered, update paymentStatus if COD
    if (status === 'Delivered' && order.paymentMethod === 'COD') {
      order.paymentStatus = 'Paid';
    }

    // If cancelling an order, replenish stock!
    if (status === 'Cancelled' && previousStatus !== 'Cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQty: item.quantity },
        });
      }
    }

    // Add entry to tracking history
    order.trackingHistory.push({
      status,
      note: note || `Order marked as ${status} by admin.`,
      timestamp: new Date(),
    });

    await order.save();

    res.json({
      success: true,
      message: `Order status successfully updated to "${status}".`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all customers with spending & order totals
 * @route   GET /api/admin/customers
 * @access  Admin
 */
const getAdminCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'user' })
      .select('name email phone address isActive createdAt')
      .sort({ createdAt: -1 });

    // Aggregate orders for each customer
    const customerListWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orderStats = await Order.aggregate([
          { $match: { user: customer._id, orderStatus: { $ne: 'Cancelled' } } },
          {
            $group: {
              _id: null,
              orderCount: { $sum: 1 },
              totalSpent: { $sum: '$totalAmount' },
            },
          },
        ]);

        return {
          ...customer.toObject(),
          totalOrders: orderStats.length > 0 ? orderStats[0].orderCount : 0,
          totalSpent: orderStats.length > 0 ? Number(orderStats[0].totalSpent.toFixed(2)) : 0,
        };
      })
    );

    res.json({
      success: true,
      count: customerListWithStats.length,
      customers: customerListWithStats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAdminOrders,
  updateOrderStatus,
  getAdminCustomers,
};
