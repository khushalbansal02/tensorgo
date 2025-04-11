import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Card,
  CardBody,
} from '@chakra-ui/react';
import axios from 'axios';
import Layout from '../components/Layout/Layout';
import { API_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';

export default function OrganizationSettings() {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const { user } = useAuth();

  const fetchOrganization = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/organizations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrganization(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch organization details',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganization();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/organizations`,
        organization,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast({
        title: 'Success',
        description: 'Organization settings updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update organization settings',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setOrganization(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setOrganization(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (loading) {
    return <Layout>Loading...</Layout>;
  }

  return (
    <Layout>
      <Box maxW="container.md" mx="auto">
        <VStack spacing={8} align="stretch">
          <Heading size="lg">Organization Settings</Heading>

          <Card>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Organization Name</FormLabel>
                    <Input
                      name="name"
                      value={organization.name}
                      onChange={handleChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Billing Email</FormLabel>
                    <Input
                      name="billingEmail"
                      type="email"
                      value={organization.billingEmail}
                      onChange={handleChange}
                    />
                  </FormControl>

                  <Heading size="md" mt={4}>Billing Address</Heading>

                  <FormControl>
                    <FormLabel>Street</FormLabel>
                    <Input
                      name="address.street"
                      value={organization.address?.street || ''}
                      onChange={handleChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>City</FormLabel>
                    <Input
                      name="address.city"
                      value={organization.address?.city || ''}
                      onChange={handleChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>State</FormLabel>
                    <Input
                      name="address.state"
                      value={organization.address?.state || ''}
                      onChange={handleChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Postal Code</FormLabel>
                    <Input
                      name="address.postalCode"
                      value={organization.address?.postalCode || ''}
                      onChange={handleChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Country</FormLabel>
                    <Input
                      name="address.country"
                      value={organization.address?.country || ''}
                      onChange={handleChange}
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={saving}
                    mt={4}
                  >
                    Save Changes
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>
        </VStack>
      </Box>
    </Layout>
  );
}
