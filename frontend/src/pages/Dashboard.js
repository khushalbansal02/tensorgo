import React from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
} from '@chakra-ui/react';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../contexts/AuthContext';

const StatCard = ({ label, number, helpText }) => {
  const bgColor = useColorModeValue('white', 'gray.700');

  return (
    <Box p={6} bg={bgColor} rounded="lg" shadow="base">
      <Stat>
        <StatLabel fontSize="md" fontWeight="medium">
          {label}
        </StatLabel>
        <StatNumber fontSize="3xl" fontWeight="bold">
          {number}
        </StatNumber>
        {helpText && (
          <StatHelpText fontSize="sm">
            {helpText}
          </StatHelpText>
        )}
      </Stat>
    </Box>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const organization = user?.organization;

  return (
    <Layout>
      <Box>
        <Heading size="lg" mb={6}>
          Welcome, {user?.firstName}!
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <StatCard
            label="Current Plan"
            number={organization?.plan?.name || 'Basic'}
            helpText={organization?.subscriptionStatus === 'trialing' 
              ? 'Trial Period'
              : 'Active Subscription'}
          />
          <StatCard
            label="Active Users"
            number={organization?.activeUsers || 1}
            helpText={`of ${organization?.plan?.maxUsers || 1} available`}
          />
          <StatCard
            label="Days Remaining"
            number={organization?.trialEndsAt 
              ? Math.max(0, Math.ceil((new Date(organization.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24)))
              : 'N/A'}
            helpText={organization?.subscriptionStatus === 'trialing' 
              ? 'Trial Period'
              : 'Subscription Period'}
          />
        </SimpleGrid>
      </Box>
    </Layout>
  );
}
