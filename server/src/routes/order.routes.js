const express = require('express');
const router = express.Router();
const {
  createOrder,
  trackOrder,
  getMyOrders,
  getOrderById,
} = require('../controllers/order.controller');
const { protect, optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, createOrder);
router.get('/track', trackOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:identifier', getOrderById);

module.exports = router;
