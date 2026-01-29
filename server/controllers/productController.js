const Product = require('../models/Product');
const path = require('path');


exports.getProducts = async (req, res, next) => {
    try {
        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit'];

        // Loop over removeFields and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query string
        let queryStr = JSON.stringify(reqQuery);

        // Create operators ($gt, $gte, etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        // Parse into JSON
        let queryObj = JSON.parse(queryStr);

        // Only show approved products to public
        queryObj.isApproved = true;
        // Only show eyewear categories
        queryObj.category = {
            $in: ['Sunglasses', 'Optical', 'Aviator', 'Wayfarer', 'Round']
        };
        // Keep sold products visible, but marked as sold in UI
        // queryObj.isSold = false;

        // Finding resource
        query = Product.find(queryObj).populate('addedBy', 'name');

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Executing query
        const products = await query;

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).populate('addedBy', 'name');

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin/Seller)
exports.createProduct = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.addedBy = req.user.id;

        // Multi-part form data in req.body might need simple parsing if using some libraries but multer handles it.
        // req.file contains the image info

        if (req.file) {
            req.body.image = path.basename(req.file.path);
        }

        // Auto-approve if admin, otherwise false
        req.body.isApproved = req.user.role === 'admin';

        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            data: product,
            message: req.user.role === 'admin' ? 'Product created' : 'Product submitted for approval'
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin/Seller)
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        // Make sure user is product owner (if we want that check)
        // For now, let's allow any authorized user (assuming admin for now) or check ownership
        if (product.addedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'User not authorized to delete this product' });
        }

        await product.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Approve a product
// @route   PUT /api/products/:id/approve
// @access  Private (Admin)
exports.approveProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        product.isApproved = true;
        await product.save();

        res.status(200).json({ success: true, data: product });
    } catch (err) {
        next(err);
    }
};

// @desc    Get unapproved products
// @route   GET /api/products/admin/unapproved
// @access  Private (Admin)
exports.getUnapprovedProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ isApproved: false }).populate('addedBy', 'name');

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (err) {
        next(err);
    }
};
// @desc    Get all approved products (Admin)
// @route   GET /api/products/admin/approved
// @access  Private (Admin)
exports.getAllApprovedProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ isApproved: true }).populate('addedBy', 'name');

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get logged in user's products
// @route   GET /api/products/seller/myproducts
// @access  Private (Seller/Admin)
exports.getMyProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ addedBy: req.user.id });

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (err) {
        next(err);
    }
};
