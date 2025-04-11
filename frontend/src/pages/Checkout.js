import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Divider,
  Badge,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
  Textarea,
  useColorModeValue,
} from '@chakra-ui/react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import axios from 'axios';
import Layout from '../components/Layout/Layout';
import { useCart } from '../contexts/CartContext';
import { API_URL } from '../config';

const STRIPE_PUBLIC_KEY = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

const steps = [
  { title: 'Shipping', description: 'Enter shipping details' },
  { title: 'Payment', description: 'Enter payment details' },
  { title: 'Confirmation', description: 'Review your order' }
];

const ShippingForm = ({ shippingDetails, setShippingDetails, onNext }) => {
  return (
    <VStack spacing={6} align="stretch">
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <FormControl isRequired>
          <FormLabel>First Name</FormLabel>
          <Input
            value={shippingDetails.firstName}
            onChange={(e) => setShippingDetails(prev => ({
              ...prev,
              firstName: e.target.value
            }))}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Last Name</FormLabel>
          <Input
            value={shippingDetails.lastName}
            onChange={(e) => setShippingDetails(prev => ({
              ...prev,
              lastName: e.target.value
            }))}
          />
        </FormControl>
      </SimpleGrid>

      <FormControl isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          value={shippingDetails.email}
          onChange={(e) => setShippingDetails(prev => ({
            ...prev,
            email: e.target.value
          }))}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Phone</FormLabel>
        <Input
          type="tel"
          value={shippingDetails.phone}
          onChange={(e) => setShippingDetails(prev => ({
            ...prev,
            phone: e.target.value
          }))}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Address</FormLabel>
        <Textarea
          value={shippingDetails.address}
          onChange={(e) => setShippingDetails(prev => ({
            ...prev,
            address: e.target.value
          }))}
        />
      </FormControl>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <FormControl isRequired>
          <FormLabel>City</FormLabel>
          <Input
            value={shippingDetails.city}
            onChange={(e) => setShippingDetails(prev => ({
              ...prev,
              city: e.target.value
            }))}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>State</FormLabel>
          <Input
            value={shippingDetails.state}
            onChange={(e) => setShippingDetails(prev => ({
              ...prev,
              state: e.target.value
            }))}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>PIN Code</FormLabel>
          <Input
            value={shippingDetails.pinCode}
            onChange={(e) => setShippingDetails(prev => ({
              ...prev,
              pinCode: e.target.value
            }))}
          />
        </FormControl>
      </SimpleGrid>

      <Button
        colorScheme="blue"
        size="lg"
        onClick={onNext}
        isDisabled={
          !shippingDetails.firstName ||
          !shippingDetails.lastName ||
          !shippingDetails.email ||
          !shippingDetails.phone ||
          !shippingDetails.address ||
          !shippingDetails.city ||
          !shippingDetails.state ||
          !shippingDetails.pinCode
        }
      >
        Continue to Payment
      </Button>
    </VStack>
  );
};

const PaymentForm = ({ onBack, onNext, processing }) => {
  const cardElementStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: useColorModeValue('#424770', '#fff'),
        '::placeholder': {
          color: useColorModeValue('#aab7c4', '#535353'),
        },
        backgroundColor: 'transparent',
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <VStack spacing={6} align="stretch">
      <Card>
        <CardHeader>
          <Heading size="md">Payment Information</Heading>
        </CardHeader>
        <CardBody>
          <FormControl>
            <FormLabel>Card Details</FormLabel>
            <Box
              p={4}
              borderWidth="1px"
              borderRadius="md"
              bg={useColorModeValue('white', 'gray.700')}
            >
              <CardElement options={cardElementStyle} />
            </Box>
          </FormControl>
        </CardBody>
      </Card>

      <HStack spacing={4}>
        <Button variant="outline" onClick={onBack}>
          Back to Shipping
        </Button>
        <Button
          colorScheme="blue"
          onClick={onNext}
          isLoading={processing}
          flex={1}
        >
          Review Order
        </Button>
      </HStack>
    </VStack>
  );
};

const ConfirmationStep = ({ shippingDetails, onBack, onConfirm, processing }) => {
  const { cartItems, getTotal } = useCart();
  const subtotal = getTotal();
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  return (
    <VStack spacing={6} align="stretch">
      <Card>
        <CardHeader>
          <Heading size="md">Order Summary</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            {cartItems.map((item) => (
              <HStack key={item.plan._id} justify="space-between">
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">
                    {item.plan.name}
                    <Badge ml={2} colorScheme="blue">
                      {item.quantity} {item.quantity === 1 ? 'user' : 'users'}
                    </Badge>
                  </Text>
                  <Text color="gray.500">₹{item.plan.price}/user/year</Text>
                </VStack>
                <Text fontWeight="bold">₹{item.plan.price * item.quantity}</Text>
              </HStack>
            ))}
            <Divider />
            <HStack justify="space-between">
              <Text color="gray.600">Subtotal</Text>
              <Text>₹{subtotal}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.600">Tax (18% GST)</Text>
              <Text>₹{tax}</Text>
            </HStack>
            <Divider />
            <HStack justify="space-between">
              <Text fontWeight="bold">Total</Text>
              <Text fontWeight="bold" fontSize="xl">₹{total}</Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <Heading size="md">Shipping Details</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Box>
              <Text fontWeight="bold">Contact Information</Text>
              <Text>{shippingDetails.firstName} {shippingDetails.lastName}</Text>
              <Text>{shippingDetails.email}</Text>
              <Text>{shippingDetails.phone}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Shipping Address</Text>
              <Text>{shippingDetails.address}</Text>
              <Text>
                {shippingDetails.city}, {shippingDetails.state} {shippingDetails.pinCode}
              </Text>
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>

      <HStack spacing={4}>
        <Button variant="outline" onClick={onBack}>
          Back to Payment
        </Button>
        <Button
          colorScheme="blue"
          onClick={onConfirm}
          isLoading={processing}
          flex={1}
        >
          Confirm Order
        </Button>
      </HStack>
    </VStack>
  );
};

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const { cartItems, getTotal, clearCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });

  const [shippingDetails, setShippingDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
  });

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem('token');

      // Create subscription for each plan
      const orderPromises = cartItems.map(item => 
        axios.post(
          `${API_URL}/stripe/subscribe`,
          {
            planId: item.plan._id,
            quantity: item.quantity,
            shippingDetails,
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
      );

      const responses = await Promise.all(orderPromises);

      // Process each subscription payment
      for (const response of responses) {
        const { clientSecret, subscriptionId } = response.data;
        
        const { error } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: elements.getElement(CardElement),
              billing_details: {
                name: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
                email: shippingDetails.email,
                phone: shippingDetails.phone,
                address: {
                  line1: shippingDetails.address,
                  city: shippingDetails.city,
                  state: shippingDetails.state,
                  postal_code: shippingDetails.pinCode,
                },
              },
            },
          }
        );

        if (error) {
          throw new Error(error.message);
        }
      }

      toast({
        title: 'Payment Successful!',
        description: 'Your subscriptions have been activated.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      clearCart();
      navigate('/dashboard');

    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: error.message || 'Unable to process payment',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setActiveStep(1); // Go back to payment step
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box maxW="container.lg" mx="auto">
      <Stepper index={activeStep} mb={8}>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepIndicator>
              <StepStatus
                complete={<StepIcon />}
                incomplete={<StepNumber />}
                active={<StepNumber />}
              />
            </StepIndicator>
            <Box flexShrink='0'>
              <StepTitle>{step.title}</StepTitle>
              <StepDescription>{step.description}</StepDescription>
            </Box>
            <StepSeparator />
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <ShippingForm
          shippingDetails={shippingDetails}
          setShippingDetails={setShippingDetails}
          onNext={() => setActiveStep(1)}
        />
      )}

      {activeStep === 1 && (
        <PaymentForm
          onBack={() => setActiveStep(0)}
          onNext={() => setActiveStep(2)}
          processing={processing}
        />
      )}

      {activeStep === 2 && (
        <ConfirmationStep
          shippingDetails={shippingDetails}
          onBack={() => setActiveStep(1)}
          onConfirm={handleSubmit}
          processing={processing}
        />
      )}
    </Box>
  );
}

export default function Checkout() {
  const { cartItems } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    navigate('/pricing');
    return null;
  }

  return (
    <Layout>
      <Box maxW="container.xl" mx="auto" py={8} px={4}>
        <VStack spacing={8}>
          <Heading>Checkout</Heading>
          <Elements stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        </VStack>
      </Box>
    </Layout>
  );
}
