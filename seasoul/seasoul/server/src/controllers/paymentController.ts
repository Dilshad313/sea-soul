import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '../config/razorpay';
import { verifyPaymentSignature } from '../utils/verifySignature';

class PaymentController {
    private razorpay: Razorpay;

    constructor() {
        this.razorpay = new Razorpay({
            key_id: RAZORPAY_KEY_ID,
            key_secret: RAZORPAY_KEY_SECRET,
        });
    }

    public createOrder = async (req: Request, res: Response): Promise<void> => {
        const { amount, currency } = req.body;

        const options = {
            amount: amount * 100, // amount in paise
            currency: currency,
            receipt: `receipt_order_${Math.random()}`,
        };

        try {
            const order = await this.razorpay.orders.create(options);
            res.status(200).json(order);
        } catch (error) {
            res.status(500).json({ error: 'Error creating order' });
        }
    };

    public verifyPayment = (req: Request, res: Response): void => {
        const { orderId, paymentId, signature } = req.body;

        const isValid = verifyPaymentSignature(orderId, paymentId, signature);

        if (isValid) {
            res.status(200).json({ success: true });
        } else {
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    };
}

export default new PaymentController();