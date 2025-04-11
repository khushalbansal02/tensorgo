import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';

const router = express.Router();

// Get organization users (Admin only)
router.get('/',
  auth,
  authorize('admin', 'superAdmin'),
  async (req, res) => {
    try {
      const users = await User.find({ 
        organization: req.user.organization._id 
      }).select('-password');
      
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Create user (Admin only)
router.post('/',
  auth,
  authorize('admin'),
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, firstName, lastName } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Check organization user limit
      const organization = await Organization.findById(req.user.organization._id);
      if (!(await organization.canAddUsers(1))) {
        return res.status(403).json({ 
          message: 'Organization has reached maximum user limit' 
        });
      }

      // Create user
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        role: 'user',
        organization: req.user.organization._id,
      });
      await user.save();

      // Update organization active users count
      organization.activeUsers += 1;
      await organization.save();

      res.status(201).json({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Update user (Admin only)
router.put('/:id',
  auth,
  authorize('admin'),
  async (req, res) => {
    try {
      const { firstName, lastName, isActive } = req.body;

      const user = await User.findOne({
        _id: req.params.id,
        organization: req.user.organization._id,
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update user fields
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (typeof isActive === 'boolean' && user.role !== 'admin') {
        const prevStatus = user.isActive;
        user.isActive = isActive;

        // Update organization active users count
        const organization = await Organization.findById(req.user.organization._id);
        organization.activeUsers += isActive ? 1 : -1;
        await organization.save();
      }

      await user.save();

      res.json({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Delete user (Admin only)
router.delete('/:id',
  auth,
  authorize('admin'),
  async (req, res) => {
    try {
      const user = await User.findOne({
        _id: req.params.id,
        organization: req.user.organization._id,
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.role === 'admin') {
        return res.status(403).json({ 
          message: 'Cannot delete admin user' 
        });
      }

      // Soft delete by setting isActive to false
      user.isActive = false;
      await user.save();

      // Update organization active users count
      const organization = await Organization.findById(req.user.organization._id);
      organization.activeUsers -= 1;
      await organization.save();

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

export default router;
