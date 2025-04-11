import React from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  IconButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Image,
  Divider,
  Badge,
  Progress,
  Flex,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { DeleteIcon, InfoIcon } from '@chakra-ui/icons';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      bg={bgColor}
      borderColor={borderColor}
      position="relative"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
    >
      <HStack spacing={4} align="start">
        <Box flex="1">
          <HStack justify="space-between" mb={2}>
            <Box>
              <Text fontWeight="bold" fontSize="lg">
                {item.plan.name}
                {item.plan.isPopular && (
                  <Badge ml={2} colorScheme="green">Popular</Badge>
                )}
              </Text>
              <Text color="gray.500" fontSize="sm">
                ₹{item.plan.price}/user/year
              </Text>
            </Box>
            <IconButton
              size="sm"
              icon={<DeleteIcon />}
              onClick={() => onRemove(item.plan._id)}
              variant="ghost"
              colorScheme="red"
              aria-label="Remove item"
            />
          </HStack>
          
          <Box mb={3}>
            <Text fontSize="sm" color="gray.500" mb={1}>Users</Text>
            <HStack>
              <NumberInput
                size="sm"
                maxW={24}
                value={item.quantity}
                min={1}
                max={item.plan.maxUsers}
                onChange={(value) => onUpdateQuantity(item.plan._id, parseInt(value))}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Tooltip label={`Maximum ${item.plan.maxUsers} users allowed`}>
                <InfoIcon color="gray.500" />
              </Tooltip>
            </HStack>
          </Box>
          
          <Box>
            <Text fontSize="sm" color="gray.500" mb={1}>Capacity Usage</Text>
            <Progress 
              value={(item.quantity / item.plan.maxUsers) * 100} 
              size="sm" 
              colorScheme="blue" 
              borderRadius="full"
            />
          </Box>
        </Box>
      </HStack>
      
      <Flex justify="flex-end" mt={4}>
        <Text fontWeight="bold" fontSize="lg">
          ₹{item.plan.price * item.quantity}
        </Text>
      </Flex>
    </Box>
  );
};

export default function Cart({ isOpen, onClose }) {
  const { cartItems, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.800');

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <Drawer 
      isOpen={isOpen} 
      placement="right" 
      onClose={onClose} 
      size="md"
    >
      <DrawerOverlay />
      <DrawerContent bg={bgColor}>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          <HStack justify="space-between">
            <Text>Shopping Cart</Text>
            <Badge colorScheme="blue" fontSize="md">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </Badge>
          </HStack>
        </DrawerHeader>

        <DrawerBody>
          {cartItems.length === 0 ? (
            <VStack spacing={4} py={8}>
              <Image 
                src="/empty-cart.svg" 
                alt="Empty Cart" 
                boxSize="200px"
                opacity="0.6"
              />
              <Text fontSize="lg" color="gray.500">
                Your cart is empty
              </Text>
              <Button 
                colorScheme="blue" 
                variant="outline"
                onClick={() => {
                  onClose();
                  navigate('/pricing');
                }}
              >
                Browse Plans
              </Button>
            </VStack>
          ) : (
            <VStack spacing={4} align="stretch" py={4}>
              {cartItems.map((item) => (
                <CartItem
                  key={item.plan._id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </VStack>
          )}
        </DrawerBody>

        {cartItems.length > 0 && (
          <DrawerFooter borderTopWidth="1px" flexDirection="column" gap={4}>
            <VStack width="100%" spacing={3}>
              <HStack justify="space-between" width="100%">
                <Text color="gray.600">Subtotal</Text>
                <Text>₹{getTotal()}</Text>
              </HStack>
              <HStack justify="space-between" width="100%">
                <Text color="gray.600">Tax (18% GST)</Text>
                <Text>₹{Math.round(getTotal() * 0.18)}</Text>
              </HStack>
              <Divider />
              <HStack justify="space-between" width="100%">
                <Text fontWeight="bold" fontSize="lg">Total</Text>
                <Text fontWeight="bold" fontSize="lg">
                  ₹{getTotal() + Math.round(getTotal() * 0.18)}
                </Text>
              </HStack>
            </VStack>
            
            <HStack width="100%" spacing={4}>
              <Button 
                variant="outline" 
                onClick={clearCart}
                size="lg"
                width="40%"
              >
                Clear Cart
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={handleCheckout}
                size="lg"
                width="60%"
              >
                Proceed to Checkout
              </Button>
            </HStack>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
