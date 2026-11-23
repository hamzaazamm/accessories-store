const Product = require('../models/Product');
const Category = require('../models/Category');

/**
 * @desc    Get all products with search, filter, sort & pagination
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      featured,
      bestSeller,
      trending,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isActive: true };

    // Text search across name, brand, SKU, description
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { SKU: searchRegex },
        { description: searchRegex },
      ];
    }

    // Category filter (handles slug or ObjectId)
    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const catDoc = await Category.findOne({ slug: category });
        if (catDoc) {
          query.category = catDoc._id;
        }
      }
    }

    // Brand filter
    if (brand) {
      query.brand = new RegExp(`^${brand}$`, 'i');
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') query.price.$lte = Number(maxPrice);
    }

    // In stock filter
    if (inStock === 'true' || inStock === true) {
      query.stockQty = { $gt: 0 };
    }

    // Tag filters
    if (featured === 'true') query.isFeatured = true;
    if (bestSeller === 'true') query.isBestSeller = true;
    if (trending === 'true') query.isTrending = true;

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'price-asc') sortOptions = { price: 1 };
    else if (sort === 'price-desc') sortOptions = { price: -1 };
    else if (sort === 'rating') sortOptions = { rating: -1, numReviews: -1 };
    else if (sort === 'popular') sortOptions = { isBestSeller: -1, numReviews: -1 };
    else if (sort === 'newest') sortOptions = { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug icon')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by slug or ID
 * @route   GET /api/products/:identifier
 * @access  Public
 */
const getProduct = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    let product;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(identifier).populate('category', 'name slug icon');
    } else {
      product = await Product.findOne({ slug: identifier, isActive: true }).populate(
        'category',
        'name slug icon'
      );
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get related products
 * @route   GET /api/products/:id/related
 * @access  Public
 */
const getRelatedProducts = async (req, res, next) => {
  try {
    const current = await Product.findById(req.params.id);
    if (!current) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const related = await Product.find({
      _id: { $ne: current._id },
      isActive: true,
      $or: [{ category: current.category }, { brand: current.brand }],
    })
      .populate('category', 'name slug')
      .limit(4);

    res.json({ success: true, products: related });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check device compatibility for a product
 * @route   GET /api/products/:id/check-compatibility
 * @access  Public
 */
const checkCompatibility = async (req, res, next) => {
  try {
    const { device } = req.query;
    if (!device || !device.trim()) {
      return res.status(400).json({ success: false, message: 'Please specify a device model name' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const cleanInput = device.trim().toLowerCase();
    const isCompatible = product.compatibility.some((model) =>
      model.toLowerCase().includes(cleanInput) || cleanInput.includes(model.toLowerCase())
    );

    res.json({
      success: true,
      device: device.trim(),
      productName: product.name,
      isCompatible,
      compatibleModels: product.compatibility,
      message: isCompatible
        ? `Yes! This accessory is fully compatible with ${device.trim()}.`
        : `This accessory may not be officially certified for ${device.trim()}. Please check the supported devices list.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a product
 * @route   POST /api/products
 * @access  Admin
 */
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      brand,
      category,
      SKU,
      price,
      salePrice,
      images,
      stockQty,
      compatibility,
      warranty,
      specifications,
      isFeatured,
      isBestSeller,
      isTrending,
    } = req.body;

    const slug =
      req.body.slug ||
      `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${Date.now().toString().slice(-4)}`;

    const product = await Product.create({
      name,
      slug,
      description,
      brand,
      category,
      SKU: SKU.toUpperCase(),
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : null,
      images: Array.isArray(images) ? images : [images],
      stockQty: Number(stockQty) || 0,
      compatibility: Array.isArray(compatibility) ? compatibility : [],
      warranty: warranty || '12 Months Official Warranty',
      specifications: specifications || {},
      isFeatured: Boolean(isFeatured),
      isBestSeller: Boolean(isBestSeller),
      isTrending: Boolean(isTrending),
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Admin
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Admin
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  getRelatedProducts,
  checkCompatibility,
  createProduct,
  updateProduct,
  deleteProduct,
};
