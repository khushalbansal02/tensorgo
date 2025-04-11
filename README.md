# SaaS Subscription Platform with Stripe Integration

A full-stack SaaS platform that offers subscription plans with Stripe payment integration.

## Features

- Multiple subscription plans (Basic, Standard, Plus)
- User role management (Super Admin, Admin, User)
- Stripe payment integration
- Organization management
- User management based on plan limits
- Shopping cart functionality
- Order history

## Tech Stack

- Frontend: React.js
- Backend: Node.js with Express
- Database: MongoDB
- Payment: Stripe API
- Authentication: JWT

## Project Structure

```
project2025/
├── frontend/           # React frontend application
└── backend/           # Node.js backend application
```

## Prerequisites

- Node.js >= 14
- MongoDB
- Stripe Account (for API keys)

## Getting Started

1. Clone the repository
2. Set up environment variables
3. Install dependencies
4. Start the development servers

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env  # Configure your environment variables
npm start
```

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
```
