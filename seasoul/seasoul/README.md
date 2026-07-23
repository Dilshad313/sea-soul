# Seasoul Project

## Overview
Seasoul is a web application that integrates Razorpay Standard Web Checkout for handling payments. This README provides instructions for setting up and running the project, as well as details on the backend and frontend implementations.

## Project Structure
```
seasoul
├── server
│   ├── src
│   │   ├── config
│   │   │   └── razorpay.ts
│   │   ├── controllers
│   │   │   └── paymentController.ts
│   │   ├── routes
│   │   │   └── paymentRoutes.ts
│   │   ├── services
│   │   │   └── razorpayService.ts
│   │   └── utils
│   │       └── verifySignature.ts
│   ├── .env
│   ├── package.json
│   └── README.md
├── client
│   ├── src
│   │   ├── components
│   │   │   └── RazorpayCheckout.tsx
│   │   └── services
│   │       └── paymentService.ts
│   ├── package.json
│   └── README.md
└── README.md
```

## Backend Implementation
1. **Razorpay Configuration**: The Razorpay credentials are stored in the `.env` file and loaded in `server/src/config/razorpay.ts`.
2. **Payment Controller**: The `PaymentController` class in `server/src/controllers/paymentController.ts` handles order creation and payment verification.
3. **Payment Routes**: The routes for creating orders and verifying payments are defined in `server/src/routes/paymentRoutes.ts`.
4. **Razorpay Service**: Functions to interact with the Razorpay API are implemented in `server/src/services/razorpayService.ts`.
5. **Signature Verification**: The payment signature is verified using a utility function in `server/src/utils/verifySignature.ts`.

## Frontend Implementation
1. **Razorpay Checkout Component**: The `RazorpayCheckout` component in `client/src/components/RazorpayCheckout.tsx` renders the checkout button and manages the payment process.
2. **Payment Service**: Functions to communicate with the backend for order creation and payment verification are located in `client/src/services/paymentService.ts`.

## Environment Setup
- Create a `.env` file in the `server` directory with the following content:
  ```
  RAZORPAY_KEY_ID=rzp_test_TDlXv0mHO9Tjbj
  RAZORPAY_KEY_SECRET=VRBkWv9b4voz2xxdRc7XLhaG
  ```
- Add `.env` to your `.gitignore` file to prevent it from being committed to version control.

## Testing Instructions
1. Start the backend server by running `npm start` in the `server` directory.
2. Start the frontend application by running `npm start` in the `client` directory.
3. Open a web browser and navigate to the frontend application.
4. Click the Razorpay checkout button to initiate the payment process.
5. Complete the payment in the Razorpay modal and observe the success or failure messages.

## Manual Steps Required
- Ensure that the `.env` file is created in the `server` directory with the correct Razorpay credentials.
- Add `.env` to `.gitignore` to prevent it from being committed to version control.