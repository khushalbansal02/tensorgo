import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCustomer = async ({ email, name }) => {
  try {
    return await stripe.customers.create({
      email,
      name,
    });
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
};

export const createSubscription = async ({ customerId, priceId, quantity }) => {
  try {
    console.log('Creating Stripe subscription:', { customerId, priceId, quantity });
    
    // First, check if customer exists
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer) {
      throw new Error('Customer not found in Stripe');
    }
    
    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price: priceId,
        quantity,
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    console.log('Stripe subscription created:', subscription.id);
    return subscription;
  } catch (error) {
    console.error('Error creating Stripe subscription:', error);
    throw error;
  }
};

export const cancelSubscription = async (subscriptionId) => {
  try {
    return await stripe.subscriptions.cancel(subscriptionId);
  } catch (error) {
    console.error('Error canceling Stripe subscription:', error);
    throw error;
  }
};

export const updateSubscription = async ({ subscriptionId, quantity }) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        quantity,
      }],
    });
  } catch (error) {
    console.error('Error updating Stripe subscription:', error);
    throw error;
  }
};

export const createSetupIntent = async (customerId) => {
  try {
    return await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });
  } catch (error) {
    console.error('Error creating Stripe setup intent:', error);
    throw error;
  }
};

export const handleWebhookEvent = async (event) => {
  try {
    switch (event.type) {
      case 'invoice.paid':
        // Handle successful payment
        return {
          status: 'success',
          data: event.data.object,
        };
      
      case 'invoice.payment_failed':
        // Handle failed payment
        return {
          status: 'failed',
          data: event.data.object,
        };
      
      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        return {
          status: 'cancelled',
          data: event.data.object,
        };
      
      default:
        return {
          status: 'unhandled',
          data: null,
        };
    }
  } catch (error) {
    console.error('Error handling Stripe webhook:', error);
    throw error;
  }
};
