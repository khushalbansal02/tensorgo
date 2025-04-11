import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true,
  },
  stripeCustomerId: {
    type: String,
    required: true,
  },
  stripeSubscriptionId: {
    type: String,
  },
  activeUsers: {
    type: Number,
    default: 0,
  },
  trialEndsAt: {
    type: Date,
  },
  subscriptionStatus: {
    type: String,
    enum: ['trialing', 'active', 'canceled', 'expired'],
    default: 'trialing',
  },
  billingEmail: {
    type: String,
    required: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Validate user limit before adding new users
organizationSchema.methods.canAddUsers = async function(count) {
  const plan = await mongoose.model('Plan').findById(this.plan);
  return this.activeUsers + count <= plan.maxUsers;
};

export default mongoose.model('Organization', organizationSchema);
