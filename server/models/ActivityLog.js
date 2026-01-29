const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'LOGIN',
            'LOGOUT',
            'REGISTER',
            'UPDATE_PROFILE',
            'CHANGE_PASSWORD',
            'ENABLE_MFA',
            'CREATE_PRODUCT',
            'APPROVE_PRODUCT',
            'ORDER_PLACED',
            'PAYMENT',
            'PAYMENT_FAILED',
            'REFUND_REQUESTED',
            'REFUND_APPROVED',
            'REFUND_REJECTED',
            'ORDER_STATUS_UPDATE'
        ]
    },
    details: {
        type: String
    },
    ip: {
        type: String
    },
    userAgent: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
