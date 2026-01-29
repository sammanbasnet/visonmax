const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./models/Order');

dotenv.config();

const checkOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/secure_app');
        const orders = await Order.find().populate('buyer', 'name email').sort({ createdAt: -1 }).limit(5);
        console.log(`Total Orders in DB: ${await Order.countDocuments()}`);
        console.log('Last 5 Orders:');
        orders.forEach(o => {
            console.log(`- ID: ${o._id}, Buyer: ${o.buyer?.name}, Total: ${o.totalAmount}, Status: ${o.status}`);
        });
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkOrders();
