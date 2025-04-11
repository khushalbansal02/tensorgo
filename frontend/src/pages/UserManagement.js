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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Switch,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import Layout from '../components/Layout/Layout';
import { API_URL } from '../config';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const toast = useToast();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch users',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/users`, newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast({
        title: 'Success',
        description: 'User created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      onClose();
      fetchUsers();
      setNewUser({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create user',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/users/${userId}`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchUsers();
      
      toast({
        title: 'Success',
        description: `User ${currentStatus ? 'deactivated' : 'activated'} successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update user status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Layout>
      <Box>
        <Box mb={6} display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="lg">User Management</Heading>
          <Button colorScheme="blue" onClick={onOpen}>
            Add User
          </Button>
        </Box>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map(user => (
              <Tr key={user._id}>
                <Td>{user.firstName} {user.lastName}</Td>
                <Td>{user.email}</Td>
                <Td>{user.role}</Td>
                <Td>{user.isActive ? 'Active' : 'Inactive'}</Td>
                <Td>
                  {user.role !== 'admin' && (
                    <Switch
                      isChecked={user.isActive}
                      onChange={() => toggleUserStatus(user._id, user.isActive)}
                    />
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add New User</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <form onSubmit={handleCreateUser}>
                <Stack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>First Name</FormLabel>
                    <Input
                      name="firstName"
                      value={newUser.firstName}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Last Name</FormLabel>
                    <Input
                      name="lastName"
                      value={newUser.lastName}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      name="email"
                      value={newUser.email}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Password</FormLabel>
                    <Input
                      type="password"
                      name="password"
                      value={newUser.password}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <Button type="submit" colorScheme="blue">
                    Create User
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
