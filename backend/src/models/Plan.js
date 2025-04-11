import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Basic', 'Standard', 'Plus'],
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  billingCycle: {
    type: String,
    enum: ['yearly'],
    default: 'yearly',
  },
  features: [{
    type: String,
  }],
  maxUsers: {
    type: Number,
    required: true,
  },
  minUsers: {
    type: Number,
    required: true,
  },
  trialDays: {
    type: Number,
    default: 0,
  },
  stripeProductId: {
    type: String,
    required: true,
  },
  stripePriceId: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model('Plan', planSchema);
