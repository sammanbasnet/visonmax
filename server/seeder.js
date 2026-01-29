const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

const importData = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@thriftsecure.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecret123!';

        // Check if admin exists
        const adminExists = await User.findOne({ email: adminEmail });

        if (adminExists) {
            console.log('Admin user already exists - UPDATING PASSWORD');
            adminExists.password = adminPassword;
            await adminExists.save();
            console.log(`Password reset to: ${adminPassword}`);
            process.exit();
        }

        await User.create({
            name: 'System Admin',
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            mfaEnabled: false // Can enable later
        });

        console.log('Admin User Imported!');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany({ role: 'admin' });
        console.log('Admin Users Destroyed!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
