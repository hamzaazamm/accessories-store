const express = require('express');
const router = express.Router();
const { getBrands, createBrand, deleteBrand } = require('../controllers/brand.controller');
const { protect, admin } = require('../middleware/auth');

router.get('/', getBrands);
router.post('/', protect, admin, createBrand);
router.delete('/:id', protect, admin, deleteBrand);

module.exports = router;
