const express = require('express');
const {
    getProducts,
    getProduct,
    createProduct,
    deleteProduct,
    approveProduct,
    getUnapprovedProducts,
    getMyProducts,
    getAllApprovedProducts
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes
router.post('/', protect, authorize('admin', 'seller'), upload.single('image'), createProduct);
router.get('/seller/myproducts', protect, authorize('admin', 'seller'), getMyProducts);
router.delete('/:id', protect, authorize('admin', 'seller'), deleteProduct);

// Admin only routes
router.put('/:id/approve', protect, authorize('admin'), approveProduct);
router.get('/admin/unapproved', protect, authorize('admin'), getUnapprovedProducts);
router.get('/admin/approved', protect, authorize('admin'), getAllApprovedProducts);

module.exports = router;
