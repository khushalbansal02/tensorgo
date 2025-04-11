import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import planRoutes from './routes/plans.js';
import userRoutes from './routes/users.js';
import organizationRoutes from './routes/organizations.js';
import stripeRoutes from './routes/stripe.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/stripe', stripeRoutes);

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

// Catch-all route for 404s
app.use('*', (req, res) => {
  console.log('404 hit:', req.method, req.originalUrl);
  res.status(404).json({ 
    message: 'Not Found',
    note: 'All API routes should start with /api. For auth routes, use /api/auth/*'
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
