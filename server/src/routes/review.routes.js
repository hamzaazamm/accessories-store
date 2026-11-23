const express = require('express');
const router = express.Router();
const { getProductReviews, createReview } = require('../controllers/review.controller');
const { protect } = require('../middleware/auth');

router.get('/:productId', getProductReviews);
router.post('/:productId', protect, createReview);

module.exports = router;
