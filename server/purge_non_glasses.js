const mongoose = require('mongoose');
const Product = require('./models/Product');

require('dotenv').config();

const allowedCategories = ['Sunglasses', 'Optical', 'Aviator', 'Wayfarer', 'Round'];

const run = async () => {
  try {
    const dbUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/security-glasses';
    await mongoose.connect(dbUri);

    const result = await Product.deleteMany({
      category: { $nin: allowedCategories }
    });

    console.log(`DB: ${dbUri}`);
    console.log(`Removed ${result.deletedCount} non-glasses products.`);
  } catch (err) {
    console.error('Failed to purge products:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
