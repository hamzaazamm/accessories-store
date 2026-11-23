const Brand = require('../models/Brand');

// @desc    Get all active brands
// @route   GET /api/brands
// @access  Public
const getBrands = async (req, res, next) => {
  try {
    const brands = await Brand.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, count: brands.length, brands });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a brand
// @route   POST /api/brands
// @access  Admin
const createBrand = async (req, res, next) => {
  try {
    const { name, description, logo } = req.body;
    const slug = req.body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const brand = await Brand.create({
      name,
      slug,
      description: description || '',
      logo: logo || '',
    });

    res.status(201).json({ success: true, brand });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete brand
// @route   DELETE /api/brands/:id
// @access  Admin
const deleteBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }
    res.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBrands, createBrand, deleteBrand };
