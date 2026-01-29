const express = require('express');
const { getMyOrders, getAllOrders, getSellerOrders, refundOrder, getInvoice, requestRefund, updateOrderStatus, rejectRefund } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/myorders', getMyOrders);
router.get('/seller/myorders', authorize('seller', 'admin'), getSellerOrders);
router.get('/:id/invoice', getInvoice);
router.post('/:id/request-refund', requestRefund);

// Admin routes
router.get('/', authorize('admin'), getAllOrders);
router.post('/:id/refund', authorize('admin'), refundOrder);
router.put('/:id/status', authorize('admin'), updateOrderStatus);
router.put('/:id/refund/reject', authorize('admin'), rejectRefund);

module.exports = router;
