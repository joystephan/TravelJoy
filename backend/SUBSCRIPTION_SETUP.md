# Subscription System Setup Guide

## Overview

The subscription and payment system has been implemented with Stripe integration for both backend and mobile app.

## Backend Implementation

### Files Created

1. **services/subscriptionService.ts** - Core subscription logic with Stripe integration
2. **controllers/subscriptionController.ts** - API endpoint handlers
3. **routes/subscriptionRoutes.ts** - Route definitions

### Features Implemented

- Three subscription plans: Free Trial, Basic ($9.99/month), Premium ($19.99/month)
- Stripe payment processing
- Webhook handling for subscription events
- Subscription status checking
- Trip limit enforcement
- Subscription cancellation

### API Endpoints

- `GET /api/subscription/plans` - Get all subscription plans
- `POST /api/subscription/subscribe` - Create a new subscription
- `GET /api/subscription/status` - Get user's subscription status
- `POST /api/subscription/cancel/:subscriptionId` - Cancel subscription
- `POST /api/subscription/create-payment-intent` - Create payment intent
- `POST /api/subscription/webhook` - Stripe webhook handler

### Environment Variables Required

Add these to your `.env` file:

```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_BASIC_PRICE_ID=price_basic_plan_id
STRIPE_PREMIUM_PRICE_ID=price_premium_plan_id
```

## Mobile App Implementation

### Files Created

1. **services/subscriptionService.ts** - API client for subscription endpoints
2. **contexts/SubscriptionContext.tsx** - Global subscription state management
3. **screens/SubscriptionScreen.tsx** - Plan selection screen
4. **screens/PaymentScreen.tsx** - Payment processing screen
5. **screens/ManageSubscriptionScreen.tsx** - Subscription management
6. **components/SubscriptionGate.tsx** - Access control component

### Features Implemented

- Plan selection with visual design
- Payment form (simplified - needs Stripe SDK for production)
- Subscription status display
- Usage tracking (trips per month)
- Subscription cancellation
- Access control gates

### Navigation

The subscription screens are integrated into the AppNavigator:

- Home → Subscription (plan selection)
- Subscription → Payment (for paid plans)
- Home → ManageSubscription (for existing subscribers)

## Setup Instructions

### 1. Stripe Configuration

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Create two products with recurring prices:
   - Basic Plan: $9.99/month
   - Premium Plan: $19.99/month
4. Copy the price IDs to your environment variables

### 2. Webhook Setup

1. In Stripe Dashboard, go to Developers → Webhooks
2. Add endpoint: `https://your-api-domain.com/api/subscription/webhook`
3. Select events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret to your environment variables

### 3. Database

The Subscription model is already in the Prisma schema. Run migrations:

```bash
cd backend
npm run prisma:migrate
```

### 4. Testing

1. Use Stripe test mode with test card: 4242 4242 4242 4242
2. Test the free trial flow (no payment required)
3. Test paid subscription flow
4. Test webhook events using Stripe CLI

## Production Considerations

### Mobile App

The current PaymentScreen uses a simplified payment form. For production:

1. Install `@stripe/stripe-react-native`
2. Replace the payment form with Stripe's CardField component
3. Use Stripe's payment sheet for better UX
4. Implement proper payment method creation

### Security

- Ensure HTTPS is enabled in production
- Validate webhook signatures
- Implement rate limiting on subscription endpoints
- Add proper error logging and monitoring

### User Experience

- Add loading states during payment processing
- Implement retry logic for failed payments
- Send email notifications for subscription events
- Add grace period for failed payments

## Usage Example

### Protecting a Feature with Subscription Gate

```tsx
import SubscriptionGate from "../components/SubscriptionGate";

function TripCreationScreen({ navigation }) {
  return (
    <SubscriptionGate navigation={navigation} feature="trip creation">
      {/* Your trip creation UI */}
    </SubscriptionGate>
  );
}
```

### Checking Subscription Status

```tsx
import { useSubscription } from "../contexts/SubscriptionContext";

function MyComponent() {
  const { subscriptionStatus, loading } = useSubscription();

  if (subscriptionStatus?.canCreateTrip) {
    // User can create trips
  }
}
```

## Next Steps

1. Install Stripe React Native SDK for production payment processing
2. Implement email notifications for subscription events
3. Add analytics tracking for subscription conversions
4. Create admin dashboard for subscription management
5. Implement promo codes and discounts
