const mongoose = require('mongoose');
const config = require('config');

// Use environment variable first, then fallback to config
const db = process.env.MONGO_URI || (config.has('mongoURI') ? config.get('mongoURI') : 'mongodb://localhost:27017/donation-app');

const connectDB = async () => {
  try {
    // Add this line before connecting to MongoDB
    mongoose.set('strictQuery', false);
    await mongoose.connect(db);
    console.log('MongoDB Connected...');
    return true;
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    console.log('Server will continue running without database connection.');
    return false;
  }
};

module.exports = connectDB;