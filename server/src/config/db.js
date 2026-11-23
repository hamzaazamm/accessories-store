const mongoose = require('mongoose');

let isConnected = false;

/**
 * Connect to MongoDB Atlas
 * Handles connection, retries, and informative error messages
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ [Database Error]: MONGODB_URI is not defined in environment variables.');
    console.warn('⚠️  Please configure your MongoDB Atlas connection string in `server/.env`.');
    console.warn('📖 See README.md or the Atlas setup guide for step-by-step instructions.');
    return false;
  }

  // Prevent duplicate connections
  if (isConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log(`✅ [MongoDB Atlas Connected]: ${conn.connection.host}`);
    console.log(`📦 [Database Name]: ${conn.connection.name}`);

    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ [MongoDB Connection Error]:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  [MongoDB Disconnected]. Retrying connection...');
      isConnected = false;
    });

    return true;
  } catch (error) {
    isConnected = false;
    console.error('❌ [MongoDB Atlas Connection Failed]:', error.message);
    console.warn('\n📋 === MONGODB ATLAS SETUP CHECKLIST ===');
    console.warn('1. Visit https://cloud.mongodb.com and create a free M0 cluster.');
    console.warn('2. In Network Access: Add IP Address -> Select "Allow Access from Anywhere" (0.0.0.0/0).');
    console.warn('3. In Database Access: Add a Database User (e.g. "admin") with Read & Write privileges.');
    console.warn('4. In Clusters -> Connect -> Drivers (Node.js): Copy connection string.');
    console.warn('5. Replace <password> with your actual database user password.');
    console.warn('6. Put the URI into server/.env -> MONGODB_URI=...\n');
    return false;
  }
};

const getDBStatus = () => ({
  isConnected: mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host || null,
  name: mongoose.connection.name || null,
});

module.exports = { connectDB, getDBStatus };
