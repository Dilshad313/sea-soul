# Razorpay Integration for SeaSoul Project

This document outlines the integration of Razorpay Standard Web Checkout into the SeaSoul project, detailing both backend and frontend implementations.

## Backend Setup

### Razorpay Configuration
- The Razorpay credentials are stored in the `.env` file located in the `server` directory. Ensure the following entries are present:
  ```
  RAZORPAY_KEY_ID=rzp_test_TDlXv0mHO9Tjbj
  RAZORPAY_KEY_SECRET=VRBkWv9b4voz2xxdRc7XLhaG
  ```

### API Endpoints
1. **Create Order**
   - **Endpoint:** `POST /api/create-order`
   - **Description:** This endpoint creates an order by calling the Razorpay API and returns the order details.

2. **Verify Payment**
   - **Endpoint:** `POST /api/verify-payment`
   - **Description:** This endpoint verifies the payment signature using HMAC-SHA256.

### Required Files
- `server/src/config/razorpay.ts`: Contains Razorpay configuration.
- `server/src/controllers/paymentController.ts`: Handles order creation and payment verification.
- `server/src/routes/paymentRoutes.ts`: Defines the payment-related routes.
- `server/src/services/razorpayService.ts`: Interacts with the Razorpay API.
- `server/src/utils/verifySignature.ts`: Verifies payment signatures.

## Frontend Setup

### Razorpay Checkout Component
- **File:** `client/src/components/RazorpayCheckout.tsx`
- **Description:** This React component renders the Razorpay checkout button and manages the payment process, including:
  - Calling the backend to create an order.
  - Opening the Razorpay payment modal.
  - Handling success and failure events.

### Payment Service
- **File:** `client/src/services/paymentService.ts`
- **Description:** This service interacts with the backend for creating orders and verifying payments.

## Testing Instructions
1. Start the backend server by running `npm start` in the `server` directory.
2. Start the frontend application by running `npm start` in the `client` directory.
3. Open a web browser and navigate to the frontend application.
4. Click the Razorpay checkout button to initiate the payment process.
5. Complete the payment in the Razorpay modal and observe the success or failure messages.

## Manual Steps Required
- Ensure that the `.env` file is created in the `server` directory with the correct Razorpay credentials.
- Add `.env` to `.gitignore` to prevent it from being committed to version control.

This integration allows for seamless payment processing using Razorpay, enhancing the user experience in the SeaSoul application.