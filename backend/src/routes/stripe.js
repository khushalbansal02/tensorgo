import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import Organization from '../models/Organization.js';
import Plan from '../models/Plan.js';
import Order from '../models/Order.js';
import {
  createSubscription,
  cancelSubscription,
  updateSubscription,
  createSetupIntent,
  handleWebhookEvent,
} from '../services/stripe.js';

const router = express.Router();

// Create subscription (Admin only)
router.post('/subscribe',
  auth,
  authorize('admin'),
  async (req, res) => {
    try {
      const { planId, quantity } = req.body;
      console.log('Subscribe request:', { planId, quantity });

      const plan = await Plan.findById(planId);
      if (!plan) {
        console.log('Plan not found:', planId);
        return res.status(404).json({ message: 'Plan not found' });
      }
      console.log('Found plan:', plan);

      const organization = await Organization.findById(req.user.organization._id);
      console.log('Found organization:', organization._id);

      // Validate user quantity
      if (quantity < plan.minUsers || quantity > plan.maxUsers) {
        console.log('Invalid quantity:', quantity, 'for plan:', plan);
        return res.status(400).json({ 
          message: `User quantity must be between ${plan.minUsers} and ${plan.maxUsers}` 
        });
      }

      // Create subscription
      console.log('Creating subscription with:', {
        customerId: organization.stripeCustomerId,
        priceId: plan.stripePriceId,
        quantity
      });

      const subscription = await createSubscription({
        customerId: organization.stripeCustomerId,
        priceId: plan.stripePriceId,
        quantity,
      });
      console.log('Subscription created:', subscription.id);

      // Create order
      const order = new Order({
        organization: organization._id,
        plan: plan._id,
        userCount: quantity,
        amount: plan.price * quantity,
        stripePaymentIntentId: subscription.latest_invoice.payment_intent.id,
        billingPeriod: {
          start: new Date(subscription.current_period_start * 1000),
          end: new Date(subscription.current_period_end * 1000),
        },
      });
      await order.save();
      console.log('Order created:', order._id);

      // Update organization
      organization.plan = plan._id;
      organization.stripeSubscriptionId = subscription.id;
      organization.subscriptionStatus = subscription.status;
      await organization.save();
      console.log('Organization updated with subscription');

      res.json({
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        subscriptionId: subscription.id,
      });
    } catch (error) {
      console.error('Subscription error:', error);
      res.status(500).json({ 
        message: 'Server error', 
        error: error.message,
        details: error.stack 
      });
    }
  }
);

// Cancel subscription (Admin only)
router.post('/cancel',
  auth,
  authorize('admin'),
  async (req, res) => {
    try {
      const organization = await Organization.findById(req.user.organization._id);

      if (!organization.stripeSubscriptionId) {
        return res.status(400).json({ message: 'No active subscription' });
      }

      await cancelSubscription(organization.stripeSubscriptionId);

      organization.subscriptionStatus = 'canceled';
      await organization.save();

      res.json({ message: 'Subscription cancelled successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Update subscription quantity (Admin only)
router.post('/update-quantity',
  auth,
  authorize('admin'),
  async (req, res) => {
    try {
      const { quantity } = req.body;
      const organization = await Organization.findById(req.user.organization._id);

      if (!organization.stripeSubscriptionId) {
        return res.status(400).json({ message: 'No active subscription' });
      }

      const plan = await Plan.findById(organization.plan);
      if (quantity < plan.minUsers || quantity > plan.maxUsers) {
        return res.status(400).json({ 
          message: `User quantity must be between ${plan.minUsers} and ${plan.maxUsers}` 
        });
      }

      const subscription = await updateSubscription({
        subscriptionId: organization.stripeSubscriptionId,
        quantity,
      });

      res.json(subscription);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Create setup intent for saving card (Admin only)
router.post('/setup-intent',
  auth,
  authorize('admin'),
  async (req, res) => {
    try {
      const organization = await Organization.findById(req.user.organization._id);
      
      const setupIntent = await createSetupIntent(organization.stripeCustomerId);
      
      res.json({ clientSecret: setupIntent.client_secret });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    const result = await handleWebhookEvent(event);

    if (result.status === 'success') {
      const invoice = result.data;
      
      // Update order status
      await Order.findOneAndUpdate(
        { stripePaymentIntentId: invoice.payment_intent },
        { status: 'completed' }
      );

      // Update organization subscription status if needed
      if (invoice.subscription) {
        await Organization.findOneAndUpdate(
          { stripeSubscriptionId: invoice.subscription },
          { subscriptionStatus: 'active' }
        );
      }
    }

    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
