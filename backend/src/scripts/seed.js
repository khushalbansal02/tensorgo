import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Plan from '../models/Plan.js';

dotenv.config();

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create Basic plan
    const basicPlan = new Plan({
      name: 'Basic',
      description: 'Perfect for small teams',
      price: 0,
      maxUsers: 5,
      minUsers: 1,
      features: [
        'Up to 5 team members',
        'Basic features',
        'Email support'
      ],
      stripeProductId: 'prod_basic',  // You'll need to replace this with your actual Stripe product ID
      stripePriceId: 'price_basic'    // You'll need to replace this with your actual Stripe price ID
    });

    await basicPlan.save();
    console.log('Basic plan created successfully');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedPlans();
