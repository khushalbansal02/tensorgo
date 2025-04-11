import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth, authorize } from '../middleware/auth.js';
import Organization from '../models/Organization.js';
import Plan from '../models/Plan.js';
import Order from '../models/Order.js';

const router = express.Router();

// Get organization details (Admin only)
router.get('/',
  auth,
  authorize('admin', 'superAdmin'),
  async (req, res) => {
    try {
      const organization = await Organization.findById(req.user.organization._id)
        .populate('plan');
      
      res.json(organization);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Update organization details (Admin only)
router.put('/',
  auth,
  authorize('admin'),
  [
    body('name').optional(),
    body('billingEmail').optional().isEmail(),
    body('address').optional().isObject(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, billingEmail, address } = req.body;

      const organization = await Organization.findById(req.user.organization._id);
      
      if (name) organization.name = name;
      if (billingEmail) organization.billingEmail = billingEmail;
      if (address) organization.address = address;

      await organization.save();

      res.json(organization);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get organization subscription history (Admin only)
router.get('/orders',
  auth,
  authorize('admin'),
  async (req, res) => {
    try {
      const orders = await Order.find({ 
        organization: req.user.organization._id 
      })
        .populate('plan')
        .sort({ createdAt: -1 });
      
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get all organizations (Super Admin only)
router.get('/all',
  auth,
  authorize('superAdmin'),
  async (req, res) => {
    try {
      const organizations = await Organization.find()
        .populate('plan');
      
      res.json(organizations);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

export default router;
