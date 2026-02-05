# DocArchitect AI - Monetization System

This document describes the credit-based monetization system that is currently **DISABLED** for development purposes. When you're ready to enable it, follow the instructions below.

## Current Status: DISABLED

The credit system is currently bypassed in `App.tsx` with:
```typescript
const [userState, setUserState] = useState<UserState>({ 
  credits: 99999, 
  isPremium: true, // Set to true to bypass all credit checks
  subscriptionStatus: 'active' 
});
```

## How to Re-Enable the Credit System

### Step 1: Update Initial User State

In `App.tsx`, change the `userState` initialization back to:

```typescript
const [userState, setUserState] = useState<UserState>({ 
  credits: 2,  // Free credits for new users
  isPremium: false, 
  subscriptionStatus: 'none' 
});
```

### Step 2: Credit Checks Already in Place

The following credit checks are already implemented and will automatically work once you re-enable the system:

1. **Document Generation** (`handleSend` function, line ~279):
   ```typescript
   if (!userState.isPremium && userState.credits <= 0) {
     setCheckoutStage('pricing');
     return;
   }
   ```

2. **DOCX Export** (`exportDocx` function, line ~322):
   ```typescript
   if (!userState.isPremium && userState.credits <= 0) {
     setCheckoutStage('pricing');
     return;
   }
   ```

3. **PDF Export** (`exportPdf` function, line ~341):
   ```typescript
   if (!userState.isPremium && userState.credits <= 0) {
     setCheckoutStage('pricing');
     return;
   }
   ```

4. **Premium Themes** (line ~557):
   ```typescript
   if (t.isPremium && !userState.isPremium) {
     setCheckoutStage('pricing');
   }
   ```

5. **Credit Deduction** (after successful document generation, line ~308):
   ```typescript
   if (!userState.isPremium) {
     saveUser({ ...userState, credits: Math.max(0, userState.credits - 1) });
   }
   ```

## Pricing Structure

The current pricing structure is defined in the checkout modal:

### Elite Membership (Subscription)
- **Price**: $14.99/month
- **Features**:
  - Unlimited DOCX/PDF Exports
  - Elite Executive Themes
  - Smart Document Scanning
  - Priority AI Processing

### Credit Packs (One-Time Purchase)
| Pack Name | Credits | Price | Savings |
|-----------|---------|-------|---------|
| Standard Pack | 5 | $4.99 | - |
| Pro Pack | 15 | $9.99 | 33% OFF |
| Executive Pack | 50 | $24.99 | 50% OFF |

## Google Pay Integration

The app includes Google Pay integration code (currently in TEST mode). To enable real payments:

1. **Get a Google Pay Merchant ID** from the Google Pay Business Console
2. **Update the merchant info** in `App.tsx` (line ~121-126):
   ```typescript
   const paymentsClient = new (window as any).google.payments.api.PaymentsClient({
     environment: 'PRODUCTION', // Change from 'TEST' to 'PRODUCTION'
     merchantInfo: {
       merchantId: 'YOUR_REAL_MERCHANT_ID',
       merchantName: 'DocArchitect AI'
     }
   });
   ```

3. **Set up a payment gateway** and update the tokenization specification (line ~150-155):
   ```typescript
   tokenizationSpecification: {
     type: 'PAYMENT_GATEWAY',
     parameters: {
       'gateway': 'stripe', // or your payment processor
       'gatewayMerchantId': 'YOUR_GATEWAY_MERCHANT_ID'
     }
   }
   ```

4. **Implement backend verification** - The current code simulates payment success. You need to:
   - Send the payment token to your backend
   - Verify the payment with your payment processor
   - Update the user's credits/subscription in your database

## User State Persistence

User state (credits, premium status) is stored in localStorage:
- **Key**: `resume-architect-v13-user`
- **Format**: JSON object matching `UserState` type

For production, you should:
1. Store user state in a backend database
2. Authenticate users (add login/signup)
3. Sync credits between frontend and backend

## Types Reference

From `types.ts`:

```typescript
export type SubscriptionStatus = 'none' | 'active' | 'cancelled' | 'expired';

export interface UserState {
  credits: number;
  isPremium: boolean;
  subscriptionStatus: SubscriptionStatus;
  renewalDate?: string;
}
```

## UI Components

The monetization UI includes:

1. **Credit Badge** (in navbar) - Shows current credits or "Elite Level" for premium users
2. **Pricing Modal** - Two-column layout with subscription and credit pack options
3. **Checkout Modal** - Google Pay button and order summary
4. **Processing Modal** - Loading animation during payment
5. **Success Modal** - Confirmation after successful payment

## Future Enhancements

Consider adding:
- [ ] User authentication (email/social login)
- [ ] Backend API for credit management
- [ ] Stripe/PayPal as alternative payment methods
- [ ] Usage analytics and reporting
- [ ] Referral program for bonus credits
- [ ] Team/Enterprise plans
- [ ] Invoice generation for business users
