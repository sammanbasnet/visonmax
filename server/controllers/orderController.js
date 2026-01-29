const Order = require('../models/Order');
const PDFDocument = require('pdfkit');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const logActivity = require('../utils/logger');


exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ buyer: req.user.id })
            .populate('items.product', 'name price')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private (Admin)
exports.getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find()
            .populate('buyer', 'name email')
            .populate('items.product', 'name price')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get orders for products added by the seller
// @route   GET /api/orders/seller/myorders
// @access  Private (Seller/Admin)
exports.getSellerOrders = async (req, res, next) => {
    try {
        // Find all orders where at least one item's product was added by this seller
        const orders = await Order.find()
            .populate('buyer', 'name email')
            .populate({
                path: 'items.product',
                select: 'name price addedBy image'
            })
            .sort('-createdAt');

        const sellerId = req.user.id.toString();

        const filteredOrders = orders.filter(order => {
            return order.items.some(item =>
                item.product && item.product.addedBy && item.product.addedBy.toString() === sellerId
            );
        }).map(order => {
            const myItems = order.items.filter(item =>
                item.product && item.product.addedBy && item.product.addedBy.toString() === sellerId
            );

            const sellerTotal = myItems.reduce((acc, item) => acc + (item.price || 0), 0);

            // Convert to plain object manually to ensure we can add fields
            const orderObj = order.toObject();
            return {
                ...orderObj,
                items: myItems,
                sellerTotal
            };
        });

        res.status(200).json({
            success: true,
            count: filteredOrders.length,
            data: filteredOrders
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin)
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        order.status = req.body.status;
        await order.save();

        await logActivity(req.user.id, 'ORDER_STATUS_UPDATE', `Order #${order._id} status updated to ${req.body.status}`, req);

        res.status(200).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};

// @desc    Request Refund
// @route   POST /api/orders/:id/request-refund
// @access  Private (Buyer)
exports.requestRefund = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        // Check ownership
        if (order.buyer.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }
        if (order.status === 'Refunded' || order.refundStatus !== 'None') {
            return res.status(400).json({ success: false, error: 'Refund already requested or processed' });
        }
        order.refundStatus = 'Requested';
        order.disputeReason = reason;
        await order.save();

        await logActivity(req.user.id, 'REFUND_REQUESTED', `Refund requested for Order #${order._id}. Reason: ${reason}`, req);

        res.status(200).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};

// @desc    Reject Refund
// @route   PUT /api/orders/:id/refund/reject
// @access  Private (Admin)
exports.rejectRefund = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        order.refundStatus = 'Rejected';
        await order.save();

        await logActivity(req.user.id, 'REFUND_REJECTED', `Refund rejected for Order #${order._id}`, req);

        res.status(200).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};

// @desc    Refund order (Approve Refund)
// @route   POST /api/orders/:id/refund
// @access  Private (Admin)
exports.refundOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        if (order.status === 'Refunded') {
            return res.status(400).json({ success: false, error: 'Order already refunded' });
        }

        // Process refund with Stripe
        const refund = await stripe.refunds.create({
            payment_intent: order.paymentIntentId,
        });

        if (refund.status === 'succeeded' || refund.status === 'pending') {
            order.status = 'Refunded';
            order.refundStatus = 'Approved';
            await order.save();

            await logActivity(req.user.id, 'REFUND_APPROVED', `Refund approved for Order #${order._id}`, req);

            res.status(200).json({ success: true, data: order });
        } else {
            await logActivity(req.user.id, 'PAYMENT_FAILED', `Refund processing failed for Order #${order._id} with Stripe`, req);
            res.status(400).json({ success: false, error: 'Refund failed with Stripe' });
        }

    } catch (err) {
        next(err);
    }
};

// @desc    Generate Invoice PDF
// @route   GET /api/orders/:id/invoice
// @access  Private
exports.getInvoice = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('buyer', 'name email').populate('items.product', 'name price');

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        // Check ownership or admin
        if (order.buyer._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const doc = new PDFDocument();
        const filename = `invoice-${order._id}.pdf`;

        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // Header
        doc.fontSize(25).text('ThriftSecure Invoice', { align: 'center' });
        doc.moveDown();

        // Order Details
        doc.fontSize(12).text(`Order ID: ${order._id}`);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
        doc.text(`Status: ${order.status}`);
        doc.moveDown();

        // Customer
        doc.text(`Customer: ${order.buyer.name} (${order.buyer.email})`);
        doc.moveDown();
        doc.text('---------------------------------------------------------');
        doc.moveDown();

        // Items
        doc.fontSize(14).text('Items Purchased:');
        doc.moveDown();

        order.items.forEach(item => {
            doc.fontSize(12).text(`${item.product.name} - $${item.price}`);
        });

        doc.moveDown();
        doc.text('---------------------------------------------------------');
        doc.fontSize(16).text(`Total Amount: $${order.totalAmount}`, { bold: true });

        // Footer
        doc.moveDown(2);
        doc.fontSize(10).text('Thank you for shopping securely with ThriftSecure!', { align: 'center' });

        doc.end();

    } catch (err) {
        next(err);
    }
};
