import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  List,
  ListItem,
  ListIcon,
  Text,
  SimpleGrid,
  VStack,
  useColorModeValue,
  useDisclosure,
  IconButton,
} from '@chakra-ui/react';
import { CheckIcon, ViewIcon } from '@chakra-ui/icons';
import Layout from '../components/Layout/Layout';
import Cart from '../components/Cart';
import { useCart } from '../contexts/CartContext';

const PricingCard = ({ plan, onAddToCart }) => {
  const { name, price, features, isPopular, trialDays, maxUsers } = plan;
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      borderWidth="1px"
      borderColor={isPopular ? 'blue.500' : borderColor}
      borderRadius="xl"
      p={6}
      bg={bgColor}
      position="relative"
      shadow={isPopular ? 'xl' : 'md'}
    >
      {isPopular && (
        <Text
          position="absolute"
          top="-3"
          right="-3"
          bg="blue.500"
          color="white"
          px={3}
          py={1}
          borderRadius="md"
          fontSize="sm"
          fontWeight="bold"
        >
          Most Popular
        </Text>
      )}
      <VStack spacing={4} align="stretch">
        <Heading size="lg">{name}</Heading>
        <Box>
          <Text fontSize="4xl" fontWeight="bold">
            ₹{price}
            <Text as="span" fontSize="lg" fontWeight="normal">
              {price > 0 ? '/user/year' : ''}
            </Text>
          </Text>
          {trialDays > 0 && (
            <Text color="gray.500">
              {trialDays} days free trial
            </Text>
          )}
        </Box>
        <Text color="gray.500">
          {maxUsers === 1 
            ? 'For individual users'
            : `Up to ${maxUsers} users`}
        </Text>
        <List spacing={3}>
          {features.map((feature, index) => (
            <ListItem key={index} display="flex" alignItems="center">
              <ListIcon as={CheckIcon} color="green.500" />
              {feature}
            </ListItem>
          ))}
        </List>
        <Button
          colorScheme={isPopular ? 'blue' : 'gray'}
          size="lg"
          w="full"
          mt={4}
          onClick={() => onAddToCart(plan)}
        >
          Add to Cart
        </Button>
      </VStack>
    </Box>
  );
};

export default function PricingPlans() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { addToCart } = useCart();
  
  const plans = [
    {
      name: 'Basic',
      price: 0,
      trialDays: 14,
      maxUsers: 1,
      features: [
        'Single user account',
        'Basic features',
        'Email support',
        '14-day free trial',
      ],
    },
    {
      name: 'Standard',
      price: 4999,
      maxUsers: 5,
      features: [
        'Up to 5 user accounts',
        'All Basic features',
        'Priority email support',
        'Advanced analytics',
        'Custom branding',
      ],
      isPopular: true,
    },
    {
      name: 'Plus',
      price: 3999,
      maxUsers: 10,
      features: [
        '10+ user accounts',
        'All Standard features',
        'Premium support',
        'Advanced security',
        'Custom integrations',
        'Dedicated account manager',
      ],
    },
  ];

  const handleAddToCart = (plan) => {
    addToCart(plan);
    onOpen();
  };

  return (
    <Layout>
      <Box py={12}>
        <VStack spacing={8} textAlign="center" mb={12}>
          <Heading size="2xl">
            Choose the Right Plan for Your Business
          </Heading>
          <Text fontSize="xl" color="gray.500">
            Start with our 14-day free trial. No credit card required.
          </Text>
        </VStack>
        <Box position="fixed" top="4" right="4" zIndex="1">
          <IconButton
            icon={<ViewIcon />}
            onClick={onOpen}
            colorScheme="blue"
            size="lg"
            aria-label="Shopping Cart"
          />
        </Box>
        <SimpleGrid
          columns={{ base: 1, md: 3 }}
          spacing={{ base: 8, md: 12 }}
          maxW="7xl"
          mx="auto"
          px={{ base: 4, md: 8 }}
        >
          {plans.map((plan) => (
            <PricingCard 
              key={plan.name} 
              plan={plan} 
              onAddToCart={handleAddToCart}
            />
          ))}
        </SimpleGrid>
        <Cart isOpen={isOpen} onClose={onClose} />
      </Box>
    </Layout>
  );
}
