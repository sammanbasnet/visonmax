const crypto = require('crypto');

const csrfProtection = (req, res, next) => {
    
    const excludedRoutes = ['/api/payment/webhook'];
    if (excludedRoutes.includes(req.path)) return next();

    const COOKIE_NAME = 'XSRF-TOKEN-V2';

    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
        const token = (req.cookies && req.cookies[COOKIE_NAME]) ? req.cookies[COOKIE_NAME] : crypto.randomBytes(32).toString('hex');
        res.cookie(COOKIE_NAME, token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
        return next();
    }

    const tokenFromHeader = req.get('X-XSRF-TOKEN');
    const tokenFromCookie = req.cookies ? req.cookies[COOKIE_NAME] : null;

    if (!tokenFromCookie || !tokenFromHeader || tokenFromCookie !== tokenFromHeader) {
        console.error('CSRF Validation Failed:', {
            cookie: !!tokenFromCookie,
            header: !!tokenFromHeader,
            match: tokenFromCookie === tokenFromHeader
        });
        return res.status(403).json({ success: false, error: 'CSRF Token Validation Failed - Invalid or Missing Token' });
    }

    next();
};

module.exports = csrfProtection;
