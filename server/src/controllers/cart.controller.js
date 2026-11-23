const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * @desc    Get current user's cart (with fresh prices and stock check)
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate({
      path: 'items.product',
      select: 'name slug price salePrice images stockQty SKU brand',
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Filter out deleted products or calculate current totals
    const validItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      if (item.product && item.product.stockQty > 0) {
        const currentPrice =
          item.product.salePrice !== null && item.product.salePrice < item.product.price
            ? item.product.salePrice
            : item.product.price;

        // Auto-adjust quantity if requested exceeds current stock
        const adjustedQty = Math.min(item.quantity, item.product.stockQty);

        validItems.push({
          product: item.product,
          quantity: adjustedQty,
          price: currentPrice,
          inStock: true,
          availableStock: item.product.stockQty,
        });

        subtotal += currentPrice * adjustedQty;
      }
    }

    res.json({
      success: true,
      items: validItems,
      subtotal: Number(subtotal.toFixed(2)),
      itemCount: validItems.reduce((acc, curr) => acc + curr.quantity, 0),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add item to cart or update quantity
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
    }

    if (product.stockQty < 1) {
      return res.status(400).json({ success: false, message: 'This item is currently out of stock' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const currentPrice =
      product.salePrice !== null && product.salePrice < product.price
        ? product.salePrice
        : product.price;

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].quantity + Number(quantity);
      if (newQty > product.stockQty) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${product.stockQty} items in stock.`,
        });
      }
      cart.items[itemIndex].quantity = newQty;
      cart.items[itemIndex].price = currentPrice;
    } else {
      const qtyToAdd = Math.min(Number(quantity), product.stockQty);
      cart.items.push({
        product: productId,
        quantity: qtyToAdd,
        price: currentPrice,
      });
    }

    await cart.save();
    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update item quantity in cart
 * @route   PUT /api/cart/:productId
 * @access  Private
 */
const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return removeFromCart(req, res, next);
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (quantity > product.stockQty) {
      return res.status(400).json({
        success: false,
        message: `Maximum stock available is ${product.stockQty}`,
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    item.quantity = Number(quantity);
    await cart.save();

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:productId
 * @access  Private
 */
const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear all items in cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ success: true, message: 'Cart cleared successfully', items: [], subtotal: 0 });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Sync guest cart items to user cart upon login
 * @route   POST /api/cart/sync
 * @access  Private
 */
const syncCart = async (req, res, next) => {
  try {
    const { items = [] } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    for (const guestItem of items) {
      const product = await Product.findById(guestItem.productId || guestItem.product?._id);
      if (product && product.isActive && product.stockQty > 0) {
        const itemIdx = cart.items.findIndex(
          (i) => i.product.toString() === product._id.toString()
        );

        const currentPrice =
          product.salePrice !== null && product.salePrice < product.price
            ? product.salePrice
            : product.price;

        if (itemIdx > -1) {
          cart.items[itemIdx].quantity = Math.min(
            cart.items[itemIdx].quantity + (guestItem.quantity || 1),
            product.stockQty
          );
        } else {
          cart.items.push({
            product: product._id,
            quantity: Math.min(guestItem.quantity || 1, product.stockQty),
            price: currentPrice,
          });
        }
      }
    }

    await cart.save();
    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
};
