const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const checkProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/secure_app');
        const count = await Product.countDocuments();
        const approved = await Product.countDocuments({ isApproved: true });
        const unapproved = await Product.countDocuments({ isApproved: false });
        const sold = await Product.countDocuments({ isSold: true });
        const available = await Product.countDocuments({ isApproved: true, isSold: false });

        console.log(`Total: ${count}`);
        console.log(`Approved: ${approved}`);
        console.log(`Unapproved: ${unapproved}`);
        console.log(`Sold: ${sold}`);
        console.log(`Available (Appr & !Sold): ${available}`);

        const products = await Product.find({ isApproved: true, isSold: false }).limit(5);
        console.log('Available Products Sample:');
        products.forEach(p => console.log(`- ${p.name} (${p.category})`));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkProducts();
