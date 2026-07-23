import Razorpay from 'razorpay';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '../config/razorpay';

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

export const createOrder = async (amount: number, currency: string) => {
  const options = {
    amount: amount * 100, // amount in paise
    currency: currency,
    receipt: `receipt_order_${Math.random()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    throw new Error('Error creating order: ' + error.message);
  }
};