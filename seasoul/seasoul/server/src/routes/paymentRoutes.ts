import express from 'express';
import PaymentController from '../controllers/paymentController';

const router = express.Router();
const paymentController = new PaymentController();

// Route for creating an order
router.post('/create-order', paymentController.createOrder);

// Route for verifying the payment signature
router.post('/verify-payment', paymentController.verifyPayment);

export default router;