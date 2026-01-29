const express = require('express');
const {
    register,
    login,
    logout,
    getMe,
    getCaptcha,
    setupMFA,
    enableMFA,
    verifyLoginMFA
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/captcha', getCaptcha);
router.post('/register', register);
router.post('/login', login);
router.post('/login/verify-mfa', verifyLoginMFA);
router.get('/logout', logout);
router.get('/me', protect, getMe);

// MFA Routes
router.post('/mfa/setup', protect, setupMFA);
router.post('/mfa/enable', protect, enableMFA);

module.exports = router;
