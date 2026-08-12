const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db.js');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

const app = express();

// Security Middleware
app.use(helmet({ contentSecurityPolicy: false })); // Keeps scripts working smooth

// Rate Limiting (Prevents brute-force logins)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

// Body Parser & CORS Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Automatically create 'public/uploads' directory if it doesn't exist
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files from public directory
app.use(express.static('public'));

// Routes
const authRoutes = require('./routes/authRoutes.js');
const propertyRoutes = require('./routes/propertyRoutes.js');

// Register Property Route Endpoint
app.use('/api/properties', propertyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Base Route
app.get('/', (req, res) => {
  res.send('HomeBridge API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
