const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xss = require('xss-clean');
const studentRoutes = require('./routes/studentRoutes');
const pool = require('./db/config');

// Load environment variables
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Security middleware
// Set security HTTP headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Compression middleware
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: isProduction ? process.env.CORS_ORIGIN || '*' : '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Test database connection before starting server
async function startServer() {
    try {
        // Test database connection
        const client = await pool.connect();
        console.log('Successfully connected to Neon PostgreSQL database');
        client.release();
        
        // Routes
        app.use('/api/students', studentRoutes);
        
        // Error handling middleware
        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({ 
                error: 'Something went wrong!',
                message: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        });
        
        // 404 handler
        app.use((req, res) => {
            res.status(404).json({ message: 'Route not found' });
        });
        
        // Start the server after database connection is verified
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Database connection error:', error.message);
        process.exit(1);
    }
}

// Start the server
startServer();