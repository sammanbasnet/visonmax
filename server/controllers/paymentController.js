const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const logActivity = require('../utils/logger');


exports.createPaymentIntent = async (req, res, next) => {
    try {
        const { items } = req.body;

        let totalAmount = 0;
        const products_for_order = [];

        for (const item of items) {
            const product = await Product.findById(item.id);
            if (!product) continue;
            // Check if already sold or out of stock
            if (product.isSold || product.quantity <= 0) {
                return res.status(400).json({ success: false, error: `Product ${product.name} is out of stock` });
            }
            totalAmount += product.price;
            products_for_order.push(product);
        }

        if (totalAmount === 0) {
            return res.status(400).json({ success: false, error: 'No valid items to purchase' });
        }

        // Check for Simulation Mode (if no valid key is provided)
        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
            return res.status(200).json({
                success: true,
                clientSecret: `mock_secret_${Date.now()}`,
                amount: totalAmount,
                isSimulation: true
            });
        }

        // Create or get Stripe Customer
        let customerId = req.user.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: req.user.email,
                metadata: { userId: req.user.id }
            });
            customerId = customer.id;
            await User.findByIdAndUpdate(req.user.id, { stripeCustomerId: customerId });
        }

        // Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount * 100, // Stripe expects cents
            currency: 'usd',
            customer: customerId,
            setup_future_usage: 'off_session',
            metadata: {
                userId: req.user.id,
                productIds: products_for_order.map(p => p._id.toString()).join(',')
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            amount: totalAmount
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Top up wallet balance
// @route   POST /api/payment/top-up
// @access  Private
exports.topUpBalance = async (req, res, next) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, error: 'Invalid amount' });
        }

        const user = await User.findById(req.user.id);
        user.walletBalance += amount;
        await user.save();

        await logActivity(req.user.id, 'WALLET_TOPUP', `Topped up $${amount}. New balance: $${user.walletBalance}`, req);

        res.status(200).json({ success: true, balance: user.walletBalance });
    } catch (err) {
        next(err);
    }
};

// @desc    Pay using wallet balance
// @route   POST /api/payment/pay-with-balance
// @access  Private
exports.payWithBalance = async (req, res, next) => {
    try {
        const { items } = req.body;
        const user = await User.findById(req.user.id);

        let totalAmount = 0;
        const products_for_order = [];

        for (const item of items) {
            const product = await Product.findById(item.id);
            if (!product || product.isSold || product.quantity <= 0) {
                return res.status(400).json({ success: false, error: `Product ${product?.name || 'unknown'} is unavailable` });
            }
            totalAmount += product.price;
            products_for_order.push(product);
        }

        if (user.walletBalance < totalAmount) {
            return res.status(400).json({ success: false, error: 'Insufficient balance' });
        }

        // Deduct balance
        user.walletBalance -= totalAmount;
        await user.save();

        // Process order
        const orderItems = [];
        for (const product of products_for_order) {
            product.quantity = Math.max(0, product.quantity - 1);
            if (product.quantity === 0) product.isSold = true;
            await product.save();
            orderItems.push({ product: product._id, price: product.price });
        }

        const order = await Order.create({
            buyer: req.user.id,
            items: orderItems,
            totalAmount,
            status: 'Completed',
            paymentIntentId: 'wallet_' + Date.now()
        });

        await logActivity(req.user.id, 'ORDER_PLACED_WALLET', `Order #${order._id} paid with wallet. Amount: $${totalAmount}`, req);

        res.status(201).json({ success: true, data: order, balance: user.walletBalance });
    } catch (err) {
        next(err);
    }
};

// @desc    Initiate eSewa Payment
// @route   POST /api/payment/initiate-esewa
// @access  Private
exports.initiateEsewa = async (req, res, next) => {
    try {
        const { items } = req.body;
        let totalAmount = 0;
        const productIds = [];

        for (const item of items) {
            const product = await Product.findById(item.id);
            if (product && !product.isSold && product.quantity > 0) {
                totalAmount += product.price;
                productIds.push(product._id.toString());
            }
        }

        if (totalAmount === 0) {
            return res.status(400).json({ success: false, error: 'No valid items' });
        }

        const transactionUuid = `${Date.now()}-${req.user.id}`;
        const productCode = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
        const secretKey = process.env.ESEWA_SECRET_KEY || '8g8M89dg8748qDSY'; // Default dummy key for testing

        // eSewa v2 is VERY sensitive to the total_amount format.
        // If it's 100, use "100". If it's 100.5, use "100.5". 
        // We'll use a string representation of the amount to be safe.
        const formattedAmount = totalAmount.toString();

        // Combined string for signature: "total_amount=100,transaction_uuid=123,product_code=EPAYTEST"
        const signatureString = `total_amount=${formattedAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;

        const hash = crypto.createHmac('sha256', secretKey)
            .update(signatureString)
            .digest('base64');

        const esewaData = {
            amount: totalAmount,
            tax_amount: 0,
            total_amount: totalAmount,
            transaction_uuid: transactionUuid,
            product_code: productCode,
            product_service_charge: 0,
            product_delivery_charge: 0,
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success`,
            failure_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-failure`,
            signed_field_names: "total_amount,transaction_uuid,product_code",
            signature: hash
        };

        // Temporarily store the metadata for verification
        // In a real app, you might save a pending order
        res.status(200).json({
            success: true,
            esewaData,
            productIds: productIds.join(',')
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Verify eSewa Payment
// @route   POST /api/payment/verify-esewa
// @access  Private
exports.verifyEsewa = async (req, res, next) => {
    try {
        const { encodedData, productIds } = req.body;

        // Decode the data returned by eSewa
        const decodedString = Buffer.from(encodedData, 'base64').toString('utf-8');
        const data = JSON.parse(decodedString);

        // data contains status, signature, transaction_uuid, total_amount, etc.
        if (data.status !== 'COMPLETE') {
            return res.status(400).json({ success: false, error: 'Payment not completed' });
        }

        // Integrity Check: Verify Signature from eSewa Response
        const secretKey = process.env.ESEWA_SECRET_KEY || '8g8M89dg8748qDSY';

        // eSewa returns the exactly same string format it expects
        const signatureString = `total_amount=${data.total_amount},transaction_uuid=${data.transaction_uuid},product_code=${data.product_code}`;
        const expectedHash = crypto.createHmac('sha256', secretKey)
            .update(signatureString)
            .digest('base64');

        if (data.signature !== expectedHash) {
            await logActivity(req.user.id, 'SECURITY_ALERT', 'eSewa Signature Mismatch', req);
            return res.status(400).json({ success: false, error: 'Security verification failed' });
        }

        // Process the order
        const requestedIds = productIds.split(',');
        let totalAmount = 0;
        const orderItems = [];

        for (const id of requestedIds) {
            const product = await Product.findById(id);
            if (product) {
                product.quantity = Math.max(0, product.quantity - 1);
                if (product.quantity === 0) product.isSold = true;
                await product.save();
                totalAmount += product.price;
                orderItems.push({ product: product._id, price: product.price });
            }
        }

        const order = await Order.create({
            buyer: req.user.id,
            items: orderItems,
            totalAmount,
            status: 'Completed',
            paymentIntentId: 'esewa_' + data.transaction_uuid
        });

        await logActivity(req.user.id, 'ORDER_PLACED_ESEWA', `Order #${order._id} paid with eSewa.`, req);

        res.status(201).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};

// @desc    Confirm Order (Post-Payment)
// @route   POST /api/payment/confirm-order
// @access  Private
exports.confirmOrder = async (req, res, next) => {
    try {
        const { paymentIntentId, items } = req.body;

        // Simulation mode verification
        if (paymentIntentId.startsWith('mock_')) {
            // In simulation, we assume integrity for demo purposes
        } else {
            // Retrieve intent to verify status and integrity
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

            if (paymentIntent.status !== 'succeeded') {
                await logActivity(req.user.id, 'PAYMENT_FAILED', `Payment confirmation failed for Intent ${paymentIntentId}`, req);
                return res.status(400).json({ success: false, error: 'Payment not successful' });
            }

            // Integrity Check: Ensure buyer matches the account that paid
            if (paymentIntent.metadata.userId !== req.user.id.toString()) {
                await logActivity(req.user.id, 'SECURITY_ALERT', 'Payment metadata mismatch - Potential fraud attempt', req);
                return res.status(403).json({ success: false, error: 'Payment authorization mismatch' });
            }

            // Integrity Check: Ensure items match the pre-authorized intent
            const authorizedIds = paymentIntent.metadata.productIds.split(',');
            const requestedIds = items.map(i => i.id.toString());
            const isMatch = requestedIds.every(id => authorizedIds.includes(id)) && authorizedIds.length === requestedIds.length;

            if (!isMatch) {
                await logActivity(req.user.id, 'SECURITY_ALERT', 'Order content mismatch - Potential tampering', req);
                return res.status(400).json({ success: false, error: 'Order integrity check failed' });
            }
        }

        // Verify items again and mark as sold
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.id);
            if (product) {
                // Decrement quantity
                product.quantity = Math.max(0, product.quantity - 1);

                // Mark as sold ONLY if quantity reaches 0
                if (product.quantity === 0) {
                    product.isSold = true;
                }

                await product.save();
                totalAmount += product.price;
                orderItems.push({
                    product: product._id,
                    price: product.price
                });
            }
        }

        const order = await Order.create({
            buyer: req.user.id,
            items: orderItems,
            totalAmount,
            status: 'Completed',
            paymentIntentId
        });

        await logActivity(req.user.id, 'ORDER_PLACED', `Order #${order._id} placed successfully. Amount: $${totalAmount}`, req);

        res.status(201).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};
