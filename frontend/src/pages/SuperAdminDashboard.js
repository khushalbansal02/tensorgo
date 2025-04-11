import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Stack,
  useDisclosure,
  VStack,
  Card,
  CardBody,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import axios from 'axios';
import Layout from '../components/Layout/Layout';
import { API_URL } from '../config';

export default function SuperAdminDashboard() {
  const [organizations, setOrganizations] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    price: 0,
    maxUsers: 0,
    minUsers: 0,
    features: [],
    stripeProductId: '',
    stripePriceId: '',
  });
  const toast = useToast();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [orgsResponse, plansResponse] = await Promise.all([
        axios.get(`${API_URL}/organizations/all`, { headers }),
        axios.get(`${API_URL}/plans`, { headers }),
      ]);

      setOrganizations(orgsResponse.data);
      setPlans(plansResponse.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch data',
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

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/plans`,
        newPlan,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: 'Success',
        description: 'Plan created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onClose();
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create plan',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPlan(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <Layout>Loading...</Layout>;
  }

  // Calculate statistics
  const totalOrganizations = organizations.length;
  const activeOrganizations = organizations.filter(org => 
    org.subscriptionStatus === 'active'
  ).length;
  const totalUsers = organizations.reduce((sum, org) => sum + org.activeUsers, 0);
  const totalRevenue = organizations.reduce((sum, org) => {
    if (org.subscriptionStatus === 'active') {
      const plan = plans.find(p => p._id === org.plan?._id);
      return sum + (plan?.price || 0) * org.activeUsers;
    }
    return sum;
  }, 0);

  return (
    <Layout>
      <Box maxW="container.xl" mx="auto">
        <VStack spacing={8} align="stretch">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Heading size="lg">Super Admin Dashboard</Heading>
            <Button colorScheme="blue" onClick={onOpen}>
              Create Plan
            </Button>
          </Box>

          {/* Statistics */}
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Organizations</StatLabel>
                  <StatNumber>{totalOrganizations}</StatNumber>
                  <StatHelpText>{activeOrganizations} active</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Users</StatLabel>
                  <StatNumber>{totalUsers}</StatNumber>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Annual Revenue</StatLabel>
                  <StatNumber>₹{totalRevenue.toLocaleString()}</StatNumber>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Active Plans</StatLabel>
                  <StatNumber>{plans.length}</StatNumber>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Organizations Table */}
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Organizations</Heading>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Plan</Th>
                      <Th>Users</Th>
                      <Th>Status</Th>
                      <Th>Revenue</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {organizations.map(org => (
                      <Tr key={org._id}>
                        <Td>{org.name}</Td>
                        <Td>{org.plan?.name || 'No Plan'}</Td>
                        <Td>{org.activeUsers}</Td>
                        <Td>
                          <Badge
                            colorScheme={
                              org.subscriptionStatus === 'active' ? 'green' :
                              org.subscriptionStatus === 'trialing' ? 'blue' :
                              'red'
                            }
                          >
                            {org.subscriptionStatus}
                          </Badge>
                        </Td>
                        <Td>
                          ₹{org.plan?.price * org.activeUsers || 0}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </VStack>
            </CardBody>
          </Card>

          {/* Plans Table */}
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Plans</Heading>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Price</Th>
                      <Th>Users</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {plans.map(plan => (
                      <Tr key={plan._id}>
                        <Td>{plan.name}</Td>
                        <Td>₹{plan.price}</Td>
                        <Td>{plan.minUsers} - {plan.maxUsers}</Td>
                        <Td>
                          <Badge
                            colorScheme={plan.isActive ? 'green' : 'red'}
                          >
                            {plan.isActive ? 'Active' : 'Inactive'}
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

        {/* Create Plan Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Plan</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <form onSubmit={handleCreatePlan}>
                <Stack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Plan Name</FormLabel>
                    <Input
                      name="name"
                      value={newPlan.name}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Description</FormLabel>
                    <Input
                      name="description"
                      value={newPlan.description}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Price (INR)</FormLabel>
                    <NumberInput min={0}>
                      <NumberInputField
                        name="price"
                        value={newPlan.price}
                        onChange={handleInputChange}
                      />
                    </NumberInput>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Min Users</FormLabel>
                    <NumberInput min={1}>
                      <NumberInputField
                        name="minUsers"
                        value={newPlan.minUsers}
                        onChange={handleInputChange}
                      />
                    </NumberInput>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Max Users</FormLabel>
                    <NumberInput min={1}>
                      <NumberInputField
                        name="maxUsers"
                        value={newPlan.maxUsers}
                        onChange={handleInputChange}
                      />
                    </NumberInput>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Stripe Product ID</FormLabel>
                    <Input
                      name="stripeProductId"
                      value={newPlan.stripeProductId}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Stripe Price ID</FormLabel>
                    <Input
                      name="stripePriceId"
                      value={newPlan.stripePriceId}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <Button type="submit" colorScheme="blue">
                    Create Plan
                  </Button>
                </Stack>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </Layout>
  );
}
