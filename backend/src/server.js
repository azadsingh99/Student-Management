const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const studentRoutes = require('./routes/studentRoutes');
const pool = require('./db/config');


require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';


app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api', limiter);
 
app.use(express.json({ limit: '10kb' }));

 
 
const corsOptions = {
  origin: isProduction ? process.env.CORS_ORIGIN || '*' : '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
 
async function startServer() {
    try {
        
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
        
         
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Database connection error:', error.message);
        process.exit(1);
    }
}
 
startServer();