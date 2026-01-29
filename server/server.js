const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(cookieParser());

// Fix Express 5 query/params getter issue for older middlewares
app.use((req, res, next) => {
    if (req.query) {
        const query = req.query;
        Object.defineProperty(req, 'query', {
            value: query,
            writable: true,
            enumerable: true,
            configurable: true
        });
    }
    if (req.params) {
        const params = req.params;
        Object.defineProperty(req, 'params', {
            value: params,
            writable: true,
            enumerable: true,
            configurable: true
        });
    }
    next();
});

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Security Headers with CSP
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://js.stripe.com"],
            frameSrc: ["'self'", "https://js.stripe.com"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: ["'self'", "https://api.stripe.com", "https://localhost:5000", "https://127.0.0.1:5000"]
        }
    }
}));


app.use(mongoSanitize());

// Prevent Parameter Pollution
app.use(hpp());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, 
    max: 500 
});
app.use('/api', limiter);

// CORS (allow both HTTP and HTTPS origins for local dev)
const allowedOrigins = [
    process.env.CLIENT_URL || 'https://localhost:5173',
    process.env.CLIENT_URL_ALT || 'https://127.0.0.1:5173',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
];

const corsOptions = {
    origin: function (origin, callback) {
       
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// CSRF Protection
const csrfProtection = require('./middleware/csrfMiddleware');
app.use(csrfProtection);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// Serve uploads
app.use('/uploads', express.static('uploads'));

app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Basic route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'Server Error'
        : err.message;

    res.status(statusCode).json({
        success: false,
        error: message
    });
});

const PORT = process.env.PORT || 5000;

// Use HTTPS if certs exist, otherwise HTTP for local dev
const sslDir = path.join(__dirname, 'ssl');
const keyPath = path.join(sslDir, 'key.pem');
const certPath = path.join(sslDir, 'cert.pem');
const useHttps = fs.existsSync(keyPath) && fs.existsSync(certPath);

const server = useHttps
    ? https.createServer({
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
    }, app)
    : http.createServer(app);

server.listen(PORT, () => {
    const protocol = useHttps ? 'https' : 'http';
    console.log(useHttps
        ? `🔒 HTTPS Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
        : `⚠️  SSL certs not found, running HTTP (add server/ssl/key.pem & cert.pem for HTTPS)`);
    console.log(`🌐 Server URL: ${protocol}://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
