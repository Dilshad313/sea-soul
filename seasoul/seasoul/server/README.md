# Razorpay Integration for SeaSoul Project

## Overview
This project integrates Razorpay Standard Web Checkout into the SeaSoul application, allowing users to make payments seamlessly. The integration includes both backend and frontend implementations, ensuring secure payment processing and verification.

## Backend Implementation

### Configuration
- **File:** `server/src/config/razorpay.ts`
  - Exports Razorpay configuration using credentials from the environment variables.

### Payment Controller
- **File:** `server/src/controllers/paymentController.ts`
  - **Methods:**
    - `createOrder`: Creates an order by calling the Razorpay API and returns order details.
    - `verifyPayment`: Verifies the payment signature using HMAC-SHA256.

### Payment Routes
- **File:** `server/src/routes/paymentRoutes.ts`
  - **Routes:**
    - `POST /api/create-order`: Route for creating an order.
    - `POST /api/verify-payment`: Route for verifying the payment signature.

### Razorpay Service
- **File:** `server/src/services/razorpayService.ts`
  - Exports functions to interact with the Razorpay API for creating orders.

### Signature Verification Utility
- **File:** `server/src/utils/verifySignature.ts`
  - Exports a function to verify the payment signature against the generated HMAC.

## Frontend Implementation

### Razorpay Checkout Component
- **File:** `client/src/components/RazorpayCheckout.tsx`
  - Renders the Razorpay checkout button and handles the payment process, including:
    - Calling the backend to create an order.
    - Opening the Razorpay payment modal.
    - Handling success and failure events.

### Payment Service
- **File:** `client/src/services/paymentService.ts`
  - Exports functions to interact with the backend for creating orders and verifying payments.

## Environment Setup
- **File:** `.env`
  - Contains the Razorpay credentials:
    - `RAZORPAY_KEY_ID=rzp_test_TDlXv0mHO9Tjbj`
    - `RAZORPAY_KEY_SECRET=VRBkWv9b4voz2xxdRc7XLhaG`

## Testing Instructions
1. Start the backend server by running the appropriate command (e.g., `npm start` in the `server` directory).
2. Start the frontend application by running the appropriate command (e.g., `npm start` in the `client` directory).
3. Navigate to the frontend application in a web browser.
4. Click the Razorpay checkout button to initiate the payment process.
5. Complete the payment in the Razorpay modal and observe the success or failure messages.

## Manual Steps Required
- Ensure that the `.env` file is created in the `server` directory with the correct Razorpay credentials.
- Add `.env` to `.gitignore` to prevent it from being committed to version control.