const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/secure_app');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const orders = await mongoose.connection.db.collection('orders').find().toArray();
        console.log(`Total Orders: ${orders.length}`);
        if (orders.length > 0) {
            console.log('Last Order:', orders[orders.length - 1]);
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDB();
