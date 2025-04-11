import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  useColorModeValue,
  Stack,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';

const NavLink = ({ children, to }) => (
  <Link
    as={RouterLink}
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    to={to}>
    {children}
  </Link>
);

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout } = useAuth();

  const adminLinks = [
    { name: 'Dashboard', to: '/dashboard' },
    { name: 'Users', to: '/users' },
    { name: 'Settings', to: '/settings' },
    { name: 'Billing', to: '/billing' },
  ];

  const userLinks = [
    { name: 'Dashboard', to: '/dashboard' },
  ];

  const superAdminLinks = [
    { name: 'Dashboard', to: '/super-admin' },
  ];

  const getNavLinks = () => {
    if (!user) return [];
    if (user.role === 'superAdmin') return superAdminLinks;
    if (user.role === 'admin') return adminLinks;
    return userLinks;
  };

  return (
    <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <IconButton
          size={'md'}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={'Open Menu'}
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems={'center'}>
          <Box fontWeight="bold">
            <Link as={RouterLink} to="/">
              SaaS Platform
            </Link>
          </Box>
          <HStack
            as={'nav'}
            spacing={4}
            display={{ base: 'none', md: 'flex' }}>
            {getNavLinks().map((link) => (
              <NavLink key={link.name} to={link.to}>
                {link.name}
              </NavLink>
            ))}
          </HStack>
        </HStack>
        <Flex alignItems={'center'}>
          {user ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}>
                {user.firstName} {user.lastName}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={logout}>Sign Out</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <HStack spacing={4}>
              <Button as={RouterLink} to="/login" variant="ghost">
                Sign In
              </Button>
              <Button
                as={RouterLink}
                to="/register"
                colorScheme="blue">
                Sign Up
              </Button>
            </HStack>
          )}
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as={'nav'} spacing={4}>
            {getNavLinks().map((link) => (
              <NavLink key={link.name} to={link.to}>
                {link.name}
              </NavLink>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
}
