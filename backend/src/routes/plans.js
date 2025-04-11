import express from 'express';
import { body, validationResult } from 'express-validator';
import { auth, authorize } from '../middleware/auth.js';
import Plan from '../models/Plan.js';

const router = express.Router();

// Get all plans
router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create plan (Super Admin only)
router.post('/',
  auth,
  authorize('superAdmin'),
  [
    body('name').isIn(['Basic', 'Standard', 'Plus']),
    body('price').isNumeric(),
    body('maxUsers').isNumeric(),
    body('minUsers').isNumeric(),
    body('stripeProductId').notEmpty(),
    body('stripePriceId').notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const plan = new Plan(req.body);
      await plan.save();

      res.status(201).json(plan);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Update plan (Super Admin only)
router.put('/:id',
  auth,
  authorize('superAdmin'),
  async (req, res) => {
    try {
      const plan = await Plan.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );

      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Delete plan (Super Admin only)
router.delete('/:id',
  auth,
  authorize('superAdmin'),
  async (req, res) => {
    try {
      const plan = await Plan.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      res.json({ message: 'Plan deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

export default router;
