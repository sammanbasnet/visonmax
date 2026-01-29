const express = require('express');
const { createPaymentIntent, confirmOrder, topUpBalance, payWithBalance, initiateEsewa, verifyEsewa } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm-order', protect, confirmOrder);
router.post('/top-up', protect, topUpBalance);
router.post('/pay-with-balance', protect, payWithBalance);
router.post('/initiate-esewa', protect, initiateEsewa);
router.post('/verify-esewa', protect, verifyEsewa);

module.exports = router;
