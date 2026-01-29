const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { validationResult } = require('express-validator');
const logActivity = require('../utils/logger');


exports.updateDetails = async (req, res, next) => {
    try {
        // Express Validator Results
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const fieldsToUpdate = {
            name: req.body.name,
            email: req.body.email
        };

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        // Log Change
        await logActivity(req.user.id, 'UPDATE_PROFILE', 'Updated name/email', req);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update password
// @route   PUT /api/users/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        if (!(await user.matchPassword(req.body.currentPassword))) {
            return res.status(401).json({ success: false, error: 'Incorrect current password' });
        }

        user.password = req.body.newPassword;
        await user.save();

        // Log Change
        await logActivity(req.user.id, 'CHANGE_PASSWORD', 'Password changed successfully', req);

        res.status(200).json({ success: true, data: user });

    } catch (err) {
        next(err);
    }
};

// @desc    Get user activity logs
// @route   GET /api/users/logs
// @access  Private
exports.getLogs = async (req, res, next) => {
    try {
        const logs = await ActivityLog.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            data: logs
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all activity logs (Admin)
// @route   GET /api/users/admin/logs
// @access  Private (Admin)
exports.getAllLogs = async (req, res, next) => {
    try {
        const logs = await ActivityLog.find()
            .populate('user', 'name email role')
            .sort({ createdAt: -1 })
            .limit(100);

        res.status(200).json({
            success: true,
            data: logs
        });
    } catch (err) {
        next(err);
    }
};
