const ActivityLog = require('../models/ActivityLog');

/**
 * Log user activity
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Action type from ActivityLog enum
 * @param {string} details - Additional details about the action
 * @param {object} req - Express request object to capture IP and User Agent
 */
const logActivity = async (userId, action, details, req) => {
    try {
        await ActivityLog.create({
            user: userId,
            action,
            details,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent']
        });
    } catch (err) {
        console.error('Failed to create activity log', err);
        // Don't block the main flow if logging fails
    }
};

module.exports = logActivity;
