const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const checkProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jerseyshop');
        const products = await Product.find().sort({ createdAt: -1 }).limit(5);
        console.log('Last 5 Products:');
        products.forEach(p => {
            console.log(`- Name: ${p.name}, Image Path: ${p.image}`);
        });
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkProducts();
