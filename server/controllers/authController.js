const User = require('../models/User');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const svgCaptcha = require('svg-captcha');
const crypto = require('crypto');
const logActivity = require('../utils/logger');


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h' // Short expiration
    });
};

// Send final auth token (HttpOnly Cookie)
const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id);

    const options = {
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' // CSRF Protection
    };

    res.status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                mfaEnabled: user.mfaEnabled
            }
        });
};

// @desc    Get CAPTCHA
// @route   GET /api/auth/captcha
// @access  Public
exports.getCaptcha = (req, res) => {
    const captcha = svgCaptcha.create({
        size: 5,
        noise: 2,
        color: true,
        background: '#cc9966'
    });

    // Hash the captcha text to verify later without session
    const hash = crypto.createHmac('sha256', process.env.JWT_SECRET)
        .update(captcha.text.toLowerCase())
        .digest('hex');

    res.status(200)
        .cookie('captchaHash', hash, { httpOnly: true, maxAge: 10 * 60 * 1000 }) // 10 mins
        .type('svg')
        .send(captcha.data);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        if (!password || password.length < 8) {
            return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, error: 'Email already exists' });
        }

        let userRole = 'user';
        if (role === 'seller') userRole = 'seller';

        const user = await User.create({
            name,
            email,
            password,
            role: userRole
        });

        await logActivity(user._id, 'REGISTER', 'User registered', req);

        // Registration doesn't strictly need captcha, but login does.
        sendTokenResponse(user, 201, res);
    } catch (err) {
        next(err);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password, captcha } = req.body;

        // 1. Validate Email/Password presence
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide email and password' });
        }

        // 2. Validate CAPTCHA
        // Need to read cookie manually if using cookie-parser
        const captchaHash = req.cookies.captchaHash;
        if (!captchaHash) {
            return res.status(400).json({ success: false, error: 'CAPTCHA expired. Please refresh.' });
        }

        if (!captcha) {
            return res.status(400).json({ success: false, error: 'Please enter the CAPTCHA code.' });
        }

        const inputHash = crypto.createHmac('sha256', process.env.JWT_SECRET)
            .update(captcha.toLowerCase())
            .digest('hex');

        if (inputHash !== captchaHash) {
            return res.status(400).json({ success: false, error: 'Invalid CAPTCHA code.' });
        }

        // 3. User Lookup
        const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil +mfaEnabled');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // 4. Lockout Check
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000); // minutes
            return res.status(401).json({
                success: false,
                error: `Account is temporarily locked due to multiple failed login attempts. Please try again after ${remainingTime} minute${remainingTime > 1 ? 's' : ''}.`,
                locked: true,
                remainingMinutes: remainingTime
            });
        }

        // 5. Password Check
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            user.loginAttempts += 1;
            const remainingAttempts = 5 - user.loginAttempts;

            if (user.loginAttempts >= 5) {
                user.lockUntil = Date.now() + 5 * 60 * 1000; // 5 minutes lockout
                user.loginAttempts = 0;
                await user.save();
                await logActivity(user._id, 'ACCOUNT_LOCKED', 'Account locked due to failed login attempts', req);
                return res.status(401).json({
                    success: false,
                    error: 'Account is temporarily locked due to multiple failed login attempts. Please try again after 5 minutes.',
                    locked: true,
                    remainingMinutes: 5
                });
            }

            await user.save();
            return res.status(401).json({
                success: false,
                error: `Invalid credentials. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining before account lockout.`,
                remainingAttempts
            });
        }

        // Reset attempts
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        user.lastLogin = Date.now();
        await user.save();

        await logActivity(user._id, 'LOGIN', 'User logged in', req);

        // 6. MFA Check
        if (user.mfaEnabled) {
            // Return temp token
            const tempToken = jwt.sign({ id: user._id, mfaPending: true }, process.env.JWT_SECRET, { expiresIn: '10m' });
            return res.status(200).json({
                success: true,
                mfaRequired: true,
                tempToken
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
};

// @desc    Verify Login MFA
// @route   POST /api/auth/login/verify-mfa
// @access  Public (Protected by temp token)
exports.verifyLoginMFA = async (req, res, next) => {
    try {
        const { tempToken, code } = req.body;

        if (!tempToken || !code) return res.status(400).json({ success: false, error: 'Missing token or code' });

        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        if (!decoded.mfaPending) return res.status(401).json({ success: false, error: 'Invalid token' });

        const user = await User.findById(decoded.id).select('+mfaSecret');
        if (!user) return res.status(401).json({ success: false, error: 'User not found' });

        const verified = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token: code
        });

        if (!verified) return res.status(400).json({ success: false, error: 'Invalid 2FA Code' });

        await logActivity(user._id, 'LOGIN', 'MFA verified', req);

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(401).json({ success: false, error: 'Invalid or expired session' });
    }
};

// @desc    Setup MFA (Generate Secret & QR)
// @route   POST /api/auth/mfa/setup
// @access  Private
exports.setupMFA = async (req, res, next) => {
    try {
        const secret = speakeasy.generateSecret({ name: `SecureApp (${req.user.email})` });

        // Save temporary secret to user (not enabled yet)
        req.user.mfaSecret = secret.base32;
        await req.user.save();

        qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
            if (err) return next(err);
            res.status(200).json({
                success: true,
                secret: secret.base32,
                qrCode: data_url
            });
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Enable MFA (Verify first code)
// @route   POST /api/auth/mfa/enable
// @access  Private
exports.enableMFA = async (req, res, next) => {
    try {
        const { code } = req.body;
        const user = await User.findById(req.user.id).select('+mfaSecret');

        const verified = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token: code
        });

        if (verified) {
            user.mfaEnabled = true;
            await user.save();
            await logActivity(req.user.id, 'ENABLE_MFA', '2FA enabled', req);
            res.status(200).json({ success: true, message: '2FA Enabled successfully' });
        } else {
            res.status(400).json({ success: false, error: 'Invalid code' });
        }
    } catch (err) {
        next(err);
    }
};

// @desc    Get current logged in user
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

// @desc    Log user out
exports.logout = async (req, res, next) => {
    if (req.user) {
        await logActivity(req.user.id, 'LOGOUT', 'User logged out', req);
    }
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.cookie('captchaHash', 'none', { expires: new Date(Date.now() + 10 * 1000) });
    res.status(200).json({ success: true, data: {} });
};
