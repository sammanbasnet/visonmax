require('dotenv').config();
const connectDB = require('./config/db');
const Order = require('./models/Order');

const run = async () => {
    await connectDB();

    const orders = await Order.find()
        .populate({
            path: 'items.product',
            select: 'addedBy'
        });

    let updatedOrders = 0;
    let updatedItems = 0;

    for (const order of orders) {
        let changed = false;

        order.items.forEach((item) => {
            if (!item.seller && item.product && item.product.addedBy) {
                item.seller = item.product.addedBy;
                updatedItems += 1;
                changed = true;
            }
        });

        if (changed) {
            order.markModified('items');
            await order.save();
            updatedOrders += 1;
        }
    }

    console.log(`Backfill complete. Orders updated: ${updatedOrders}, items updated: ${updatedItems}`);
    process.exit(0);
};

run().catch((err) => {
    console.error('Backfill failed:', err);
    process.exit(1);
});
