const express = require('express');
const { updateDetails, updatePassword, getLogs, getAllLogs } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

const router = express.Router();

router.use(protect); // Protect all routes in this file

router.put('/updatedetails', [
    body('name').not().isEmpty().trim().escape().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], updateDetails);

router.put('/updatepassword', updatePassword);

// History Log
router.get('/logs', getLogs);
router.get('/admin/logs', authorize('admin'), getAllLogs);

module.exports = router;
