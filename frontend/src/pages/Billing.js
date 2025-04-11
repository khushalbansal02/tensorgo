import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  VStack,
  HStack,
  Text,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
} from '@chakra-ui/react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import axios from 'axios';
import Layout from '../components/Layout/Layout';
import { API_URL } from '../config';

const STRIPE_PUBLIC_KEY = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

function CheckoutForm({ selectedPlan, userCount, organization, onSuccess, processing, setProcessing }) {
  const stripe = useStripe();
  const elements = useElements();
  const toast = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      
      // Create subscription
      const response = await axios.post(
        `${API_URL}/stripe/subscribe`,
        {
          planId: selectedPlan,
          quantity: userCount,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Confirm payment
      const { error } = await stripe.confirmCardPayment(
        response.data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              email: organization.billingEmail,
            },
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: 'Success',
        description: 'Subscription updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process subscription',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <Box w="100%">
          <CardElement />
        </Box>
        <Button
          type="submit"
          colorScheme="blue"
          isLoading={processing}
          isDisabled={!stripe || !selectedPlan}
          w="100%"
        >
          Update Subscription
        </Button>
      </VStack>
    </form>
  );
}

export default function Billing() {
  const [organization, setOrganization] = useState(null);
  const [plans, setPlans] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [userCount, setUserCount] = useState(1);
  const [processing, setProcessing] = useState(false);
  const toast = useToast();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [orgResponse, plansResponse, ordersResponse] = await Promise.all([
        axios.get(`${API_URL}/organizations`, { headers }),
        axios.get(`${API_URL}/plans`, { headers }),
        axios.get(`${API_URL}/organizations/orders`, { headers }),
      ]);

      setOrganization(orgResponse.data);
      setPlans(plansResponse.data);
      setOrders(ordersResponse.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch billing data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelSubscription = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${API_URL}/stripe/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast({
        title: 'Success',
        description: 'Subscription cancelled successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to cancel subscription',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <Layout>Loading...</Layout>;
  }

  return (
    <Layout>
      <Box maxW="container.xl" mx="auto">
        <VStack spacing={8} align="stretch">
          <Heading size="lg">Billing & Subscription</Heading>

          {/* Current Plan */}
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Current Plan</Heading>
                <HStack justify="space-between">
                  <Box>
                    <Text fontWeight="bold">{organization.plan?.name || 'No Plan'}</Text>
                    <Text color="gray.600">
                      {organization.subscriptionStatus === 'trialing'
                        ? `Trial ends in ${Math.ceil((new Date(organization.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24))} days`
                        : `${organization.activeUsers} active users`}
                    </Text>
                  </Box>
                  {organization.subscriptionStatus === 'active' && (
                    <Button
                      colorScheme="red"
                      variant="outline"
                      onClick={handleCancelSubscription}
                      isLoading={processing}
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Change Plan */}
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Change Plan</Heading>
                <Select
                  placeholder="Select plan"
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                >
                  {plans.map(plan => (
                    <option key={plan._id} value={plan._id}>
                      {plan.name} - ₹{plan.price}/user/year
                    </option>
                  ))}
                </Select>
                <HStack>
                  <Text>Number of Users:</Text>
                  <NumberInput
                    min={1}
                    max={100}
                    value={userCount}
                    onChange={(value) => setUserCount(parseInt(value))}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </HStack>
                <Elements stripe={stripePromise}>
                  <CheckoutForm
                    selectedPlan={selectedPlan}
                    userCount={userCount}
                    organization={organization}
                    onSuccess={fetchData}
                    processing={processing}
                    setProcessing={setProcessing}
                  />
                </Elements>
              </VStack>
            </CardBody>
          </Card>

          {/* Order History */}
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Order History</Heading>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Date</Th>
                      <Th>Plan</Th>
                      <Th>Amount</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {orders.map(order => (
                      <Tr key={order._id}>
                        <Td>{new Date(order.createdAt).toLocaleDateString()}</Td>
                        <Td>{order.plan.name}</Td>
                        <Td>₹{order.amount}</Td>
                        <Td>
                          <Badge
                            colorScheme={
                              order.status === 'completed' ? 'green' :
                              order.status === 'pending' ? 'yellow' :
                              'red'
                            }
                          >
                            {order.status}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Box>
    </Layout>
  );
}
