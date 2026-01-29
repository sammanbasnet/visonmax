const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const path = require('path');

dotenv.config();

const migrateProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jerseyshop');
        const products = await Product.find({ image: { $exists: true, $ne: null } });
        console.log(`Found ${products.length} products to check.`);

        let updatedCount = 0;
        for (const p of products) {
            // Check if image contains path separators
            if (p.image.includes('/') || p.image.includes('\\')) {
                const oldPath = p.image;
                const newName = path.basename(p.image);
                p.image = newName;
                await p.save();
                console.log(`Updated: ${p.name} (${oldPath} -> ${newName})`);
                updatedCount++;
            }
        }

        console.log(`Migration complete. Updated ${updatedCount} products.`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

migrateProducts();
