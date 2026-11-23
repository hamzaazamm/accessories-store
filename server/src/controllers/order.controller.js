const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const BRANDING = require('../config/branding');

/**
 * Generate a unique, professional order number
 * Format: GD-YEAR-XXXXX
 */
const generateOrderNumber = () => {
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `GD-${year}-${randomChars}${timestamp}`;
};

/**
 * @desc    Create a new order with atomic stock decrement
 * @route   POST /api/orders
 * @access  Public (Guest or Authenticated)
 */
const createOrder = async (req, res, next) => {
  try {
    const { customer, items, paymentMethod = 'COD', deliveryNotes } = req.body;

    // Validate customer fields
    if (!customer || !customer.name || !customer.email || !customer.phone || !customer.address || !customer.city || !customer.postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required delivery details (name, email, phone, address, city, postal code)',
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must include at least one item',
      });
    }

    // Step 1: Validate stock & fetch official prices from database
    const orderItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const productId = item.productId || item.product || item.product?._id;
      const requestedQty = Number(item.quantity) || 1;

      if (!productId) {
        return res.status(400).json({ success: false, message: 'Invalid product item format' });
      }

      // Fetch fresh product data from DB
      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.name || productId}" is no longer available`,
        });
      }

      // Check stock
      if (product.stockQty < requestedQty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stockQty} left.`,
        });
      }

      // Calculate official price directly from database
      const verifiedPrice =
        product.salePrice !== null && product.salePrice < product.price
          ? product.salePrice
          : product.price;

      calculatedSubtotal += verifiedPrice * requestedQty;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: verifiedPrice,
        quantity: requestedQty,
        image: product.images[0] || '',
        SKU: product.SKU,
      });
    }

    // Calculate shipping fee based on store policy
    const shippingFee =
      calculatedSubtotal >= BRANDING.policies.freeShippingThreshold
        ? 0
        : BRANDING.policies.shippingFee;

    const discount = 0;
    const totalAmount = Number((calculatedSubtotal + shippingFee - discount).toFixed(2));

    // Step 2: Atomic stock deduction with rollback safety
    const updatedProducts = [];
    try {
      for (const item of orderItems) {
        const updated = await Product.findOneAndUpdate(
          { _id: item.product, stockQty: { $gte: item.quantity } },
          { $inc: { stockQty: -item.quantity } },
          { new: true }
        );

        if (!updated) {
          throw new Error(
            `Unable to reserve stock for ${item.name}. Another customer may have just ordered it.`
          );
        }
        updatedProducts.push({ id: item.product, qty: item.quantity });
      }
    } catch (stockError) {
      // Rollback already deducted items
      for (const roll of updatedProducts) {
        await Product.findByIdAndUpdate(roll.id, { $inc: { stockQty: roll.qty } });
      }
      return res.status(400).json({ success: false, message: stockError.message });
    }

    // Step 3: Create the order
    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      user: req.user ? req.user.id : null,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
        city: customer.city.trim(),
        postalCode: customer.postalCode.trim(),
        deliveryNotes: deliveryNotes || customer.deliveryNotes || '',
      },
      items: orderItems,
      subtotal: Number(calculatedSubtotal.toFixed(2)),
      shippingFee,
      discount,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Pending',
      orderStatus: 'Pending',
      trackingHistory: [
        {
          status: 'Pending',
          note: 'Order placed successfully. Waiting for store confirmation.',
          timestamp: new Date(),
        },
      ],
    });

    // Step 4: Clear user cart if authenticated
    if (req.user) {
      await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Track an order by Order Number and Phone Number
 * @route   GET /api/orders/track
 * @access  Public
 */
const trackOrder = async (req, res, next) => {
  try {
    const { orderNumber, phone } = req.query;

    if (!orderNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the Order Number to track your package.',
      });
    }

    const query = { orderNumber: orderNumber.trim().toUpperCase() };

    // If phone is provided, match phone for guest verification
    if (phone && phone.trim()) {
      query['customer.phone'] = new RegExp(phone.trim().replace(/[^0-9]/g, ''), 'i');
    }

    const order = await Order.findOne(query).select('-__v');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No order found matching the provided order number and phone number.',
      });
    }

    res.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        shippingFee: order.shippingFee,
        items: order.items,
        customer: {
          name: order.customer.name,
          city: order.customer.city,
          address: order.customer.address,
        },
        trackingHistory: order.trackingHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's past orders
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order details by orderNumber or ID
 * @route   GET /api/orders/:identifier
 * @access  Public / Private
 */
const getOrderById = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    let order;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(identifier);
    } else {
      order = await Order.findOne({ orderNumber: identifier.toUpperCase() });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  trackOrder,
  getMyOrders,
  getOrderById,
};
