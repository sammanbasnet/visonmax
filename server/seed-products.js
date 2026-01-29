/**
 * Seed sample products so the shop has something to display.
 * Run after seeding admin: npm run seed (then npm run seed:products)
 * Requires: MongoDB running, admin user already created (from .env ADMIN_EMAIL)
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const sampleProducts = [
    { name: 'Vintage Denim Jacket', description: 'Classic blue denim jacket, lightly worn. Size M.', price: 35, category: 'Clothing', condition: 'Good', size: 'M', quantity: 1 },
    { name: 'Leather Crossbody Bag', description: 'Brown leather crossbody, perfect for everyday.', price: 45, category: 'Accessories', condition: 'Like New', size: 'One Size', quantity: 1 },
    { name: 'Canvas Sneakers', description: 'White canvas low-tops, comfortable and clean.', price: 28, category: 'Shoes', condition: 'Good', size: '9', quantity: 1 },
    { name: 'Floral Midi Dress', description: 'Vintage-style floral print, perfect for spring.', price: 42, category: 'Clothing', condition: 'Like New', size: 'S', quantity: 1 },
    { name: 'Wool Scarf', description: 'Soft grey wool scarf, handmade.', price: 22, category: 'Accessories', condition: 'New with tags', size: 'One Size', quantity: 2 },
];

const run = async () => {
    try {
        let admin = await User.findOne({ $or: [{ role: 'admin' }, { email: process.env.ADMIN_EMAIL || 'admin@gmail.com' }] });
        if (!admin) {
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
            const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
            admin = await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
                mfaEnabled: false,
            });
            console.log('Created admin:', adminEmail, '/', adminPassword);
        }

        const existing = await Product.countDocuments();
        if (existing > 0 && process.argv[2] !== '-f') {
            console.log(`Products already exist (${existing}). Use: node seed-products.js -f to add more.`);
            process.exit(0);
        }

        const created = await Product.insertMany(
            sampleProducts.map(p => ({
                ...p,
                addedBy: admin._id,
                isApproved: true,
                isSold: false,
                image: 'no-photo.jpg',
            }))
        );
        console.log(`Seeded ${created.length} products. Refresh the home page to see them.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
