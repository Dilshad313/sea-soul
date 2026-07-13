const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // ✅ Use MongoDB Atlas URI
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not defined in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📦 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;