/**
 * Database Seeder Script
 * Populates MongoDB Atlas with initial Categories, Brands, Products, Admin & Customer accounts,
 * sample realistic Orders and Reviews.
 *
 * Usage:
 *   node src/seed/seeder.js           (Seed data)
 *   node src/seed/seeder.js --destroy (Wipe collections)
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const { connectDB } = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Wishlist = require('../models/Wishlist');
const Cart = require('../models/Cart');

const { categoriesData, brandsData, productsData } = require('./seedData');

const seedDatabase = async () => {
  try {
    const isConnected = await connectDB();
    if (!isConnected) {
      console.error('❌ Cannot seed database: MongoDB connection failed.');
      process.exit(1);
    }

    console.log('🧹 Clearing existing collections...');
    await User.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();
    await Wishlist.deleteMany();
    await Cart.deleteMany();

    console.log('👤 Creating demo accounts...');
    // 1. Create Admin (configured via environment or generic fallback)
    const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'Admin@ChangeMe123!';
    const adminUser = await User.create({
      name: 'Gadget District Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      phone: '+1 (800) 423-4383',
      address: {
        street: '100 District Blvd, Suite 400',
        city: 'San Francisco',
        postalCode: '94107',
        country: 'United States',
      },
    });

    // 2. Create Sample Customer
    const sampleCustomer = await User.create({
      name: 'John Miller',
      email: 'john@example.com',
      password: 'Customer@123',
      role: 'user',
      phone: '+1 (555) 234-5678',
      address: {
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        postalCode: '97477',
        country: 'United States',
      },
    });

    console.log('🏷️  Seeding categories and brands...');
    const createdCategories = await Category.insertMany(categoriesData);
    const createdBrands = await Brand.insertMany(brandsData);

    // Create lookup map for category slugs
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });

    console.log('📦 Seeding products with realistic specs & compatibility...');
    const formattedProducts = productsData.map((prod) => {
      const catId = categoryMap[prod.categorySlug];
      const productCopy = { ...prod, category: catId };
      delete productCopy.categorySlug;
      return productCopy;
    });

    const createdProducts = await Product.insertMany(formattedProducts);
    console.log(`✅ Seeded ${createdProducts.length} premium products.`);

    console.log('⭐ Creating sample reviews and realistic orders for dashboard stats...');
    // Add sample review from customer
    const firstProduct = createdProducts[0];
    await Review.create({
      product: firstProduct._id,
      user: sampleCustomer._id,
      userName: sampleCustomer.name,
      rating: 5,
      title: 'Flawless craftsmanship!',
      comment: 'The Horween leather smells amazing and the MagSafe magnets are significantly stronger than Apple original cases. Fits the iPhone 16 Pro like a glove.',
      isVerifiedPurchase: true,
    });

    // Add 3 realistic initial orders so the Admin dashboard analytics are populated with real numbers
    await Order.create({
      orderNumber: 'GD-2026-A1092',
      user: sampleCustomer._id,
      customer: {
        name: sampleCustomer.name,
        email: sampleCustomer.email,
        phone: sampleCustomer.phone,
        address: sampleCustomer.address.street,
        city: sampleCustomer.address.city,
        postalCode: sampleCustomer.address.postalCode,
        deliveryNotes: 'Please ring the doorbell upon arrival.',
      },
      items: [
        {
          product: createdProducts[0]._id,
          name: createdProducts[0].name,
          price: createdProducts[0].salePrice || createdProducts[0].price,
          quantity: 1,
          image: createdProducts[0].images[0],
          SKU: createdProducts[0].SKU,
        },
        {
          product: createdProducts[2]._id,
          name: createdProducts[2].name,
          price: createdProducts[2].price,
          quantity: 2,
          image: createdProducts[2].images[0],
          SKU: createdProducts[2].SKU,
        },
      ],
      subtotal: (createdProducts[0].salePrice || createdProducts[0].price) + createdProducts[2].price * 2,
      shippingFee: 0,
      discount: 0,
      totalAmount: (createdProducts[0].salePrice || createdProducts[0].price) + createdProducts[2].price * 2,
      paymentMethod: 'COD',
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
      trackingHistory: [
        { status: 'Pending', note: 'Order placed.', timestamp: new Date(Date.now() - 86400000 * 3) },
        { status: 'Confirmed', note: 'Order verified.', timestamp: new Date(Date.now() - 86400000 * 2) },
        { status: 'Shipped', note: 'Dispatched via Express Courier.', timestamp: new Date(Date.now() - 86400000) },
        { status: 'Delivered', note: 'Delivered to recipient.', timestamp: new Date() },
      ],
    });

    await Order.create({
      orderNumber: 'GD-2026-B8841',
      user: null, // Guest checkout demo
      customer: {
        name: 'Sarah Jenkins',
        email: 'sarah.j@gmail.com',
        phone: '+1 (555) 987-6543',
        address: '42 Wallaby Way',
        city: 'Sydney',
        postalCode: '2000',
        deliveryNotes: 'Leave on porch if not home.',
      },
      items: [
        {
          product: createdProducts[4]._id,
          name: createdProducts[4].name,
          price: createdProducts[4].salePrice || createdProducts[4].price,
          quantity: 1,
          image: createdProducts[4].images[0],
          SKU: createdProducts[4].SKU,
        },
      ],
      subtotal: createdProducts[4].salePrice || createdProducts[4].price,
      shippingFee: 0,
      discount: 0,
      totalAmount: createdProducts[4].salePrice || createdProducts[4].price,
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      orderStatus: 'Processing',
      trackingHistory: [
        { status: 'Pending', note: 'Order placed by guest.', timestamp: new Date(Date.now() - 3600000 * 4) },
        { status: 'Processing', note: 'Order packed in warehouse.', timestamp: new Date() },
      ],
    });

    console.log('\n======================================================');
    console.log('🎉 [DATABASE SEEDING SUCCESSFUL]');
    console.log('======================================================');
    console.log('🔑 Admin Account:');
    console.log(`   Email:    ${adminEmail}`);
    console.log('   Password: [Configured via ADMIN_SEED_PASSWORD or default fallback]\n');
    console.log('👤 Demo Customer Account:');
    console.log('   Email:    john@example.com');
    console.log('   Password: Customer@123\n');
    console.log('📦 Total Categories: 10');
    console.log('🏷️  Total Brands:     8');
    console.log('📱 Total Products:   ' + createdProducts.length);
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();
    await Wishlist.deleteMany();
    await Cart.deleteMany();
    console.log('🗑️  All database collections cleared successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to destroy database collections:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '--destroy') {
  destroyData();
} else {
  seedDatabase();
}
