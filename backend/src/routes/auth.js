import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Plan from '../models/Plan.js';
import { auth, authorize } from '../middleware/auth.js';
import { createCustomer } from '../services/stripe.js';

const router = express.Router();

// Register organization (first admin user)
router.post('/register',
  (req, res, next) => {
    console.log('Register route hit');
    console.log('Request URL:', req.originalUrl);
    console.log('Request method:', req.method);
    console.log('Request body:', req.body);
    next();
  },
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
    body('organizationName').notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      console.log("Validation errors:", errors.array());
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, firstName, lastName, organizationName } = req.body;
      console.log("Extracted data:", { email, firstName, lastName, organizationName });

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Get Basic plan
      const basicPlan = await Plan.findOne({ name: 'Basic' });
      console.log("Found Basic plan:", basicPlan);
      if (!basicPlan) {
        return res.status(500).json({ message: 'Basic plan not found' });
      }

      // Create Stripe customer
      console.log("Creating Stripe customer...");
      const stripeCustomer = await createCustomer({
        email,
        name: organizationName,
      });
      console.log("Stripe customer created:", stripeCustomer.id);

      // Create organization
      const organization = new Organization({
        name: organizationName,
        plan: basicPlan._id,
        stripeCustomerId: stripeCustomer.id,
        billingEmail: email,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      });
      await organization.save();
      console.log("Organization created:", organization._id);

      // Create admin user
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        role: 'admin',
        organization: organization._id,
      });
      await user.save();
      console.log("User created:", user._id);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Login
router.post('/login',
  [
    body('email').isEmail(),
    body('password').notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email }).populate('organization');
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: 'Account is inactive' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organization: {
            id: user.organization._id,
            name: user.organization.name,
            subscriptionStatus: user.organization.subscriptionStatus,
          },
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('organization')
      .select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
